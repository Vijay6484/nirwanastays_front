import React, { useState, useEffect, useRef,useCallback } from 'react';
import { ArrowLeft, Users, MapPin, Star, Wifi, Car, Coffee, TreePine } from 'lucide-react';
import { accommodations as initialAccommodations, fetchLocations, accommodationTypes, fetchAccommodations } from '../data';
import { Accommodation, Location } from '../types';
import { useNavigate } from 'react-router-dom';
import { AccommodationBookingPage } from './AccommodationBookingPage';

interface BookingPageProps {
  onBack: () => void;
}

// Helper function to truncate text for mobile only
const truncateText = (text: string, maxLength: number, isMobile: boolean) => {
  if (!text) return '';
  if (!isMobile || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Image Slider Component with touch support for mobile only
const ImageSlider = ({ images, isMobile }: { images: string[]; isMobile: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const startTime = useRef<number>(0);

  // Reset current index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  // Handle the actual slide change
  const changeSlide = useCallback((newIndex: number) => {
    if (newIndex === currentIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, isTransitioning]);

  // Touch start handler
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isTransitioning || images.length <= 1) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchCurrentX.current = touch.clientX;
    isDragging.current = false;
    startTime.current = Date.now();
    
    // Prevent default to avoid scrolling issues
    e.preventDefault();
  }, [isTransitioning, images.length]);

  // Touch move handler
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isTransitioning || images.length <= 1) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX.current);
    const deltaY = Math.abs(touch.clientY - touchStartY.current);
    
    // Only start dragging if horizontal movement is greater than vertical
    if (!isDragging.current && deltaX > deltaY && deltaX > 10) {
      isDragging.current = true;
    }
    
    if (isDragging.current) {
      touchCurrentX.current = touch.clientX;
      const diff = touchCurrentX.current - touchStartX.current;
      const containerWidth = containerRef.current?.offsetWidth || 300;
      const percentage = (diff / containerWidth) * 100;
      
      // Apply transform with current drag position
      if (sliderRef.current) {
        const translateX = -(currentIndex * 100) + percentage;
        sliderRef.current.style.transform = `translateX(${translateX}%)`;
        sliderRef.current.style.transition = 'none';
      }
      
      // Prevent default to avoid scrolling
      e.preventDefault();
    }
  }, [currentIndex, isTransitioning, images.length]);

  // Touch end handler
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isTransitioning || images.length <= 1) return;
    
    const endTime = Date.now();
    const timeDiff = endTime - startTime.current;
    const distance = touchCurrentX.current - touchStartX.current;
    const containerWidth = containerRef.current?.offsetWidth || 300;
    
    // Re-enable transitions
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.3s ease-out';
    }
    
    if (isDragging.current) {
      // Calculate if we should change slides
      const velocity = Math.abs(distance) / timeDiff;
      const threshold = containerWidth * 0.2; // 20% of container width
      const shouldChange = Math.abs(distance) > threshold || velocity > 0.5;
      
      let newIndex = currentIndex;
      
      if (shouldChange) {
        if (distance > 0 && currentIndex > 0) {
          // Swiped right - go to previous slide
          newIndex = currentIndex - 1;
        } else if (distance < 0 && currentIndex < images.length - 1) {
          // Swiped left - go to next slide
          newIndex = currentIndex + 1;
        }
      }
      
      // Apply the final position
      if (sliderRef.current) {
        sliderRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
      }
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
      
      e.preventDefault();
    }
    
    // Reset all touch references
    isDragging.current = false;
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchCurrentX.current = 0;
  }, [currentIndex, isTransitioning, images.length]);

  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.3s ease-out';
      sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    isDragging.current = false;
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchCurrentX.current = 0;
  }, [currentIndex]);

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 sm:h-48 md:h-56 lg:h-64 overflow-hidden select-none touch-pan-y"
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      <div
        ref={sliderRef}
        className="flex h-full will-change-transform"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => changeSlide(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function BookingPage({ onBack }: BookingPageProps) {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>(initialAccommodations);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [locations, setLocations] = useState<Location[]>([]);
  const navigate = useNavigate();

  // Fetch accommodations on component mount
  useEffect(() => {
    const loadAccommodations = async () => {
      try {
        const fetchedAccommodations = await fetchAccommodations();
        const fetchedLocations = await fetchLocations();
        setLocations(fetchedLocations);
        setAccommodations(fetchedAccommodations);
      } catch (error) {
        console.error('Failed to fetch accommodations:', error);
      }
    };
    
    loadAccommodations();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredAccommodations = accommodations.filter(acc => {
    const locationMatch = selectedLocation === 'all' || acc.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const typeMatch = selectedType === 'all' || acc.type === selectedType;
    return locationMatch && typeMatch;
  });

  // Handle mobile "Book Now" button click
  const handleBookNow = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
  };

  // If an accommodation is selected on desktop, show the booking page
  if (selectedAccommodation) {
    return (
      <AccommodationBookingPage
        accommodation={selectedAccommodation}
        onBack={() => setSelectedAccommodation(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 sm:space-x-3 text-gray-600 hover:text-emerald-600 transition-colors p-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back to Home</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <div className="space-y-8 sm:space-y-12">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-16 animate-fade-in">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-emerald-600">Escape</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto">
              Discover luxury accommodations nestled in nature's paradise at Pawna Lake
            </p>
          </div>
          
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl animate-slide-up">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">Filter Your Stay</h3>
            
            {/* Location Filter */}
            <div className="mb-6 sm:mb-8">
              <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">Choose Location</h4>
              <div className="flex flex-col sm:flex-row sm:gap-4 sm:flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLocation('all')}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all text-sm sm:text-base ${selectedLocation === 'all'
                    ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                    }`}
                >
                  All Locations
                </button>
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location.id)}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all capitalize text-sm sm:text-base ${selectedLocation === location.id
                      ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                      }`}
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Type Filter */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">Accommodation Type</h4>
              <div className="flex flex-col sm:flex-row sm:gap-4 sm:flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all text-sm sm:text-base ${selectedType === 'all'
                    ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                    }`}
                >
                  All Types
                </button>
                {accommodationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all capitalize text-sm sm:text-base ${selectedType === type.id
                      ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                      }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Accommodations Grid */}
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Available Accommodations ({filteredAccommodations.length})
            </h3>
            
            {filteredAccommodations.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white/50 rounded-2xl sm:rounded-3xl animate-fade-in">
                <MapPin className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h4 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2 sm:mb-3">No Properties Found</h4>
                <p className="text-sm sm:text-base text-gray-500">Try adjusting your filters to see more options</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-8">
                {filteredAccommodations.map((accommodation, index) => (
                  <div
                    key={accommodation.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl cursor-pointer animate-slide-up hover:scale-100 sm:hover:scale-102"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-1/3">
                        <ImageSlider 
                          images={accommodation.gallery && accommodation.gallery.length > 0 ? accommodation.gallery : [accommodation.image]} 
                          isMobile={isMobile} 
                        />
                      </div>
                      <div className="w-full sm:w-2/3 p-4 sm:p-6 md:p-8 flex flex-col">
                        <div className="flex-1">
                          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 truncate">{accommodation.name}</h4>
                          <div className="flex items-center space-x-2 text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">
                            <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                            <span className="capitalize">{truncateText(accommodation.location, 25, isMobile)}</span>
                            <span className="mx-1 sm:mx-2 flex-shrink-0">•</span>
                            <span className="capitalize flex-shrink-0">{accommodation.type}</span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            {truncateText(accommodation.description, 50, isMobile)}
                          </p>
                          <div className="flex items-center gap-4 sm:gap-6 text-gray-500 mt-4 flex-wrap text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>{accommodation.max_guest}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wifi className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>Wi-Fi</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>Parking</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-6">
                          <button
                            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base bg-emerald-500 text-white shadow-md sm:shadow-lg hover:bg-emerald-600"
                            onClick={() => handleBookNow(accommodation)}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}