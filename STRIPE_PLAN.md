# Plan integracji Stripe — wayoo2026

> Cel: zastąpić przycisk "Zapłać" (który teraz od razu ustawia status `paid` bez żadnej płatności) prawdziwym flow Stripe Checkout — na razie w trybie testowym (mockowym).

---

## 1. Jak działa obecny flow (co zmieniamy)

```
payment.tsx → klik "Zapłać"
  → POST /api/requests/[id]/status { status: "paid", offerId }
    → Airtable: Request.status = "paid", Offer.status = "paid"
    → Pusher: notifikacja do kierowcy
```

**Problem:** Brak prawdziwej płatności. Klik przycisku = natychmiastowe "opłacone".

---

## 2. Docelowy flow ze Stripe (tryb testowy)

```
payment.tsx → klik "Zapłać"
  → POST /api/stripe/create-checkout-session { requestId, offerId }
    → Stripe API: tworzy Checkout Session
    → redirect do stripe.com/checkout (strona hostowana przez Stripe)
      → użytkownik wpisuje dane karty (karta testowa: 4242 4242 4242 4242)
        → sukces → redirect na /request/[id]/payment?session_id=xxx
          → Stripe webhook: POST /api/stripe/webhook
            → weryfikacja podpisu → zmiana statusów w Airtable + Pusher
```

---

## 3. Instalacja

```bash
npm install stripe @stripe/stripe-js
```

- `stripe` — SDK server-side (Node.js), używane w API routes
- `@stripe/stripe-js` — SDK client-side, potrzebne tylko jeśli będziemy używać Stripe Elements (na razie nie — używamy Checkout hosted)

---

## 4. Konto Stripe i klucze

1. Utwórz konto na [stripe.com](https://stripe.com) (bezpłatne)
2. W dashboardzie przełącz na **tryb testowy** (toggle "Test mode" w górnym pasku)
3. Wejdź w **Developers → API keys**:
   - `Publishable key` → zaczyna się od `pk_test_...`
   - `Secret key` → zaczyna się od `sk_test_...`
4. Wejdź w **Developers → Webhooks** → **Add endpoint**:
   - URL: `https://twoja-domena.com/api/stripe/webhook` (na dev: użyj Stripe CLI)
   - Events: zaznacz `checkout.session.completed`
   - Po zapisaniu skopiuj **Signing secret** → zaczyna się od `whsec_...`

---

## 5. Zmienne środowiskowe (.env.local)

Dodaj do `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=<wklej_klucz_secret_ze_stripe>
STRIPE_PUBLISHABLE_KEY=<wklej_klucz_publishable_ze_stripe>
STRIPE_WEBHOOK_SECRET=<wklej_klucz_z_webhook_endpointu>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<wklej_klucz_publishable_ze_stripe>
```

> `NEXT_PUBLIC_` prefix jest potrzebny, żeby klucz był dostępny w przeglądarce. Sekretny klucz NIGDY nie trafia do frontendu.

---

## 6. Zmiany w Airtable

### Tabela: Requests

Dodaj nowe pole:

| Pole | Typ | Opis |
|------|-----|------|
| `stripeSessionId` | Single line text | ID sesji Checkout (`cs_test_...`) |

### Tabela: Offers

Dodaj nowe pole:

| Pole | Typ | Opis |
|------|-----|------|
| `stripePaymentIntentId` | Single line text | ID payment intent (`pi_...`) — wypełniane przez webhook |

> Dlaczego dwie tabele? `stripeSessionId` przypisujemy do Request przy tworzeniu sesji. `stripePaymentIntentId` dostajemy od webhooka po sukcesie — przypisujemy do Offer jako potwierdzenie konkretnej transakcji.

---

## 7. Nowe pliki do stworzenia

### `src/pages/api/stripe/create-checkout-session.ts`

Ten endpoint tworzy sesję Checkout w Stripe i zwraca URL do redirectu.

**Co robi:**
1. Sprawdza sesję NextAuth (tylko zalogowany użytkownik)
2. Pobiera Request i Offer z Airtable (weryfikuje, że oferta należy do tego requestu)
3. Wywołuje `stripe.checkout.sessions.create()` z:
   - `line_items` — nazwa trasy + cena z oferty (w groszach: `price * 100`)
   - `mode: "payment"`
   - `success_url` — `/request/{id}/payment?session_id={CHECKOUT_SESSION_ID}&offerId={offerId}`
   - `cancel_url` — `/request/{id}/payment?offerId={offerId}`
   - `metadata` — `{ requestId, offerId }` (potrzebne w webhooku)
4. Zapisuje `stripeSessionId` w Airtable (tabela Requests)
5. Zwraca `{ url: session.url }`

### `src/pages/api/stripe/webhook.ts`

Ten endpoint odbiera eventy od Stripe po zakończeniu płatności.

**Ważne:** Stripe wysyła raw body (nie JSON), trzeba wyłączyć domyślny body parser Next.js.

**Co robi:**
1. Weryfikuje podpis webhooka (`stripe.webhooks.constructEvent`)
2. Obsługuje event `checkout.session.completed`:
   - Pobiera `requestId` i `offerId` z `session.metadata`
   - Wywołuje istniejącą logikę: `updateRequestStatus(id, "paid")` + `markOfferAsPaid(id, offerId)`
   - Zapisuje `stripePaymentIntentId` w tabeli Offers
   - Wysyła Pusher notification do kierowcy (istniejący kod z `status.ts`)
3. Zwraca `{ received: true }`

### `src/pages/request/[id]/payment-success.tsx` (opcjonalne)

Prosta strona potwierdzenia po powrocie ze Stripe. Alternatywnie można to obsłużyć w istniejącym `payment.tsx` przez query param `session_id`.

---

## 8. Zmiany w istniejących plikach

### `src/pages/request/[id]/payment.tsx`

Zmień handler `handleMarkAsPaid`:

```typescript
// PRZED (obecny kod):
const handleMarkAsPaid = async () => {
  const res = await fetch(`/api/requests/${request.id}/status`, {
    method: "POST",
    body: JSON.stringify({ status: "paid", offerId }),
  });
  // ...
};

// PO (nowy kod):
const handleMarkAsPaid = async () => {
  setIsPaying(true);
  try {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: request.id, offerId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // redirect do Stripe Checkout
    }
  } catch (error) {
    console.error("Błąd inicjowania płatności:", error);
  } finally {
    setIsPaying(false);
  }
};
```

Dodatkowo: po powrocie ze Stripe (query param `session_id`) pokaż odpowiedni komunikat. Webhook zmieni status w tle — ewentualnie `getServerSideProps` odświeży dane po przekierowaniu.

---

## 9. Testowanie lokalnie — Stripe CLI

Webhook nie działa na `localhost` — Stripe nie ma jak dosłać HTTP request do twojego laptopa. Do lokalnego testowania użyj **Stripe CLI**:

### Instalacja Stripe CLI

```bash
# Windows (winget):
winget install Stripe.StripeCLI

# Lub pobierz .exe z: https://github.com/stripe/stripe-cli/releases
```

### Nasłuchiwanie webhooków lokalnie

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

CLI wyświetli tymczasowy `whsec_...` — użyj go jako `STRIPE_WEBHOOK_SECRET` w `.env.local` podczas developmentu.

### Symulowanie płatności

```bash
stripe trigger checkout.session.completed
```

---

## 10. Karta testowa Stripe

Na stronie Checkout Stripe wpisz:

| Pole | Wartość |
|------|---------|
| Numer karty | `4242 4242 4242 4242` |
| Data ważności | dowolna przyszła (np. `12/29`) |
| CVC | dowolne 3 cyfry (np. `123`) |
| Imię | cokolwiek |

Inne karty testowe (scenariusze błędów):
- `4000 0000 0000 0002` — karta odrzucona
- `4000 0025 0000 3155` — wymaga 3D Secure

---

## 11. Kolejność implementacji

1. **Utwórz konto Stripe** i pobierz klucze testowe
2. **Dodaj pola w Airtable** (`stripeSessionId` w Requests, `stripePaymentIntentId` w Offers)
3. **Dodaj zmienne środowiskowe** do `.env.local`
4. **Zainstaluj pakiet** `stripe`
5. **Stwórz `/api/stripe/create-checkout-session.ts`**
6. **Zmodyfikuj `payment.tsx`** — zmień handler na redirect do Stripe
7. **Stwórz `/api/stripe/webhook.ts`**
8. **Zainstaluj Stripe CLI** i uruchom `stripe listen`
9. **Przetestuj** — kliknij "Zapłać", przejdź przez Checkout, sprawdź czy status w Airtable się zmienił

---

## 12. Co NIE zmienia się

- Cała logika `updateRequestStatus` i `markOfferAsPaid` w serwisach — webhook jej używa
- Pusher notifications do kierowcy — webhook je wysyła tak samo jak teraz
- UI strony payment.tsx po zakończeniu płatności — `request.status === "paid"` nadal decyduje o wyświetleniu danych kierowcy
- Tabela `status.ts` API route — można ją zostawić lub usunąć po weryfikacji, że webhook działa poprawnie

---

## 13. Gotowość produkcyjna (po mockach)

Gdy będziesz gotowy na prawdziwe płatności:
1. Przełącz toggle w Stripe Dashboard na **Live mode**
2. Podmień klucze w zmiennych środowiskowych na `pk_live_...` / `sk_live_...`
3. Zarejestruj nowy endpoint webhooków w Stripe Dashboard z live URL
4. Nic więcej — kod się nie zmienia
