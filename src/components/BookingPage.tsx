import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarIcon, Users, MapPin, Star, Wifi, Car, Coffee, TreePine, Mountain, Sun, Waves } from 'lucide-react';
import { accommodations, locations, accommodationTypes } from '../data';
import { Accommodation, BookingData } from '../types';
import Calendar from './Calendar'; // Import the custom calendar component

interface BookingPageProps {
  onBack: () => void;
}

export function BookingPage({ onBack }: BookingPageProps) {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [formData, setFormData] = useState<BookingData>({
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    name: '',
    email: '',
    phone: ''
  });

  // Reset dates when accommodation changes
  useEffect(() => {
    if (selectedAccommodation) {
      setFormData(prev => ({
        ...prev,
        checkIn: null,
        checkOut: null
      }));
    }
  }, [selectedAccommodation]);

  const filteredAccommodations = accommodations.filter(acc => {
  const locationMatch = selectedLocation === 'all' || acc.location.toLowerCase().includes(selectedLocation.toLowerCase());
  const typeMatch = selectedType === 'all' || acc.type === selectedType;
  return locationMatch && typeMatch;
});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', formData, selectedAccommodation);
    alert('Booking request submitted! We will contact you shortly.');
  };

  const handleInputChange = (field: keyof BookingData, value: string | number | Date | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Automatically set checkout to next day when checkin is selected
      if (field === 'checkIn' && value instanceof Date) {
        const nextDay = new Date(value);
        nextDay.setDate(value.getDate() + 1);
        updated.checkOut = nextDay;
      }

      return updated;
    });
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 1;
  };

  const totalAmount = selectedAccommodation ? selectedAccommodation.price * calculateNights() : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-3 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Nirwana Stays</h1>
                <p className="text-sm text-emerald-600">Book Your Perfect Stay</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Side - Filters and Accommodations */}
          <div className="lg:col-span-2 space-y-12">
            {/* Hero Section */}
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Find Your Perfect
                <span className="block text-emerald-600">Escape</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover luxury accommodations nestled in nature's paradise at Pawna Lake
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl animate-slide-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-8">Filter Your Stay</h3>

              {/* Location Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-6">Choose Location</h4>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  <button
                    onClick={() => setSelectedLocation('all')}
                    className={`flex-shrink-0 px-6 py-4 rounded-2xl font-medium transition-all ${selectedLocation === 'all'
                        ? 'bg-emerald-500 text-white shadow-xl scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                  >
                    All Locations
                  </button>
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`flex-shrink-0 px-6 py-4 rounded-2xl font-medium transition-all capitalize ${selectedLocation === location.id
                          ? 'bg-emerald-500 text-white shadow-xl scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-6">Accommodation Type</h4>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`flex-shrink-0 px-6 py-4 rounded-2xl font-medium transition-all ${selectedType === 'all'
                        ? 'bg-emerald-500 text-white shadow-xl scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                  >
                    All Types
                  </button>
                  {accommodationTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex-shrink-0 px-6 py-4 rounded-2xl font-medium transition-all capitalize ${selectedType === type.id
                          ? 'bg-emerald-500 text-white shadow-xl scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Accommodations Grid */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-800">
                Available Accommodations ({filteredAccommodations.length})
              </h3>

              {filteredAccommodations.length === 0 ? (
                <div className="text-center py-16 bg-white/50 rounded-3xl animate-fade-in">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h4 className="text-xl font-semibold text-gray-600 mb-3">No Properties Found</h4>
                  <p className="text-gray-500">Try adjusting your filters to see more options</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {filteredAccommodations.map((accommodation, index) => (
                    <div
                      key={accommodation.id}
                      className={`bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl cursor-pointer animate-slide-up ${selectedAccommodation?.id === accommodation.id ? 'ring-4 ring-emerald-400 scale-105' : 'hover:scale-102'
                        }`}
                      onClick={() => setSelectedAccommodation(accommodation)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="sm:flex">
                        <div className="sm:w-1/3">
                          <img
                            src={accommodation.image}
                            alt={accommodation.name}
                            className="w-full h-64 sm:h-full object-cover"
                          />
                        </div>
                        <div className="sm:w-2/3 p-8">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
                            <div>
                              <h4 className="text-xl font-bold text-gray-800 mb-3">{accommodation.name}</h4>
                              <div className="flex items-center space-x-2 text-gray-600 mb-3">
                                <MapPin className="w-4 h-4" />
                                <span className="capitalize">{accommodation.location}</span>
                                <span className="mx-2">•</span>
                                <span className="capitalize">{accommodation.type}</span>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-2xl font-bold text-emerald-600">₹{accommodation.price.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">per night</div>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-6 leading-relaxed">{accommodation.description}</p>

                          <div className="flex items-center gap-6 text-gray-500 mb-6 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">4-6 guests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wifi className="w-4 h-4" />
                              <span className="text-sm">Wi-Fi</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4" />
                              <span className="text-sm">Parking</span>
                            </div>
                          </div>

                          <button
                            className={`w-full py-4 rounded-2xl font-semibold transition-all ${selectedAccommodation?.id === accommodation.id
                                ? 'bg-emerald-500 text-white shadow-lg'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                          >
                            {selectedAccommodation?.id === accommodation.id ? 'Selected' : 'Select This Stay'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-800 mb-8">Complete Your Booking</h3>

                {selectedAccommodation ? (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Selected Accommodation */}
                    <div className="bg-emerald-50 rounded-2xl p-6">
                      <h4 className="font-semibold text-emerald-800 mb-2">{selectedAccommodation.name}</h4>
                      <div className="text-sm text-emerald-600 capitalize">
                        {selectedAccommodation.location} • {selectedAccommodation.type}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Date</h3>
                        <p className="text-sm text-gray-600 mb-4">Select your stay date</p>

                        <p className="text-sm text-gray-500 mb-4">
                          Some dates have special pricing. Please check the calendar before booking.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Check-in Calendar */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              <CalendarIcon className="w-4 h-4 inline mr-2" />
                              Check-in
                            </label>
                            <Calendar
                              selectedDate={formData.checkIn ?? undefined}
                              onDateSelect={(date: Date) => handleInputChange('checkIn', date)}
                              minDate={new Date()}
                              label=""
                              accommodationId={selectedAccommodation.id}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Check-in/out Times */}
                      <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/50">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Check-in/out Times</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-gray-500">Check-in:</span>
                            <span className="font-medium text-gray-800">
                              {formData.checkIn
                                ? `${formData.checkIn.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}, 3:00 PM`
                                : "Select a date"}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-500">Check-out:</span>
                            <span className="font-medium text-gray-800">
                              {formData.checkOut
                                ? `${formData.checkOut.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}, 11:00 AM`
                                : "Select a date"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Users className="w-4 h-4 inline mr-2" />
                          Adults
                        </label>
                        <select
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={formData.adults}
                          onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Users className="w-4 h-4 inline mr-2" />
                          Children
                        </label>
                        <select
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={formData.children}
                          onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
                        >
                          {[0, 1, 2, 3, 4].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Booking Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Nights:</span>
                          <span>{calculateNights()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate per night:</span>
                          <span>₹{selectedAccommodation.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guests:</span>
                          <span>{formData.adults + formData.children}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                          <span>Total Amount:</span>
                          <span className="text-emerald-600">₹{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Confirm Booking
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-16">
                    <TreePine className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-3">Select an Accommodation</h4>
                    <p className="text-gray-500">Choose your perfect stay from the options on the left</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}