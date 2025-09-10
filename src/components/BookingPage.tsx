import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarIcon, Users, MapPin, Star, Wifi, Car, Coffee, TreePine, Mountain, Sun, Waves } from 'lucide-react';
import { accommodations, locations, accommodationTypes } from '../data';
import { Accommodation, BookingData, Coupon } from '../types';
import Calendar from './Calendar';

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
  const [rooms, setRooms] = useState(0);
  const [roomGuests, setRoomGuests] = useState<{ adults: number; children: number }[]>([]);
  const [availableRoomsForSelectedDate, setAvailableRoomsForSelectedDate] = useState(0);
  const [maxPeoplePerRoom, setMaxPeoplePerRoom] = useState(0);
  const [currentAdultRate, setCurrentAdultRate] = useState(0);
  const [currentChildRate, setCurrentChildRate] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [foodCounts, setFoodCounts] = useState({ veg: 0, nonveg: 0, jain: 0 });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL || "http://api.nirwanastays.com";

  // Calculate total guests
  const totalAdults = roomGuests.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = roomGuests.reduce((sum, room) => sum + room.children, 0);
  const totalGuests = totalAdults + totalChildren;

  // Fetch coupons from API
  const fetchCoupons = async () => {
    console.log('Fetching coupons...');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/coupons`);
      const result = await response.json();
      console.log('Coupons fetched:', result.data);
      if (result.success && result.data) {
        const currentDate = new Date();

        // Filter active coupons (active=1) with future expiry dates
        const activeCoupons = result.data.filter((coupon: Coupon) => {
          const expiryDate = new Date(coupon.expiryDate);
          return coupon.active === 1 && expiryDate > currentDate;
        });

        setAvailableCoupons(activeCoupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  // Update rates when accommodation changes
  useEffect(() => {
    if (selectedAccommodation) {
      console.log('Selected accommodation:', selectedAccommodation);
      fetchCoupons();
      setCurrentAdultRate(selectedAccommodation.adult_price);
      setCurrentChildRate(selectedAccommodation.child_price);
      setFormData(prev => ({
        ...prev,
        checkIn: null,
        checkOut: null
      }));
      setRooms(0);
      setMaxPeoplePerRoom(selectedAccommodation.max_guest);
      setRoomGuests([]);
      setAppliedCoupon(null);
      setCouponInput('');
      setCouponError('');
      setFoodCounts({ veg: 0, nonveg: 0, jain: 0 });
      setErrors({});
    } else {
      setCurrentAdultRate(0);
      setCurrentChildRate(0);
    }
  }, [selectedAccommodation]);

  // Handle food count changes
  const handleFoodCount = (type: 'veg' | 'nonveg' | 'jain', delta: number) => {
    setFoodCounts(prev => {
      const newCounts = { ...prev };
      const currentTotal = prev.veg + prev.nonveg + prev.jain;
      
      if (delta > 0 && currentTotal >= totalGuests) {
        return prev; // Cannot exceed total guests
      }
      
      newCounts[type] = Math.max(0, prev[type] + delta);
      
      // Validate food counts
      const newTotal = newCounts.veg + newCounts.nonveg + newCounts.jain;
      if (newTotal !== totalGuests) {
        setErrors(prev => ({ ...prev, food: 'Food count must match total guests' }));
      } else {
        setErrors(prev => ({ ...prev, food: '' }));
      }
      
      return newCounts;
    });
  };

  // Apply coupon based on input
  const applyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const couponToApply = availableCoupons.find(
      coupon => coupon.code.toLowerCase() === couponInput.toLowerCase().trim()
    );

    if (!couponToApply) {
      setCouponError('Invalid coupon code');
      return;
    }

    // Check if coupon is expired
    const currentDate = new Date();
    const expiryDate = new Date(couponToApply.expiryDate);
    if (expiryDate < currentDate) {
      setCouponError('This coupon has expired');
      return;
    }

    // Check if coupon is active
    if (couponToApply.active !== 1) {
      setCouponError('This coupon is not active');
      return;
    }

    // Calculate base amount for minimum amount check
    const baseAmount = (totalAdults * currentAdultRate + totalChildren * currentChildRate) * calculateNights();
    
    if (couponToApply.minAmount && baseAmount < parseFloat(couponToApply.minAmount)) {
      setCouponError(`Minimum amount of ₹${couponToApply.minAmount} required for this coupon`);
      return;
    }

    // All checks passed, apply the coupon
    setAppliedCoupon(couponToApply);
    setCouponError('');
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const filteredAccommodations = accommodations.filter(acc => {
    const locationMatch = selectedLocation === 'all' || acc.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const typeMatch = selectedType === 'all' || acc.type === selectedType;
    return locationMatch && typeMatch;
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.checkIn) newErrors.dates = 'Please select a date';
    if ((foodCounts.veg + foodCounts.nonveg + foodCounts.jain) !== totalGuests) {
      newErrors.food = 'Food preferences must match total guests';
    }
    if (rooms === 0) {
      newErrors.rooms = 'Please select at least one room';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;
    if (!selectedAccommodation) return;
    
    setLoading(true);
    
    try {
      const formatDate = (date: Date | null) => date ? date.toISOString().split('T')[0] : '';
      
      const bookingPayload = {
        guest_name: formData.name,
        guest_email: formData.email,
        guest_phone: formData.phone,
        accommodation_id: selectedAccommodation.id,
        check_in: formatDate(formData.checkIn),
        check_out: formatDate(formData.checkOut),
        adults: totalAdults,
        children: totalChildren,
        rooms: rooms,
        food_veg: foodCounts.veg,
        food_nonveg: foodCounts.nonveg,
        food_jain: foodCounts.jain,
        total_amount: totalAmount,
        advance_amount: totalAmount * 0.5, // 50% advance
        package_id: 0,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
      };

      // Create booking
      const bookingResponse = await fetch(`${API_BASE_URL}/admin/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      const bookingData = await bookingResponse.json();
      console.log('Booking response:', bookingData);
      
      if (!bookingResponse.ok) {
        const errorMsg = bookingData.error || bookingData.message || 'Failed to create booking';
        throw new Error(errorMsg);
      }
      
      const bookingId = bookingData.data?.booking_id || bookingData.booking_id;
      if (!bookingId) {
        throw new Error('Booking ID not found in response');
      }

      // Initiate payment
      const paymentPayload = {
        amount: totalAmount * 0.5, // 50% advance
        firstname: formData.name,
        email: formData.email,
        phone: formData.phone,
        productinfo: `Booking for ${selectedAccommodation.name}`,
        booking_id: bookingId,
      };

      const paymentResponse = await fetch(`${API_BASE_URL}/admin/bookings/payments/payu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentData = await paymentResponse.json();
      console.log('Payment response:', paymentData);
      
      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || paymentData.message || 'Failed to initiate payment');
      }

      if (!paymentData.payu_url || !paymentData.payment_data || typeof paymentData.payment_data !== 'object') {
        console.error('Invalid payment data structure:', paymentData);
        throw new Error('Invalid payment data received from server');
      }

      // Create and submit the payment form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.payu_url;

      Object.entries(paymentData.payment_data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (error: any) {
      console.error('Booking/Payment error:', error);
      let errorMessage = error.message || 'Something went wrong. Please try again.';
      alert(errorMessage);
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookingData, value: string | number | Date | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'checkIn' && value instanceof Date) {
        const nextDay = new Date(value);
        nextDay.setDate(value.getDate() + 1);
        updated.checkOut = nextDay;
      }
      return updated;
    });
  };

  const handleRoomsChange = (newRooms: number) => {
    setRooms(newRooms);
    setRoomGuests(prev => {
      const newGuests = [...prev];
      if (newRooms > prev.length) {
        for (let i = prev.length; i < newRooms; i++) {
          newGuests.push({ adults: 1, children: 0 });
        }
      } else {
        newGuests.splice(newRooms);
      }
      
      // Reset food counts when rooms change
      setFoodCounts({ veg: 0, nonveg: 0, jain: 0 });
      setErrors(prev => ({ ...prev, food: '' }));
      
      return newGuests;
    });
  };

  const handleRoomGuestChange = (index: number, field: 'adults' | 'children', value: number) => {
    setRoomGuests(prev => {
      const newGuests = [...prev];
      newGuests[index] = { ...newGuests[index], [field]: value };
      
      // Reset food counts when guests change
      setFoodCounts({ veg: 0, nonveg: 0, jain: 0 });
      setErrors(prev => ({ ...prev, food: '' }));
      
      return newGuests;
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

  const calculateDiscountedTotal = (total: number, coupon: Coupon | null) => {
    if (!coupon) return total;

    let discountValue = 0;

    if (coupon.discountType === 'percentage') {
      discountValue = total * (parseFloat(coupon.discount) / 100);

      // Apply maximum discount limit if specified
      if (coupon.maxDiscount) {
        discountValue = Math.min(discountValue, parseFloat(coupon.maxDiscount));
      }
    } else {
      discountValue = parseFloat(coupon.discount);
    }

    return Math.max(0, total - discountValue);
  };

  // Calculate base amount based on adults and children rates
  const baseAmount = (totalAdults * currentAdultRate + totalChildren * currentChildRate) * calculateNights();
  
  // Apply coupon discount if any
  const totalAmount = calculateDiscountedTotal(baseAmount, appliedCoupon);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 sm:space-x-3 text-gray-600 hover:text-emerald-600 transition-colors p-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-12">
          {/* Left Side - Filters and Accommodations */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-16 animate-fade-in">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
                Find Your Perfect
                <span className="block text-emerald-600">Escape</span>
              </h1>
              <p className="text-base sm:text-xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto">
                Discover luxury accommodations nestled in nature's paradise at Pawna Lake
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl animate-slide-up">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">Filter Your Stay</h3>

              {/* Location Filter */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">Choose Location</h4>
                <div className="flex flex-col sm:flex-row sm:gap-4 sm:flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLocation('all')}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all text-sm sm:text-base ${selectedLocation === 'all'
                      ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                      }`}
                  >
                    All Locations
                  </button>
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all capitalize text-sm sm:text-base ${selectedLocation === location.id
                        ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                        }`}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6">Accommodation Type</h4>
                <div className="flex flex-col sm:flex-row sm:gap-4 sm:flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all text-sm sm:text-base ${selectedType === 'all'
                      ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                      }`}
                  >
                    All Types
                  </button>
                  {accommodationTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all capitalize text-sm sm:text-base ${selectedType === type.id
                        ? 'bg-emerald-500 text-white shadow-lg sm:shadow-xl scale-100 sm:scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-100 sm:hover:scale-105'
                        }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Accommodations Grid */}
            <div className="space-y-6 sm:space-y-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Available Accommodations ({filteredAccommodations.length})
              </h3>

              {filteredAccommodations.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white/50 rounded-2xl sm:rounded-3xl animate-fade-in">
                  <MapPin className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2 sm:mb-3">No Properties Found</h4>
                  <p className="text-sm sm:text-base text-gray-500">Try adjusting your filters to see more options</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:gap-8">
                  {filteredAccommodations.map((accommodation, index) => (
                    <div
                      key={accommodation.id}
                      className={`bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl cursor-pointer animate-slide-up ${selectedAccommodation?.id === accommodation.id ? 'ring-4 ring-emerald-400 scale-100 sm:scale-105' : 'hover:scale-100 sm:hover:scale-102'
                        }`}
                      onClick={() => setSelectedAccommodation(accommodation)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/3">
                          <img
                            src={accommodation.image}
                            alt={accommodation.name}
                            className="w-full h-48 sm:h-64 md:h-full object-cover"
                          />
                        </div>
                        <div className="w-full sm:w-2/3 p-4 sm:p-6 md:p-8">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                            <div>
                              <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">{accommodation.name}</h4>
                              <div className="flex items-center space-x-2 text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">
                                <MapPin className="w-3 sm:w-4 h-3 sm:h-4" />
                                <span className="capitalize">{accommodation.location}</span>
                                <span className="mx-1 sm:mx-2">•</span>
                                <span className="capitalize">{accommodation.type}</span>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-xl sm:text-2xl font-bold text-emerald-600">₹{accommodation.price.toLocaleString()}</div>
                              <div className="text-xs sm:text-sm text-gray-500">per night</div>
                            </div>
                          </div>

                          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">{accommodation.description}</p>

                          <div className="flex items-center gap-4 sm:gap-6 text-gray-500 mb-4 sm:mb-6 flex-wrap text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>4-6 guests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wifi className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>Wi-Fi</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="w-3 sm:w-4 h-3 sm:h-4" />
                              <span>Parking</span>
                            </div>
                          </div>

                          <button
                            className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${selectedAccommodation?.id === accommodation.id
                              ? 'bg-emerald-500 text-white shadow-md sm:shadow-lg'
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
            <div className="sticky top-20 sm:top-24 lg:top-32">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl sm:shadow-2xl animate-fade-in">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">Complete Your Booking</h3>

                {selectedAccommodation ? (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Selected Accommodation */}
                    <div className="bg-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h4 className="font-semibold text-emerald-800 mb-2 text-sm sm:text-base">{selectedAccommodation.name}</h4>
                      <div className="text-xs sm:text-sm text-emerald-600 capitalize">
                        {selectedAccommodation.location} • {selectedAccommodation.type}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                      <div className="p-3 sm:p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Select Date</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Select your stay date</p>

                        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                          Some dates have special pricing. Please check the calendar before booking.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Check-in Calendar */}
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                              <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1 sm:mr-2" />
                              Check-in
                            </label>
                            <Calendar
                              selectedDate={formData.checkIn ?? undefined}
                              onDateSelect={(date: Date) => handleInputChange('checkIn', date)}
                              onAvailableRoomsChange={(rooms) => setAvailableRoomsForSelectedDate(rooms ?? 0)}
                              minDate={new Date()}
                              label=""
                              accommodationId={selectedAccommodation.id}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Check-in/out Times */}
                      <div className="p-3 sm:p-4 border border-emerald-100 rounded-xl bg-emerald-50/50">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Check-in/out Times</h4>
                        <ul className="space-y-2 text-xs sm:text-sm">
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

                    {/* Rooms */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rooms</label>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleRoomsChange(Math.max(0, rooms - 1))}
                          disabled={rooms <= 0}
                          className="px-2 sm:px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px] text-sm"
                        >-</button>
                        <span className="font-bold text-sm sm:text-lg">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => handleRoomsChange(Math.min(availableRoomsForSelectedDate, rooms + 1))}
                          disabled={rooms >= availableRoomsForSelectedDate}
                          className="px-2 sm:px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px] text-sm"
                        >+</button>
                        <span className="text-xs text-gray-500">
                          {availableRoomsForSelectedDate - rooms} rooms remaining
                        </span>
                      </div>
                      {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>}
                      {rooms > 0 && (
                        <div className="border rounded-lg p-2 sm:p-3 bg-gray-50">
                          {roomGuests.slice(0, rooms).map((room, idx) => {
                            const adults = room.adults;
                            const children = room.children;
                            return (
                              <div key={`room-${idx}`} className="flex flex-col gap-2 mb-2 border-b pb-2 last:border-0">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                  <span className="w-16 font-medium text-xs sm:text-sm">Room {idx + 1}</span>
                                  <select
                                    value={adults}
                                    onChange={e => handleRoomGuestChange(idx, 'adults', Number(e.target.value))}
                                    className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:flex-1 min-h-[44px]"
                                  >
                                    {[...Array(maxPeoplePerRoom + 1).keys()].map(n =>
                                      n + children <= maxPeoplePerRoom && (
                                        <option key={`adults-${n}`} value={n}>{n} Adults</option>
                                      )
                                    )}
                                  </select>
                                  <select
                                    value={children}
                                    onChange={e => handleRoomGuestChange(idx, 'children', Number(e.target.value))}
                                    className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:flex-1 min-h-[44px]"
                                  >
                                    {[...Array(maxPeoplePerRoom + 1).keys()].map(n =>
                                      n + adults <= maxPeoplePerRoom && (
                                        <option key={`children-${n}`} value={n}>{n} Children</option>
                                      )
                                    )}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {rooms > 0 && (
                        <>
                          <div className="mt-2 text-xs sm:text-sm">
                            <span className="font-medium">Total:</span> {totalAdults} Adults, {totalChildren} Children
                          </div>
                          <div className="text-xs text-gray-600">
                            Adult rate: ₹{currentAdultRate.toLocaleString()} / night, Child rate: ₹{currentChildRate.toLocaleString()} / night
                          </div>
                        </>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Food Preferences */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Food Preferences</h3>
                      <div className="space-y-3 bg-gray-50 p-4 rounded border">
                        {(['veg', 'nonveg', 'jain'] as const).map(type => (
                          <div key={type} className="flex items-center gap-4">
                            <span className="w-32 capitalize">{type === 'nonveg' ? 'Non veg' : type} count</span>
                            <button
                              type="button"
                              onClick={() => handleFoodCount(type, -1)}
                              disabled={foodCounts[type] <= 0}
                              className="rounded-full bg-gray-200 text-lg w-8 h-8 flex items-center justify-center disabled:opacity-50"
                            >-</button>
                            <span className="w-6 text-center">{foodCounts[type]}</span>
                            <button
                              type="button"
                              onClick={() => handleFoodCount(type, 1)}
                              disabled={(foodCounts.veg + foodCounts.nonveg + foodCounts.jain) >= totalGuests}
                              className="rounded-full bg-gray-200 text-lg w-8 h-8 flex items-center justify-center disabled:opacity-50"
                            >+</button>
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-2">
                          Total food count: {foodCounts.veg + foodCounts.nonveg + foodCounts.jain} / {totalGuests}
                          {foodCounts.veg + foodCounts.nonveg + foodCounts.jain !== totalGuests && (
                            <span className="text-red-600 ml-2">Must match total guests!</span>
                          )}
                        </div>
                        {errors.food && <p className="text-red-500 text-sm mt-2">{errors.food}</p>}
                      </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label
                          htmlFor="coupon_code"
                          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                        >
                          Coupon Code
                        </label>

                        {/* Coupon Codes - Horizontal Scroll */}
                        {availableCoupons.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {availableCoupons.map((coupon) => (
                              <div
                                key={coupon.id}
                                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs sm:text-sm cursor-pointer whitespace-nowrap hover:bg-emerald-200"
                                onClick={() => {
                                  setCouponInput(coupon.code);
                                  setCouponError('');
                                }}
                              >
                                {coupon.code}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Coupon Input + Button */}
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            id="coupon_code"
                            name="coupon_code"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm min-h-[44px]"
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            disabled={!!appliedCoupon}
                          />
                          {appliedCoupon ? (
                            <button
                              type="button"
                              onClick={removeCoupon}
                              className="px-4 bg-red-500 text-white rounded-lg text-xs sm:text-sm min-h-[44px]"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={applyCoupon}
                              className="px-4 bg-emerald-500 text-white rounded-lg text-xs sm:text-sm min-h-[44px]"
                            >
                              Apply
                            </button>
                          )}
                        </div>

                        {/* Error Message */}
                        {couponError && (
                          <p className="text-red-500 text-xs mt-2">{couponError}</p>
                        )}

                        {/* Applied Coupon */}
                        {appliedCoupon && (
                          <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                            <p className="text-emerald-700 text-xs sm:text-sm">
                              Coupon applied: {appliedCoupon.code} -{' '}
                              {appliedCoupon.discountType === 'percentage'
                                ? `${appliedCoupon.discount}% off`
                                : `₹${appliedCoupon.discount} off`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Booking Summary</h4>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span>Rooms:</span>
                          <span>{rooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nights:</span>
                          <span>{calculateNights()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adults ({totalAdults}):</span>
                          <span>₹{(totalAdults * currentAdultRate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Children ({totalChildren}):</span>
                          <span>₹{(totalChildren * currentChildRate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total per night:</span>
                          <span>₹{(totalAdults * currentAdultRate + totalChildren * currentChildRate).toLocaleString()}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount:</span>
                            <span>
                              {appliedCoupon.discountType === 'percentage'
                                ? `${appliedCoupon.discount}%`
                                : `-₹${appliedCoupon.discount}`}
                            </span>
                          </div>
                        )}
                        <div className="border-t pt-2 sm:pt-3 flex justify-between font-semibold text-sm sm:text-lg">
                          <span>Total Amount:</span>
                          <span className="text-emerald-600">₹{totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleBooking}
                      disabled={loading || (foodCounts.veg + foodCounts.nonveg + foodCounts.jain) !== totalGuests || rooms === 0}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-md sm:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
                    >
                      {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <TreePine className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                    <h4 className="text-base sm:text-lg font-semibold text-gray-600 mb-2 sm:mb-3">Select an Accommodation</h4>
                    <p className="text-xs sm:text-base text-gray-500">Choose your perfect stay from the options on the left</p>
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