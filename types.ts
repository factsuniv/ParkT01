
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export enum SpotStatus {
  AVAILABLE = 'AVAILABLE',
  HELD_BY_PARKER = 'HELD_BY_PARKER',
  OCCUPIED = 'OCCUPIED'
}

export interface Spot {
  id: string;
  location: Location;
  price: number;
  parkerName?: string;
  status: SpotStatus;
  rating?: number;
  carModel?: string;
  isVirtual?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  isDefault?: boolean;
}

export interface ParkingTier {
  id: 'basic' | 'best' | 'vip';
  name: string;
  price: number;
  description: string;
  icon: string;
  color: string;
}

export enum ParkerStatus {
  OFFLINE = 'OFFLINE',
  READY = 'READY',
  PARKED = 'PARKED'
}

export enum AppState {
  LOGIN = 'LOGIN',
  MAP_IDLE = 'MAP_IDLE', // Map visible, searching allowed, bottom sheet shows tabs
  SEARCHING = 'SEARCHING', // Full screen search
  SPOT_SELECTED = 'SPOT_SELECTED', // Spot clicked, showing details + ASAP/Reserve
  SELECT_VEHICLE = 'SELECT_VEHICLE', // "Your Car" page
  SELECT_TIER = 'SELECT_TIER', // New Tier Selection Page
  BOOKING_REVIEW = 'BOOKING_REVIEW', // New Review Page
  PAYMENT_METHODS = 'PAYMENT_METHODS', // Select card/apple pay
  SEARCHING_PARKER = 'SEARCHING_PARKER', // Loading screen "Finalizing details"
  WAITING_FOR_PARKER = 'WAITING_FOR_PARKER', // Active Booking Details
  PROFILE = 'PROFILE', // User Profile
  NAVIGATING = 'NAVIGATING',
  ARRIVED = 'ARRIVED',
  
  // Contractor Side
  CONTRACTOR_DASHBOARD = 'CONTRACTOR_DASHBOARD',
  CONTRACTOR_ACCOUNT = 'CONTRACTOR_ACCOUNT',
  
  // Contractor Account Sub-pages
  CONTRACTOR_PERSONAL_DETAILS = 'CONTRACTOR_PERSONAL_DETAILS',
  CONTRACTOR_BUSINESS_INFO = 'CONTRACTOR_BUSINESS_INFO',
  CONTRACTOR_CONTACT_PREFERENCES = 'CONTRACTOR_CONTACT_PREFERENCES',
  CONTRACTOR_PAYMENT_METHODS = 'CONTRACTOR_PAYMENT_METHODS',
  CONTRACTOR_EARNINGS = 'CONTRACTOR_EARNINGS',
  CONTRACTOR_TAX_DOCUMENTS = 'CONTRACTOR_TAX_DOCUMENTS',
  CONTRACTOR_SETTINGS_LANGUAGE = 'CONTRACTOR_SETTINGS_LANGUAGE',
  CONTRACTOR_SETTINGS_THEME = 'CONTRACTOR_SETTINGS_THEME',
  CONTRACTOR_SETTINGS_SECURITY = 'CONTRACTOR_SETTINGS_SECURITY',
  CONTRACTOR_SUPPORT = 'CONTRACTOR_SUPPORT',
  CONTRACTOR_TERMS = 'CONTRACTOR_TERMS',
  CONTRACTOR_PRIVACY = 'CONTRACTOR_PRIVACY'
}
