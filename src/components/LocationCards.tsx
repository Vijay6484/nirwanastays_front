import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { locations } from '../data';
import { Location } from '../types';

interface LocationCardsProps {
  selectedLocation: string;
  onLocationSelect: (locationId: string) => void;
}

export function LocationCards({ selectedLocation, onLocationSelect }: LocationCardsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % locations.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + locations.length) % locations.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  const getCardStyle = (index: number) => {
    const diff = index - currentSlide;
    const absIndex = ((diff % locations.length) + locations.length) % locations.length;
    
    if (absIndex === 0) {
      // Center card
      return {
        transform: 'translateX(0) translateZ(0) scale(1)',
        opacity: 1,
        zIndex: 3
      };
    } else if (absIndex === 1 || absIndex === locations.length - 1) {
      // Side cards
      const isRight = absIndex === 1;
      return {
        transform: `translateX(${isRight ? '60%' : '-60%'}) translateZ(-100px) scale(0.8)`,
        opacity: 0.6,
        zIndex: 1
      };
    } else {
      // Hidden cards
      return {
        transform: 'translateX(200%) translateZ(-200px) scale(0.6)',
        opacity: 0,
        zIndex: 0
      };
    }
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

        {/* Mobile View - Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {locations.map((location, index) => (
              <div
                key={location.id}
                className={`flex-shrink-0 w-48 cursor-pointer transition-all duration-300 ${
                  selectedLocation === location.id ? 'scale-105 ring-4 ring-emerald-400' : ''
                }`}
                onClick={() => onLocationSelect(location.id)}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-lg font-bold text-white mb-1 drop-shadow">{location.name}</h3>
                    <div className={`
                      inline-block px-4 py-1 rounded-full font-medium text-xs
                      ${selectedLocation === location.id
                        ? 'bg-emerald-400 text-emerald-900 shadow'
                        : 'bg-white/20 text-white backdrop-blur-sm'
                      }
                    `}>
                      {selectedLocation === location.id ? 'Selected' : 'Explore'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
  
}

function LocationCard({ location, isSelected, onClick, animationDelay }: {
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

