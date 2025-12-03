import React from 'react';
import { Loader2, ArrowLeft, Search, MapPin, Navigation, Car } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  fullWidth, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative flex items-center justify-center px-6 py-3.5 text-sm font-semibold transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20",
    secondary: "bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20",
    outline: "border-2 border-gray-200 hover:border-brand-500 hover:text-brand-500 text-gray-700 bg-white",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export const SearchInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  loading?: boolean;
}> = ({ value, onChange, onFocus, placeholder, loading }) => (
  <div className="relative w-full shadow-lg rounded-xl">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      placeholder={placeholder || "Where to?"}
      className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-lg border-none"
    />
  </div>
);

export const LocationItem: React.FC<{
  name: string;
  address: string;
  onClick: () => void;
  icon?: React.ReactNode;
}> = ({ name, address, onClick, icon }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors text-left"
  >
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-gray-600 shrink-0">
      {icon || <MapPin className="w-5 h-5" />}
    </div>
    <div>
      <h4 className="font-semibold text-gray-900">{name}</h4>
      <p className="text-sm text-gray-500 truncate">{address}</p>
    </div>
  </button>
);
