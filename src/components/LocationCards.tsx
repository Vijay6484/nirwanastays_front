import React, { useState, useEffect, useRef } from "react";
import { fetchLocations, getLocations } from "../data";
import { Location } from "../types";

interface LocationCardsProps {
  selectedLocation: string;
  onLocationSelect: (locationId: string) => void;
}

export function LocationCards({
  selectedLocation,
  onLocationSelect,
}: LocationCardsProps) {
  const [current, setCurrent] = useState(0);
  const [fetchedLocations, setFetchedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        await fetchLocations();
        setFetchedLocations(getLocations());
      } catch (error) {
        console.error("Error loading locations:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % fetchedLocations.length);
  const prev = () =>
    setCurrent(
      (prev) => (prev - 1 + fetchedLocations.length) % fetchedLocations.length
    );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const getCarouselItems = () => {
    if (!fetchedLocations.length) return [];
    const items = [];
    for (let i = -2; i <= 2; i++) {
      let idx =
        (current + i + fetchedLocations.length) % fetchedLocations.length;
      items.push({ ...fetchedLocations[idx], level: i });
    }
    return items;
  };

  // Update the getLevelStyle function for smoother mobile animations:
  const getLevelStyle = (level: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      top: "50%",
      transition: "all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)", // Smoother easing
      cursor: "pointer",
      zIndex: 10 - Math.abs(level),
      opacity: Math.abs(level) > 2 ? 0 : 1,
      boxShadow: "0 10px 24px 0 rgba(0,0,0,0.15)",
      borderRadius: "12px",
      overflow: "hidden",
      willChange: "transform, opacity",
      transform: "translate3d(-50%, -50%, 0)", // Base transform for hardware acceleration
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      perspective: "1000px",
      WebkitPerspective: "1000px",
    };

    // Adjusted sizes and transforms for mobile
    switch (level) {
      case 0:
        return {
          ...base,
          width: "140px", // Slightly larger center card
          height: "200px",
          zIndex: 20,
          opacity: 1,
          transform: "translate3d(-50%, -50%, 0) scale(1)",
        };
      case -1:
        return {
          ...base,
          width: "120px",
          height: "180px",
          opacity: 0.8,
          zIndex: 15,
          transform:
            "translate3d(-50%, -50%, 0) scale(0.9) translateX(-110%) rotateY(15deg)",
        };
      case 1:
        return {
          ...base,
          width: "120px",
          height: "180px",
          opacity: 0.8,
          zIndex: 15,
          transform:
            "translate3d(-50%, -50%, 0) scale(0.9) translateX(110%) rotateY(-15deg)",
        };
      case -2:
        return {
          ...base,
          width: "100px",
          height: "160px",
          opacity: 0.6,
          zIndex: 12,
          transform:
            "translate3d(-50%, -50%, 0) scale(0.8) translateX(-220%) rotateY(25deg)",
        };
      case 2:
        return {
          ...base,
          width: "100px",
          height: "160px",
          opacity: 0.6,
          zIndex: 12,
          transform:
            "translate3d(-50%, -50%, 0) scale(0.8) translateX(220%) rotateY(-25deg)",
        };
      default:
        return { ...base, opacity: 0 };
    }
  };

  if (loading) {
    return (
      <section className="relative will-change-transform backface-visibility-hidden py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Explore Locations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our beautiful resorts across stunning destinations
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading locations...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative will-change-transform backface-visibility-hidden py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Trending Locations
          </h2>
        </div>

        {/* Desktop view - horizontal scroll without scrollbar */}
        <div className="hidden lg:block relative overflow-hidden">
          <div
            className="flex gap-6 overflow-x-auto pb-6 px-4 -mx-4 snap-x snap-mandatory scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              transform: "translate3d(0,0,0)",
            }}
          >
            {fetchedLocations.map((location, index) => (
              <div key={location.id} className="snap-center">
                <LocationCard
                  location={location}
                  isSelected={selectedLocation === location.id}
                  onClick={() => onLocationSelect(location.id)}
                  animationDelay={index * 100}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view - 3D stacked with 5 cards and gaps */}
        <div
          className="lg:hidden relative mx-auto hardware-accelerated"
          style={{
            height: "260px", // Increased height for better visibility
            maxWidth: "100%",
            perspective: "1200px",
            overflow: "visible",
            transform: "translate3d(0,0,0)",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative w-full h-full transform-gpu"
            style={{
              minHeight: 220,
              transform: "translate3d(0,0,0)",
            }}
          >
            {getCarouselItems().map((location) => (
              <div
                key={location.id}
                style={getLevelStyle(location.level)}
                onClick={() => {
                  if (Math.abs(location.level) <= 1) {
                    onLocationSelect(location.id);
                  } else if (location.level === -2) {
                    prev();
                  } else if (location.level === 2) {
                    next();
                  }
                }}
                className={`
          group transition-all duration-500 hardware-accelerated
          ${selectedLocation === location.id && location.level === 0
            ? "ring-2 ring-emerald-400"
            : ""}
        `}
              >
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  style={{
                    transform: "translate3d(0,0,0)",
                    backfaceVisibility: "hidden",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center items-end">
                  <h3
                    className={`
              font-bold text-white text-center transform-gpu
              ${location.level === 0 ? "text-base" : "text-sm"}
            `}
                    style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                  >
                    {location.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Desktop helper component
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
        flex-shrink-0 w-80 cursor-pointer transform transition-transform duration-300
        will-change-transform hardware-accelerated
        ${isSelected ? "scale-[1.02]" : ""}
      `}
      style={{
        animationDelay: `${animationDelay}ms`,
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div
        className={`
        relative rounded-3xl overflow-hidden shadow-lg transition-shadow duration-300
        ${isSelected ? "shadow-2xl ring-2 ring-emerald-400" : "hover:shadow-xl"}
      `}
      >
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-56 object-cover"
          loading="lazy"
          decoding="async"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-3 transform-gpu">
            {location.name}
          </h3>
          <div
            className={`
            inline-block px-6 py-3 rounded-full font-medium transition-colors duration-300
            ${
              isSelected
                ? "bg-emerald-400 text-emerald-900"
                : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            }
          `}
          >
            {isSelected ? "Selected" : "Explore"}
          </div>
        </div>
      </div>
    </div>
  );
}
