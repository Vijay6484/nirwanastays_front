import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onNavigate: (section: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('home') || document.querySelector('[data-hero]');

    // Fallback: if no hero found, use scroll position (~60% of viewport)
    if (!hero) {
      const onScroll = () => setIsScrolled(window.scrollY > window.innerHeight * 0.6);
      onScroll();
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { root: null, threshold: 0.01 }
    );

    observer.observe(hero as Element);
    return () => observer.disconnect();
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Accommodations', id: 'accommodations' },
    { label: 'About Us', id: 'about' },
    { label: 'Gallery', id: 'gallery' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        isScrolled
          ? [
              // modern Tailwind + fallback for older Tailwind
              'bg-white/90', 'bg-white', 'bg-opacity-90',
              // blur (only if supported) + subtle border & shadow
              'backdrop-blur-md', 'supports-[backdrop-filter]:backdrop-blur-lg',
              'shadow-lg border-b border-gray-200'
            ].join(' ')
          : 'bg-black/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="relative flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            {/* Light logo (top only) */}
            <img
              src="/logo-light.png"
              alt="Nirwana Stays Logo"
              className={`h-14 w-auto transition-opacity duration-500 ${
                isScrolled ? 'opacity-0 absolute' : 'opacity-100'
              }`}
            />
            {/* Dark logo (after scroll) */}
            <img
              src="/logo-dark.png"
              alt="Nirwana Stays Logo"
              className={`h-20 w-auto transition-opacity duration-500 absolute -left-6 ${
                isScrolled ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative font-medium transition-all duration-300 ${
                  isScrolled ? 'text-gray-800' : 'text-white'
                } after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-emerald-500 after:transition-all hover:after:w-full`}
              >
                {item.label}
              </button>
            ))}
            {/* <button
              onClick={() => onNavigate('booking')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-110 hover:shadow-emerald-400/50"
            >
              Book Now
            </button> */}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden z-[1001] bg-white/95 bg-white bg-opacity-95 backdrop-blur-md rounded-2xl mt-2 p-6 shadow-2xl border border-gray-200 animate-fade-in">
            <div className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-5 text-gray-700 font-medium rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onNavigate('booking');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
