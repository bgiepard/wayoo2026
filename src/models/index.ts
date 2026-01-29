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
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  options: string; // JSON string
  status: RequestStatus;
}

export interface CreateRequestData {
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  options: Record<string, boolean>;
}

// --------------------------------------------
// OFFER - Tabela Offers
// --------------------------------------------
// Status oferty: 1 = oczekująca, 2 = zaakceptowana, 3 = odrzucona
export type OfferStatus = 1 | 2 | 3;

export interface OfferData {
  id: string;
  requestId: string;
  driverId: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
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
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  options: Options;
}

// --------------------------------------------
// NOTIFICATION - Powiadomienia
// --------------------------------------------
export type NotificationType = 'new_offer' | 'offer_accepted' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}
