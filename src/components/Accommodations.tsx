import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Users, Wifi, ChevronLeft, ChevronRight } from 'lucide-react';
import { Accommodation } from '../types';
import { fetchAccommodations } from '../data';
import { useNavigate } from 'react-router-dom';

interface AccommodationsProps {
  selectedLocation: string;
  selectedType: string;
  onBookAccommodation: (accommodation: Accommodation) => void;
}

// Helper function to truncate text for mobile only
const truncateText = (text: string, maxLength: number, isMobile: boolean) => {
  if (!text) return '';
  if (!isMobile || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Perfect Image Slider Component with working swipe functionality
const ImageSlider = ({ images, isMobile }: { images: string[]; isMobile: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragActive = useRef(false);

  // Touch/Mouse handlers for perfect swipe functionality
  const handleStart = (clientX: number) => {
    if (images.length <= 1) return;
    
    isDragActive.current = true;
    setIsDragging(true);
    startX.current = clientX;
    currentX.current = clientX;
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragActive.current || images.length <= 1) return;
    
    currentX.current = clientX;
    const offset = startX.current - clientX;
    setDragOffset(offset);
  };

  const handleEnd = () => {
    if (!isDragActive.current || images.length <= 1) return;
    
    const offset = startX.current - currentX.current;
    const threshold = 50; // Minimum swipe distance
    
    // Reset drag state
    isDragActive.current = false;
    setIsDragging(false);
    setDragOffset(0);
    
    // Check if swipe is valid
    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        // Swipe left - next image
        setCurrentIndex(prev => (prev + 1) % images.length);
      } else {
        // Swipe right - previous image
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
      }
    }
    
    // Reset values
    startX.current = 0;
    currentX.current = 0;
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragActive.current) return;
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const handleMouseLeave = () => {
    handleEnd();
  };

  // Wheel handler for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (images.length <= 1) return;
    e.preventDefault();
    if (e.deltaY > 0) {
      setCurrentIndex(prev => (prev + 1) % images.length);
    } else if (e.deltaY < 0) {
      setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    }
  };

  // Navigation functions
  const goToSlide = (index: number) => setCurrentIndex(index);
  const goToPrevious = () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  const goToNext = () => setCurrentIndex(prev => (prev + 1) % images.length);

  // Arrow button handlers
  const handlePrevClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevious();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNext();
  };

  if (images.length === 0) return null;

  return (
    <div
      ref={sliderRef}
      className={`relative w-full h-64 sm:h-48 md:h-56 lg:h-64 overflow-hidden group ${
        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{ 
        touchAction: 'pan-x',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          onClick={handlePrevClick}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-80 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-opacity duration-300"
          style={{ pointerEvents: 'auto' }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          onClick={handleNextClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-80 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-opacity duration-300"
          style={{ pointerEvents: 'auto' }}
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div
        className={`flex h-full ${
          isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'
        }`}
        style={{ 
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover select-none"
              loading="lazy"
              draggable="false"
            />
          </div>
        ))}
      </div>
      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Swipe indicator */}
      {images.length > 1 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {isMobile ? '← Swipe →' : 'Scroll or drag'}
        </div>
      )}
      
      {/* Drag feedback */}
      {isDragging && images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
          {Math.abs(dragOffset) > 20 ? (dragOffset > 0 ? 'Next →' : '← Previous') : 'Drag to navigate'}
        </div>
      )}
    </div>
  );
};

export function Accommodations({
  selectedLocation,
  selectedType,
  onBookAccommodation
}: AccommodationsProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => {
    // Enhanced mobile phone detection
    const userAgent = navigator.userAgent;
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
    const isSmallScreen = window.innerWidth < 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return (isMobileUA && !isTablet) || (isSmallScreen && isTouchDevice);
  });

  useEffect(() => {
    const handleResize = () => {
      const userAgent = navigator.userAgent;
      const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const isMobileDevice = (isMobileUA && !isTablet) || (isSmallScreen && isTouchDevice);
      setIsMobile(isMobileDevice);
    };
    window.addEventListener('resize', handleResize);

    setLoading(true);
    fetchAccommodations().then(data => {
      setAccommodations(data);
      setLoading(false);
    });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredAccommodations = accommodations.filter(acc => {
    const locationMatch =
      selectedLocation === 'all' || acc.location === selectedLocation;
    const typeMatch = selectedType === 'all' || acc.type === selectedType;
    return locationMatch && typeMatch;
  });

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Perfect Stays Await
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Choose from our carefully curated accommodations designed for comfort
            and luxury
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
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              No Properties Found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters to see more options
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccommodations.map((accommodation, index) => (
              <AccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
                onBook={() => onBookAccommodation(accommodation)}
                animationDelay={index * 100}
                isMobile={isMobile}
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
  animationDelay,
  isMobile
}: {
  accommodation: Accommodation;
  onBook: () => void;
  animationDelay: number;
  isMobile: boolean;
}) {
  const navigate = useNavigate();

  const handleAccommodationClick = () => {
    navigate(`/accommodation/${accommodation.id}`, { 
      state: { accommodation } 
    });
  };
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl 
                 transition-all duration-500 hover:-translate-y-2 animate-slide-up 
                 h-full flex flex-col
                 w-[94%] mx-auto sm:w-full 
                 min-h-[500px] sm:min-h-[0]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="relative overflow-hidden h-64 sm:h-48 md:h-56 lg:h-64">
        <ImageSlider
          images={
            accommodation.gallery && accommodation.gallery.length > 0
              ? accommodation.gallery
              : [accommodation.image]
          }
          isMobile={isMobile}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 
                        bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-0.5 
                        sm:px-3 sm:py-1 shadow-lg flex items-center max-w-[70%]">
          <span className="text-xs sm:text-base font-bold text-gray-800 truncate">
            ₹{accommodation.price.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-600 ml-1">
            /night
          </span>
        </div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 
                        bg-emerald-500/90 text-white px-1.5 py-0.5 
                        sm:px-3 sm:py-1 rounded-lg font-medium capitalize 
                        backdrop-blur-sm text-xs sm:text-base max-w-[70%] truncate">
          {accommodation.type}
        </div>
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
          <button
            onClick={handleAccommodationClick}
            className="hover:text-emerald-600 transition-colors underline-offset-2 hover:underline text-left"
          >
            {accommodation.name}
          </button>
        </h3>
        <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base line-clamp-4 sm:line-clamp-3">
          {truncateText(accommodation.description, 120, isMobile)}
        </p>
        <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-8 
                        text-gray-500 flex-wrap text-sm sm:text-base">
          <div className="flex items-center gap-1 sm:gap-2">
            <Users className="w-4 h-4" />
            <span>{accommodation.max_guest}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Wifi className="w-4 h-4" />
            <span>Wi-Fi</span>
          </div>
        </div>
        <div className="mt-auto">
          <button
            onClick={onBook}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 
                       text-white font-semibold py-3 sm:py-3 rounded-2xl 
                       hover:from-emerald-600 hover:to-emerald-700 
                       transition-all duration-300 transform hover:scale-105 
                       shadow-lg text-sm sm:text-base"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}