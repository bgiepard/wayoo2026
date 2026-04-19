# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Czym jest WAYOO

Polska platforma ride-sharingowa. To repozytorium to **aplikacja pasażera** (port 3000). Siostrzana aplikacja kierowcy: `../driver-wayoo-2026/` (port 3001). Obie współdzielą bazę Airtable i kanały Pusher.

## Komendy

```bash
npm run dev           # serwer deweloperski (port 3000)
npm run build         # build produkcyjny
npm run lint          # ESLint
npx tsc --noEmit      # sprawdzenie typów
npm run cy:open       # Cypress UI
npm run cy:run        # Cypress headless
npm run migrate:offers  # migracja statusów ofert w Airtable (tsx scripts/)
```

## Stack technologiczny

- **Next.js 16** (Pages Router, NIE App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** — bez pliku config, `@import "tailwindcss"` w globals.css
- **Airtable** — baza danych
- **NextAuth 4** (JWT, cookie: `next-auth.session-token.wayoo`) — email/hasło + Google OAuth
- **Stripe** — płatności (Checkout Session + Webhook)
- **Pusher** — real-time WebSocket
- **Google Maps API** — autocomplete (`@react-google-maps/api`), skrypt globalnie w `_app.tsx`
- **Statsig** — feature flags i session replay (owija aplikację w `StatsigWrapper`)
- **date-fns** — formatowanie dat

## Architektura

```
src/
├── pages/           # Strony i API routes (Pages Router)
│   ├── api/         # Endpointy REST
│   └── request/     # Podstrony zlecenia ([id]/ i draft/)
├── components/      # Komponenty React
│   ├── ui/          # Reusable primitives (Modal, DatePicker, TimePicker)
│   └── icons/       # SVG icon components z barrel export
├── services/        # Warstwa dostępu do Airtable (requests, offers, users, drivers, notifications)
├── lib/             # Konfiguracja serwisów (airtable.ts, pusher.ts, pusher-client.ts, formatDate.ts)
├── models/          # Jeden plik index.ts — wszystkie typy + pomocnicze funkcje (calculateDistance)
├── context/         # PusherContext (połączenie WS), NotificationsContext (stan powiadomień)
└── styles/          # globals.css (Tailwind + CSS custom properties)
```

Przepływ danych: **Page/API route → Service (services/) → Lib (airtable.ts) → Airtable REST API**

Provider stack w `_app.tsx`: `SessionProvider → StatsigWrapper → NotificationsProvider → PusherProvider`

## Strony i flow użytkownika

| Strona | Opis |
|--------|------|
| `/` | Strona główna z formularzem wyszukiwania (`SearchForm` — 4-krokowy wizard) |
| `/request/draft/details` | Podgląd zlecenia przed opublikowaniem |
| `/request/[id]` | Szczegóły opublikowanego zlecenia |
| `/request/[id]/offers` | Lista ofert od kierowców |
| `/request/[id]/payment` | Płatność Stripe za wybraną ofertę |
| `/my-requests` | Lista zleceń zalogowanego użytkownika |
| `/account` | Ustawienia konta |

## API Routes

- `POST /api/requests` — tworzenie zlecenia
- `GET /api/my-requests` — zlecenia zalogowanego użytkownika
- `GET /api/offers?requestId=X` — oferty na zlecenie
- `PATCH /api/requests/[id]/status` — zmiana statusu zlecenia
- `POST /api/stripe/create-checkout-session` — inicjacja Stripe Checkout
- `POST /api/stripe/webhook` — webhook Stripe (weryfikacja podpisu, zmiana statusów na `paid`, odrzucenie innych ofert, powiadomienie kierowcy przez Pusher)
- `GET/PATCH /api/notifications` — powiadomienia użytkownika
- `POST /api/auth/register` — rejestracja

## Płatności (Stripe)

Flow: użytkownik klika "Zapłać" → `POST /api/stripe/create-checkout-session` (tworzy Checkout Session, zapisuje `stripeSessionId` w Airtable) → redirect do Stripe → po płatności webhook zmienia Request na `paid`, Offer na `paid`, inne oferty na `rejected` → Pusher notification do kierowcy.

Webhook wymaga raw body — Next.js body parser jest wyłączony w `api/stripe/webhook.ts`.

## Modele danych i statusy

Wszystkie typy w `src/models/index.ts`.

**Request:** `draft` → `published` → `paid` → `completed` | `canceled`

**Offer:** `new` → `paid` | `rejected` | `canceled`

Pola `route` (typ `Route`) i `options` (typ `Options`) przechowywane jako **JSON stringi** w Airtable — zawsze `JSON.parse` po odczycie, `JSON.stringify` przed zapisem.

## Real-time (Pusher)

- Kanał: `request-{requestId}` — subskrypcja na zdarzenia dotyczące zlecenia
- Eventy: `new-offer`, `offer-accepted`, `offer-paid`
- `PusherContext` zarządza połączeniem i auto-subskrybuje kanały aktywnych zleceń; `NotificationsContext` przechowuje listę powiadomień

## Ważne konwencje

- Język UI i komentarze: **polski**
- Package manager: **npm**
- **Pages Router** (`src/pages/`), nigdy App Router
- Import alias: `@/*` → `./src/*`
- Modale: pattern `isOpen/onClose/onSave/onNext`
- CSS custom properties: `--accent` (#2563eb), `--background`, `--foreground`, `--muted`, `--border`
- Header navy: `#0B298F`
- Font: DM Sans (Google Fonts via `next/font/google`)
- Autentykacja: `getServerSession(req, res, authOptions)` w API routes; sesja zawiera `id`, `email`, `firstName`, `lastName`
