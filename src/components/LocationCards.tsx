import React from 'react';
import { locations } from '../data';
import { Location } from '../types';

interface LocationCardsProps {
  selectedLocation: string;
  onLocationSelect: (locationId: string) => void;
}

export function LocationCards({ selectedLocation, onLocationSelect }: LocationCardsProps) {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Explore Locations</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our beautiful resorts across stunning destinations
          </p>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-6 px-4 -mx-4 scrollbar-hide">
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
      </div>

      <style jsx>{`
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