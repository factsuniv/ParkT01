import { Spot, SpotStatus, Vehicle } from './types';

// Centered around Legacy West, Plano, TX
export const INITIAL_CENTER = {
  lat: 33.0825,
  lng: -96.8250 
};

export const MOCK_SPOTS: Spot[] = [
  {
    id: '1',
    location: { lat: 33.0830, lng: -96.8255, address: 'Legacy Hall North' },
    price: 12.00,
    status: SpotStatus.HELD_BY_PARKER,
    parkerName: 'David',
    rating: 4.9,
    carModel: 'Blue Ford Focus'
  },
  {
    id: '2',
    location: { lat: 33.0820, lng: -96.8245, address: 'Haywire Entrance' },
    price: 15.00,
    status: SpotStatus.AVAILABLE,
    parkerName: 'Sarah',
    rating: 5.0,
    carModel: 'Silver Honda Civic'
  },
  {
    id: '3',
    location: { lat: 33.0840, lng: -96.8260, address: 'Garage South' },
    price: 9.50,
    status: SpotStatus.HELD_BY_PARKER,
    parkerName: 'Mike',
    rating: 4.8,
    carModel: 'White Toyota Camry'
  },
  {
    id: '4', // The Star
    location: { lat: 33.1110, lng: -96.8290, address: 'The Star District' },
    price: 20.00,
    status: SpotStatus.HELD_BY_PARKER,
    parkerName: 'Jessica',
    rating: 4.9,
    carModel: 'Black Tesla Model 3'
  }
];

export const POPULAR_LOCATIONS = [
  { name: "The Star", lat: 33.1112, lng: -96.8288, address: "1 Cowboys Way, Frisco" },
  { name: "Legacy West", lat: 33.0835, lng: -96.8252, address: "Windrose Ave, Plano" },
  { name: "Legacy East", lat: 33.0780, lng: -96.8200, address: "Legacy Dr, Plano" },
  { name: "Grandscape The Colony", lat: 33.0750, lng: -96.8600, address: "Grandscape Blvd" },
  { name: "Frisco Main", lat: 33.1507, lng: -96.8236, address: "Main St, Frisco" }
];

// Mock data for specific business searches
export const MOCK_BUSINESSES = [
  { name: "Mi Cocina", lat: 33.0845, lng: -96.8255, address: "Legacy West" },
  { name: "Macy's", lat: 33.0990, lng: -96.8110, address: "Stonebriar Centre" },
  { name: "IKEA", lat: 33.0920, lng: -96.8330, address: "Frisco" },
  { name: "Del Frisco's", lat: 33.0850, lng: -96.8260, address: "Legacy West" },
  { name: "Hutchins BBQ", lat: 33.1520, lng: -96.8250, address: "Frisco" }
];

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', make: 'Honda', model: 'Civic', licensePlate: '7ABC123', isDefault: true },
  { id: 'v2', make: 'Tesla', model: 'Model 3', licensePlate: '8XYZ456', isDefault: false },
  { id: 'v3', make: 'Ford', model: 'F-150', licensePlate: 'PARKR1', isDefault: false },
];