import React, { useEffect, useState } from 'react';
import { MapPin, Users, Wifi, Car } from 'lucide-react';
import { Accommodation } from '../types';
import { fetchAccommodations } from '../data'; // <-- async function from your data file

interface AccommodationsProps {
  selectedLocation: string;
  selectedType: string;
  onBookAccommodation: (accommodation: Accommodation) => void;
}

export function Accommodations({ selectedLocation, selectedType, onBookAccommodation }: AccommodationsProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAccommodations().then(data => {
      setAccommodations(data);
      setLoading(false);
    });
  }, []);

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
            {loading
              ? 'Loading…'
              : `${filteredAccommodations.length} ${
                  filteredAccommodations.length === 1 ? 'property' : 'properties'
                } available`}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">Loading accommodations…</div>
        ) : filteredAccommodations.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Properties Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more options</p>
          </div>
        ) : (
           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up h-full flex flex-col"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="relative h-36 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
        <img
          src={accommodation.image}
          alt={accommodation.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        {/* Price badge */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-0.5 sm:px-3 sm:py-1 shadow-lg flex items-center max-w-[70%]">
          <span className="text-xs sm:text-base font-bold text-gray-800 truncate">₹{accommodation.price.toLocaleString()}</span>
          <span className="text-[10px] sm:text-xs text-gray-600 ml-1">/night</span>
        </div>
        {/* Type badge */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-emerald-500/90 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg font-medium capitalize backdrop-blur-sm text-xs sm:text-base max-w-[70%] truncate">
          {accommodation.type}
        </div>
      </div>
      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <h3 className="text-sm sm:text-xl font-bold text-gray-800 mb-1 sm:mb-3 truncate">{accommodation.name}</h3>
        <p className="text-gray-600 mb-2 sm:mb-6 leading-relaxed text-xs sm:text-base line-clamp-3">{accommodation.description}</p>
        {/* Amenities */}
        <div className="flex items-center gap-2 sm:gap-6 mb-3 sm:mb-8 text-gray-500 flex-wrap text-[11px] sm:text-sm">
          {/* <div className="flex items-center gap-1 sm:gap-2">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">{accommodation.location}</span>
          </div> */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Users className="w-4 h-4" />
            <span>4-6 guests</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Wifi className="w-4 h-4" />
            <span>Wi-Fi</span>
          </div>
        </div>
        {/* Book Now button always at bottom */}
        <div className="mt-auto">
          <button
            onClick={onBook}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-2 sm:py-3 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-xs sm:text-base"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
