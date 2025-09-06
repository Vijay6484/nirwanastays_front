import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
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
import  StatusPage  from './components/PaymentSuccess'; // Add this import
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

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/booking" element={<BookingPage onBack={() => navigate('/')} />} />
        <Route path="/payment-success/:status/:id" element={<StatusPage />} /> {/* Add this route */}
        <Route path="/about" element={<AboutPage onBack={() => navigate('/')} />} />
        <Route path="/gallery" element={<GalleryPage onBack={() => navigate('/')} />} />
        <Route path="/accommodation/:id" element={
          selectedAccommodationForBooking ? 
            <AccommodationBookingPage 
              accommodation={selectedAccommodationForBooking}
              onBack={() => {
                navigate('/');
                setSelectedAccommodationForBooking(null);
              }}
            /> 
            : <div>Loading...</div>
        } />
        <Route path="/" element={
          <>
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
            {/* Floating WhatsApp Button */}
            <a
              href="https://wa.me/9021408308?text=Hi! I'm interested in booking a stay at Nirwana Stays."
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
              style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </a>
          </>
        } />
      </Routes>
    </div>
  );
}

export default AppWrapper;