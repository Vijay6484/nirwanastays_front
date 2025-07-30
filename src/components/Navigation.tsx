import React, { useState, useEffect } from 'react';
import { TreePine, Menu, X } from 'lucide-react';

interface NavigationProps {
  onNavigate: (section: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Accommodations', id: 'accommodations' },
    { label: 'Activities', id: 'activities' },
    { label: 'About Us', id: 'about' },
    { label: 'Gallery', id: 'gallery' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold transition-colors ${
                isScrolled ? 'text-gray-800' : 'text-white'
              }`}>
                Nirwana Stays
              </h1>
              <p className={`text-sm transition-colors ${
                isScrolled ? 'text-emerald-600' : 'text-emerald-200'
              }`}>
                The Pawna Lake Resort
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`font-medium transition-colors hover:text-emerald-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => onNavigate('booking')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-3 rounded-xl transition-colors ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

       {isMobileMenuOpen && (
  <div className="lg:hidden z-50 bg-white/95 backdrop-blur-md rounded-2xl mt-2 p-6 shadow-2xl border border-gray-100 animate-fade-in">
    <div className="space-y-4">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            onNavigate(item.id);
            setIsMobileMenuOpen(false);
          }}
          className="block w-full text-left py-4 px-6 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all duration-300 font-medium"
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
)}


  </div>
   </nav>
 );
}