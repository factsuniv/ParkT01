
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
    setAppState(AppState.ContractorDashboard);
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

    // --- MAP & BOOKING FLOW ---
    const isMapState = [
      AppState.MAP_IDLE,
      AppState.SPOT_SELECTED,
      AppState.SELECT_VEHICLE,
      AppState.SELECT_TIER,
      AppState.BOOKING_REVIEW,
      AppState.PAYMENT_METHODS,
      AppState.SEARCHING_PARKER,
      AppState.WAITING_FOR_PARKER,
      AppState.NAVIGATING,
      AppState.ARRIVED
    ].includes(appState);

    if (isMapState) {
      return (
        <div className="relative h-full w-full bg-gray-100 overflow-hidden">
          <Map
            center={center}
            spots={spots}
            selectedSpotId={selectedSpot?.id}
            onSpotClick={handleSpotClick}
            onMapClick={handleMapClick}
            isInteracting={appState === AppState.MAP_IDLE || appState === AppState.SPOT_SELECTED}
          />

          {/* Top Search Bar - Only show on MAP_IDLE or SPOT_SELECTED */}
          {(appState === AppState.MAP_IDLE || appState === AppState.SPOT_SELECTED) && (
             <div className="absolute top-0 left-0 right-0 p-4 pt-12 z-10 bg-gradient-to-b from-white/90 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="absolute left-6 top-[60px] p-2 bg-white rounded-full shadow-md z-20"
                    >
                        <Menu className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="pl-12">
                         <SearchInput
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onFocus={handleSearchFocus}
                         />
                    </div>
                </div>

                {/* Filter Tabs */}
                {appState === AppState.MAP_IDLE && !searchQuery && (
                   <div className="flex gap-2 mt-3 overflow-x-auto pb-2 pointer-events-auto no-scrollbar pl-12">
                      <button
                        onClick={() => setActiveTab('nearby')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm transition-colors ${
                            activeTab === 'nearby'
                            ? 'bg-brand-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Nearby
                      </button>
                      <button
                        onClick={() => setActiveTab('popular')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm transition-colors ${
                            activeTab === 'popular'
                            ? 'bg-brand-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Popular
                      </button>
                   </div>
                )}
             </div>
          )}

           {appState === AppState.MAP_IDLE && (
              <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-3xl shadow-lg z-20">
                  <div className="grid grid-cols-4 items-center justify-items-center">
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
              </div>
           )}

            {appState === AppState.SPOT_SELECTED && selectedSpot && (
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 animate-in slide-in-from-bottom duration-300">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedSpot.location.address}</h2>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="flex items-center text-sm"><MapPin className="w-3.5 h-3.5 mr-1" /> 0.2 mi</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="flex items-center text-sm"><Clock className="w-3.5 h-3.5 mr-1" /> 4 min walk</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-bold text-brand-600">${selectedSpot.price}</span>
                            <span className="text-xs text-gray-400 font-medium">total</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-6">
                        <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Park Until</p>
                            <p className="font-semibold text-gray-900">6:00 PM</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                            <p className="font-semibold text-gray-900">Tesla Model 3</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                         <Button
                            variant="secondary"
                            className="flex-1 h-14 bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-none border-transparent"
                            onClick={() => setSelectedSpot(null)}
                         >
                            Cancel
                         </Button>
                         <Button
                            fullWidth
                            className="flex-[2] h-14 text-lg shadow-xl shadow-brand-500/30"
                            onClick={handleContinueToCar}
                         >
                            Park Here
                            <ArrowRight className="w-5 h-5 ml-2" />
                         </Button>
                    </div>
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
