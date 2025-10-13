import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import * as LucideIcons from 'lucide-react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Camera,
  MapPin,
  Star,
  AlertCircle,
} from 'lucide-react';
import Calendar from "./Calendar";
import axios from "axios";
import { Accommodation as BaseAccommodation, BookingData, Amenities } from "../types";
import DOMPurify from "dompurify";

const API_BASE_URL = "https://api.nirwanastays.com";

// MODIFICATION: Interface updated to match your SQL table columns for villas.
interface Accommodation extends BaseAccommodation {
    bhk?: string;
    min_persons?: number;
    max_persons?: number;
    extra_person_charge?: number;
    MaxPersonVilla?: number; 
    ratePerPerson?: number;
}

interface Coupon {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discount: number;
  minAmount?: number;
  maxDiscount?: number;
  expiryDate: string;
  active: number;
  accommodationType: string;
}
interface RoomGuests {
  adults: number;
  children: number;
  extraGuests?: number; 
}
interface AccommodationBookingPageProps {
  accommodation: Accommodation;
  onBack: () => void;
}
export function AccommodationBookingPage({
  accommodation,
  onBack,
}: AccommodationBookingPageProps) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const isVilla = accommodation.type.toLowerCase() === 'villa';
  // MODIFICATION: Using MaxPersonVilla from your table for total capacity.
  const totalPropertyCapacity = accommodation.MaxPersonVilla || accommodation.max_guest || 99;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [amenitiesData, setAmenitiesData] = useState<Amenities[]>([]);
  const [formData, setFormData] = useState<BookingData>({
    checkIn: null,
    checkOut: null,
    adults: 0,
    children: 0,
    name: "",
    email: "",
    phone: "",
  });
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [rooms, setRooms] = useState(isVilla ? 1 : 0);
  const [roomGuests, setRoomGuests] = useState<RoomGuests[]>(
    isVilla ? [{ adults: accommodation.min_persons || 2, children: 0, extraGuests: 0 }] : []
  );
  const [availableRoomsForSelectedDate, setAvailableRoomsForSelectedDate] =
    useState(0);
  const [maxPeoplePerRoom, setMaxPeoplePerRoom] = useState(
    accommodation.max_guest || 6
  );
  const [currentAdultRate, setCurrentAdultRate] = useState(
    accommodation.adult_price || accommodation.price
  );
  const [currentChildRate, setCurrentChildRate] = useState(
    accommodation.child_price || accommodation.price * 0.5
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [paymentError, setPaymentError] = useState("");
  const [loading, setLoading] = useState(false);
  const [foodCounts, setFoodCounts] = useState({ veg: 0, nonveg: 0, jain: 0 });
  

  const stripQuillArtifacts = (html: string): string => {
    if (!html) return "";
    let cleaned = html.replace(
      /<span[^>]*class=["']?ql-cursor["']?[^>]*>.*?<\/span>/gi,
      ""
    );
    cleaned = cleaned.replace(/<p><br\/?><\/p>/gi, "");
    cleaned = cleaned.replace(/<\/?u>/gi, "");
    return cleaned;
  };
  const cleanHtml = (input: string): string => stripQuillArtifacts(input);

  const contactSectionRef = useRef<HTMLDivElement>(null);
  const datesSectionRef = useRef<HTMLDivElement>(null);
  const roomsSectionRef = useRef<HTMLDivElement>(null);
  const foodSectionRef = useRef<HTMLDivElement>(null);
  const roomRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalAdults = roomGuests.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = roomGuests.reduce(
    (sum, room) => sum + room.children,
    0
  );
  const totalGuests = totalAdults + totalChildren;

  const totalExtraGuests = isVilla
    ? roomGuests.reduce((sum, villa) => sum + (villa.extraGuests || 0), 0)
    : 0;

  const finalTotalGuests = totalGuests + totalExtraGuests;

  useEffect(() => {
    if (isVilla && totalGuests < totalPropertyCapacity) {
        setRoomGuests(prev => {
            const newGuests = [...prev];
            if (newGuests[0]) {
                newGuests[0].extraGuests = 0;
            }
            return newGuests;
        });
    }
  }, [totalGuests, isVilla, totalPropertyCapacity]);

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/coupons`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const currentDate = new Date();
        
        const activeCoupons = result.data.filter((coupon: Coupon) => {
          if (!coupon.active) return false;
          if (coupon.accommodationType === "All") return true;
            if (!coupon.accommodationType) return true;
          const expiryDate = new Date(coupon.expiryDate);
          return coupon.active === 1 && expiryDate > currentDate && (coupon.accommodationType === accommodation.name);
        });
        setAvailableCoupons(activeCoupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleFoodCount = (type: "veg" | "nonveg" | "jain", delta: number) => {
    setFoodCounts((prev) => {
      const newCounts = { ...prev };
      const currentTotal = prev.veg + prev.nonveg + prev.jain;

      if (delta > 0 && currentTotal >= totalGuests) {
        return prev;
      }

      newCounts[type] = Math.max(0, prev[type] + delta);

      const newTotal = newCounts.veg + newCounts.nonveg + newCounts.jain;
      if (newTotal !== totalGuests) {
        setErrors((prev) => ({
          ...prev,
          food: "Food count must match total guests",
        }));
      } else {
        setErrors((prev) => ({ ...prev, food: "" }));
      }

      return newCounts;
    });
  };

  const applyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    const couponToApply = availableCoupons.find(
      (coupon) => coupon.code.toLowerCase() === couponInput.toLowerCase().trim()
    );
    if (!couponToApply) {
      setCouponError("Invalid coupon code");
      return;
    }
    const currentDate = new Date();
    const expiryDate = new Date(couponToApply.expiryDate);
    if (expiryDate < currentDate) {
      setCouponError("This coupon has expired");
      return;
    }
    if (couponToApply.active !== 1) {
      setCouponError("This coupon is not active");
      return;
    }

    const baseAmount = calculateTotalAmount();

    if (
      couponToApply.minAmount &&
      baseAmount < parseFloat(couponToApply.minAmount as any)
    ) {
      setCouponError(
        `Minimum amount of ₹${couponToApply.minAmount} required for this coupon`
      );
      return;
    }
    setAppliedCoupon(couponToApply);
    setCouponError("");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.checkIn) newErrors.dates = "Please select a date";
    
    if (!isVilla && foodCounts.veg + foodCounts.nonveg + foodCounts.jain !== totalGuests) {
      newErrors.food = "Food preferences must match total guests";
    }

    if (isVilla) {
        if (finalTotalGuests < 1) {
            newErrors.rooms = "At least one guest is required for the villa."
        }
    } else {
        if (rooms === 0) {
            newErrors.rooms = "Please select at least one room";
        }
        roomGuests.slice(0, rooms).forEach((room, idx) => {
            if (room.adults + room.children < 2) {
                newErrors[`room-${idx}`] = "Each room must have at least 2 guests";
            }
        });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        let element: HTMLElement | null = null;

        if (["name", "email", "phone"].includes(firstErrorKey)) {
          element = contactSectionRef.current;
        } else if (firstErrorKey === "dates") {
          element = datesSectionRef.current;
        } else if (firstErrorKey === "food") {
          element = foodSectionRef.current;
        } else if (firstErrorKey === "rooms") {
          element = roomsSectionRef.current;
        } else if (firstErrorKey.startsWith("room-")) {
          const roomIndex = parseInt(firstErrorKey.split("-")[1]);
          element = roomRefs.current[roomIndex];
        }

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setPaymentError("");

    try {
      const formatDate = (date: Date | null) =>
        date ? date.toISOString().split("T")[0] : "";

      const bookingPayload = {
        guest_name: formData.name,
        guest_email: formData.email,
        guest_phone: formData.phone,
        accommodation_id: accommodation.id,
        check_in: formatDate(formData.checkIn),
        check_out: formatDate(formData.checkOut),
        adults: isVilla ? finalTotalGuests : totalAdults,
        children: isVilla ? 0 : totalChildren,
        rooms: rooms,
        food_veg: foodCounts.veg,
        food_nonveg: foodCounts.nonveg,
        food_jain: foodCounts.jain,
        total_amount: totalAmount,
        advance_amount: totalAmount * 0.3,
        package_id: 0,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
      };

      const bookingResponse = await fetch(`${API_BASE_URL}/admin/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });
      const bookingData = await bookingResponse.json();
      console.log("Booking response:", bookingData);

      if (!bookingResponse.ok) {
        const errorMsg =
          bookingData.error ||
          bookingData.message ||
          "Failed to create booking";
        throw new Error(errorMsg);
      }

      const bookingId = bookingData.data?.booking_id || bookingData.booking_id;
      if (!bookingId) {
        throw new Error("Booking ID not found in response");
      }

      await initiatePaymentWithRetry(bookingId, totalAmount * 0.3);
    } catch (error: any) {
      console.error("Booking/Payment error:", error);
      let errorMessage =
        error.message || "Something went wrong. Please try again.";
      setPaymentError(errorMessage);
      setLoading(false);
    }
  };

  const initiatePaymentWithRetry = async (
    bookingId: string,
    amount: number,
    attempt = 1
  ) => {
    const maxRetries = 3;
    const baseDelay = 1000;

    try {
      const paymentPayload = {
        amount: amount,
        firstname: formData.name,
        email: formData.email,
        phone: formData.phone,
        productinfo: `Booking for ${accommodation.name}`,
        booking_id: bookingId,
      };
      const paymentResponse = await fetch(
        `${API_BASE_URL}/admin/bookings/payments/payu`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentPayload),
        }
      );
      const paymentData = await paymentResponse.json();
      console.log("Payment response:", paymentData);

      if (!paymentResponse.ok) {
        if (
          paymentData.error?.includes("Too many Requests") &&
          attempt < maxRetries
        ) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          setPaymentError(
            `Payment system busy. Retrying in ${
              delay / 1000
            } seconds... (Attempt ${attempt}/${maxRetries})`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          return initiatePaymentWithRetry(bookingId, amount, attempt + 1);
        }

        throw new Error(
          paymentData.error ||
            paymentData.message ||
            "Failed to initiate payment"
        );
      }

      if (
        !paymentData.payu_url ||
        !paymentData.payment_data ||
        typeof paymentData.payment_data !== "object"
      ) {
        console.error("Invalid payment data structure:", paymentData);
        throw new Error("Invalid payment data received from server");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentData.payu_url;
      Object.entries(paymentData.payment_data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      if (
        attempt < maxRetries &&
        error.message?.includes("Too many Requests")
      ) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        setPaymentError(
          `Payment system busy. Retrying in ${
            delay / 1000
          } seconds... (Attempt ${attempt}/${maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return initiatePaymentWithRetry(bookingId, amount, attempt + 1);
      }

      throw error;
    }
  };

  const handleInputChange = (
    field: keyof BookingData,
    value: string | number | Date | null
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "checkIn" && value instanceof Date) {
        const nextDay = new Date(value);
        nextDay.setDate(value.getDate() + 1);
        updated.checkOut = nextDay;
      }
      return updated;
    });
  };

  const handleRoomsChange = (newRooms: number) => {
    setRooms(newRooms);
    setRoomGuests((prev) => {
      const newGuests = [...prev];
      if (newRooms > prev.length) {
        for (let i = prev.length; i < newRooms; i++) {
            newGuests.push({ adults: 2, children: 0 });
        }
      } else {
        newGuests.splice(newRooms);
      }

      setFoodCounts({ veg: 0, nonveg: 0, jain: 0 });
      setErrors((prev) => ({ ...prev, food: "" }));
      return newGuests;
    });
  };

  const handleRoomGuestChange = (
    index: number,
    field: "adults" | "children",
    value: number
  ) => {
    setRoomGuests((prev) => {
      const guestsInOtherRooms = prev.reduce((sum, room, idx) => {
        if (idx === index) return sum;
        return sum + room.adults + room.children;
      }, 0);
  
      const maxGuestsAllowedInThisRoom = totalPropertyCapacity - guestsInOtherRooms;
  
      const newGuests = [...prev];
      if (isVilla && field === 'children') return prev;
  
      const otherField = field === "adults" ? "children" : "adults";
      const otherValue = newGuests[index][otherField];
      
      let newValue = value;
  
      if (newValue + otherValue > maxGuestsAllowedInThisRoom) {
          newValue = maxGuestsAllowedInThisRoom - otherValue;
      }
      
      const maxForFieldPerRoom = maxPeoplePerRoom - otherValue;
      if (!isVilla) {
          newValue = Math.min(newValue, maxForFieldPerRoom);
      }
  
      const minForField = isVilla ? 1 : Math.max(2 - otherValue, 0);
      newValue = Math.max(newValue, minForField);
      
      newValue = Math.max(0, newValue);
  
      newGuests[index] = { ...newGuests[index], [field]: newValue };
  
      if (isVilla && newGuests[index].adults < totalPropertyCapacity) {
        newGuests[index].extraGuests = 0;
      }

      if (prev[index][field] === newValue) {
        return prev;
      }
  
      setFoodCounts({ veg: 0, nonveg: 0, jain: 0 });
      setErrors((prev) => ({ ...prev, food: "" }));
  
      return newGuests;
    });
  };

  const handleExtraGuestChange = (index: number, delta: number) => {
    setRoomGuests(prev => {
        const newGuests = [...prev];
        const currentExtra = newGuests[index].extraGuests || 0;
        const newExtraCount = Math.max(0, Math.min(5, currentExtra + delta)); 

        newGuests[index] = { ...newGuests[index], extraGuests: newExtraCount };
        return newGuests;
    });
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  };

  const calculateTotalAmount = () => {
    const nights = calculateNights();
    if (finalTotalGuests === 0) return 0;
  
    if (isVilla) {
      const baseRate = accommodation.price || 0;
      // MODIFICATION: Using RatePersonVilla from your table.
      const extraPersonCharge = accommodation.ratePerPerson || 0;
      
      const extraGuests = roomGuests[0]?.extraGuests || 0;
      const extraGuestsCost = extraGuests * extraPersonCharge;
      const nightlyRate = baseRate + extraGuestsCost;
  
      return nightlyRate * nights;
    }
  
    let total = 0;
    roomGuests.forEach((room) => {
      total += (room.adults * currentAdultRate + room.children * currentChildRate);
    });
  
    return total * nights;
  };
  

  const calculateDiscountedTotal = (total: number, coupon: Coupon | null) => {
    if (!coupon) return total;
    let discountValue = 0;
    if (coupon.discountType === "percentage") {
      discountValue = total * (coupon.discount / 100);
      if (coupon.maxDiscount) {
        discountValue = Math.min(discountValue, coupon.maxDiscount);
      }
    } else {
      discountValue = coupon.discount;
    }
    return Math.max(0, total - discountValue);
  };

  const totalAmount = calculateTotalAmount();
  const finalAmount = calculateDiscountedTotal(totalAmount, appliedCoupon);
  const advanceAmount = Math.max(0, Math.round(finalAmount * 0.3));

  const handleCouponSelect = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    setCouponInput(coupon.code);
    setCouponError("");
  };

  const handleCouponRemove = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const filteredCoupons = availableCoupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(couponInput.toLowerCase())
  );

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/amenities`);
        const data = response.data;

        if (!Array.isArray(data)) {
          console.error("Invalid response structure:", response.data);
          return;
        }
        console.log("Fetched amenities:", data);
        setAmenitiesData(
          data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            icon: item.icon,
          }))
        );
      } catch (error) {
        console.error("Error fetching amenities:", error);
      }
    };
    fetchAmenities();
    fetchCoupons();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                onBack();
              }}
              className="flex items-center space-x-2 sm:space-x-3 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="p-2 sm:p-3 text-gray-600 hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 sm:p-3 text-gray-600 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative animate-fade-in">
              <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={
                    accommodation.gallery[currentImageIndex] ||
                    accommodation.image
                  }
                  alt={accommodation.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                />
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs sm:text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {accommodation.gallery.length}
                </div>
                <button className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2 shadow-md">
                  <Camera className="w-4 h-4" />
                  <span>View all photos</span>
                </button>
              </div>
              {accommodation.gallery.length > 1 && (
                <div className="flex space-x-2 sm:space-x-3 mt-4 overflow-x-auto pb-3">
                  {accommodation.gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        window.scrollTo(0, 0);
                      }}
                      className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-emerald-500 scale-105"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {accommodation.name}
                    </h1>
                    <div className="flex flex-wrap items-center space-x-2 text-gray-600 text-sm sm:text-base mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">
                        {accommodation.location}
                      </span>
                      <span className="mx-2 hidden sm:inline">•</span>
                      <span className="capitalize">{accommodation.type}</span>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0">
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                      ₹{accommodation.price.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {isVilla
                        ? `per night (up to ${totalPropertyCapacity} guests)`
                        : "per Person"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm sm:text-base">
                    4.9 (127 reviews)
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                  About this place
                </h3>
                <div
                  className="text-gray-600 leading-relaxed text-sm sm:text-base prose prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(accommodation.fullDescription),
                  }}
                />
              </div>
              {(accommodation as any).packageDescription && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                    Package details
                  </h3>
                  <div
                    className="prose prose-sm sm:prose base text-gray-700 max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(
                        (accommodation as any).packageDescription
                      ),
                    }}
                  />
                </div>
              )}

             
             <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                  What's included
                </h3>
              
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {accommodation.inclusions.map((item, idx) => {
                    const amenity = amenitiesData.find(a => a.name === item);
                    const IconComponent = amenity ? (LucideIcons[amenity.icon as keyof typeof LucideIcons] as any) : null;
              
                    return (
                      <div
                        key={idx}
                        className="relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-250 text-white text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer"
                      >
                        {IconComponent && <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />}
                        <span className="text-sm sm:text-base font-medium text-gray-700">
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 lg:top-32">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    Reserve Your Stay
                  </h3>
                  <p className="text-emerald-100 text-sm sm:text-base">
                    Book now and pay later
                  </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">
                          Payment Error
                        </p>
                        <p className="text-red-700 text-sm mt-1">
                          {paymentError}
                        </p>
                        {paymentError.includes("Too many Requests") && (
                          <p className="text-red-700 text-sm mt-2">
                            Please wait a moment and try again. If the problem
                            persists, contact support at care@payu.in.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div ref={datesSectionRef} className="grid grid-cols-1 gap-4">
                    <Calendar
                      selectedDate={formData.checkIn ?? undefined}
                      onDateSelect={(date: Date) => {
                        handleInputChange("checkIn", date);
                        const nextDay = new Date(date);
                        nextDay.setDate(date.getDate() + 1);
                        handleInputChange("checkOut", nextDay);
                        window.scrollTo(0, 0);
                      }}
                      onAvailableRoomsChange={(rooms) =>
                        setAvailableRoomsForSelectedDate(rooms ?? 0)
                      }
                      label="Check-in"
                      accommodationId={accommodation.id}
                    />
                    {errors.dates && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.dates}
                      </p>
                    )}
                  </div>

                  <div className="p-4 border border-emerald-100 rounded-lg bg-emerald-50/50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Check-in/out Times
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-500">Check-in:</span>
                        <span className="font-medium text-gray-800">
                          {formData.checkIn
                            ? `${formData.checkIn.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}, 3:00 PM`
                            : "Select a date"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Check-out:</span>
                        <span className="font-medium text-gray-800">
                          {formData.checkOut
                            ? `${formData.checkOut.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}, 11:00 AM`
                            : "Select a date"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div ref={roomsSectionRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isVilla ? 'Guests' : 'Rooms'}
                    </label>

                    {/* MODIFICATION: Hide room counter for villas, which are fixed to 1. */}
                    {!isVilla && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                type="button"
                                onClick={() => handleRoomsChange(Math.max(0, rooms - 1))}
                                disabled={rooms <= 0}
                                className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]"
                                >-</button>
                                <span className="font-bold text-base sm:text-lg">{rooms}</span>
                                <button
                                type="button"
                                onClick={() => handleRoomsChange(Math.min(availableRoomsForSelectedDate, rooms + 1))}
                                disabled={rooms >= availableRoomsForSelectedDate}
                                className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]"
                                >+</button>
                                <span className="text-xs text-gray-500">
                                {availableRoomsForSelectedDate - rooms} rooms remaining
                                </span>
                            </div>
                            {errors.rooms && <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>}
                        </>
                    )}

                    {(rooms > 0) && (
                      <div className="border rounded-lg p-3 bg-gray-50">
                        {isVilla && roomGuests[0] ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-gray-600">Standard Guests</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleRoomGuestChange(0, 'adults', roomGuests[0].adults - 1)}
                                  disabled={roomGuests[0].adults <= 1}
                                  className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]"
                                >-</button>
                                <span className="font-bold text-base sm:text-lg w-8 text-center">{roomGuests[0].adults}</span>
                                <button
                                  onClick={() => handleRoomGuestChange(0, 'adults', roomGuests[0].adults + 1)}
                                  disabled={roomGuests[0].adults >= totalPropertyCapacity}
                                  className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]"
                                >+</button>
                              </div>
                            </div>
                            {roomGuests[0].adults >= totalPropertyCapacity && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm text-gray-600">Extra Guests</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleExtraGuestChange(0, -1)} disabled={(roomGuests[0].extraGuests || 0) <= 0} className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]">-</button>
                                            <span className="font-bold text-base sm:text-lg w-8 text-center">{roomGuests[0].extraGuests || 0}</span>
                                            <button onClick={() => handleExtraGuestChange(0, 1)} disabled={(roomGuests[0].extraGuests || 0) >= 5} className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]">+</button>
                                        </div>
                                    </div>
                                    {/* MODIFICATION: Using RatePersonVilla from your table */}
                                    <p className="text-xs text-gray-500 mt-1 text-right">Charge: ₹{accommodation.ratePerPerson?.toLocaleString() || 0} per extra guest</p>
                                </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-4">
                            {roomGuests.slice(0, rooms).map((room, idx) => (
                                <div key={idx} ref={(el) => (roomRefs.current[idx] = el)} className="border-b pb-4 last:border-b-0 last:pb-0">
                                <span className="font-semibold text-gray-800">Room {idx + 1}</span>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-medium text-sm text-gray-600">Adults</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleRoomGuestChange(idx, "adults", room.adults - 1)} disabled={room.adults <= 0} className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]">-</button>
                                        <span className="font-bold text-base sm:text-lg w-8 text-center">{room.adults}</span>
                                        <button onClick={() => handleRoomGuestChange(idx, "adults", room.adults + 1)} disabled={(room.adults + room.children) >= maxPeoplePerRoom} className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]">+</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-medium text-sm text-gray-600">Children</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleRoomGuestChange(idx, 'children', room.children - 1)} disabled={room.children <= 0} className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]">-</button>
                                        <span className="font-bold text-base sm:text-lg w-8 text-center">{room.children}</span>
                                        <button onClick={() => handleRoomGuestChange(idx, 'children', room.children + 1)} disabled={(room.adults + room.children) >= maxPeoplePerRoom} className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]">+</button>
                                    </div>
                                </div>
                                {errors[`room-${idx}`] && <p className="text-red-500 text-xs mt-1">{errors[`room-${idx}`]}</p>}
                                </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {rooms > 0 && (
                      <>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Total:</span>{" "}
                          {isVilla ? `${finalTotalGuests} Guests` : `${totalGuests} Guests in ${rooms} Room(s)`}
                        </div>
                      </>
                    )}
                  </div>


                  <div ref={contactSectionRef} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base min-h-[44px]"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isVilla && (
                    <div ref={foodSectionRef}>
                      <h3 className="text-lg font-semibold mb-4">
                        Food Preferences
                      </h3>
                      <div className="space-y-3 bg-gray-50 p-4 rounded border">
                        {(["veg", "nonveg", "jain"] as const).map((type) => (
                          <div key={type} className="flex items-center gap-4">
                            <span className="w-32 capitalize">
                              {type === "nonveg" ? "Non veg" : type} count
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFoodCount(type, -1)}
                              disabled={foodCounts[type] <= 0}
                              className="rounded-full bg-gray-200 text-lg w-8 h-8 flex items-center justify-center disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="w-6 text-center">
                              {foodCounts[type]}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleFoodCount(type, 1)}
                              disabled={
                                foodCounts.veg +
                                  foodCounts.nonveg +
                                  foodCounts.jain >=
                                totalGuests
                              }
                              className="rounded-full bg-gray-200 text-lg w-8 h-8 flex items-center justify-center disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-2">
                          Total food count:{" "}
                          {foodCounts.veg + foodCounts.nonveg + foodCounts.jain} /{" "}
                          {totalGuests}
                          {foodCounts.veg +
                            foodCounts.nonveg +
                            foodCounts.jain !==
                            totalGuests && (
                            <span className="text-red-600 ml-2">
                              Must match total guests!
                            </span>
                          )}
                        </div>
                        {errors.food && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.food}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label
                        htmlFor="coupon_code"
                        className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                      >
                        Coupon Code
                      </label>
                      {availableCoupons.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableCoupons.map((coupon) => (
                            <div
                              key={coupon.id}
                              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs sm:text-sm cursor-pointer whitespace-nowrap hover:bg-emerald-200"
                              onClick={() => {
                                setCouponInput(coupon.code);
                                setCouponError("");
                              }}
                            >
                              {coupon.code}
                            </div>
                          ))}
                        </div>
                      )}
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
                      {couponError && (
                        <p className="text-red-500 text-xs mt-2">
                          {couponError}
                        </p>
                      )}
                      {appliedCoupon && (
                        <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                          <p className="text-emerald-700 text-xs sm:text-sm">
                            Coupon applied: {appliedCoupon.code} -{" "}
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discount}% off`
                              : `₹${appliedCoupon.discount} off`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                      Booking Summary
                    </h4>
                    <div className="space-y-2 text-sm sm:text-base">
                        {!isVilla && (
                            <div className="flex justify-between">
                                <span>Rooms:</span>
                                <span>{rooms}</span>
                            </div>
                        )}
                      <div className="flex justify-between">
                        <span>Nights:</span>
                        <span>{calculateNights()}</span>
                      </div>
                      {isVilla ? (
                          <>
                            <div className="flex justify-between">
                                <span>Base rate per night:</span>
                                <span>₹{(accommodation.price || 0).toLocaleString()}</span>
                            </div>
                            {totalExtraGuests > 0 && (
                                <div className="flex justify-between">
                                    <span>Extra person charges:</span>
                                    <span>₹{(accommodation.ratePerPerson || 0).toLocaleString()} x {totalExtraGuests}</span>
                                </div>
                            )}
                          </>
                      ) : (
                        <div className="flex justify-between">
                            <span>Rate per Person:</span>
                            <span>₹{accommodation.price.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Guests:</span>
                        <span>
                          {isVilla 
                            ? `${totalGuests}${totalExtraGuests > 0 ? ` + ${totalExtraGuests} Extra` : ''}` 
                            : `${totalGuests} (${totalAdults} Adults, ${totalChildren} Children)`
                          }
                        </span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span>
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discount}%`
                              : `-₹${appliedCoupon.discount.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold text-base sm:text-lg">
                        <span>Total:</span>
                        <span className="text-emerald-600">
                          ₹{finalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Advance (30%):</span>
                        <span>₹{advanceAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={
                      loading ||
                      (!isVilla && (foodCounts.veg + foodCounts.nonveg + foodCounts.jain !== totalGuests)) ||
                      (!isVilla && rooms === 0)
                    }
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                  >
                    {loading ? "Processing Payment..." : "Proceed to Payment"}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    You won't be charged yet. Complete your booking to confirm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}