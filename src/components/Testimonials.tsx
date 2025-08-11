import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonials } from '../data';

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

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
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-14 h-14 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
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