// src/components/GalleryDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { galleryImages } from '../data';

export function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentIndex = id ? parseInt(id) : 0;

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1)
      : (currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1);
    
    navigate(`/gallery/${newIndex}`);
  };

  const closeGallery = () => {
    navigate('/gallery');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* Close Button */}
      <button
        onClick={closeGallery}
        className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={() => navigateImage('prev')}
        className="absolute left-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={() => navigateImage('next')}
        className="absolute right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Image */}
      <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center">
        <img
          src={galleryImages[currentIndex]}
          alt={`Gallery ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        
        {/* Image Counter */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          {currentIndex + 1} / {galleryImages.length}
        </div>
      </div>
    </div>
  );
}