import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { LocationCards } from './components/LocationCards';
import { AccommodationTypes } from './components/AccommodationTypes';
import { Activities } from './components/Activities';
import { Accommodations } from './components/Accommodations';
import { Testimonials } from './components/Testimonials';
import { InstagramShowcase } from './components/InstagramShowcase';
import { Footer } from './components/Footer';
import { BookingPage } from './components/BookingPage';
import { AccommodationBookingPage } from './components/AccommodationBookingPage';
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

  const handleNavigate = (section: string) => {
    if (section === 'booking') {
      navigate('/booking');
    } else if (section === 'gallery') {
      navigate('/gallery');
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

  // Render different layouts based on route
  if (location.pathname.startsWith('/booking')) {
    return <BookingPage onBack={() => navigate('/')} />;
  }

  if (location.pathname.startsWith('/about')) {
    return <AboutPage onBack={() => navigate('/')} />;
  }

  if (location.pathname.startsWith('/gallery')) {
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
    </div>
  );
}

export default AppWrapper;