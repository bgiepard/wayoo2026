// ============================================
// MODELE DANYCH - WAYOO 2026
// ============================================
// Ten plik zawiera wszystkie typy i interfejsy używane w aplikacji.
// Odpowiadają one strukturze danych w Airtable.

// --------------------------------------------
// USER - Tabela Users
// --------------------------------------------
export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneVerified: boolean;
  provider: AuthProvider;
  password?: string;
}

export interface CreateUserData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  provider?: AuthProvider;
}

// --------------------------------------------
// DRIVER - Tabela Drivers
// --------------------------------------------
export interface Driver {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

// --------------------------------------------
// ROUTE - Struktura trasy z koordynatami
// --------------------------------------------
export interface Place {
  address: string;
  placeId: string;
  lat: number;
  lng: number;
}

export interface Route {
  origin: Place;
  destination: Place;
  waypoints: Place[];
}

// Pusta lokalizacja (dla inicjalizacji)
export const emptyPlace: Place = {
  address: '',
  placeId: '',
  lat: 0,
  lng: 0,
};

// Pusta trasa (dla inicjalizacji)
export const emptyRoute: Route = {
  origin: { ...emptyPlace },
  destination: { ...emptyPlace },
  waypoints: [],
};

// --------------------------------------------
// REQUEST - Tabela Requests
// --------------------------------------------
export type RequestStatus =
  | 'draft'      // Wersja robocza
  | 'published'  // Opublikowane, czeka na oferty
  | 'accepted'   // Oferta zaakceptowana, czeka na płatność
  | 'paid'       // Zapłacone
  | 'completed'  // Zakończone
  | 'cancelled'; // Anulowane

export interface RequestData {
  id: string;
  userId: string;
  userEmail: string;
  route: string; // JSON string (Route)
  date: string;
  time: string;
  adults: number;
  children: number;
  options: string; // JSON string
  status: RequestStatus;
}

export interface CreateRequestData {
  route: Route;
  date: string;
  time: string;
  adults: number;
  children: number;
  options: Record<string, boolean>;
}

// --------------------------------------------
// OFFER - Tabela Offers
// --------------------------------------------
export type OfferStatus =
  | 'new'       // Nowa oferta, oczekuje na decyzję
  | 'accepted'  // Zaakceptowana przez klienta
  | 'paid'      // Opłacona
  | 'canceled'  // Anulowana przez kierowcę
  | 'rejected'; // Odrzucona (gdy inna oferta została zaakceptowana)

export interface VehicleInfo {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  photos: string[];
  hasWifi: boolean;
  hasWC: boolean;
  hasTV: boolean;
  hasAirConditioning: boolean;
}

export interface OfferData {
  id: string;
  requestId: string;
  driverId: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
  vehicle?: VehicleInfo;
  price: number;
  message: string;
  status: OfferStatus;
}

// --------------------------------------------
// OPTIONS - Opcje dodatkowe w zapytaniu
// --------------------------------------------
export interface Options {
  wifi: boolean;
  wc: boolean;
  tv: boolean;
  airConditioning: boolean;
  powerOutlet: boolean;
}

// --------------------------------------------
// SEARCH FORM - Dane formularza wyszukiwania
// --------------------------------------------
export interface SearchData {
  route: Route;
  date: string;
  time: string;
  adults: number;
  children: number;
  options: Options;
}

// --------------------------------------------
// NOTIFICATION - Powiadomienia (Tabela Notifications)
// --------------------------------------------
export type NotificationType = 'new_offer' | 'offer_accepted' | 'info';

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string; // ISO string w Airtable
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

// Frontend notification (z Date zamiast string)
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}
