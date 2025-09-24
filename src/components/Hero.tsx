import React from "react";
import { Waves, Mountain, Sun, TreePine, ArrowDown } from "lucide-react";

// --- PROPS INTERFACES ---
interface HeroProps {
  onBookNow: () => void;
}

interface HighlightCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface HeroProps {
  onBookNow: () => void;
}

interface HighlightCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}




// --- CONSTANTS ---
// Moved outside the component to prevent re-creation on every render.
const highlights: HighlightCardProps[] = [
  { icon: Waves, title: "Lakeside Location", description: "Direct access to pristine Pawna Lake" },
  { icon: Mountain, title: "Scenic Views", description: "Breathtaking sunrise and sunset vistas" },
  { icon: Sun, title: "Year Round", description: "Perfect weather throughout the year" },
  { icon: TreePine, title: "Nature Immersion", description: "Surrounded by lush greenery" },
];

// --- SUB-COMPONENTS ---
// Refactored into a separate component for better readability and reusability.
function HighlightCard({ icon: IconComponent, title, description }: HighlightCardProps) {
  return (
    <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg">
      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
        <IconComponent className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export function Hero({ onBookNow }: HeroProps) {
  const handleScrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {/* PERFORMANCE OPTIMIZATION:
            1. Removed `loading="lazy"`: The main hero image (Largest Contentful Paint) should never be lazy-loaded.
            2. Added `fetchpriority="high"`: Hints the browser to download this critical image sooner.
            3. Added `srcset` and `sizes`: Provides responsive images, allowing the browser to download the most
               efficient size for the user's screen, saving bandwidth on smaller devices.
          */}
          <img
            src="https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920"
            srcSet="https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=640 640w,
                    https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1280 1280w,
                    https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920 1920w"
            sizes="100vw"
            alt="Pawna Lake Camping Resort at sunset"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight animate-fade-in">
            Nirwana Stays
            <span className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-emerald-300 mt-2">
              Where nature meets comfort
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 font-light animate-slide-up">
            Escape. Relax. Rejuvenate.
          </p>
          <button
            onClick={onBookNow}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-2xl animate-fade-in"
          >
            Book Your Stay
          </button>
        </div>

        {/* ACCESSIBILITY & SEMANTICS IMPROVEMENT:
          - Changed from <button> to <a> for a semantic link.
          - The `href` provides a fallback if JavaScript is disabled.
          - The `onClick` handler provides the smooth scroll enhancement.
        */}
        <a
          href="#about"
          onClick={handleScrollToAbout}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce"
          aria-label="Scroll to about section"
        >
          <ArrowDown className="w-6 h-6" />
        </a>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 lg:py-24 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 animate-fade-in text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                Experience Nature's
                <span className="block text-emerald-600">Paradise</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((highlight) => (
                  <HighlightCard key={highlight.title} {...highlight} />
                ))}
              </div>
            </div>

            <div className="relative animate-slide-up hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Scenic view of Pawna Lake Resort"
                  className="w-full h-80 lg:h-96 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
              </div>
              
              {/* ACCESSIBILITY IMPROVEMENT: Added aria-hidden to decorative element */}
              <div
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl"
                aria-hidden="true"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}