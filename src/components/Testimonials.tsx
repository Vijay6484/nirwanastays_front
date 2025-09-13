import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, RefreshCw, AlertCircle } from 'lucide-react';

// Define the Testimonial interface
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  avatar: string;
  date?: string;
}

// Define the API response interface
interface ApiTestimonial {
  id: number;
  guestName: string;
  propertyName: string;
  image: string;
  rating: number;
  review: string;
  date: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch testimonials from API
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.nirwanastays.com/admin/ratings');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const data: ApiTestimonial[] = await response.json();
      
      // Transform API data to match our Testimonial interface
      const transformedData: Testimonial[] = data.map(item => ({
        id: item.id.toString(),
        name: item.guestName,
        location: item.propertyName,
        avatar: item.image,
        rating: item.rating,
        review: item.review,
        date: item.date
      }));
      
      setTestimonials(transformedData);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(nextTestimonial, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  // Render loading state
  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading testimonials...
            </p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
            <div className="flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <p className="text-lg">Failed to load testimonials</p>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {error}
            </p>
            <button 
              onClick={fetchTestimonials}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Render empty state
  if (testimonials.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No testimonials available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Render testimonials
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-emerald-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real experiences from real guests who've discovered paradise with us
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main testimonial */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-16 relative overflow-hidden animate-fade-in">
            {/* Quote decoration */}
            <div className="absolute top-8 left-8 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Quote className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="text-center pt-8">
              {/* Stars */}
              <div className="flex justify-center mb-8">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Review text */}
              <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-10 font-light italic">
                "{testimonials[currentIndex].review}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-emerald-100"
                  onError={(e) => {
                    // Fallback avatar if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg';
                  }}
                />
                <div className="text-left">
                  <p className="font-bold text-lg text-gray-800">{testimonials[currentIndex].name}</p>
                  <p className="text-gray-600">{testimonials[currentIndex].location}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12">
              <button
                onClick={prevTestimonial}
                className="w-14 h-14 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-emerald-600" />
              </button>

              {/* Indicators */}
              <div className="flex space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-3 rounded-full transition-all duration-200 ${
                      index === currentIndex ? 'bg-emerald-500 w-8' : 'bg-emerald-200 w-3'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-14 h-14 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-emerald-600" />
              </button>
            </div>
          </div>

          {/* Background testimonials for desktop */}
          <div className="hidden lg:block">
            {testimonials.map((testimonial, index) => {
              if (index === currentIndex) return null;
              const offset = index < currentIndex ? -1 : 1;
              return (
                <div
                  key={testimonial.id}
                  className={`absolute top-8 ${offset < 0 ? '-left-8' : '-right-8'} w-72 bg-white/60 backdrop-blur-sm rounded-2xl p-8 transform ${offset < 0 ? '-rotate-3' : 'rotate-3'} scale-95 opacity-70 shadow-xl`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg';
                      }}
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">"{testimonial.review}"</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}