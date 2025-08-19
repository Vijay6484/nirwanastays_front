import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Star, Wifi, Car, Coffee, MapPin, TreePine, 
  Heart, Share2, Camera, ParkingCircle, Utensils, Music, Waves 
} from 'lucide-react';
import Calendar from './Calendar';
import axios from 'axios';
import { Accommodation, BookingData, Amenities } from '../types';

const API_BASE_URL = "https://adminnirwana-back-1.onrender.com";

interface Coupon {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discount: number;
}

interface RoomGuests {
  adults: number;
  children: number;
}

interface AccommodationBookingPageProps {
  accommodation: Accommodation;
  onBack: () => void;
}

export function AccommodationBookingPage({ accommodation, onBack }: AccommodationBookingPageProps) {
  console.log('Accommodation data:', accommodation);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [amenities, setAmenities] = useState<Amenities[]>([]);
  const [formData, setFormData] = useState<BookingData>({
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    name: '',
    email: '',
    phone: ''
  });
  const [availableCoupons] = useState<Coupon[]>([
    { id: 1, code: 'SUMMER20', discountType: 'percentage', discount: 20 },
    { id: 2, code: 'WELCOME1000', discountType: 'fixed', discount: 1000 },
    { id: 3, code: 'FALL15', discountType: 'percentage', discount: 15 },
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [rooms, setRooms] = useState(0);
  const [roomGuests, setRoomGuests] = useState<RoomGuests[]>([]);
  const [availableRoomsForSelectedDate] = useState(10); // Placeholder: Assume 10 rooms available
  const [maxPeoplePerRoom] = useState(4); // Placeholder: Max 4 people per room
  const [currentAdultRate] = useState(accommodation.price); // Placeholder: Use accommodation price
  const [currentChildRate] = useState(accommodation.price * 0.5); // Placeholder: 50% of adult rate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rooms === 0) {
      alert('Please select at least one room to proceed with the booking.');
      return;
    }
    console.log('Booking submitted:', { ...formData, rooms, roomGuests });
    alert('Booking request submitted! We will contact you shortly.');
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
      return newGuests;
    });
  };

  const handleRoomGuestChange = (index: number, field: 'adults' | 'children', value: number) => {
    setRoomGuests(prev => {
      const newGuests = [...prev];
      newGuests[index] = { ...newGuests[index], [field]: value };
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
    if (coupon.discountType === 'percentage') {
      return total - (total * coupon.discount / 100);
    } else {
      return Math.max(0, total - coupon.discount);
    }
  };

  const totalAdults = roomGuests.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = roomGuests.reduce((sum, room) => sum + room.children, 0);
  const totalAmount = rooms * accommodation.price * calculateNights();
  const finalAmount = calculateDiscountedTotal(totalAmount, appliedCoupon);

  const handleCouponSelect = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    setCouponInput(coupon.code);
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const filteredCoupons = availableCoupons.filter(coupon => 
    coupon.code.toLowerCase().includes(couponInput.toLowerCase())
  );

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/amenities`);
        const data = response.data;
        
        if (!Array.isArray(data)) {
          console.error('Invalid response structure:', response.data);
          return;
        }

        console.log('Fetched amenities:', data);

        setAmenities(
          data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            icon: item.icon,
          }))
        );
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    };

    fetchAmenities();
  }, []);

  const iconsMap = {
    wifi: Wifi,
    car: Car,
    coffee: Coffee,
    mappin: MapPin,
    treepine: TreePine,
    heart: Heart,
    share2: Share2,
    camera: Camera,
    parking: ParkingCircle,
    restaurant: Utensils,
    pool: Waves,
    music: Music,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-3 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-3 text-gray-600 hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-600 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Side - Images and Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery */}
            <div className="relative animate-fade-in">
              <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={accommodation.gallery[currentImageIndex] || accommodation.image}
                  alt={accommodation.name}
                  className="w-full h-full object-cover"
                />

                {/* Image Counter */}
                <div className="absolute top-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {accommodation.gallery.length}
                </div>

                {/* View All Photos Button */}
                <button className="absolute bottom-6 right-6 bg-white text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-lg">
                  <Camera className="w-4 h-4" />
                  <span>View all photos</span>
                </button>
              </div>

              {/* Thumbnail Navigation */}
              {accommodation.gallery.length > 1 && (
                <div className="flex space-x-3 mt-6 overflow-x-auto pb-3">
                  {accommodation.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                        index === currentImageIndex ? 'border-emerald-500 scale-105' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="space-y-8 animate-slide-up">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                      {accommodation.name}
                    </h1>
                    <div className="flex items-center space-x-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">{accommodation.location}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{accommodation.type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                      ₹{accommodation.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">per night</div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600">4.9 (127 reviews)</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">About this place</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{accommodation.fullDescription}</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {amenities.map((amenity, idx) => {
                    const IconComponent = iconsMap[amenity.icon as keyof typeof iconsMap];
                    return IconComponent ? (
                      <div key={idx} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <IconComponent className="w-6 h-6 text-emerald-600" />
                        <span className="font-medium text-gray-700">{amenity.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">What's included</h4>
                  <ul className="space-y-3">
                    {accommodation.inclusions.map((item, index) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Not included</h4>
                  <ul className="space-y-3">
                    {accommodation.exclusions.map((item, index) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-8">
                  <h3 className="text-2xl font-bold mb-2">Reserve Your Stay</h3>
                  <p className="text-emerald-100">Book now and pay later</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  {/* Date Selection */}
                  <div className="grid grid-cols-1 gap-4">
                    <Calendar
                      selectedDate={formData.checkIn ?? undefined}
                      onDateSelect={(date: Date) => {
                        handleInputChange("checkIn", date);
                        const nextDay = new Date(date);
                        nextDay.setDate(date.getDate() + 1);
                        handleInputChange("checkOut", nextDay);
                      }}
                      label="Check-in"
                      accommodationId={accommodation.id}
                    />
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

                  {/* Number of Rooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => handleRoomsChange(Math.max(0, rooms - 1))}
                        disabled={rooms <= 0}
                        className="px-3 py-1 bg-green-700 text-white rounded disabled:bg-gray-300"
                      >-</button>
                      <span className="font-bold text-lg">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => handleRoomsChange(Math.min(availableRoomsForSelectedDate, rooms + 1))}
                        disabled={rooms >= availableRoomsForSelectedDate}
                        className="px-3 py-1 bg-green-700 text-white rounded disabled:bg-gray-300"
                      >+</button>
                      <span className="text-xs text-gray-500">
                        {availableRoomsForSelectedDate - rooms} rooms remaining
                      </span>
                    </div>
                    {rooms > 0 && (
                      <div className="border rounded p-2 bg-gray-50">
                        {roomGuests.slice(0, rooms).map((room, idx) => {
                          const adults = room.adults;
                          const children = room.children;
                          return (
                            <div key={`room-${idx}`} className="flex flex-col gap-1 mb-2 border-b pb-2 last:border-0">
                              <div className="flex items-center gap-4">
                                <span className="w-16 font-medium">Room {idx + 1}</span>
                                <select
                                  value={adults}
                                  onChange={e => handleRoomGuestChange(idx, 'adults', Number(e.target.value))}
                                  className="border rounded px-2 py-1"
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
                                  className="border rounded px-2 py-1"
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
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Total:</span> {totalAdults} Adults, {totalChildren} Children
                        </div>
                        <div className="text-xs text-gray-600">
                          Adult rate: ₹{currentAdultRate} / night, Child rate: ₹{currentChildRate} / night
                        </div>
                      </>
                    )}
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
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
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
                        {[0, 1, 2, 3, 4].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
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

                  {/* Coupon Code */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="coupon_code" className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Code
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="coupon_code"
                          name="coupon_code"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter coupon code"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            if (appliedCoupon && e.target.value !== appliedCoupon.code) {
                              setAppliedCoupon(null);
                            }
                          }}
                        />
                        {filteredCoupons.length > 0 && !appliedCoupon && (
                          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                            {filteredCoupons.map(coupon => (
                              <div
                                key={coupon.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleCouponSelect(coupon)}
                              >
                                <div className="font-medium">{coupon.code}</div>
                                <div className="text-gray-500">
                                  {coupon.discountType === 'percentage'
                                    ? `${coupon.discount}% off`
                                    : `₹${coupon.discount} off`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {appliedCoupon && (
                        <div className="mt-2 flex items-center justify-between text-sm text-emerald-600">
                          <span>
                            Coupon applied: {appliedCoupon.code} - {appliedCoupon.discountType === 'percentage'
                              ? `${appliedCoupon.discount}% discount`
                              : `₹${appliedCoupon.discount} discount`}
                          </span>
                          <button 
                            type="button" 
                            onClick={handleCouponRemove}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Rooms:</span>
                        <span>{rooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nights:</span>
                        <span>{calculateNights()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate per night:</span>
                        <span>₹{accommodation.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guests:</span>
                        <span>{totalAdults + totalChildren} ({totalAdults} Adults, {totalChildren} Children)</span>
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
                      <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-emerald-600">₹{finalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={rooms === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Reserve Now
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    You won't be charged yet. Complete your booking to confirm.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}













