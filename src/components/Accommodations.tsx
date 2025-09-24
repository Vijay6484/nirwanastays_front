// Accommodations.tsx - OPTIMIZED VERSION

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo, // OPTIMIZATION: Import useMemo
} from "react";
import { MapPin, Wifi, Check } from "lucide-react";
import { Accommodation } from "../types";
import { fetchAccommodations, getLocations } from "../data";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer"; // NEW: Import for lazy loading

// Helper function to truncate text (unchanged)
const truncateText = (text: string, maxLength: number, isMobile: boolean) => {
  if (!text) return "";
  if (!isMobile || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};


interface AccommodationsProps {
  selectedLocation: string;
  selectedType: string;
  onBookAccommodation: (accommodation: Accommodation) => void;
}

// Image Slider Component (unchanged, it was already well-optimized)
const ImageSlider = ({
  images,
  isMobile,
}: {
  images: string[];
  isMobile: boolean;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const dragOffset = useRef<number>(0);
  const dragType = useRef<"touch" | "mouse" | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const changeSlide = useCallback(
    (newIndex: number) => {
      if (
        newIndex === currentIndex ||
        isTransitioning ||
        newIndex < 0 ||
        newIndex >= images.length
      )
        return;
      setIsTransitioning(true);
      setCurrentIndex(newIndex);
      if (sliderRef.current) {
        sliderRef.current.style.transition = "transform 0.3s ease-out";
        sliderRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
      }
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [currentIndex, isTransitioning, images.length]
  );

  const handleDragStart = useCallback(
    (clientX: number, clientY: number, type: "touch" | "mouse") => {
      if (isTransitioning || images.length <= 1) return;
      startX.current = clientX;
      startY.current = clientY;
      isDragging.current = false;
      dragOffset.current = 0;
      dragType.current = type;
    },
    [isTransitioning, images.length]
  );

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (isTransitioning || images.length <= 1 || !dragType.current) return;
      const deltaX = clientX - startX.current;
      const deltaY = clientY - startY.current;
      if (!isDragging.current) {
        const threshold = dragType.current === "touch" ? 15 : 10;
        if (
          Math.abs(deltaX) > threshold &&
          Math.abs(deltaX) > Math.abs(deltaY) * 1.2
        ) {
          isDragging.current = true;
        }
      }
      if (isDragging.current) {
        dragOffset.current = deltaX;
        const containerWidth = containerRef.current?.offsetWidth || 300;
        const percentage = (deltaX / containerWidth) * 100;
        let resistance = 1;
        if (
          (currentIndex === 0 && deltaX > 0) ||
          (currentIndex === images.length - 1 && deltaX < 0)
        ) {
          resistance = 0.3;
        }
        if (sliderRef.current) {
          const translateX = -(currentIndex * 100) + percentage * resistance;
          sliderRef.current.style.transition = "none";
          sliderRef.current.style.transform = `translateX(${translateX}%)`;
        }
      }
    },
    [currentIndex, isTransitioning, images.length]
  );

  const handleDragEnd = useCallback(() => {
    if (isTransitioning || images.length <= 1 || !isDragging.current) {
      isDragging.current = false;
      dragType.current = null;
      return;
    }
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const threshold = containerWidth * 0.25;
    let newIndex = currentIndex;
    if (Math.abs(dragOffset.current) > threshold) {
      if (dragOffset.current > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (dragOffset.current < 0 && currentIndex < images.length - 1) {
        newIndex = currentIndex + 1;
      }
    }
    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.3s ease-out";
      sliderRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
    isDragging.current = false;
    dragOffset.current = 0;
    dragType.current = null;
  }, [currentIndex, isTransitioning, images.length]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY, "touch");
    },
    [handleDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    },
    [handleDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX, e.clientY, "mouse");
      const handleMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientX, e.clientY);
      };
      const handleMouseUp = () => {
        handleDragEnd();
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleDragStart, handleDragMove, handleDragEnd]
  );

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 sm:h-48 md:h-56 lg:h-64 overflow-hidden select-none cursor-grab active:cursor-grabbing group"
      style={{ touchAction: "pan-y" }}
    >
      <div
        ref={sliderRef}
        className="flex h-full will-change-transform"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && !isMobile && (
        <>
          <button
            onClick={() => changeSlide(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
            disabled={isTransitioning}
          >←</button>
          <button
            onClick={() => changeSlide(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
            disabled={isTransitioning}
          >→</button>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => changeSlide(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? "bg-white scale-125 shadow-lg" : "bg-white/50 hover:bg-white/70"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      {isMobile && images.length > 1 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs opacity-75">
          ← Swipe →
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

  // OPTIMIZATION: useMemo will prevent re-calculating this on every render
  const filteredAccommodations = useMemo(() => {
    const selectedLocationName =
      selectedLocation === "all"
        ? ""
        : (getLocations().find((l) => l.id === selectedLocation)?.name || "").toLowerCase();

    return accommodations.filter((acc) => {
      const locationMatch =
        selectedLocation === "all"
          ? true
          : acc.cityId
          ? acc.cityId === selectedLocation
          : selectedLocationName
          ? acc.location.toLowerCase().includes(selectedLocationName)
          : false;
      const typeMatch = selectedType === "all" || acc.type === selectedType;
      return locationMatch && typeMatch;
    });
  }, [accommodations, selectedLocation, selectedType]); // Dependencies

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Perfect Stays Await
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Choose from our carefully curated accommodations.
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
            <p className="text-gray-600">Try adjusting your filters to see more options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccommodations.map((accommodation) => (
              // NEW: Use the LazyAccommodationCard wrapper
              <LazyAccommodationCard
                key={accommodation.id}
                accommodation={accommodation}
                onBook={() => onBookAccommodation(accommodation)}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// NEW: Wrapper component for lazy loading
function LazyAccommodationCard(props: AccommodationCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Only trigger this once
    rootMargin: '200px 0px', // Load the component when it's 200px away from the viewport
  });

  return (
    <div ref={ref} className="min-h-[500px] sm:min-h-[480px]">
      {/* Render the actual card only when it's in view */}
      {inView && <AccommodationCard {...props} />}
    </div>
  );
}

// Define props type for AccommodationCard
interface AccommodationCardProps {
  accommodation: Accommodation;
  onBook: () => void;
  isMobile: boolean;
}

// OPTIMIZATION: Memoize the component to prevent re-renders when props don't change.
const AccommodationCard = React.memo(function AccommodationCard({
  accommodation,
  onBook,
  isMobile,
}: AccommodationCardProps) {
  const navigate = useNavigate();

  const handleAccommodationClick = () => {
    navigate(`/accommodation/${accommodation.id}`, { state: { accommodation } });
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-xl h-full flex flex-col w-[94%] mx-auto sm:w-full animate-fade-in">
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
       <div className="flex items-center gap-x-4 gap-y-2 mb-4 sm:mb-6 text-rose-taupe flex-wrap text-xs rounded-full">
  {accommodation.inclusions && accommodation.inclusions.slice(0, 50).map((item, index) => (
    <div key={index} className="flex items-center gap-1.5">
      {/* <Check className="w-4 h-4 text-emerald-500" /> */}
      <span className="bg-blue-100 text-green-500 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 cursor-pointer">{item}</span>
    </div>
  ))}
</div>
        <div className="mt-auto">
          <button
            onClick={onBook}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
});

// Optional: Add a simple fade-in animation for when cards load
// In your global CSS file (e.g., index.css):
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
*/