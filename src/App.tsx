import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { LocationCards } from './components/LocationCards';
import { AccommodationTypes } from './components/AccommodationTypes';
import { Activities } from './components/Activities';
import { Accommodations } from './components/Accommodations';
import { Testimonials } from './components/Testimonials';
import { Gallery } from './components/Gallery';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { BookingPage } from './components/BookingPage';
import { AccommodationBookingPage } from './components/AccommodationBookingPage';
import { Accommodation } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedAccommodationForBooking, setSelectedAccommodationForBooking] = useState<Accommodation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleNavigate = (section: string) => {
    if (section === 'booking') {
      setCurrentPage('booking');
    } else {
      setCurrentPage('home');
      if (section !== 'home') {
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(selectedLocation === locationId ? 'all' : locationId);
    // Scroll to accommodations section
    document.getElementById('accommodations')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(selectedType === typeId ? 'all' : typeId);
    // Scroll to accommodations section
    document.getElementById('accommodations')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookAccommodation = (accommodation: Accommodation) => {
    setSelectedAccommodationForBooking(accommodation);
    setCurrentPage('accommodationBooking');
  };

  const handleBookNow = () => {
    setCurrentPage('booking');
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedAccommodation(null);
  };

  if (currentPage === 'booking') {
    return (
      <BookingPage onBack={() => setCurrentPage('home')} />
    );
  }

  if (currentPage === 'accommodationBooking' && selectedAccommodationForBooking) {
    return (
      <AccommodationBookingPage 
        accommodation={selectedAccommodationForBooking}
        onBack={() => {
          setCurrentPage('home');
          setSelectedAccommodationForBooking(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={handleNavigate} />
      
      <Hero onBookNow={handleBookNow} />
      
      <LocationCards 
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
      />
      
      <AccommodationTypes 
        selectedType={selectedType}
        onTypeSelect={handleTypeSelect}
      />

       <div id="accommodations">
        <Accommodations 
          selectedLocation={selectedLocation}
          selectedType={selectedType}
          onBookAccommodation={handleBookAccommodation}
        />
      </div>

      
      <div id="about">
        <Activities />
      </div>
      
     
      
      <Testimonials />
      
      <div id="gallery">
      <Gallery />
      </div>
      
      <Footer />

      <BookingModal
        accommodation={selectedAccommodation}
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
      />
    </div>
  );
}

export default App;