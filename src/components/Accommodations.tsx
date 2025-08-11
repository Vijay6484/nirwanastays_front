import React from 'react';
import { MapPin, Users, Wifi, Car } from 'lucide-react';
import { accommodations } from '../data';
import { Accommodation } from '../types';

interface AccommodationsProps {
  selectedLocation: string;
  selectedType: string;
  onBookAccommodation: (accommodation: Accommodation) => void;
}

export function Accommodations({ selectedLocation, selectedType, onBookAccommodation }: AccommodationsProps) {
  const filteredAccommodations = accommodations.filter(acc => {
    const locationMatch = selectedLocation === 'all' || acc.location === selectedLocation;
    const typeMatch = selectedType === 'all' || acc.type === selectedType;
    return locationMatch && typeMatch;
  });

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Perfect Stays Await</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Choose from our carefully curated accommodations designed for comfort and luxury
          </p>
          <div className="text-emerald-600 font-semibold">
            {filteredAccommodations.length} {filteredAccommodations.length === 1 ? 'property' : 'properties'} available
          </div>
        </div>

        {filteredAccommodations.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Properties Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more options</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAccommodations.map((accommodation, index) => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
                onBook={() => onBookAccommodation(accommodation)}
                animationDelay={index * 100}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AccommodationCard({ 
  accommodation, 
  onBook, 
  animationDelay 
}: { 
  accommodation: Accommodation; 
  onBook: () => void;
  animationDelay: number;
}) {
  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={accommodation.image}
          alt={accommodation.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Price badge */}
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
          <span className="text-lg font-bold text-gray-800">₹{accommodation.price.toLocaleString()}</span>
          <span className="text-sm text-gray-600 ml-1">/night</span>
        </div>

        {/* Type badge */}
        <div className="absolute top-6 right-6 bg-emerald-500/90 text-white px-4 py-2 rounded-xl font-medium capitalize backdrop-blur-sm">
          {accommodation.type}
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{accommodation.name}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{accommodation.description}</p>
        
        {/* Amenities */}
        <div className="flex items-center gap-6 mb-8 text-gray-500 flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="capitalize text-sm">{accommodation.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">4-6 guests</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Wi-Fi</span>
          </div>
        </div>

        <button
          onClick={onBook}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}