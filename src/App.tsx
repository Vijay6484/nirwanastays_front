import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
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
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';
import { CancellationPolicy } from './components/CancellationPolicy';
import { Accommodation } from './types';
import StatusPage  from './components/PaymentSuccess'; // Add this import

// '/payment/:status/:id'

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

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Add this before your route conditions
  const renderWithTransition = (Component: React.ComponentType<any>) => (
    <div className="animate-fade-in">
      <Navigation onNavigate={handleNavigate} />
      <Component onBack={() => navigate('/')} />
    </div>
  );

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

  if (location.pathname.startsWith('/privacy-policy')) {
    return renderWithTransition(PrivacyPolicy);
  }

  if (location.pathname.startsWith( '/terms-conditions')) {
    return renderWithTransition(TermsConditions);
  }

  if (location.pathname.startsWith('/cancellation-policy')) {
    return renderWithTransition(CancellationPolicy);
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
     {/* Floating Call Button */}
<a
  href="tel:9021408308"
  className="fixed bottom-24 right-6 z-50 w-12 h-12 md:w-16 md:h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
  aria-label="Call Nirwana Stays"
>
  <svg className="w-6 h-6 md:w-9 md:h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 4.5A1 1 0 013 3.5h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/>
  </svg>
</a>

{/* Floating WhatsApp Button */}
<a
  href="https://wa.me/9021408308?text=Hi! I'm interested in booking a stay at Nirwana Stays."
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 z-50 w-12 h-12 md:w-16 md:h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
>
  <svg className="w-6 h-6 md:w-9 md:h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
</a>

      
    </div>

    
  );
}

export default AppWrapper;