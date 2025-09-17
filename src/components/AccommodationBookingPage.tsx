import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Users,
  Star,
  Wifi,
  Car,
  Coffee,
  MapPin,
  TreePine,
  Heart,
  Share2,
  Camera,
  ParkingCircle,
  Utensils,
  Music,
  Waves,
  AlertCircle,
  Snowflake,
  Flame,
  ThermometerSun,
  CookingPot,
  CupSoda,
  Flower2,
} from "lucide-react";
import Calendar from "./Calendar";
import axios from "axios";
import { Accommodation, BookingData, Amenities } from "../types";
import DOMPurify from "dompurify";

const API_BASE_URL = "https://api.nirwanastays.com";

interface Coupon {
  id: number;
  code: string;
  discountType: "percentage" | "fixed";
  discount: number;
  minAmount?: number;
  maxDiscount?: number;
  expiryDate: string;
  active: number;
}
interface RoomGuests {
  adults: number;
  children: number;
}
interface AccommodationBookingPageProps {
  accommodation: Accommodation;
  onBack: () => void;
}
export function AccommodationBookingPage({
  accommodation,
  onBack,
}: AccommodationBookingPageProps) {
  // Scroll to top on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [amenities, setAmenities] = useState<Amenities[]>([]);
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
  const [rooms, setRooms] = useState(0);
  const [roomGuests, setRoomGuests] = useState<RoomGuests[]>([]);
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

  // Clean Quill HTML artifacts for safe rendering
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

  // Refs for scrolling to error sections
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const datesSectionRef = useRef<HTMLDivElement>(null);
  const roomsSectionRef = useRef<HTMLDivElement>(null);
  const foodSectionRef = useRef<HTMLDivElement>(null);
  const roomRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate total guests
  const totalAdults = roomGuests.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = roomGuests.reduce(
    (sum, room) => sum + room.children,
    0
  );
  const totalGuests = totalAdults + totalChildren;

  // Fetch coupons from API
  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/coupons`);
      const result = await response.json();
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
      console.error("Error fetching coupons:", error);
    }
  };

  // Handle food count changes
  const handleFoodCount = (type: "veg" | "nonveg" | "jain", delta: number) => {
    setFoodCounts((prev) => {
      const newCounts = { ...prev };
      const currentTotal = prev.veg + prev.nonveg + prev.jain;

      if (delta > 0 && currentTotal >= totalGuests) {
        return prev; // Cannot exceed total guests
      }

      newCounts[type] = Math.max(0, prev[type] + delta);

      // Validate food counts
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

  // Apply coupon based on input
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
    // Check if coupon is expired
    const currentDate = new Date();
    const expiryDate = new Date(couponToApply.expiryDate);
    if (expiryDate < currentDate) {
      setCouponError("This coupon has expired");
      return;
    }
    // Check if coupon is active
    if (couponToApply.active !== 1) {
      setCouponError("This coupon is not active");
      return;
    }
    // Calculate base amount for minimum amount check
    const baseAmount =
      (totalAdults * currentAdultRate + totalChildren * currentChildRate) *
      calculateNights();

    if (
      couponToApply.minAmount &&
      baseAmount < parseFloat(couponToApply.minAmount as any)
    ) {
      setCouponError(
        `Minimum amount of ₹${couponToApply.minAmount} required for this coupon`
      );
      return;
    }
    // All checks passed, apply the coupon
    setAppliedCoupon(couponToApply);
    setCouponError("");
  };

  // Remove applied coupon
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
    if (foodCounts.veg + foodCounts.nonveg + foodCounts.jain !== totalGuests) {
      newErrors.food = "Food preferences must match total guests";
    }
    if (rooms === 0) {
      newErrors.rooms = "Please select at least one room";
    }
    // adult+ children per room validation must be greater or equal to 2
    roomGuests.slice(0, rooms).forEach((room, idx) => {
      if (room.adults + room.children < 2) {
        newErrors[`room-${idx}`] = "Each room must have at least 2 guests";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error section
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
        adults: totalAdults,
        children: totalChildren,
        rooms: rooms,
        food_veg: foodCounts.veg,
        food_nonveg: foodCounts.nonveg,
        food_jain: foodCounts.jain,
        total_amount: totalAmount,
        advance_amount: totalAmount * 0.3, // 30% advance
        package_id: 0,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
      };

      // Create booking
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

      // Implement retry mechanism with exponential backoff for payment
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
    const baseDelay = 1000; // 1 second base delay

    try {
      // Initiate payment
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
        // Check if it's a rate limiting error
        if (
          paymentData.error?.includes("Too many Requests") &&
          attempt < maxRetries
        ) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          setPaymentError(
            `Payment system busy. Retrying in ${
              delay / 1000
            } seconds... (Attempt ${attempt}/${maxRetries})`
          );

          // Wait before retrying
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

      // Create and submit the payment form
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

        // Wait before retrying
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
          // Initialize each new room with 2 adults and 0 children
          newGuests.push({ adults: 2, children: 0 });
        }
      } else {
        newGuests.splice(newRooms);
      }

      // Reset food counts when rooms change
      setFoodCounts({ veg: 0, nonveg: 0, jain: 0 });
      setErrors((prev) => ({ ...prev, food: "" }));
      console.log("New Guest: ", newGuests);
      return newGuests;
    });
  };

  const handleRoomGuestChange = (
    index: number,
    field: "adults" | "children",
    value: number
  ) => {
    setRoomGuests((prev) => {
      const newGuests = [...prev];
      const otherField = field === "adults" ? "children" : "adults";
      const otherValue = newGuests[index][otherField];

      // Calculate min and max for the current field
      const minForField = Math.max(2 - otherValue, 0); // Ensure at least 2 guests total
      const maxForField = maxPeoplePerRoom - otherValue; // Ensure not exceeding max guests

      // Clamp the value between min and max
      let newValue = Math.min(Math.max(value, minForField), maxForField);

      newGuests[index] = { ...newGuests[index], [field]: newValue };

      // Reset food counts when guests change
      setFoodCounts({ veg: 0, nonveg: 0, jain: 0 });
      setErrors((prev) => ({ ...prev, food: "" }));

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

  // Calculate the total amount based on adults, children, and nights
  const calculateTotalAmount = () => {
    const nights = calculateNights();
    let total = 0;

    // Calculate for each room
    roomGuests.forEach((room) => {
      total +=
        (room.adults * currentAdultRate + room.children * currentChildRate) *
        nights;
    });

    return total;
  };

  const calculateDiscountedTotal = (total: number, coupon: Coupon | null) => {
    if (!coupon) return total;
    let discountValue = 0;
    if (coupon.discountType === "percentage") {
      discountValue = total * (coupon.discount / 100);
      // Apply maximum discount limit if specified
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
        setAmenities(
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
    // Custom amenity keys
    "Electric Kettle": CookingPot,
    electric_kettle: CookingPot,
    kettle: CookingPot,
    AC: Snowflake,
    ac: Snowflake,
    Barbeque: Flame,
    barbeque: Flame,
    heater: ThermometerSun,
    mini_fridge: CupSoda,
    spa: Flower2,
    garden: TreePine,
  };

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
          {/* Left Side - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
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

            {/* Property Details */}
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
                      per night
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
                  Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {amenities.map((amenity, idx) => {
                    const IconComponent =
                      iconsMap[amenity.icon as keyof typeof iconsMap];
                    return IconComponent ? (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        <span className="text-sm sm:text-base font-medium text-gray-700">
                          {amenity.name}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    What's included
                  </h4>
                  <ul className="space-y-2">
                    {accommodation.inclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                    Not included
                  </h4>
                  <ul className="space-y-2">
                    {accommodation.exclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-2 text-gray-500 text-sm sm:text-base"
                      >
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
                  {/* Payment Error Display */}
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
                      Rooms
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleRoomsChange(Math.max(0, rooms - 1))
                        }
                        disabled={rooms <= 0}
                        className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]"
                      >
                        -
                      </button>
                      <span className="font-bold text-base sm:text-lg">
                        {rooms}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRoomsChange(
                            Math.min(availableRoomsForSelectedDate, rooms + 1)
                          )
                        }
                        disabled={rooms >= availableRoomsForSelectedDate}
                        className="px-3 py-1 bg-green-700 text-white rounded-lg disabled:bg-gray-300 touch-manipulation min-w-[44px] min-h-[44px]"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-500">
                        {availableRoomsForSelectedDate - rooms} rooms remaining
                      </span>
                    </div>
                    {errors.rooms && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.rooms}
                      </p>
                    )}

                    {rooms > 0 && (
                      <div className="border rounded-lg p-3 bg-gray-50">
                        {roomGuests.slice(0, rooms).map((room, idx) => {
                          const adults = room.adults;
                          const children = room.children;
                          return (
                            <div
                              key={`room-${idx}`}
                              ref={(el) => (roomRefs.current[idx] = el)}
                              className="flex flex-col gap-2 mb-2 border-b pb-2 last:border-0"
                            >
                              <span className="w-16 font-medium text-sm sm:text-base">
                                Room {idx + 1}
                              </span>
                              <div className="flex items-center gap-3 sm:gap-4">
                                <select
                                  value={adults}
                                  onChange={(e) =>
                                    handleRoomGuestChange(
                                      idx,
                                      "adults",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border rounded px-2 py-1 text-sm sm:text-base flex-1 min-h-[44px]"
                                >
                                  {[...Array(maxPeoplePerRoom + 1).keys()].map(
                                    (n) =>
                                      n + children <= maxPeoplePerRoom && (
                                        <option key={`adults-${n}`} value={n}>
                                          {n} Adults
                                        </option>
                                      )
                                  )}
                                </select>
                                <select
                                  value={children}
                                  onChange={(e) =>
                                    handleRoomGuestChange(
                                      idx,
                                      "children",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="border rounded px-2 py-1 text-sm sm:text-base flex-1 min-h-[44px]"
                                >
                                  {[...Array(maxPeoplePerRoom + 1).keys()].map(
                                    (n) =>
                                      n + adults <= maxPeoplePerRoom && (
                                        <option key={`children-${n}`} value={n}>
                                          {n} Children
                                        </option>
                                      )
                                  )}
                                </select>
                              </div>
                              {errors[`room-${idx}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`room-${idx}`]}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {rooms > 0 && (
                      <>
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Total:</span>{" "}
                          {totalAdults} Adults, {totalChildren} Children
                        </div>
                        <div className="text-xs text-gray-600">
                          Adult rate: ₹{currentAdultRate.toLocaleString()} /
                          night, Child rate: ₹
                          {currentChildRate.toLocaleString()} / night
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

                  {/* Food Preferences */}
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
                                setCouponError("");
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
                        <p className="text-red-500 text-xs mt-2">
                          {couponError}
                        </p>
                      )}
                      {/* Applied Coupon */}
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
                        <span>
                          {totalAdults + totalChildren} ({totalAdults} Adults,{" "}
                          {totalChildren} Children)
                        </span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span>
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discount}%`
                              : `-₹${appliedCoupon.discount}`}
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
                      foodCounts.veg + foodCounts.nonveg + foodCounts.jain !==
                        totalGuests ||
                      rooms === 0
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
