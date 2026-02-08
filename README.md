# WAYOO 2026 — Aplikacja pasażera

Frontendowa aplikacja Next.js dla pasażerów platformy WAYOO. Umożliwia wyszukiwanie tras, składanie zleceń przejazdów, przeglądanie ofert kierowców i płatności.

## Uruchamianie

```bash
npm install
npm run dev     # http://localhost:3000
```

## Skrypty

| Komenda | Opis |
|---------|------|
| `npm run dev` | Serwer developerski (port 3000) |
| `npm run build` | Build produkcyjny |
| `npm run start` | Start produkcyjny |
| `npm run lint` | ESLint |
| `npm run migrate:offers` | Migracja statusów ofert |

## Główne strony

| Ścieżka | Plik | Opis |
|----------|------|------|
| `/` | `pages/index.tsx` | Strona główna z formularzem wyszukiwania |
| `/my-requests` | `pages/my-requests.tsx` | Lista zleceń użytkownika |
| `/request/[id]` | `pages/request/[id]/index.tsx` | Szczegóły zlecenia |
| `/request/[id]/offers` | `pages/request/[id]/offers.tsx` | Oferty na zlecenie |
| `/request/[id]/payment` | `pages/request/[id]/payment.tsx` | Płatność za przejazd |
| `/request/draft/details` | `pages/request/draft/details.tsx` | Edycja wersji roboczej |
| `/account` | `pages/account.tsx` | Ustawienia konta |

## API Routes

| Metoda | Endpoint | Opis |
|--------|----------|------|
| POST | `/api/requests` | Utwórz zlecenie |
| GET | `/api/my-requests` | Pobierz zlecenia użytkownika |
| GET | `/api/offers?requestId=X` | Pobierz oferty na zlecenie |
| PATCH | `/api/requests/[id]/status` | Zmień status zlecenia |
| GET/POST | `/api/notifications` | Powiadomienia |
| POST | `/api/auth/register` | Rejestracja |

## Kluczowe komponenty

- **SearchForm** — 4-krokowy formularz wyszukiwania (trasa → data → pasażerowie → opcje)
- **RouteModal** — wybór trasy z Google Places Autocomplete
- **RouteMap** — wizualizacja trasy na mapie Google
- **RequestSteps** — stepper postępu zlecenia
- **NotificationDropdown** — powiadomienia real-time
