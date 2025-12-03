
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

export enum AppState {
  LOGIN = 'LOGIN',
  MAP_IDLE = 'MAP_IDLE', // Map visible, searching allowed, bottom sheet shows tabs
  SEARCHING = 'SEARCHING', // Full screen search
  SPOT_SELECTED = 'SPOT_SELECTED', // Spot clicked, showing details + ASAP/Reserve
  SELECT_VEHICLE = 'SELECT_VEHICLE', // "Your Car" page
  SELECT_TIER = 'SELECT_TIER', // New Tier Selection Page
  BOOKING_REVIEW = 'BOOKING_REVIEW', // New Review Page
  WAITING_FOR_PARKER = 'WAITING_FOR_PARKER',
  NAVIGATING = 'NAVIGATING',
  ARRIVED = 'ARRIVED'
}
