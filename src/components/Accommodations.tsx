import React, { useState, useEffect, useRef } from "react";
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

// Improved Image Slider with smooth mobile swipe
const ImageSlider = ({ images, isMobile }: { images: string[]; isMobile: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Auto scroll on desktop
  useEffect(() => {
    if (isMobile || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, isMobile, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsSwiping(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isSwiping) return;
    setIsSwiping(false);
    
    const swipeTime = Date.now() - touchStartTime.current;
    const swipeVelocity = Math.abs(swipeOffset) / Math.max(swipeTime, 1);
    
    // Determine if it's a swipe based on distance or velocity
    if (Math.abs(swipeOffset) > 50 || swipeVelocity > 0.3) {
      if (swipeOffset > 0) {
        // Swipe left - go to next slide
        setCurrentIndex(prevIndex =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      } else {
        // Swipe right - go to previous slide
        setCurrentIndex(prevIndex =>
          prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
      }
    }
    
    // Reset swipe offset
    setSwipeOffset(0);
  };

  if (images.length === 0) return null;

  // Calculate the transform value with swipe offset for smooth dragging
  const transformValue = isSwiping 
    ? `translateX(calc(-${currentIndex * 100}% - ${swipeOffset}px))`
    : `translateX(-${currentIndex * 100}%)`;

  return (
    <div
      ref={sliderRef}
      className="relative w-full h-64 sm:h-48 md:h-56 lg:h-64 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ 
          transform: transformValue,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover select-none"
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
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Accommodations
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
      className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col w-[94%] mx-auto sm:w-full min-h-[500px] sm:min-h-[0]"
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
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-0.5 sm:px-3 sm:py-1 shadow-lg flex items-center max-w-[70%]">
          <span className="text-xs sm:text-base font-bold text-gray-800 truncate">
            ₹{accommodation.price.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-600 ml-1">/night</span>
        </div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-emerald-500/90 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg font-medium capitalize backdrop-blur-sm text-xs sm:text-base max-w-[70%] truncate">
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