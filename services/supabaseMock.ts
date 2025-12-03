import { Spot, SpotStatus, User } from '../types';
import { MOCK_SPOTS } from '../constants';

// This simulates the Supabase client interactions
export const supabaseMock = {
  auth: {
    signInAnonymously: async (): Promise<{ user: User | null, error: any }> => {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
      return {
        user: {
          id: 'guest_123',
          name: 'Guest User',
          email: 'guest@parkr.valet',
          isGuest: true
        },
        error: null
      };
    }
  },
  spots: {
    getNearby: async (lat: number, lng: number): Promise<Spot[]> => {
       await new Promise(resolve => setTimeout(resolve, 500));
       // In a real app, we'd use PostGIS to find spots within radius
       // For demo, we return the mock spots
       return MOCK_SPOTS;
    },
    reserve: async (spotId: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    }
  }
};
