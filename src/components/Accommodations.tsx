import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Users, Wifi } from "lucide-react";
import { Accommodation } from "../types";
import { fetchAccommodations } from "../data";

interface AccommodationsProps {
  selectedLocation: string;
  selectedType: string;
  onBookAccommodation: (accommodation: Accommodation) => void;
}

// Helper function to truncate text for mobile only
const truncateText = (text: string, maxLength: number, isMobile: boolean) => {
  if (!text) return "";
  if (!isMobile || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Enhanced Image Slider with bulletproof mobile swipe
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

// Main Accommodations Component
export function Accommodations({
  selectedLocation,
  selectedType,
  onBookAccommodation,
}: AccommodationsProps) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);

    setLoading(true);
    fetchAccommodations().then((data) => {
      setAccommodations(data);
      setLoading(false);
    });

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredAccommodations = accommodations.filter((acc) => {
    const locationMatch = selectedLocation === "all" || acc.location === selectedLocation;
    const typeMatch = selectedType === "all" || acc.type === selectedType;
    return locationMatch && typeMatch;
  });

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Perfect Stays Await
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Choose from our carefully curated accommodations designed for comfort
            and luxury
          </p>
          <div className="text-emerald-600 font-semibold">
            {loading
              ? "Loading…"
              : `${filteredAccommodations.length} ${
                  filteredAccommodations.length === 1 ? "property" : "properties"
                } available`}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">Loading accommodations…</div>
        ) : filteredAccommodations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Properties Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more options</p>
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

// Accommodation Card Component
function AccommodationCard({
  accommodation,
  onBook,
  animationDelay,
  isMobile,
}: {
  accommodation: Accommodation;
  onBook: () => void;
  animationDelay: number;
  isMobile: boolean;
}) {
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col w-[98%] mx-auto sm:w-full min-h-[500px] sm:min-h-[0]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-0.5 sm:px-3 sm:py-1 shadow-lg flex items-center max-w-[70%] pointer-events-none">
          <span className="text-xs sm:text-base font-bold text-gray-800 truncate">
            ₹{accommodation.price.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-600 ml-1">/night</span>
        </div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-emerald-500/90 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg font-medium capitalize backdrop-blur-sm text-xs sm:text-base max-w-[70%] truncate pointer-events-none">
          {accommodation.type}
        </div>
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
          {accommodation.name}
        </h3>
        <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base line-clamp-4 sm:line-clamp-3">
          {truncateText(accommodation.description, 120, isMobile)}
        </p>
        <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-8 text-gray-500 flex-wrap text-sm sm:text-base">
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
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 sm:py-3 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}