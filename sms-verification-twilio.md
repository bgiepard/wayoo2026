# Weryfikacja SMS przez Twilio Verify — plan implementacji

## 1. Założenie konta i konfiguracja Twilio

1. Wejdź na **twilio.com** → Sign up
2. Po zalogowaniu przejdź do **Verify → Services → Create new Service**
   - Service name: `wayoo`
   - Skopiuj **Service SID** (`VA...`)
3. W głównym dashboardzie skopiuj:
   - **Account SID** (`AC...`)
   - **Auth Token**
4. Dodaj do `.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_VERIFY_SERVICE_SID=VA...
   ```

> Twilio Verify na darmowym koncie działa bez zakupu numeru — kody SMS są wysyłane bezpośrednio przez Twilio Verify Service.

---

## 2. Co trzeba dodać w Airtable

W tabeli **Users** — żadnych nowych pól. Twilio Verify przechowuje stan weryfikacji po swojej stronie (kod jest ważny 10 minut). Jedyne co zapisujemy to już istniejące `phoneVerified` (Checkbox).

---

## 3. Flow weryfikacji SMS

```
Użytkownik wchodzi w /account → klika "Wyślij kod SMS"
    ↓
POST /api/auth/send-phone-code  { phone }
    ↓
Twilio Verify wysyła SMS z 6-cyfrowym kodem
    ↓
Użytkownik wpisuje kod w UI
    ↓
POST /api/auth/verify-phone-code  { phone, code }
    ↓
Twilio sprawdza kod → status "approved"
    ↓
Ustawiamy phoneVerified: true w Airtable
```

---

## 4. Endpointy do zbudowania

### `POST /api/auth/send-phone-code`
- Wymaga zalogowanej sesji
- Pobiera `phone` z body
- Wywołuje Twilio Verify API: `POST /v2/Services/{SID}/Verifications`
  - `To`: numer telefonu (format E.164, np. `+48721433007`)
  - `Channel`: `sms`
- Zwraca `{ message: "Kod wysłany" }`

### `POST /api/auth/verify-phone-code`
- Wymaga zalogowanej sesji
- Pobiera `phone` i `code` z body
- Wywołuje Twilio Verify API: `POST /v2/Services/{SID}/VerificationChecks`
  - `To`: numer telefonu
  - `Code`: kod wpisany przez użytkownika
- Jeśli `status === "approved"` → aktualizuje `phoneVerified: true` w Airtable
- Zwraca `{ verified: true }` lub błąd

---

## 5. Helper — Twilio Verify (`src/lib/twilio.ts`)

```ts
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!;

const twilioBase = `https://verify.twilio.com/v2/Services/${SERVICE_SID}`;
const authHeader = "Basic " + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

export async function sendPhoneVerificationCode(phone: string): Promise<void> {
  const res = await fetch(`${twilioBase}/Verifications`, {
    method: "POST",
    headers: { "Authorization": authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Channel: "sms" }).toString(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Nie udało się wysłać kodu SMS");
  }
}

export async function checkPhoneVerificationCode(phone: string, code: string): Promise<boolean> {
  const res = await fetch(`${twilioBase}/VerificationChecks`, {
    method: "POST",
    headers: { "Authorization": authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Code: code }).toString(),
  });
  const data = await res.json();
  return data.status === "approved";
}
```

---

## 6. Formatowanie numeru (E.164)

Twilio wymaga numeru w formacie E.164 (`+48721433007`). Użytkownicy mogą wpisywać różnie (`721433007`, `0048...`). Dodaj helper:

```ts
export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("48") && digits.length === 11) return `+${digits}`;
  if (digits.length === 9) return `+48${digits}`;
  return `+${digits}`;
}
```

---

## 7. UI w `/account`

Zastąp obecny button "Wyslij kod SMS" flow z modalem lub inline inputem:

1. Klik "Wyślij kod SMS" → wywołuje `send-phone-code` → pojawia się input na 6-cyfrowy kod
2. Użytkownik wpisuje kod → klik "Zweryfikuj" → wywołuje `verify-phone-code`
3. Sukces → badge zmienia się na "Zweryfikowany"

---

## 8. Kolejność implementacji

- [ ] Założyć konto Twilio + utworzyć Verify Service
- [ ] Dodać zmienne do `.env`
- [ ] Zbudować `src/lib/twilio.ts`
- [ ] Zbudować `POST /api/auth/send-phone-code`
- [ ] Zbudować `POST /api/auth/verify-phone-code`
- [ ] Dodać funkcję `markPhoneAsVerified` do `src/services/users.ts`
- [ ] Zaktualizować UI w `/account` — inline flow z inputem na kod

---

## 9. Koszty

Twilio Verify: **$0.05 za każdą weryfikację** (nie za SMS, za weryfikację).
Trial account: darmowe środki na start (~15$), wystarczy do testów.
