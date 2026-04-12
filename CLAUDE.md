# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Czym jest WAYOO

Polska platforma ride-sharingowa (marketplace) łącząca pasażerów z kierowcami. Pasażer składa zapytanie o przejazd, kierowcy składają oferty cenowe, pasażer wybiera najlepszą ofertę i płaci.

To repozytorium to **aplikacja pasażera** (port 3000). Istnieje też siostrzana aplikacja kierowcy w `../driver-wayoo-2026/` (port 3001) — obie współdzielą bazę Airtable i kanały Pusher.

## Komendy

```bash
npm run dev       # serwer deweloperski (port 3000)
npm run build     # build produkcyjny
npm run lint      # ESLint
npm run cy:open   # Cypress UI
npm run cy:run    # Cypress headless
npm run migrate:offers  # migracja statusów ofert w Airtable (tsx scripts/)
```

## Stack technologiczny

- **Next.js 16** (Pages Router, NIE App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4**
- **Airtable** — baza danych (tabele: Users, Drivers, Requests, Offers, Vehicles, Notifications)
- **NextAuth 4** (JWT strategy) — email/hasło + Google OAuth
- **Pusher** — real-time WebSocket
- **Google Maps API** — autocomplete (`@react-google-maps/api`), skrypt ładowany globalnie w `_app.tsx`
- **Statsig** — feature flags i session replay (owija całą aplikację w `StatsigWrapper`)
- **date-fns** — formatowanie dat

## Architektura

```
src/
├── pages/           # Strony i API routes (Pages Router)
│   ├── api/         # Endpointy REST
│   └── request/     # Podstrony zlecenia ([id]/ i draft/)
├── components/      # Komponenty React (ikony w components/icons/)
├── services/        # Warstwa dostępu do Airtable (requests, offers, users, drivers, notifications)
├── lib/             # Konfiguracja serwisów (airtable.ts, pusher.ts, pusher-client.ts, formatDate.ts)
├── models/          # Jeden plik index.ts — wszystkie typy TypeScript + pomocnicze funkcje (calculateDistance)
├── context/         # PusherContext (połączenie WS), NotificationsContext (stan powiadomień)
└── styles/          # globals.css (Tailwind)
```

Przepływ danych: **Page/API route → Service (services/) → Lib (airtable.ts) → Airtable REST API**

Provider stack w `_app.tsx` (od zewnątrz): `SessionProvider → StatsigWrapper → NotificationsProvider → PusherProvider`

## Strony i flow użytkownika

| Strona | Opis |
|--------|------|
| `/` | Strona główna z formularzem wyszukiwania (`SearchForm`) |
| `/request/draft/details` | Podgląd zlecenia przed opublikowaniem |
| `/request/[id]` | Szczegóły opublikowanego zlecenia |
| `/request/[id]/details` | Pełne szczegóły zlecenia |
| `/request/[id]/offers` | Lista ofert od kierowców |
| `/request/[id]/payment` | Płatność za wybraną ofertę |
| `/my-requests` | Lista zleceń zalogowanego użytkownika |
| `/account` | Ustawienia konta |

## API Routes

- `POST /api/requests` — tworzenie zlecenia
- `GET /api/my-requests` — zlecenia zalogowanego użytkownika
- `GET/POST /api/offers?requestId=X` — oferty na zlecenie
- `PATCH /api/requests/[id]/status` — zmiana statusu zlecenia
- `POST /api/auth/register` — rejestracja
- `GET/PATCH /api/notifications` — powiadomienia użytkownika

## Modele danych i statusy

Wszystkie typy są w `src/models/index.ts`.

**Request:** `draft` → `published` → `paid` → `completed` | `canceled`

**Offer:** `new` → `paid` | `rejected` | `canceled`

Pola `route` (typ `Route`) i `options` (typ `Options`) są przechowywane w Airtable jako **JSON stringi** — zawsze wymagają `JSON.parse` po odczycie i `JSON.stringify` przed zapisem.

## Real-time (Pusher)

- Kanał: `request-{requestId}` — subskrypcja na zdarzenia dotyczące zlecenia
- Eventy: `new-offer`, `offer-accepted`, `offer-paid`
- `PusherContext` zarządza połączeniem; `NotificationsContext` przechowuje listę powiadomień i stan odczytu

## Zmienne środowiskowe (.env)

```
AIRTABLE_API_KEY, AIRTABLE_BASE_ID
PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
NEXTAUTH_SECRET, NEXTAUTH_URL
```

## Ważne konwencje

- Język UI i komentarze w kodzie: **polski**
- Package manager: **npm**
- Używamy **Pages Router** (`src/pages/`), nigdy App Router
- Autentykacja przez NextAuth; sesja JWT zawiera `id`, `email`, `firstName`, `lastName`