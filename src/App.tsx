import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { LocationCards } from './components/LocationCards';
import { AccommodationTypes } from './components/AccommodationTypes';
import { Activities } from './components/Activities';
import { Accommodations } from './components/Accommodations';
import { Testimonials } from './components/Testimonials';
import { Gallery } from './components/Gallery';
import { InstagramShowcase } from './components/InstagramShowcase';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { BookingPage } from './components/BookingPage';
import { AccommodationBookingPage } from './components/AccommodationBookingPage';
import { GalleryDetail } from './components/GalleryDetail';
import { AboutPage } from './components/AboutPage';
import { GalleryPage } from './components/GalleryPage';
import { Accommodation } from './types';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAccommodationForBooking, setSelectedAccommodationForBooking] = useState<Accommodation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleNavigate = (section: string) => {
    if (section === 'booking') {
      navigate('/booking');
    } else if (section === 'gallery') {
      navigate('/gallery-page');
    } else if (section === 'about') {
      navigate('/about');
    } else if (section === 'home') {
      navigate('/');
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(selectedLocation === locationId ? 'all' : locationId);
    document.getElementById('accommodations')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(selectedType === typeId ? 'all' : typeId);
    document.getElementById('accommodations')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookAccommodation = (accommodation: Accommodation) => {
    setSelectedAccommodationForBooking(accommodation);
    navigate(`/accommodation/${accommodation.id}`);
  };

  const handleBookNow = () => {
    navigate('/booking');
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedAccommodation(null);
  };

  // Render different layouts based on route
  if (location.pathname.startsWith('/booking')) {
    return <BookingPage onBack={() => navigate('/')} />;
  }

  if (location.pathname.startsWith('/about')) {
    return <AboutPage onBack={() => navigate('/')} />;
  }

  if (location.pathname.startsWith('/gallery-page')) {
    return <GalleryPage onBack={() => navigate('/')} />;
  }

  if (location.pathname.startsWith('/accommodation') && selectedAccommodationForBooking) {
    return (
      <AccommodationBookingPage 
        accommodation={selectedAccommodationForBooking}
        onBack={() => {
          navigate('/');
          setSelectedAccommodationForBooking(null);
        }}
      />
    );
  }

  if (location.pathname.startsWith('/gallery')) {
    return (
      <Routes>
        <Route path="/gallery" element={
          <div className="min-h-screen">
            <Navigation onNavigate={handleNavigate} />
            <Gallery />
            <Footer />
          </div>
        } />
        <Route path="/gallery/:id" element={<GalleryDetail />} />
      </Routes>
    );
  }

  // Default home page layout
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

      <div id="activities">
        <Activities />
      </div>
      
      <Testimonials />
      
      <InstagramShowcase />
      
      <Footer />

      <BookingModal
        accommodation={selectedAccommodation}
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
      />
    </div>
  );
}

export default AppWrapper;