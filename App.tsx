

import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import { Button, SearchInput, LocationItem } from './components/UIComponents';
import { AppState, Spot, User, SpotStatus, Vehicle, ParkingTier, ParkerStatus } from './types';
import { INITIAL_CENTER, POPULAR_LOCATIONS, MOCK_BUSINESSES, MOCK_SPOTS, MOCK_VEHICLES } from './constants';
import { supabaseMock } from './services/supabaseMock';
import { 
  Menu, 
  User as UserIcon, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  Navigation,
  ShieldCheck,
  Car,
  Banknote,
  MoreHorizontal,
  Plus,
  Check,
  Award,
  CircleDollarSign,
  Calendar,
  CreditCard,
  ArrowRight,
  Bell,
  Trophy,
  Sparkles,
  Wallet,
  Info,
  Megaphone,
  Lightbulb,
  MapPin as AddLocation,
  BarChart,
  HelpCircle,
  Home,
  Newspaper,
  Briefcase,
  Phone,
  FileText,
  Globe,
  Moon,
  Lock,
  Gavel,
  Shield,
  LogOut,
  Pencil,
  ArrowLeft
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card_1');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nearby' | 'popular'>('nearby');
  // Navigation for active booking bottom bar
  const [bottomNavTab, setBottomNavTab] = useState<'find' | 'car' | 'history' | 'profile'>('find');
  
  // Contractor State
  const [parkerStatus, setParkerStatus] = useState<ParkerStatus>(ParkerStatus.OFFLINE);

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

  const handleContractorLogin = () => {
    setAppState(AppState.CONTRACTOR_DASHBOARD);
  };

  const handleSearchFocus = () => {
    setAppState(AppState.SEARCHING);
  };

  const handleBackToMap = () => {
    setAppState(AppState.MAP_IDLE);
    setSearchQuery('');
    setSelectedSpot(null);
  };

  const handleLocationSelect = async (location: { lat: number; lng: number; name: string }) => {
    setLoading(true);
    setSearchQuery(location.name);
    setCenter({ lat: location.lat, lng: location.lng });
    
    // Always create a virtual spot so the user can book at this location
    const newSpot: Spot = {
      id: `temp_${Date.now()}`,
      location: { lat: location.lat, lng: location.lng, address: location.name },
      price: 0, // Price set by tier later
      status: SpotStatus.AVAILABLE,
      isVirtual: true
    };
    
    setSpots(prev => [...prev, newSpot]);
    setSelectedSpot(newSpot);
    setAppState(AppState.SPOT_SELECTED);
    
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
      setAppState(AppState.SELECT_TIER);
    } else {
      setAppState(AppState.BOOKING_REVIEW);
    }
  };

  const handleTierSelect = (tier: ParkingTier) => {
    setSelectedTier(tier);
  };

  const handleTierContinue = () => {
    setAppState(AppState.BOOKING_REVIEW);
  };

  const handleReviewConfirm = () => {
    // Go to payment options
    setAppState(AppState.PAYMENT_METHODS);
  };

  const handlePaymentContinue = async () => {
    setAppState(AppState.SEARCHING_PARKER);
    // Simulate searching delay
    setTimeout(() => {
        setAppState(AppState.WAITING_FOR_PARKER);
        setBottomNavTab('find'); // Default to 'Find Parking' view which shows details
    }, 3500);
  };

  const handleCancelBooking = () => {
      // In a real app, logic to cancel
      handleReset();
  };

  const handleReset = () => {
    setAppState(AppState.MAP_IDLE);
    setSelectedSpot(null);
    setSearchQuery('');
    setCenter(INITIAL_CENTER);
    setSpots(MOCK_SPOTS);
    setBottomNavTab('find');
  };

  // Helper for Bottom Nav Switching
  const handleBottomNavChange = (tab: 'find' | 'car' | 'history' | 'profile') => {
      setBottomNavTab(tab);
  };

  // Contractor Helpers
  const toggleGoLive = () => {
    if (parkerStatus === ParkerStatus.OFFLINE) {
        setParkerStatus(ParkerStatus.READY);
    } else {
        setParkerStatus(ParkerStatus.OFFLINE);
    }
  };

  // --- RENDER VIEWS ---

  // Helper to render consistent sub-pages for Contractor Account
  const renderContractorSubPage = (title: string, content?: React.ReactNode) => (
    <div className="h-full w-full bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
        <header className="flex items-center justify-between p-4 pt-6 pb-2 bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200/50">
            <button 
                onClick={() => setAppState(AppState.CONTRACTOR_ACCOUNT)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <div className="w-10"></div> {/* Spacer for center alignment */}
        </header>
        <main className="flex-1 overflow-y-auto p-4">
            {content || (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <p>Details for {title} would go here.</p>
                </div>
            )}
        </main>
    </div>
  );

  const renderContent = () => {
    if (appState === AppState.LOGIN) {
      return (
        <div className="h-full w-full bg-[#f8fafc] flex flex-col px-6 py-6 relative overflow-hidden">
          <header className="w-full flex justify-center flex-none mb-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Parkr</h1>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto min-h-0">
            <div className="w-full h-full max-h-[25vh] aspect-square flex items-center justify-center mb-4 shrink-1">
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
              onClick={handleContractorLogin}
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

    // --- CONSUMER BOOKING FLOWS ---

    // 1. SELECT VEHICLE
    if (appState === AppState.SELECT_VEHICLE) {
      return (
        <div className="h-full w-full bg-white flex flex-col font-sans overflow-hidden">
          <header className="sticky top-0 bg-white z-30 border-b border-gray-100 flex-none">
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

          <main className="flex-grow px-4 pt-6 pb-20 overflow-y-auto">
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
                        <Car className="w-6 h-6" />
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

          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex-none">
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

    // 2. SELECT TIER (For Virtual/Search Spots)
    if (appState === AppState.SELECT_TIER) {
      return (
        <div className="h-full w-full bg-white flex flex-col font-sans overflow-hidden">
          <header className="sticky top-0 bg-white z-30 flex-none">
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

          <main className="flex-grow px-4 py-3 pb-24 overflow-y-auto">
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

          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex-none">
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

    // 3. BOOKING REVIEW
    if (appState === AppState.BOOKING_REVIEW) {
      const displayPrice = selectedSpot?.isVirtual ? selectedTier.price : selectedSpot?.price;
      const priceString = displayPrice?.toFixed(2);

      return (
        <div className="h-full w-full bg-white flex flex-col font-sans overflow-hidden">
          <header className="sticky top-0 bg-white z-30 flex-none">
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

          <main className="flex-grow pb-24 overflow-y-auto">
            <div className="flex px-4 py-3">
               <div className="w-full h-48 rounded-xl overflow-hidden relative shadow-md">
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
              <div className="flex items-center gap-4 min-h-[72px]">
                <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Spot Location</p>
                  <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">{selectedSpot?.location.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 min-h-[72px]">
                <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                  <CircleDollarSign className="w-6 h-6" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Total Cost</p>
                  <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">${priceString}</p>
                </div>
              </div>

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

          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col gap-3 flex-none">
            <Button 
              fullWidth 
              size="lg" 
              isLoading={loading}
              onClick={handleReviewConfirm}
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

    // 4. PAYMENT
    if (appState === AppState.PAYMENT_METHODS) {
      return (
        <div className="h-full w-full bg-white flex flex-col font-sans overflow-hidden">
          <header className="sticky top-0 bg-white z-30 flex-none">
            <div className="flex items-center p-4 pb-2 justify-between">
              <button 
                onClick={() => setAppState(AppState.BOOKING_REVIEW)}
                className="text-[#111418] flex size-12 shrink-0 items-center justify-center hover:bg-gray-50 rounded-full"
              >
                 <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Payment Options</h2>
              <div className="flex size-12 shrink-0"></div>
            </div>
          </header>

          <main className="flex-grow px-4 py-6 pb-24 overflow-y-auto">
            <p className="text-[#111418] text-base font-bold leading-normal pb-4">My Saved Cards</p>
            
            <div 
               onClick={() => setSelectedPaymentMethod('card_1')}
               className={`rounded-lg p-4 flex items-center justify-between min-h-[64px] mb-3 cursor-pointer border transition-colors ${selectedPaymentMethod === 'card_1' ? 'bg-brand-50 border-brand-500' : 'bg-[#f0f2f5] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="text-[#60758a] w-6 h-6" />
                <p className="text-[#111418] text-base font-normal leading-normal">Visa ending in •••• 1234</p>
              </div>
              {selectedPaymentMethod === 'card_1' && <Check className="text-brand-500 w-5 h-5" />}
            </div>

            <button className="flex items-center justify-center w-full bg-[#f0f2f5] rounded-lg min-h-[64px] py-4 px-4 text-brand-500 text-base font-medium leading-normal cursor-pointer hover:bg-gray-200 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              <span className="truncate">Add New Card</span>
            </button>

            <div className="h-px bg-gray-100 my-6"></div>

            <p className="text-[#111418] text-base font-bold leading-normal pb-4">Digital Wallets</p>
            <button 
               onClick={() => setSelectedPaymentMethod('apple_pay')}
               className="flex items-center justify-center w-full h-12 px-5 bg-brand-500 text-white text-base font-bold rounded-lg tracking-[0.015em] active:scale-[0.98] transition-transform"
            >
              Pay with Apple Pay
            </button>
          </main>

          {selectedPaymentMethod && (
              <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex-none">
                  <Button 
                     fullWidth 
                     size="lg" 
                     onClick={handlePaymentContinue}
                  >
                     Continue
                  </Button>
              </div>
          )}
        </div>
      );
    }

    // 5. SEARCHING PARKER LOADING
    if (appState === AppState.SEARCHING_PARKER) {
      return (
        <div className="h-full w-full bg-[#E5E5EA]/20 flex flex-col items-center justify-center relative font-sans overflow-hidden">
          <h2 className="text-[#111418] text-lg font-bold mb-12 absolute top-[20%]">Finalizing details...</h2>
          
          {/* Pulsing Animation */}
          <div className="relative flex items-center justify-center">
              {/* Outer rings */}
              <div className="absolute w-32 h-32 bg-brand-500/10 rounded-full animate-ping"></div>
              <div className="absolute w-24 h-24 bg-brand-500/20 rounded-full animate-pulse"></div>
              
              {/* Main Circle with Border */}
              <div className="relative w-20 h-20 rounded-full border-4 border-brand-500 bg-brand-50 flex items-center justify-center shadow-lg">
                  <span className="text-brand-600 font-bold text-3xl">P</span>
              </div>
          </div>

          <div className="mt-12 text-center px-8 max-w-xs">
              <p className="text-gray-600 text-sm leading-relaxed">
                  Your spot holder has accepted the job. We are confirming everything for you.
              </p>
          </div>

          <div className="absolute bottom-8 w-full px-4">
               <Button fullWidth onClick={() => setAppState(AppState.BOOKING_REVIEW)}>
                   Cancel
               </Button>
          </div>
        </div>
      );
    }

    // 6. ACTIVE BOOKING / PROFILE FLOW
    if (appState === AppState.WAITING_FOR_PARKER || appState === AppState.PROFILE) {
        // --- PROFILE VIEW (Active) ---
        const renderProfileView = () => (
            <div className="h-full bg-white flex flex-col font-sans">
                <header className="flex items-center bg-white p-4 pb-2 justify-between flex-none">
                   <button onClick={() => setBottomNavTab('find')} className="text-[#111418] flex size-12 shrink-0 items-center">
                      <ChevronLeft className="w-6 h-6" />
                   </button>
                   <h2 className="text-[#111418] text-lg font-bold leading-tight flex-1 text-center pr-12">Profile</h2>
                </header>
                
                <main className="flex-1 overflow-y-auto pb-24">
                   <div className="flex flex-col items-center p-6 pb-2">
                       <div 
                          className="w-32 h-32 rounded-full bg-center bg-cover mb-4 shadow-md"
                          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBYOI0IICc1sAGt-H_0Wo8lZb7o0uenClFoyBOZpM0LslX8S1IFunBiRSQxrKSGZwGUH54TScyJs157FmB8BW4npwDghV5hBA97TCLx9w6yB5AfinWbSBn9_OLN0ofLOZ1O36pFGbb1LJ6RtdPE9HglR7lLaV4eCpLSLgET8YCbtNThMgEZ4fXDhLHvr9yGzkanqNdn-kJZ7OXB-ORKoBAZhiOBR3ma6DCLRNvXcDKpjofqjNF47oE0JYhFJiTNplfogy8CNx4Acg")' }}
                       />
                       <h3 className="text-2xl font-bold text-gray-900">Ethan Carter</h3>
                       <p className="text-brand-600">Member since 2021</p>
                   </div>

                   <h3 className="text-lg font-bold px-4 pt-4 pb-2">Account</h3>
                   <div className="px-4 space-y-1">
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Personal Information</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Payment Methods</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Vehicles</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                   </div>

                   <h3 className="text-lg font-bold px-4 pt-4 pb-2">Activity</h3>
                   <div className="px-4 space-y-1">
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Parking History</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Reviews</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                   </div>

                   <h3 className="text-lg font-bold px-4 pt-4 pb-2">Settings</h3>
                   <div className="px-4 space-y-1">
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Notifications</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Privacy</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="flex w-full items-center justify-between p-4 bg-white hover:bg-gray-50 border-b border-gray-100">
                         <span>Help</span>
                         <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                   </div>
                </main>
            </div>
        );

        // --- ACTIVE BOOKING (Details View) ---
        const renderActiveBookingDetails = () => (
            <div className="flex flex-col h-full bg-white font-sans">
               <div className="flex items-center bg-white p-4 pb-2 justify-between flex-none">
                  <button onClick={() => {}} className="text-[#111418] flex size-12 shrink-0 items-center">
                     <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-[#111418] text-lg font-bold leading-tight flex-1 text-center pr-12">Booking Details</h2>
               </div>

               <div className="flex-1 overflow-y-auto pb-24">
                   <div className="flex px-4 py-3">
                      <div className="w-full h-48 rounded-xl overflow-hidden relative shadow-md">
                         <img 
                           src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzCWlho9gZR3_k1OLAlNGo3lkH-6Sv7XLDnVFg20SZnxKSawVXZzi_7YI_Zg0KBGV7WKjATnL7J-3Moj-s5plr53C44goq0BWGvyju80VQbzvvrKtrSqxChgGlzYI_VFrHHrixy59A33v09YqJ2SIR3hHDhBxWXsmcqmzkZOaVc5TTzA8KgcnZY6OCCCQ7tW0Uq9Lzit0_7MXr90sC_BPVOvmOxzGKEgMbbINnn48CcnWZ0EmdDJHln5ym4lA-GFOxsX0HoJt27AqK" 
                           alt="Map Location" 
                           className="w-full h-full object-cover"
                         />
                      </div>
                   </div>

                   <div className="mx-4 mt-2 rounded-xl bg-gray-50 p-4 shadow-sm border border-brand-100">
                      <h2 className="text-brand-600 text-2xl font-extrabold pb-2">Booking Accepted</h2>
                      <p className="text-[#111418] text-base font-medium leading-normal">Spot Holder's Profile Name</p>
                      <p className="text-[#111418] text-base font-normal leading-normal pt-2">
                         Once the parker arrives at the spot, we'll connect via location services, and you'll have <span className="font-bold">30 minutes</span> to arrive at the spot.
                      </p>
                   </div>

                   <div className="mx-4 mt-4 space-y-4">
                      <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 shadow-sm min-h-[72px]">
                         <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                            <MapPin className="w-6 h-6" />
                         </div>
                         <div className="flex flex-col justify-center">
                            <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Spot Location</p>
                            <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">{selectedSpot?.location.address}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 shadow-sm min-h-[72px]">
                         <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                            <CircleDollarSign className="w-6 h-6" />
                         </div>
                         <div className="flex flex-col justify-center">
                            <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Total Cost</p>
                            <p className="text-[#60758a] text-sm font-normal leading-normal line-clamp-2">
                               ${selectedSpot?.isVirtual ? selectedTier.price.toFixed(2) : selectedSpot?.price.toFixed(2)}
                            </p>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 shadow-sm min-h-[72px]">
                         <div className="text-[#111418] flex items-center justify-center rounded-lg bg-white shrink-0 size-12 shadow-sm">
                            <Calendar className="w-6 h-6" />
                         </div>
                         <div className="flex flex-col justify-center">
                            <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Booking Time</p>
                            <p className="text-brand-600 font-bold line-clamp-2">ASAP</p>
                         </div>
                      </div>
                      
                      <Button fullWidth onClick={handleCancelBooking} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                         Cancel Booking
                      </Button>
                   </div>
               </div>
            </div>
        );

        return (
            <div className="h-full w-full bg-white flex flex-col font-sans relative overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    {bottomNavTab === 'find' && renderActiveBookingDetails()}
                    {bottomNavTab === 'profile' && renderProfileView()}
                    {bottomNavTab === 'car' && (
                        <div className="p-8 text-center text-gray-500 mt-20">My Car View Placeholder</div>
                    )}
                    {bottomNavTab === 'history' && (
                        <div className="p-8 text-center text-gray-500 mt-20">History View Placeholder</div>
                    )}
                </div>

                {/* BOTTOM NAVIGATION BAR */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 h-[80px] grid grid-cols-4 items-center justify-items-center z-50 flex-none">
                    <button 
                       onClick={() => handleBottomNavChange('find')}
                       className={`flex h-full w-full flex-col items-center justify-center gap-1 ${bottomNavTab === 'find' ? 'text-brand-600' : 'text-[#60758a] hover:text-brand-600'}`}
                    >
                       <MapPin className="w-7 h-7" />
                       <span className="text-xs font-medium leading-tight">Find parking</span>
                    </button>
                    <button 
                       onClick={() => handleBottomNavChange('car')}
                       className={`flex h-full w-full flex-col items-center justify-center gap-1 ${bottomNavTab === 'car' ? 'text-brand-600' : 'text-[#60758a] hover:text-brand-600'}`}
                    >
                       <Car className="w-7 h-7" />
                       <span className="text-xs font-medium leading-tight">My car</span>
                    </button>
                    <button 
                       onClick={() => handleBottomNavChange('history')}
                       className={`flex h-full w-full flex-col items-center justify-center gap-1 ${bottomNavTab === 'history' ? 'text-brand-600' : 'text-[#60758a] hover:text-brand-600'}`}
                    >
                       <Clock className="w-7 h-7" />
                       <span className="text-xs font-medium leading-tight">History</span>
                    </button>
                    <button 
                       onClick={() => handleBottomNavChange('profile')}
                       className={`flex h-full w-full flex-col items-center justify-center gap-1 ${bottomNavTab === 'profile' ? 'text-brand-600' : 'text-[#111418] hover:text-brand-600'}`}
                    >
                       <UserIcon className="w-7 h-7" />
                       <span className="text-xs font-medium leading-tight relative">
                           Profile
                           {bottomNavTab === 'profile' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-brand-600 rounded-full"></span>}
                       </span>
                    </button>
                </div>
            </div>
        );
    }

    // --- CONTRACTOR DASHBOARD ---
    if (appState === AppState.CONTRACTOR_DASHBOARD) {
        return (
            <div className="h-full w-full bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
                <header className="flex items-center justify-between p-6 pt-8 bg-white/50 backdrop-blur-md flex-none sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 shadow-sm"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZOGn8B8EETGrUvzk0_6Im-y21_rPdEo0tuPQBM4DiDbVTnSlAaWlN2pck3HAXdXS1Gy-O4-2DGsKXuEdkgrnvsIoZtEbe0izznjWPIflfnRYLz-zz9FrTEspUVNPyTMl5zHW8aL1KHBGtVJFgQjss8f7Dz1DA04Q4RdnAn1AZFn_zkbjrjYuGdCUXqU9tbvsbv6scrTmsxpdHheWcERyGOLL8iTXlGqlRcy-GzyJ5YZuDj9_KAfpMCm0MjAWhE4IcfM01wxfnMhT3")' }}
                        />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Welcome back,</p>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">Alex Doe</h1>
                        </div>
                    </div>
                    <button className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Achievement Card */}
                    <div className="w-full bg-gradient-to-br from-brand-500 to-blue-400 rounded-3xl p-6 text-white shadow-lg shadow-brand-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-6 h-6 text-yellow-300" />
                                <h2 className="text-xl font-bold">Achievement Path</h2>
                            </div>
                            <p className="text-blue-50 text-sm mb-4 font-medium">You're a Gold Parker! Just 5 more spots to Platinum.</p>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-black/20 rounded-full mb-1">
                                <div className="w-[75%] h-full bg-white rounded-full relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow flex items-center justify-center">
                                        <Sparkles className="w-2 h-2 text-brand-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] text-blue-100 font-medium mb-5">
                                <span>Gold Parker</span>
                                <span>Platinum Parker</span>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-semibold backdrop-blur-sm transition-colors flex items-center justify-center gap-2">
                                    View Milestones <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={toggleGoLive}
                                    className="px-5 py-2.5 bg-white text-brand-600 hover:bg-blue-50 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {parkerStatus === ParkerStatus.OFFLINE ? 'Go Live' : 'Stop'}
                                    <span className={`w-2.5 h-2.5 rounded-full ${parkerStatus === ParkerStatus.OFFLINE ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <Wallet className="w-4 h-4" />
                                <span className="text-xs font-semibold">Earnings</span>
                            </div>
                            <p className="text-2xl font-bold text-brand-600">$1,250.75</p>
                            <p className="text-[10px] text-gray-400 font-medium">+ $80 this week</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-2">
                                <Info className="w-4 h-4" />
                                <span className="text-xs font-semibold">Status</span>
                            </div>
                            <p className={`text-2xl font-bold ${
                                parkerStatus === ParkerStatus.READY ? 'text-green-500' : 
                                parkerStatus === ParkerStatus.PARKED ? 'text-yellow-500' : 'text-gray-400'
                            }`}>
                                {parkerStatus === ParkerStatus.OFFLINE ? 'Offline' : 
                                 parkerStatus === ParkerStatus.READY ? 'Ready' : 'Parked'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">
                                {parkerStatus === ParkerStatus.OFFLINE ? "Press 'Go Live' to accept" : 
                                 parkerStatus === ParkerStatus.READY ? "Ready to take requests" : "Currently holding a spot"}
                            </p>
                        </div>
                    </div>

                    {/* Parker Hub */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Parker Hub</h3>
                        <div className="space-y-3">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-600 flex items-center justify-center shrink-0">
                                    <Megaphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Local Demand Insight</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">High demand in Downtown core this weekend! Consider listing your spot.</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-600 flex items-center justify-center shrink-0">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Peer Tip: Cleanliness Boosts Ratings</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">"A tidy spot always gets me 5-star reviews!" - Sarah P.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tools Grid */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Tools</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <AddLocation className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">Add New Spot</span>
                            </button>
                            <button 
                                onClick={() => setAppState(AppState.CONTRACTOR_TOOLS_PAY)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">Pay</span>
                            </button>
                            <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <BarChart className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">View Analytics</span>
                            </button>
                            <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">Support Center</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Contractor Bottom Nav */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 h-[80px] grid grid-cols-4 items-center justify-items-center z-50 flex-none">
                     <button 
                        onClick={() => setAppState(AppState.CONTRACTOR_DASHBOARD)}
                        className="flex h-full w-full flex-col items-center justify-center gap-1 text-brand-600"
                     >
                        <Home className="w-6 h-6 fill-current" />
                        <span className="text-[10px] font-bold">Home</span>
                     </button>
                     <button className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600">
                        <Car className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Spots</span>
                     </button>
                     <button className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600">
                        <Newspaper className="w-6 h-6" />
                        <span className="text-[10px] font-medium">News</span>
                     </button>
                     <button 
                        onClick={() => setAppState(AppState.CONTRACTOR_ACCOUNT)}
                        className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600"
                     >
                        <UserIcon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Account</span>
                     </button>
                </div>
            </div>
        );
    }

    // --- CONTRACTOR TOOLS PAY ---
    if (appState === AppState.CONTRACTOR_TOOLS_PAY) {
      return (
        <div className="h-full w-full bg-[#f5f7f8] flex flex-col font-sans overflow-hidden">
          <header className="flex items-center justify-between p-4 pt-6 flex-none bg-[#f5f7f8] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <img 
                alt="User avatar" 
                className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZOGn8B8EETGrUvzk0_6Im-y21_rPdEo0tuPQBM4DiDbVTnSlAaWlN2pck3HAXdXS1Gy-O4-2DGsKXuEdkgrnvsIoZtEbe0izznjWPIflfnRYLz-zz9FrTEspUVNPyTMl5zHW8aL1KHBGtVJFgQjss8f7Dz1DA04Q4RdnAn1AZFn_zkbjrjYuGdCUXqU9tbvsbv6scrTmsxpdHheWcERyGOLL8iTXlGqlRcy-GzyJ5YZuDj9_KAfpMCm0MjAWhE4IcfM01wxfnMhT3"
              />
              <div>
                <p className="text-sm text-slate-500">Welcome back,</p>
                <h1 className="text-xl font-bold text-[#0f1923]">Alex Doe</h1>
              </div>
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 hover:bg-white transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[#f5f7f8]"></div>
            </button>
          </header>

          <main className="flex flex-col gap-6 p-4 grow overflow-y-auto">
            <div>
                <h2 className="text-2xl font-bold px-1 mt-2 text-[#0f1923]">Upcoming Payments</h2>
                <div className="relative w-full overflow-hidden rounded-2xl bg-[#359EFF] p-6 text-white shadow-lg shadow-[#359EFF]/30 mt-4">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>
                  <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/10"></div>
                  <div className="relative z-10 flex flex-col gap-2">
                    <p className="text-4xl font-bold">$185.00</p>
                    <p className="text-xs font-light opacity-80 mt-1">Next Pay Period: 3 days</p>
                  </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold px-1 text-[#0f1923]">Itemized Payments</h3>
              <div className="relative flex flex-col gap-3">
                 {[
                    { title: "Frisco The Star Payout", date: "Nov 28, 2024", amount: "6.50" },
                    { title: "Legacy East Payout", date: "Nov 27, 2024", amount: "8.00" },
                    { title: "Mi Cocina Parking Fee", date: "Nov 27, 2024", amount: "4.00" },
                    { title: "Legacy West Payout", date: "Nov 26, 2024", amount: "7.25" },
                    { title: "Frisco The Star Payout", date: "Nov 25, 2024", amount: "5.50" },
                    { title: "Mi Cocina Parking Fee", date: "Nov 24, 2024", amount: "4.00" },
                    { title: "Legacy East Payout", date: "Nov 23, 2024", amount: "7.75" },
                    { title: "Frisco The Star Payout", date: "Nov 22, 2024", amount: "6.00" },
                 ].map((item, i) => (
                    <div key={i} className="rounded-xl bg-white/70 backdrop-blur-md border border-slate-200/60 p-4 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-base text-[#0f1923]">{item.title}</p>
                        <p className="text-sm text-slate-500">Paid: {item.date}</p>
                      </div>
                      <p className="text-lg font-bold text-[#359EFF]">${item.amount}</p>
                    </div>
                 ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 pt-4 pb-4">
              <div className="flex justify-center gap-6 mt-2">
                <button onClick={() => setAppState(AppState.CONTRACTOR_PAYMENT_METHODS)} className="text-sm font-semibold text-[#359EFF] hover:underline cursor-pointer bg-transparent border-none p-0">Manage Payment Methods</button>
                <button className="text-sm font-semibold text-[#359EFF] hover:underline cursor-pointer bg-transparent border-none p-0">View Past Transactions</button>
              </div>
            </div>
          </main>
            
          <footer className="sticky bottom-0 w-full bg-white/70 backdrop-blur-xl border-t border-slate-200 flex-none z-50">
            <nav className="flex justify-around items-center h-20 px-4 pb-2">
               <button onClick={() => setAppState(AppState.CONTRACTOR_DASHBOARD)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#359EFF] w-16">
                  <Home className="w-6 h-6" />
                  <span className="text-xs font-medium">Home</span>
               </button>
               <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#359EFF] w-16">
                  <Car className="w-6 h-6" />
                  <span className="text-xs font-medium">Spots</span>
               </button>
               <button className="flex flex-col items-center gap-1 text-[#359EFF] w-16">
                  <Newspaper className="w-6 h-6 fill-current" />
                  <span className="text-xs font-bold">News</span>
               </button>
               <button onClick={() => setAppState(AppState.CONTRACTOR_ACCOUNT)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#359EFF] w-16">
                  <UserIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">Account</span>
               </button>
            </nav>
          </footer>
        </div>
      );
    }

    // --- CONTRACTOR ACCOUNT SETTINGS ---
    if (appState === AppState.CONTRACTOR_ACCOUNT) {
        return (
            <div className="h-full w-full bg-[#f8fafc] flex flex-col font-sans overflow-hidden">
                <header className="flex items-center justify-between p-4 pt-6 pb-2 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <button 
                        onClick={() => setAppState(AppState.CONTRACTOR_DASHBOARD)}
                        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Account</h1>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></div>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-6">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div 
                            className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-white shadow-md"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZOGn8B8EETGrUvzk0_6Im-y21_rPdEo0tuPQBM4DiDbVTnSlAaWlN2pck3HAXdXS1Gy-O4-2DGsKXuEdkgrnvsIoZtEbe0izznjWPIflfnRYLz-zz9FrTEspUVNPyTMl5zHW8aL1KHBGtVJFgQjss8f7Dz1DA04Q4RdnAn1AZFn_zkbjrjYuGdCUXqU9tbvsbv6scrTmsxpdHheWcERyGOLL8iTXlGqlRcy-GzyJ5YZuDj9_KAfpMCm0MjAWhE4IcfM01wxfnMhT3")' }}
                        />
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Alex Doe</h2>
                            <p className="text-sm text-gray-500">alex.doe@example.com</p>
                        </div>
                        <button className="flex items-center gap-1 text-brand-600 font-semibold text-sm hover:underline">
                            Edit Profile <Pencil className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Section: Profile & Contact */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Profile & Contact Information</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                            <button onClick={() => setAppState(AppState.CONTRACTOR_PERSONAL_DETAILS)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Personal Details</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_BUSINESS_INFO)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Business Information</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_CONTACT_PREFERENCES)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Contact Preferences</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Section: Financial */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Financial Management</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                            <button onClick={() => setAppState(AppState.CONTRACTOR_PAYMENT_METHODS)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Payment Methods</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_EARNINGS)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Earnings Reports</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_TAX_DOCUMENTS)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Tax Documents</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Section: App Settings */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">App Settings</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                            <button onClick={() => setAppState(AppState.CONTRACTOR_SETTINGS_LANGUAGE)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Language</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_SETTINGS_THEME)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Moon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Theme</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_SETTINGS_SECURITY)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Security</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Section: Support & Legal */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Support & Legal</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                            <button onClick={() => setAppState(AppState.CONTRACTOR_SUPPORT)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <HelpCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Help Center</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_TERMS)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Gavel className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Terms of Service</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                            <button onClick={() => setAppState(AppState.CONTRACTOR_PRIVACY)} className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Privacy Policy</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => setAppState(AppState.LOGIN)}
                        className="flex items-center justify-center w-full p-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </main>

                {/* Contractor Bottom Nav */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 h-[80px] grid grid-cols-4 items-center justify-items-center z-50 flex-none">
                     <button 
                        onClick={() => setAppState(AppState.CONTRACTOR_DASHBOARD)}
                        className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600"
                     >
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Home</span>
                     </button>
                     <button className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600">
                        <Car className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Spots</span>
                     </button>
                     <button className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-600">
                        <Newspaper className="w-6 h-6" />
                        <span className="text-[10px] font-medium">News</span>
                     </button>
                     <button className="flex h-full w-full flex-col items-center justify-center gap-1 text-brand-600">
                        <UserIcon className="w-6 h-6 fill-current" />
                        <span className="text-[10px] font-bold">Account</span>
                     </button>
                </div>
            </div>
        );
    }

    // --- CONTRACTOR SUB-PAGES ---
    if (appState === AppState.CONTRACTOR_PERSONAL_DETAILS) return renderContractorSubPage('Personal Details');
    if (appState === AppState.CONTRACTOR_BUSINESS_INFO) return renderContractorSubPage('Business Information');
    if (appState === AppState.CONTRACTOR_CONTACT_PREFERENCES) return renderContractorSubPage('Contact Preferences');
    if (appState === AppState.CONTRACTOR_PAYMENT_METHODS) return renderContractorSubPage('Payment Methods');
    if (appState === AppState.CONTRACTOR_EARNINGS) return renderContractorSubPage('Earnings Reports');
    if (appState === AppState.CONTRACTOR_TAX_DOCUMENTS) return renderContractorSubPage('Tax Documents');
    if (appState === AppState.CONTRACTOR_SETTINGS_LANGUAGE) return renderContractorSubPage('Language');
    if (appState === AppState.CONTRACTOR_SETTINGS_THEME) return renderContractorSubPage('Theme');
    if (appState === AppState.CONTRACTOR_SETTINGS_SECURITY) return renderContractorSubPage('Security');
    if (appState === AppState.CONTRACTOR_SUPPORT) return renderContractorSubPage('Help Center');
    if (appState === AppState.CONTRACTOR_TERMS) return renderContractorSubPage('Terms of Service');
    if (appState === AppState.CONTRACTOR_PRIVACY) return renderContractorSubPage('Privacy Policy');

    // MAP VIEW (Consumer) - Main Interactive Logic
    if (
      appState === AppState.MAP_IDLE ||
      appState === AppState.SEARCHING ||
      appState === AppState.SPOT_SELECTED ||
      appState === AppState.NAVIGATING ||
      appState === AppState.ARRIVED
    ) {
      return (
        <div className="h-full w-full relative bg-gray-50 overflow-hidden flex flex-col">
          {/* Map Layer - Always rendered in background for transitions */}
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
    }

    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#f0f2f5] flex items-center justify-center">
      {/* Phone Frame wrapper for desktop, full screen for mobile */}
      <div className="w-full h-full sm:w-[390px] sm:h-[844px] bg-white sm:rounded-[40px] sm:border-[12px] sm:border-[#111111] relative overflow-hidden shadow-2xl">
         {/* Desktop-only notch simulation */}
         <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-[#111111] rounded-b-2xl z-50 pointer-events-none"></div>
         
         {/* App Content */}
         {renderContent()}
      </div>
    </div>
  );
};

export default App;