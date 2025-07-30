// src/components/Gallery.tsx
import React, { useState } from 'react';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryImages } from '../data';
import { useNavigate } from 'react-router-dom';

export function Gallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const openImage = (index: number) => {
    setSelectedImageIndex(index);
    // Update URL for direct linking
    navigate(`/gallery/${index}`, { replace: true });
  };

  const closeImage = () => {
    setSelectedImageIndex(null);
    navigate('/gallery', { replace: true });
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev === 0 ? galleryImages.length - 1 : (prev as number) - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev === galleryImages.length - 1 ? 0 : (prev as number) + 1
      );
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Picture Perfect Moments
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get a glimpse of the breathtaking beauty and unforgettable experiences waiting for you
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="break-inside-avoid mb-6 group cursor-pointer relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-slide-up"
              onClick={() => openImage(index)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Viewer Modal */}
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            {/* Close Button */}
            <button
              onClick={closeImage}
              className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => navigateImage('next')}
              className="absolute right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center">
              <img
                src={galleryImages[selectedImageIndex]}
                alt={`Gallery ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                {selectedImageIndex + 1} / {galleryImages.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}