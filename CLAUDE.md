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

## Design System

Żywa dokumentacja: `src/pages/design.tsx` → dostępna pod `/design` (tylko wewnętrznie).

### Tokeny CSS (globals.css)

| Token | Wartość | Zastosowanie |
|-------|---------|--------------|
| `var(--accent)` | `#2563eb` | Primary color — CTA buttony, linki, focus ring |
| `var(--accent-light)` | `#eff6ff` | Tło badge info, focus ring (box-shadow) |
| `var(--background)` | `#FCFDFD` | Tło strony |
| `var(--foreground)` | `#1a1a1a` | Tekst podstawowy |
| `var(--muted)` | `#6b7280` | Tekst pomocniczy, ikony |
| `var(--border)` | `#e5e5e5` | Obramowania inputów i kart |
| `#0B298F` | Header navy | Tło headera, sidebar design systemu |

### Buttony

```tsx
// Primary
<button style={{ backgroundColor: 'var(--accent)' }}
  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90">

// Secondary
<button style={{ border: '1.5px solid var(--border)', color: 'var(--foreground)' }}
  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-[#f5f5f5]">

// Ghost
<button style={{ color: 'var(--accent)' }}
  className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#f0f4ff]">

// Danger
<button className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:opacity-90">

// Disabled (dowolny wariant)
className="opacity-40 cursor-not-allowed"
```

### Inputy

```tsx
// Default
style={{ border: '1.5px solid var(--border)', outline: 'none' }}
className="w-full px-4 py-3 rounded-xl text-sm bg-white"

// Focus
style={{ border: '1.5px solid var(--accent)', outline: 'none', boxShadow: '0 0 0 3px var(--accent-light)' }}

// Error
style={{ border: '1.5px solid #dc2626', outline: 'none', boxShadow: '0 0 0 3px #fee2e2' }}

// Disabled
className="bg-[#f8f9fa] opacity-60 cursor-not-allowed"
```

### Typografia

- Font: `DM Sans` via `var(--font-dm-sans)` (załadowany w `_app.tsx`)
- H1: `text-[2rem] font-bold`
- H2: `text-2xl font-semibold`
- H3: `text-xl font-semibold`
- H4: `text-base font-semibold`
- Body: `text-base text-[#1a1a1a]`
- Muted: `text-base text-[#6b7280]`
- Caption: `text-xs text-[#6b7280]`

### Odznaki statusów (Badge)

```tsx
// Paid / success
className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#dcfce7] text-[#16a34a]"

// New / warning
className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#fef9c3] text-[#a16207]"

// Published / info
className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#eff6ff] text-[#2563eb]"

// Canceled / error
className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#fee2e2] text-[#dc2626]"

// Draft / neutral
className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f3f4f6] text-[#6b7280]"
```

### Karty

```tsx
<div className="bg-white rounded-2xl p-5"
  style={{ border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
```

### Ikony

Barrel export z `@/components/icons`. Wszystkie ikony przyjmują `className?: string`.  
Wyjątki: `WhyIcon1-4` i `GoogleIcon` mają hardcoded kolory (className nie zmienia barwy).

```tsx
import { BellIcon, LocationMarkerIcon } from '@/components/icons';
<BellIcon className="w-5 h-5 text-[#6b7280]" />
```
