
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
  ArrowLeft,
  Search
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
    
    const isBusiness = MOCK_BUSINESSES.some(b => b.name === location.name);
    
    if (isBusiness) {
       const newSpot: Spot = {
         id: `temp_${Date.now()}`,
         location: { lat: location.lat, lng: location.lng, address: location.name },
         price: 0, 
         status: SpotStatus.AVAILABLE,
         isVirtual: true
       };
       setSpots(prev => [...prev, newSpot]);
       setSelectedSpot(newSpot);
       setAppState(AppState.SPOT_SELECTED);
    } else {
       setAppState(AppState.MAP_IDLE); 
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
        <header className="flex items-center justify-between p-4 pt-6 pb-2 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
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
                            <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
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
                     <button className="flex h-full w-full flex-col items-center justify-center gap-1 text-brand-600">
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

    // --- CONSUMER VIEW ---
    const isConsumer = !appState.toString().startsWith('CONTRACTOR') && appState !== AppState.LOGIN;

    if (isConsumer) {
      return (
        <div className="h-full w-full relative flex flex-col font-sans overflow-hidden bg-white">
          {/* Map Layer - Always present for consumer to maintain state/context */}
          <div className={`absolute inset-0 z-0 ${appState === AppState.SEARCHING ? 'invisible' : 'visible'}`}>
             <Map
               center={center}
               spots={spots}
               selectedSpotId={selectedSpot?.id}
               onSpotClick={handleSpotClick}
               onMapClick={handleMapClick}
               isInteracting={appState === AppState.MAP_IDLE}
             />
          </div>

          {/* Top Search Bar - Visible in MAP_IDLE */}
          {appState === AppState.MAP_IDLE && (
            <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-white/90 to-transparent pb-8">
               <div className="shadow-lg rounded-xl">
                 <button
                   onClick={handleSearchFocus}
                   className="w-full h-14 bg-white rounded-xl flex items-center px-4 shadow-sm border border-gray-100"
                 >
                   <Search className="w-5 h-5 text-gray-400 mr-3" />
                   <span className="text-gray-500 font-medium text-base">Where to?</span>
                 </button>
               </div>

               {/* Quick filters / Tabs */}
               <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                 <button className="px-4 py-2 bg-brand-500 text-white rounded-full text-sm font-semibold shadow-md whitespace-nowrap">
                   Nearby
                 </button>
                 <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-semibold shadow-md whitespace-nowrap">
                   Recent
                 </button>
                 <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-semibold shadow-md whitespace-nowrap">
                   Cheap
                 </button>
               </div>
            </div>
          )}

          {/* Searching Overlay */}
          {appState === AppState.SEARCHING && (
            <div className="absolute inset-0 z-50 bg-[#f8fafc] flex flex-col">
              <div className="p-4 bg-white shadow-sm border-b border-gray-100 flex items-center gap-2">
                 <button onClick={handleBackToMap} className="p-2 -ml-2 text-gray-600 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-6 h-6" />
                 </button>
                 <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search destination..."
                    autoFocus
                 />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {searchQuery.length > 0 ? (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-2">Search Results</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {[...MOCK_BUSINESSES, ...POPULAR_LOCATIONS]
                                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.address?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((loc, idx) => (
                                <LocationItem
                                    key={`search_${idx}`}
                                    name={loc.name}
                                    address={loc.address || ''}
                                    onClick={() => handleLocationSelect(loc)}
                                    icon={MOCK_BUSINESSES.some(b => b.name === loc.name) ? <Briefcase className="w-5 h-5" /> : undefined}
                                />
                            ))}
                            {[...MOCK_BUSINESSES, ...POPULAR_LOCATIONS]
                                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.address?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .length === 0 && (
                                    <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                                )
                            }
                        </div>
                    </div>
                 ) : (
                    <>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-2">Nearby Businesses</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {MOCK_BUSINESSES.map((loc, idx) => (
                                <LocationItem
                                    key={`bus_${idx}`}
                                    name={loc.name}
                                    address={loc.address}
                                    onClick={() => handleLocationSelect(loc)}
                                    icon={<Briefcase className="w-5 h-5" />}
                                />
                            ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide px-2">Popular Destinations</h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {POPULAR_LOCATIONS.map((loc, idx) => (
                                <LocationItem
                                    key={`pop_${idx}`}
                                    name={loc.name}
                                    address={loc.address}
                                    onClick={() => handleLocationSelect(loc)}
                                />
                            ))}
                            </div>
                        </div>
                    </>
                 )}
              </div>
            </div>
          )}

          {/* Spot Selected Bottom Sheet */}
          {appState === AppState.SPOT_SELECTED && selectedSpot && (
             <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-6 pb-8 animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedSpot.location.address}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">OPEN</span>
                        <span>•</span>
                        <span>3 min walk</span>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-brand-600">${selectedSpot.price}</span>
                      <span className="text-xs text-gray-400">total</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                   <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1 text-gray-500">
                         <ShieldCheck className="w-4 h-4" />
                         <span className="text-xs font-bold">Verified</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-tight">Spot verified by community.</p>
                   </div>
                   <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                       <div className="flex items-center gap-2 mb-1 text-gray-500">
                         <Car className="w-4 h-4" />
                         <span className="text-xs font-bold">Spacious</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-tight">Fits SUVs and trucks.</p>
                   </div>
                </div>

                <Button onClick={handleContinueToCar} fullWidth>
                   Park Here
                </Button>
             </div>
          )}

          {/* Vehicle Selection */}
          {appState === AppState.SELECT_VEHICLE && (
             <div className="absolute inset-0 z-50 bg-white flex flex-col">
                <header className="flex items-center p-4 border-b border-gray-100">
                   <button onClick={() => setAppState(AppState.SPOT_SELECTED)} className="p-2 -ml-2 text-gray-600">
                      <ArrowLeft className="w-6 h-6" />
                   </button>
                   <h1 className="text-lg font-bold flex-1 text-center pr-10">Select Vehicle</h1>
                </header>
                <div className="p-4 space-y-3">
                   {MOCK_VEHICLES.map(v => (
                      <button
                        key={v.id}
                        onClick={() => handleVehicleSelection(v.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${selectedVehicleId === v.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white'}`}
                      >
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedVehicleId === v.id ? 'border-brand-500' : 'border-gray-300'}`}>
                            {selectedVehicleId === v.id && <div className="w-3 h-3 rounded-full bg-brand-500"></div>}
                         </div>
                         <div className="text-left">
                            <p className="font-bold text-gray-900">{v.make} {v.model}</p>
                            <p className="text-sm text-gray-500">{v.licensePlate}</p>
                         </div>
                      </button>
                   ))}

                   <button className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                      <Plus className="w-5 h-5" /> Add New Vehicle
                   </button>
                </div>
                <div className="mt-auto p-4 border-t border-gray-100">
                   <Button onClick={handleVehicleConfirm} fullWidth>Continue</Button>
                </div>
             </div>
          )}

          {/* Tier Selection */}
          {appState === AppState.SELECT_TIER && (
             <div className="absolute inset-0 z-50 bg-white flex flex-col">
                <header className="flex items-center p-4 border-b border-gray-100">
                   <button onClick={() => setAppState(AppState.SELECT_VEHICLE)} className="p-2 -ml-2 text-gray-600">
                      <ArrowLeft className="w-6 h-6" />
                   </button>
                   <h1 className="text-lg font-bold flex-1 text-center pr-10">Choose Tier</h1>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {PARKING_TIERS.map(tier => (
                      <button
                        key={tier.id}
                        onClick={() => handleTierSelect(tier)}
                        className={`w-full p-5 rounded-2xl border-2 flex flex-col gap-3 transition-all relative overflow-hidden ${selectedTier.id === tier.id ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-gray-100 bg-white'}`}
                      >
                         <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedTier.id === tier.id ? 'bg-white' : 'bg-gray-100'}`}>
                                  {tier.id === 'vip' ? <Award className="w-5 h-5 text-amber-500" /> : <Car className="w-5 h-5 text-gray-600" />}
                               </div>
                               <div className="text-left">
                                  <h3 className={`font-bold text-lg ${tier.color}`}>{tier.name}</h3>
                               </div>
                            </div>
                            <div className="text-right">
                               <span className="block text-xl font-bold text-gray-900">${tier.price}</span>
                            </div>
                         </div>
                         <p className="text-left text-sm text-gray-600 leading-relaxed">{tier.description}</p>
                         {selectedTier.id === tier.id && (
                            <div className="absolute top-0 right-0 p-2 bg-brand-500 rounded-bl-xl text-white">
                               <Check className="w-4 h-4" />
                            </div>
                         )}
                      </button>
                   ))}
                </div>
                <div className="mt-auto p-4 border-t border-gray-100">
                   <Button onClick={handleTierContinue} fullWidth>Select {selectedTier.name}</Button>
                </div>
             </div>
          )}

          {/* Booking Review */}
          {appState === AppState.BOOKING_REVIEW && selectedSpot && (
             <div className="absolute inset-0 z-50 bg-[#f8fafc] flex flex-col">
                <header className="flex items-center p-4 bg-white border-b border-gray-100">
                   <button onClick={() => setAppState(selectedSpot.isVirtual ? AppState.SELECT_TIER : AppState.SELECT_VEHICLE)} className="p-2 -ml-2 text-gray-600">
                      <ArrowLeft className="w-6 h-6" />
                   </button>
                   <h1 className="text-lg font-bold flex-1 text-center pr-10">Review Booking</h1>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {/* Summary Card */}
                   <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                         <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                            <MapPin className="w-7 h-7" />
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900 text-lg">{selectedSpot.location.address}</h3>
                            <p className="text-gray-500 text-sm">Today, 2:00 PM - 4:00 PM</p>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Vehicle</span>
                            <span className="font-semibold text-gray-900">{MOCK_VEHICLES.find(v => v.id === selectedVehicleId)?.model}</span>
                         </div>
                         {selectedSpot.isVirtual && (
                            <div className="flex justify-between text-sm">
                               <span className="text-gray-500">Service Tier</span>
                               <span className={`font-semibold ${selectedTier.color}`}>{selectedTier.name}</span>
                            </div>
                         )}
                         <div className="flex justify-between text-sm pt-2 border-t border-dashed border-gray-200">
                            <span className="text-gray-500">Total Price</span>
                            <span className="font-bold text-gray-900 text-lg">${selectedSpot.isVirtual ? selectedTier.price : selectedSpot.price}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700 leading-relaxed">
                         Free cancellation up to 15 mins before arrival. You will only be charged after you park.
                      </p>
                   </div>
                </div>

                <div className="mt-auto p-4 bg-white border-t border-gray-100">
                   <Button onClick={handleReviewConfirm} fullWidth>Confirm & Pay</Button>
                </div>
             </div>
          )}

           {/* Payment Methods */}
           {appState === AppState.PAYMENT_METHODS && (
             <div className="absolute inset-0 z-50 bg-white flex flex-col">
                <header className="flex items-center p-4 border-b border-gray-100">
                   <button onClick={() => setAppState(AppState.BOOKING_REVIEW)} className="p-2 -ml-2 text-gray-600">
                      <ArrowLeft className="w-6 h-6" />
                   </button>
                   <h1 className="text-lg font-bold flex-1 text-center pr-10">Payment</h1>
                </header>
                <div className="p-4 space-y-4">
                    <button
                       onClick={() => setSelectedPaymentMethod('card_1')}
                       className={`w-full p-4 rounded-xl border flex items-center gap-4 ${selectedPaymentMethod === 'card_1' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
                    >
                       <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-[8px]">CARD</div>
                       <div className="text-left flex-1">
                          <p className="font-bold text-gray-900">Visa •••• 4242</p>
                       </div>
                       {selectedPaymentMethod === 'card_1' && <Check className="w-5 h-5 text-brand-600" />}
                    </button>

                     <button
                       onClick={() => setSelectedPaymentMethod('apple_pay')}
                       className={`w-full p-4 rounded-xl border flex items-center gap-4 ${selectedPaymentMethod === 'apple_pay' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}
                    >
                       <div className="w-10 h-6 bg-black rounded flex items-center justify-center text-white text-[10px] font-bold">Pay</div>
                       <div className="text-left flex-1">
                          <p className="font-bold text-gray-900">Apple Pay</p>
                       </div>
                       {selectedPaymentMethod === 'apple_pay' && <Check className="w-5 h-5 text-brand-600" />}
                    </button>
                </div>
                 <div className="mt-auto p-4 border-t border-gray-100">
                   <Button onClick={handlePaymentContinue} fullWidth>Pay Now</Button>
                </div>
             </div>
           )}

           {/* Searching Parker / Loading */}
           {appState === AppState.SEARCHING_PARKER && (
              <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Search className="w-8 h-8 text-brand-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Finalizing Booking...</h2>
                 <p className="text-gray-500">Connecting you with the spot...</p>
              </div>
           )}

           {/* Active Booking / Waiting for Parker */}
           {appState === AppState.WAITING_FOR_PARKER && (
              <div className="absolute inset-0 z-50 bg-[#f8fafc] flex flex-col font-sans">
                  {/* Active Booking Header */}
                  <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100 z-10">
                     <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-gray-900">Active Booking</h1>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">CONFIRMED</span>
                     </div>

                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-xl bg-gray-200 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=200&q=80")' }}></div>
                        <div>
                           <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">Legacy West Garage</h2>
                           <p className="text-sm text-gray-500">Section B, Level 2</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-3 bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20">
                           <Navigation className="w-4 h-4" /> Navigate
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold">
                           <Phone className="w-4 h-4" /> Call Help
                        </button>
                     </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Ticket Pass</h3>
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                           <span className="text-3xl font-bold text-gray-900 tracking-widest mb-1">8492</span>
                           <span className="text-xs text-gray-500">Show this code at entrance</span>
                        </div>
                     </div>

                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Time Remaining</span>
                            <span className="text-sm font-bold text-brand-600">1h 58m</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-brand-500 h-2 rounded-full w-[10%]"></div>
                         </div>
                     </div>

                     <button onClick={handleCancelBooking} className="w-full py-4 text-red-500 font-semibold">
                        Cancel Booking
                     </button>
                  </div>
              </div>
           )}

           {/* Bottom Navigation - Only on MAP_IDLE */}
           {appState === AppState.MAP_IDLE && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-[80px] grid grid-cols-4 items-center justify-items-center z-40 pb-2">
                 <button
                    onClick={() => handleBottomNavChange('find')}
                    className={`flex flex-col items-center gap-1 ${bottomNavTab === 'find' ? 'text-brand-600' : 'text-gray-400'}`}
                 >
                    <Search className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Find</span>
                 </button>
                 <button
                    onClick={() => handleBottomNavChange('car')}
                    className={`flex flex-col items-center gap-1 ${bottomNavTab === 'car' ? 'text-brand-600' : 'text-gray-400'}`}
                 >
                    <Car className="w-6 h-6" />
                    <span className="text-[10px] font-bold">My Car</span>
                 </button>
                 <button
                    onClick={() => handleBottomNavChange('history')}
                    className={`flex flex-col items-center gap-1 ${bottomNavTab === 'history' ? 'text-brand-600' : 'text-gray-400'}`}
                 >
                    <Clock className="w-6 h-6" />
                    <span className="text-[10px] font-bold">History</span>
                 </button>
                 <button
                    onClick={() => handleBottomNavChange('profile')}
                    className={`flex flex-col items-center gap-1 ${bottomNavTab === 'profile' ? 'text-brand-600' : 'text-gray-400'}`}
                 >
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Profile</span>
                 </button>
              </div>
           )}
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
