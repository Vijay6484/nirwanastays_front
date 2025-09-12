import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { locations } from '../data';
import { Location } from '../types';

interface LocationCardsProps {
  selectedLocation: string;
  onLocationSelect: (locationId: string) => void;
}

export function LocationCards({ selectedLocation, onLocationSelect }: LocationCardsProps) {
  const [current, setCurrent] = useState(0);

  // Swipe state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const next = () => setCurrent((prev) => (prev + 1) % locations.length);
  const prev = () => setCurrent((prev) => (prev - 1 + locations.length) % locations.length);

  useEffect(() => {
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, []);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) next(); // swipe left
        else prev(); // swipe right
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Get 5 items centered on current
  const getCarouselItems = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      let idx = (current + i + locations.length) % locations.length;
      items.push({ ...locations[idx], level: i });
    }
    return items;
  };

  // Responsive card style for mobile
  const getLevelStyle = (level: number) => {
    const base = {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      transition: 'all 0.5s cubic-bezier(.4,2,.6,1)',
      cursor: 'pointer',
      zIndex: 10 - Math.abs(level),
      opacity: Math.abs(level) > 2 ? 0 : 1,
      boxShadow: '0 10px 24px 0 rgba(0,0,0,0.15)',
    };
    if (level === 0) {
      return {
        ...base,
        left: '50%',
        width: '60vw',
        maxWidth: 220,
        height: '38vw',
        maxHeight: 260,
        marginLeft: '-30vw',
        background: 'linear-gradient(180deg,#fff,#e5e7eb)',
        filter: 'brightness(1.1)',
        zIndex: 20,
        opacity: 1,
        transform: 'translateY(-50%) scale(1.08)',
      };
    }
    if (level === -1) {
      return {
        ...base,
        left: 'calc(50% - 36vw)',
        width: '36vw',
        maxWidth: 130,
        height: '26vw',
        maxHeight: 150,
        filter: 'brightness(0.95)',
        opacity: 0.7,
        zIndex: 15,
        transform: 'translateY(-50%) scale(0.92)',
      };
    }
    if (level === 1) {
      return {
        ...base,
        left: 'calc(50% + 36vw - 36vw)',
        width: '36vw',
        maxWidth: 130,
        height: '26vw',
        maxHeight: 150,
        filter: 'brightness(0.95)',
        opacity: 0.7,
        zIndex: 15,
        transform: 'translateY(-50%) scale(0.92)',
      };
    }
    if (level === -2) {
      return {
        ...base,
        left: 'calc(50% - 60vw)',
        width: '22vw',
        maxWidth: 90,
        height: '16vw',
        maxHeight: 90,
        filter: 'brightness(0.8)',
        opacity: 0.4,
        zIndex: 10,
        transform: 'translateY(-50%) scale(0.8)',
      };
    }
    if (level === 2) {
      return {
        ...base,
        left: 'calc(50% + 60vw - 22vw)',
        width: '22vw',
        maxWidth: 90,
        height: '16vw',
        maxHeight: 90,
        filter: 'brightness(1.8)',
        opacity: 0.4,
        zIndex: 10,
        transform: 'translateY(-50%) scale(0.8)',
      };
    }
    return { ...base, opacity: 0, pointerEvents: 'none' };
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Explore Locations</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our beautiful resorts across stunning destinations
          </p>
        </div>

        {/* Desktop View - Horizontal Scroll */}
        <div className="hidden lg:flex gap-6 overflow-x-auto pb-6 px-4 -mx-4 scrollbar-hide">
          {locations.map((location, index) => (
            <LocationCard
              key={location.id}
              location={location}
              isSelected={selectedLocation === location.id}
              onClick={() => onLocationSelect(location.id)}
              animationDelay={index * 100}
            />
          ))}
        </div>

        {/* Mobile View - 3D Carousel with swipe */}
       <div
  className="lg:hidden relative mx-auto touch-pan-x"
  style={{ height: '56vw', minHeight: 180, maxWidth: 400 }} // wider maxWidth
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  {/* Left Arrow */}
  <button
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-8 h-8 flex items-center justify-center hover:bg-emerald-100 transition"
    onClick={prev}
    aria-label="Previous"
    style={{ touchAction: 'manipulation' }}
  >
    <ChevronLeft className="w-5 h-5 text-emerald-500" />
  </button>
  {/* Carousel Items */}
  <div className="relative w-full h-full" style={{ minHeight: 100 }}>
    {getCarouselItems().map((location, i) => (
      <div
        key={location.id}
        style={getLevelStyle(location.level)}
        onClick={() => onLocationSelect(location.id)}
        className={`rounded-2xl overflow-hidden shadow-xl group transition-all duration-500 ${
          selectedLocation === location.id && location.level === 0
            ? 'ring-4 ring-emerald-400 scale-105'
            : ''
        }`}
      >
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col items-center">
          <h3
            className={`font-bold drop-shadow text-white ${
              location.level === 0
                ? 'text-lg'
                : location.level === -1 || location.level === 1
                ? 'text-base'
                : 'text-sm'
            }`}
          >
            {location.name}
          </h3>
        </div>
      </div>
    ))}
  </div>
  {/* Right Arrow */}
  <button
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full w-8 h-8 flex items-center justify-center hover:bg-emerald-100 transition"
    onClick={next}
    aria-label="Next"
    style={{ touchAction: 'manipulation' }}
  >
    <ChevronRight className="w-5 h-5 text-emerald-500" />
  </button>
</div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
  
}

// Helper component for desktop cards
function LocationCard({
  location,
  isSelected,
  onClick,
  animationDelay,
}: {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
  animationDelay: number;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        flex-shrink-0 w-80 cursor-pointer transform transition-all duration-500 hover:scale-105 animate-slide-up
        ${isSelected ? 'scale-105' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={`
        relative rounded-3xl overflow-hidden shadow-xl transition-all duration-300
        ${isSelected ? 'shadow-2xl ring-4 ring-emerald-400' : 'hover:shadow-2xl'}
      `}>
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-56 object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-3">{location.name}</h3>
          <div className={`
            inline-block px-6 py-3 rounded-full font-medium transition-all duration-300
            ${isSelected 
              ? 'bg-emerald-400 text-emerald-900 shadow-lg' 
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }
          `}>
            {isSelected ? 'Selected' : 'Explore'}
          </div>
        </div>
      </div>
    </div>
  );
}