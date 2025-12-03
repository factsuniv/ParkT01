
import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import { Button, SearchInput, LocationItem } from './components/UIComponents';
import { AppState, Spot, User, SpotStatus, Vehicle, ParkingTier } from './types';
import { INITIAL_CENTER, POPULAR_LOCATIONS, MOCK_BUSINESSES, MOCK_SPOTS, MOCK_VEHICLES } from './constants';
import { supabaseMock } from './services/supabaseMock';
import { 
  Menu, 
  User as UserIcon, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  Car,
  Banknote,
  MoreHorizontal,
  Plus,
  Check,
  Award,
  CircleDollarSign,
  Calendar
} from 'lucide-react';

const PARKING_TIERS: ParkingTier[] = [
  {
    id: 'basic',
    name: 'Just in the lot',
    price: 9,
    description: 'Basic parking. Find an open spot within the designated area.',
    icon: 'P',
    color: 'text-brand-600'
  },
  {
    id: 'best',
    name: 'Best spot available',
    price: 14,
    description: 'A premium spot, closer to the entrance or amenities, guaranteed upon arrival.',
    icon: 'car',
    color: 'text-brand-600'
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 24,
    description: 'Exclusive parking experience with valet service and dedicated prime spots.',
    icon: 'star',
    color: 'text-amber-500'
  }
];

const App: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [center, setCenter] = useState(INITIAL_CENTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('v1');
  const [selectedTier, setSelectedTier] = useState<ParkingTier>(PARKING_TIERS[1]); // Default to middle tier
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nearby' | 'popular'>('nearby');

  // Initial Data Load
  useEffect(() => {
    // When map idle, ensure spots are loaded
    if (appState === AppState.MAP_IDLE && spots.length === 0) {
      setSpots(MOCK_SPOTS);
    }
  }, [appState, spots.length]);

  // Handlers
  const handleLogin = async () => {
    setLoading(true);
    const { user, error } = await supabaseMock.auth.signInAnonymously();
    if (user && !error) {
      setUser(user);
      setAppState(AppState.MAP_IDLE);
      setSpots(MOCK_SPOTS);
    }
    setLoading(false);
  };

  const handleSearchFocus = () => {
    setAppState(AppState.SEARCHING);
  };

  const handleBackToMap = () => {
    setAppState(AppState.MAP_IDLE);
    setSearchQuery('');
    setSelectedSpot(null);
  };

  // Handle selecting a popular location OR a business
  const handleLocationSelect = async (location: { lat: number; lng: number; name: string }) => {
    setLoading(true);
    setSearchQuery(location.name);
    setCenter({ lat: location.lat, lng: location.lng });
    
    // Logic: If it's a business search, we might want to "spawn" a spot nearby
    // For demo purposes, we will check if it's one of our business mocks and create a spot
    // Or just find nearest existing.
    
    const isBusiness = MOCK_BUSINESSES.some(b => b.name === location.name);
    
    if (isBusiness) {
       // Create a mock spot at this location for the demo
       const newSpot: Spot = {
         id: `temp_${Date.now()}`,
         location: { lat: location.lat, lng: location.lng, address: location.name },
         price: 0, // Hidden for virtual spots initially
         status: SpotStatus.AVAILABLE,
         isVirtual: true
       };
       setSpots(prev => [...prev, newSpot]);
       setSelectedSpot(newSpot);
       setAppState(AppState.SPOT_SELECTED);
    } else {
       // Just moving the map to a popular area
       setAppState(AppState.MAP_IDLE); 
       // In real app, we'd fetch spots in this new area
    }
    
    setLoading(false);
  };

  const handleSpotClick = (spot: Spot) => {
    setSelectedSpot(spot);
    setCenter({ lat: spot.location.lat, lng: spot.location.lng });
    setAppState(AppState.SPOT_SELECTED);
  };

  const handleMapClick = () => {
    if (appState === AppState.SPOT_SELECTED) {
      setSelectedSpot(null);
      setAppState(AppState.MAP_IDLE);
    }
  };

  const handleContinueToCar = () => {
    if (!selectedSpot) return;
    setAppState(AppState.SELECT_VEHICLE);
  };

  const handleVehicleSelection = (id: string) => {
    setSelectedVehicleId(id);
  };

  const handleVehicleConfirm = () => {
    if (!selectedSpot) return;

    if (selectedSpot.isVirtual) {
      // If user searched for a spot, they need to select a tier
      setAppState(AppState.SELECT_TIER);
    } else {
      // If it's a pre-parked spot, price is fixed, go straight to review
      setAppState(AppState.BOOKING_REVIEW);
    }
  };

  const handleTierSelect = (tier: ParkingTier) => {
    setSelectedTier(tier);
  };

  const handleTierContinue = () => {
    setAppState(AppState.BOOKING_REVIEW);
  };

  const handleFinalBooking = async () => {
    setLoading(true);
    if (selectedSpot) {
      const success = await supabaseMock.spots.reserve(selectedSpot.id);
      if (success) {
        setAppState(AppState.WAITING_FOR_PARKER);
        
        // Simulate parker arrival flow
        setTimeout(() => {
          setAppState(AppState.NAVIGATING);
        }, 3000);
        
        setTimeout(() => {
          setAppState(AppState.ARRIVED);
        }, 8000);
      }
    }
    setLoading(false);
  };

  const handleReset = () => {
    setAppState(AppState.MAP_IDLE);
    setSelectedSpot(null);
    setSearchQuery('');
    setCenter(INITIAL_CENTER);
    setSpots(MOCK_SPOTS);
  };

  // --- Render Views ---

  if (appState === AppState.LOGIN) {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col px-6 py-6 relative overflow-hidden">
        <header className="w-full flex justify-center flex-none mb-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Parkr</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-0">
          {/* Illustration */}
          <div className="w-full h-full max-h-[35vh] aspect-square flex items-center justify-center mb-4 shrink-1">
            <div 
              className="w-full h-full bg-center bg-no-repeat bg-contain"
              style={{ 
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBLIyoT6fRCx3w5CFtpGgNlKpAJy6dUdDP6MgAwKLYbIdz9EesYpdtlt_eGi_eqgbnAAkbykhn2Vb6nVsnYJZ4Yk1-OF9H0ofOjTV-DBTcEyhdMttsb4xig791Xkax5Y32NZvbNPWUd_ON0PUdNB12I4zlWR2v5mH2nERZl9d7wpdbhQ4C4kIXH-yKPCIWcVklmtsL7FTPsLKlmdF1QMW8Pdg7DvB7XAXaC2p4aS5jjPgXbuiwSp4K6AT0S5buJmOOEaY7OwiHzbmTb")' 
              }}
            />
          </div>

          <div className="text-center mb-6 space-y-2 shrink-0">
            <h1 className="text-2xl md:text-[32px] font-bold text-gray-900 leading-tight">
              Parking, Made Simple.
            </h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-[280px] mx-auto">
              Find or share a parking spot with a community of drivers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mb-2 shrink-0">
            <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <Clock className="w-5 h-5 text-brand-500" />
              <div>
                <h2 className="text-gray-900 text-sm font-bold leading-tight mb-0.5">Real-time Spot Finding</h2>
                <p className="text-gray-500 text-[10px] leading-normal">Find available spots instantly</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <Banknote className="w-5 h-5 text-brand-500" />
              <div>
                <h2 className="text-gray-900 text-sm font-bold leading-tight mb-0.5">Earn Money</h2>
                <p className="text-gray-500 text-[10px] leading-normal">Share your spot and earn cash</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full max-w-md mx-auto flex flex-col gap-3 mt-auto flex-none pt-4">
          <Button 
            onClick={handleLogin} 
            isLoading={loading} 
            fullWidth 
            className="h-12 text-base font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-none"
          >
            Find a Spot
          </Button>
          <Button 
            fullWidth 
            className="h-12 text-base font-semibold rounded-xl bg-blue-50 text-brand-600 hover:bg-blue-100 border-none shadow-none"
          >
            Offer my Spot
          </Button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            Already have an account? <span className="text-brand-600 font-bold cursor-pointer hover:underline">Sign In</span>
          </p>
        </footer>
      </div>
    );
  }

  // --- YOUR CAR PAGE ---
  if (appState === AppState.SELECT_VEHICLE) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col font-sans">
        <header className="sticky top-0 bg-white z-30 border-b border-gray-100">
          <div className="flex items-center p-4 pb-3 justify-between">
            <button 
              onClick={() => setAppState(AppState.SPOT_SELECTED)}
              className="text-brand-600 flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-brand-600 text-lg font-bold leading-tight flex-1 text-center">Your Car</h1>
            <div className="flex size-12 shrink-0"></div>
          </div>
        </header>

        <main className="flex-grow px-4 pt-6 pb-20">
          <p className="text-gray-900 text-base font-normal leading-normal pb-6 text-center">
            Select the vehicle you are parking with.
          </p>
          
          <div className="space-y-4 max-w-md mx-auto">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-brand-500/30 transition-transform duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="w-5 h-5" />
              <span>Add a New Car</span>
            </button>

            {MOCK_VEHICLES.map((vehicle) => {
              const isSelected = selectedVehicleId === vehicle.id;
              return (
                <div 
                  key={vehicle.id}
                  onClick={() => handleVehicleSelection(vehicle.id)}
                  className={`
                    flex items-center gap-4 rounded-xl p-4 justify-between border-2 transition-all cursor-pointer shadow-sm
                    ${isSelected 
                      ? 'bg-white border-brand-500 ring-4 ring-brand-500/10' 
                      : 'bg-white border-transparent hover:border-gray-200'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center rounded-lg shrink-0 size-12 ${isSelected ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                      {vehicle.model.includes('F-150') ? <Car className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col justify-center text-left">
                      <p className="text-gray-900 text-base font-medium leading-normal">{vehicle.make} {vehicle.model}</p>
                      <p className="text-gray-500 text-sm font-normal leading-normal">{vehicle.licensePlate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <div className="flex size-6 items-center justify-center text-white bg-brand-500 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <button className="shrink-0 text-gray-400 hover:text-brand-600 p-2">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <Button 
               fullWidth 
               size="lg" 
               isLoading={loading}
               onClick={handleVehicleConfirm}
            >
               Confirm
            </Button>
        </div>
      </div>
    );
  }

  // --- SELECT PARKING TIER PAGE (Virtual Spots Only) ---
  if (appState === AppState.SELECT_TIER) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col font-sans">
        <header className="sticky top-0 bg-white z-30">
          <div className="flex items-center p-4 pb-2 justify-between">
            <button 
              onClick={() => setAppState(AppState.SELECT_VEHICLE)}
              className="text-[#111418] flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Select Parking Tier</h2>
            <div className="flex size-12 shrink-0"></div>
          </div>
        </header>

        <main className="flex-grow px-4 py-3 pb-24">
          <div className="flex flex-col gap-4">
            {PARKING_TIERS.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              const borderColor = isSelected ? 'border-brand-500 ring-2 ring-brand-500/20' : (tier.id === 'vip' ? 'border-amber-400' : 'border-blue-200');
              const bgColor = isSelected ? 'bg-brand-50/50' : 'bg-white/80';
              
              return (
                <div 
                  key={tier.id}
                  onClick={() => handleTierSelect(tier)}
                  className={`flex flex-col rounded-xl p-5 backdrop-blur-md border ${borderColor} ${bgColor} cursor-pointer transition-all shadow-sm`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {tier.icon === 'P' && <div className={`text-2xl font-bold ${tier.color}`}>P</div>}
                    {tier.icon === 'car' && <Car className={`w-7 h-7 ${tier.color}`} />}
                    {tier.icon === 'star' && <Award className={`w-7 h-7 ${tier.color}`} />}
                    <h3 className="text-xl font-bold leading-tight tracking-[-0.015em] text-[#111418]">{tier.name}</h3>
                  </div>
                  <p className="text-lg font-semibold text-gray-600 mb-2">${tier.price}</p>
                  <p className="text-sm text-gray-500 leading-normal">
                    {tier.description}
                  </p>
                </div>
              );
            })}
          </div>
        </main>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <Button 
               fullWidth 
               size="lg" 
               onClick={handleTierContinue}
            >
               Continue
            </Button>
        </div>
      </div>
    );
  }

  // --- BOOKING REVIEW PAGE ---
  if (appState === AppState.BOOKING_REVIEW) {
    const displayPrice = selectedSpot?.isVirtual ? selectedTier.price : selectedSpot?.price;
    const priceString = displayPrice?.toFixed(2);

    return (
      <div className="min-h-screen w-full bg-white flex flex-col font-sans">
        <header className="sticky top-0 bg-white z-30">
          <div className="flex items-center p-4 pb-2 justify-between">
            <button 
              onClick={() => setAppState(selectedSpot?.isVirtual ? AppState.SELECT_TIER : AppState.SELECT_VEHICLE)}
              className="text-[#111418] flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-full"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Booking Details</h2>
            <div className="flex size-12 shrink-0"></div>
          </div>
        </header>

        <main className="flex-grow pb-24">
          <div className="flex px-4 py-3">
             <div className="w-full h-48 rounded-xl overflow-hidden relative shadow-md">
                {/* Static Map Image for Review */}
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzCWlho9gZR3_k1OLAlNGo3lkH-6Sv7XLDnVFg20SZnxKSawVXZzi_7YI_Zg0KBGV7WKjATnL7J-3Moj-s5plr53C44goq0BWGvyju80VQbzvvrKtrSqxChgGlzYI_VFrHHrixy59A33v09YqJ2SIR3hHDhBxWXsmcqmzkZOaVc5TTzA8KgcnZY6OCCCQ7tW0Uq9Lzit0_7MXr90sC_BPVOvmOxzGKEgMbbINnn48CcnWZ0EmdDJHln5ym4lA-GFOxsX0HoJt27AqK" 
                  alt="Map Location" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      {selectedSpot?.location.address || 'San Francisco'}
                   </div>
                </div>
             </div>
          </div>

          <div className="px-4 mt-2">
            <h2 className="text-brand-600 text-2xl font-extrabold pb-2">Review</h2>
            <p className="text-[#111418] text-base font-normal leading-normal pb-4">
              Ready to go? Please arrive at the spot in 30 minutes once connected to a parker.
            </p>
          </div>

          <div className="mx-4 mt-2 rounded-xl bg-gray-50 p-4 shadow-sm space-y-4 border border-gray-100">
            {/* Location */}
            <div className="flex items-center gap-4 min-h-[72px]">
              <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Spot Location</p>
                <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">{selectedSpot?.location.address}</p>
              </div>
            </div>
            
            {/* Cost */}
            <div className="flex items-center gap-4 min-h-[72px]">
              <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Total Cost</p>
                <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">${priceString}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-4 min-h-[72px]">
              <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                 <Calendar className="w-6 h-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Booking Time</p>
                <p className="text-brand-600 font-bold line-clamp-2">ASAP</p>
              </div>
            </div>
          </div>
        </main>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col gap-3">
          <Button 
            fullWidth 
            size="lg" 
            isLoading={loading}
            onClick={handleFinalBooking}
          >
            Confirm Booking
          </Button>
          <Button 
            fullWidth 
            variant="ghost"
            onClick={handleReset}
            className="text-gray-500 font-normal h-12"
          >
            Cancel Booking
          </Button>
        </div>
      </div>
    );
  }

  // --- MAP & MAIN FLOW ---
  const showMap = [AppState.MAP_IDLE, AppState.SEARCHING, AppState.SPOT_SELECTED, AppState.WAITING_FOR_PARKER, AppState.NAVIGATING, AppState.ARRIVED].includes(appState);

  return (
    <div className="h-screen w-full relative bg-gray-50 overflow-hidden flex flex-col">
      {/* Map Layer */}
      {showMap && (
        <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${appState === AppState.SEARCHING ? 'opacity-0 hidden' : 'opacity-100'}`}>
          <Map 
              center={center} 
              spots={spots} 
              selectedSpotId={selectedSpot?.id}
              onSpotClick={handleSpotClick}
              onMapClick={handleMapClick}
              isInteracting={false}
          />
        </div>
      )}

      {/* Top Header Layer (Menu & Status) */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-3">
            {appState === AppState.SEARCHING ? null : (
               <>
                {/* Left Button */}
                {appState === AppState.MAP_IDLE || appState === AppState.SPOT_SELECTED ? (
                  <button onClick={() => setIsMenuOpen(true)} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
                    <Menu className="w-6 h-6" />
                  </button>
                ) : (
                  <button onClick={handleReset} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Status Pills */}
                {appState === AppState.WAITING_FOR_PARKER && (
                    <div className="bg-brand-600 text-white px-4 py-2 rounded-full shadow-lg font-medium flex items-center animate-pulse">
                      Connecting to Parker...
                    </div>
                )}
                
                {appState === AppState.NAVIGATING && (
                    <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg font-medium flex items-center">
                      <Navigation className="w-4 h-4 mr-2" />
                      Head to your spot
                    </div>
                )}
                
                {/* Location Indicator (Idle) */}
                {(appState === AppState.MAP_IDLE || appState === AppState.SPOT_SELECTED) && (
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg font-medium text-brand-600 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        North Dallas
                    </div>
                )}
               </>
            )}
        </div>
      </div>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500">5.0 ★ Rating</p>
              </div>
            </div>
            <nav className="space-y-2 flex-1">
              <button className="flex items-center w-full p-3 hover:bg-brand-50 hover:text-brand-600 rounded-xl text-gray-700 font-medium transition-colors">
                <Clock className="w-5 h-5 mr-3" /> My Bookings
              </button>
              <button className="flex items-center w-full p-3 hover:bg-brand-50 hover:text-brand-600 rounded-xl text-gray-700 font-medium transition-colors">
                <ShieldCheck className="w-5 h-5 mr-3" /> Safety
              </button>
            </nav>
            <div className="pt-6 border-t border-gray-100">
               <p className="text-xs text-gray-400 mb-4">Parkr Valet v1.0.0 (Demo)</p>
               <Button variant="outline" fullWidth onClick={() => setAppState(AppState.LOGIN)}>Log Out</Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Layer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col justify-end h-full">
        
        {/* IDLE STATE: Search Bar & Tabs */}
        {appState === AppState.MAP_IDLE && (
          <>
             {/* Floating Search Bar */}
             <div className="pointer-events-auto px-4 pb-4 w-full max-w-md mx-auto">
               <SearchInput 
                 value={searchQuery} 
                 onChange={setSearchQuery} 
                 onFocus={handleSearchFocus}
                 placeholder="Search restaurants, shops..."
               />
             </div>

             {/* Bottom Sheet Tabs */}
             <div className="pointer-events-auto bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[40vh]">
                <div className="flex border-b border-gray-100">
                   <button 
                      onClick={() => setActiveTab('nearby')}
                      className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'nearby' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      Nearby Spots
                   </button>
                   <button 
                      onClick={() => setActiveTab('popular')}
                      className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'popular' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      Popular Locations
                   </button>
                </div>
                
                <div className="overflow-y-auto p-4 bg-gray-50/50">
                   {activeTab === 'nearby' ? (
                      <div className="space-y-2">
                         {spots.map(spot => (
                            <div 
                              key={spot.id} 
                              onClick={() => handleSpotClick(spot)}
                              className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-brand-200 cursor-pointer transition-colors"
                            >
                               <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 font-bold text-xs shrink-0 mr-3">
                                  P
                               </div>
                               <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm">{spot.location.address}</h4>
                                  <p className="text-xs text-gray-500">{spot.status === SpotStatus.HELD_BY_PARKER ? 'Held by Parker' : 'Open Spot'}</p>
                               </div>
                               <span className="font-bold text-gray-900">${spot.price}</span>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="space-y-2">
                         {POPULAR_LOCATIONS.map((loc, idx) => (
                            <div 
                              key={idx}
                              onClick={() => handleLocationSelect(loc)}
                              className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-brand-200 cursor-pointer transition-colors"
                            >
                               <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 shrink-0 mr-3">
                                  <MapPin className="w-5 h-5" />
                               </div>
                               <div>
                                  <h4 className="font-semibold text-gray-900 text-sm">{loc.name}</h4>
                                  <p className="text-xs text-gray-500">{loc.address}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </>
        )}

        {/* FULL SCREEN SEARCH */}
        {appState === AppState.SEARCHING && (
          <div className="pointer-events-auto bg-white h-full flex flex-col animate-in slide-in-from-bottom-10 duration-300">
             <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={handleBackToMap} className="p-2 hover:bg-gray-100 rounded-full">
                   <ChevronLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex-1">
                   <input
                     autoFocus
                     className="w-full text-lg font-medium placeholder-gray-400 outline-none"
                     placeholder="Search restaurants, shops..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
             </div>
             <div className="flex-1 overflow-y-auto bg-gray-50">
               <div className="p-4">
                 {searchQuery.length > 0 && (
                   <>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Businesses</h3>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        {MOCK_BUSINESSES.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).map((biz, idx) => (
                          <LocationItem 
                            key={idx}
                            name={biz.name}
                            address={biz.address}
                            onClick={() => handleLocationSelect(biz)}
                          />
                        ))}
                        {MOCK_BUSINESSES.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="p-4 text-gray-400 text-sm text-center">No results found</div>
                        )}
                      </div>
                   </>
                 )}

                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular Areas</h3>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    {POPULAR_LOCATIONS.map((loc, idx) => (
                        <LocationItem 
                          key={idx}
                          name={loc.name}
                          address={loc.address}
                          onClick={() => handleLocationSelect(loc)}
                        />
                    ))}
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* SPOT SELECTED BOTTOM SHEET */}
        {appState === AppState.SPOT_SELECTED && selectedSpot && (
          <div className="pointer-events-auto bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-6 pb-8 animate-in slide-in-from-bottom-20 duration-500">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
             
             <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedSpot.isVirtual ? 'Park Here' : (selectedSpot.status === SpotStatus.HELD_BY_PARKER ? 'Spot Held by Parker' : 'Open Spot')}
                  </h2>
                  <p className="text-gray-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> {selectedSpot.location.address}
                  </p>
               </div>
               
               {!selectedSpot.isVirtual && (
                <div className="bg-gray-900 px-3 py-1.5 rounded-lg">
                    <span className="text-xl font-bold text-white">${selectedSpot.price}</span>
                </div>
               )}
             </div>

             {!selectedSpot.isVirtual && selectedSpot.parkerName && (
               <div className="flex items-center gap-3 bg-brand-50 p-4 rounded-xl mb-6 border border-brand-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-brand-200 shadow-sm">
                     <UserIcon className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                     <p className="text-sm text-brand-900 font-bold">Held by {selectedSpot.parkerName}</p>
                     <p className="text-xs text-brand-600">{selectedSpot.rating} ★ • {selectedSpot.carModel}</p>
                  </div>
                  <div className="ml-auto bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                     VERIFIED
                  </div>
               </div>
             )}

             <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-brand-500 bg-brand-50 text-brand-700 relative overflow-hidden transition-transform active:scale-[0.98]">
                   <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] px-2 py-0.5 rounded-bl font-bold">FASTEST</div>
                   <span className="text-lg font-bold">ASAP</span>
                   <span className="text-xs opacity-75">Connect now</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                   <span className="text-lg font-bold">Reserve</span>
                   <span className="text-xs opacity-75">For later</span>
                </button>
             </div>

             <Button 
               fullWidth 
               size="lg" 
               onClick={handleContinueToCar}
               className="h-14 text-lg"
             >
               Continue
             </Button>
          </div>
        )}

        {/* ACTIVE BOOKING STATES */}
        {(appState === AppState.WAITING_FOR_PARKER || appState === AppState.NAVIGATING) && (
           <div className="pointer-events-auto bg-white m-4 rounded-2xl shadow-2xl p-6 mb-8 animate-in slide-in-from-bottom duration-500 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">
                       {appState === AppState.WAITING_FOR_PARKER ? 'Connecting...' : 'Parker is Waiting'}
                    </h3>
                    <p className="text-sm text-gray-500">
                       {appState === AppState.WAITING_FOR_PARKER ? 'Finalizing details' : 'Drive to the pinned location'}
                    </p>
                 </div>
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <Car className="w-6 h-6 text-brand-600" />
                 </div>
              </div>

              {appState === AppState.NAVIGATING && (
                 <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center">
                       <Car className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                       <p className="font-bold text-gray-900">Gray Honda Civic</p>
                       <p className="text-gray-500 text-sm">License: KLP-9822</p>
                       <div className="flex items-center mt-1">
                          <span className="w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded flex items-center justify-center mr-1">P</span>
                          <span className="text-xs text-brand-600 font-medium">Badge on Dashboard</span>
                       </div>
                    </div>
                 </div>
              )}

              <div className="flex gap-3">
                 <Button variant="secondary" className="flex-1 h-12">
                    <Phone className="w-4 h-4 mr-2" /> Call
                 </Button>
                 <Button variant="secondary" className="flex-1 h-12">
                    <MessageSquare className="w-4 h-4 mr-2" /> Chat
                 </Button>
              </div>
           </div>
        )}

        {/* ARRIVAL STATE */}
        {appState === AppState.ARRIVED && (
           <div className="pointer-events-auto bg-white m-4 rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <ShieldCheck className="w-8 h-8" />
                 </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You've Arrived!</h2>
              <p className="text-gray-600 mb-8">Exchange complete. The parker has released the spot to you.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                 <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Spot Fee</span>
                    <span className="font-medium">$12.00</span>
                 </div>
                 <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">$2.50</span>
                 </div>
                 <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>$14.50</span>
                 </div>
              </div>

              <Button fullWidth size="lg" onClick={handleReset}>Done</Button>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
