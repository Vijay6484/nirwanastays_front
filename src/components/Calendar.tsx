import React, { useState, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format, addDays, isBefore, startOfDay, isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";

interface AdditionalRoomInfo {
  date: Date;
  additionalRooms: number;
  adultPrice: number | null;
  childPrice: number | null;
  isAllRooms: boolean;
}

interface Accommodation {
  rooms: number;
  adult_price: number;
  child_price: number;
}

interface CalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  onAvailableRoomsChange: (rooms: number | null) => void;
  minDate?: Date;
  label: string;
  accommodationId: string;
}

const API_BASE_URL = "https://api.nirwanastays.com";

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  onAvailableRoomsChange,
  minDate,
  label,
  accommodationId,
}) => {
  const [fullyBooked, setFullyBooked] = useState<Date[]>([]);
  const [hasAdditionalRooms, setHasAdditionalRooms] = useState<Date[]>([]);
  const [hasCustomPricing, setHasCustomPricing] = useState<Date[]>([]);
  const [additionalRoomsInfo, setAdditionalRoomsInfo] = useState<
    AdditionalRoomInfo[]
  >([]);
  const [bookedRoom, setBookedRoom] = useState<number>(0);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(
    null
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  const [blockedRooms, setBlockedRooms] = useState<number | null>(null);
  const [baseRooms, setBaseRooms] = useState<number | null>(null);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(false);

  const fetchAccommodation = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/properties/accommodations/${accommodationId}`
      );
      if (!res.ok) throw new Error("Failed to fetch accommodation");
      const data = await res.json();
      setAccommodation({
        rooms: data.basicInfo.rooms || 0,
        adult_price: data.packages.pricing.adult,
        child_price: data.packages.pricing.child,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [accommodationId]);

  useEffect(() => {
    if (availableRooms !== null && onAvailableRoomsChange) {
      onAvailableRoomsChange(availableRooms);
    }
  }, [availableRooms, onAvailableRoomsChange]);

  const fetchAdditionalRooms = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/calendar/blocked-dates/${accommodationId}`
      );
      const json = await res.json();
      if (json.success) {
        const dates: AdditionalRoomInfo[] = json.data.map((d: any) => {
          const roomsRaw = d.rooms;
          let additionalRooms = 0;
          let isAllRooms = false;

          if (
            roomsRaw === null ||
            roomsRaw === "null" ||
            roomsRaw === "" ||
            roomsRaw === 0 ||
            roomsRaw === "0"
          ) {
            additionalRooms = 0;
            isAllRooms = false;
          } else {
            additionalRooms = parseInt(roomsRaw, 10) || 0;
            isAllRooms = false;
          }

          return {
            date: new Date(d.blocked_date),
            additionalRooms,
            adultPrice: d.adult_price ? parseFloat(d.adult_price) : null,
            childPrice: d.child_price ? parseFloat(d.child_price) : null,
            isAllRooms,
          };
        });

        setAdditionalRoomsInfo(dates);
      }
    } catch (err) {
      console.error(err);
    }
  }, [accommodationId]);

  const fetchTotalRoom = useCallback(
    async (date: Date) => {
      if (!accommodationId) return;
      setRoomsLoading(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/bookings/room-occupancy?check_in=${formattedDate}&id=${accommodationId}`
        );
        if (res.ok) {
          const data = await res.json();
          setBookedRoom(data.total_rooms || 0);
        } else setBookedRoom(0);
      } catch {
        setBookedRoom(0);
      } finally {
        setRoomsLoading(false);
      }
    },
    [accommodationId]
  );

  const calculateAvailableRoomsForDate = useCallback(
    (date?: Date) => {
      if (!date || !accommodation) return 0;
      const dateObj = startOfDay(date);
      const totalBaseRooms = accommodation.rooms;
      const additionalInfo = additionalRoomsInfo.find((a) =>
        isSameDay(a.date, dateObj)
      );
      let blockedRooms = 0;
      if (additionalInfo) {
        blockedRooms = additionalInfo.isAllRooms
          ? totalBaseRooms
          : additionalInfo.additionalRooms;
      }
      const totalRoomsForDay = totalBaseRooms + blockedRooms;
      const availableRooms = totalRoomsForDay - bookedRoom;
      return Math.max(0, availableRooms);
    },
    [accommodation, additionalRoomsInfo, bookedRoom]
  );

  const calculateDateTypes = useCallback(() => {
    const today = startOfDay(new Date());
    const fully: Date[] = [];
    const additional: Date[] = [];
    const customPricing: Date[] = [];

    additionalRoomsInfo.forEach(
      ({ date, additionalRooms, isAllRooms, adultPrice, childPrice }) => {
        if (isBefore(date, today)) return;
        const availableRooms = calculateAvailableRoomsForDate(date);
        if (availableRooms <= 0) fully.push(date);
        else if (isAllRooms || additionalRooms > 0) additional.push(date);
        else if (adultPrice !== null || childPrice !== null)
          customPricing.push(date);
      }
    );

    setFullyBooked(fully);
    setHasAdditionalRooms(additional);
    setHasCustomPricing(customPricing);
  }, [additionalRoomsInfo, calculateAvailableRoomsForDate]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      const min = minDate ? startOfDay(minDate) : startOfDay(new Date());
      return isBefore(date, min) || fullyBooked.some((d) => isSameDay(d, date));
    },
    [fullyBooked, minDate]
  );

  const handleDateSelect = useCallback(
    async (date: Date | undefined) => {
      if (!date || isDateDisabled(date)) return;

      // Fix for timezone issue - ensure date is in local timezone
      const localDate = new Date(date);
      localDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

      setRoomsLoading(true);
      await fetchTotalRoom(localDate);
      onDateSelect(localDate);
      setShowModal(false);
      setRoomsLoading(false);
    },
    [onDateSelect, isDateDisabled, fetchTotalRoom]
  );

  useEffect(() => {
    if (selectedDate && accommodation) {
      const dateObj = startOfDay(selectedDate);
      const additionalInfo = additionalRoomsInfo.find((a) =>
        isSameDay(a.date, dateObj)
      );
      let blocked = 0;
      if (additionalInfo) {
        blocked = additionalInfo.isAllRooms
          ? accommodation.rooms
          : additionalInfo.additionalRooms;
      }
      setBaseRooms(accommodation.rooms);
      setBlockedRooms(blocked);
      const available = accommodation.rooms + blocked - bookedRoom;
      setAvailableRooms(available);
    } else {
      setAvailableRooms(null);
      setBaseRooms(null);
      setBlockedRooms(null);
    }
  }, [selectedDate, accommodation, bookedRoom, additionalRoomsInfo]);

  useEffect(() => {
    if (accommodationId) {
      setLoading(true);
      fetchAccommodation();
      fetchAdditionalRooms();
    }
  }, [accommodationId, fetchAccommodation, fetchAdditionalRooms]);

  useEffect(() => {
    calculateDateTypes();
  }, [additionalRoomsInfo, bookedRoom, calculateDateTypes]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <button
        type="button"
        className="w-full px-4 py-2 border rounded-lg text-left bg-white"
        onClick={() => setShowModal(true)}
      >
        {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select a date"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              fromDate={minDate || new Date()}
              toDate={addDays(new Date(), 365)}
              disabled={isDateDisabled}
              modifiers={{ fullyBooked, hasAdditionalRooms, hasCustomPricing }}
              modifiersClassNames={{
                fullyBooked:
                  "bg-red-100 text-gray-400 line-through cursor-not-allowed",
                hasAdditionalRooms: "bg-green-100",
                hasCustomPricing: "bg-purple-100",
                selected: "bg-blue-500 text-white rounded-full",
              }}
              className="bg-white p-2 rounded-lg"
            />

            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 mr-2" />
                <span>Fully Booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 mr-2" />
                <span>Additional Rooms</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-100 mr-2" />
                <span>Special Pricing</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-white border border-gray-300 mr-2" />
                <span>Standard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {roomsLoading && (
        <div className="mt-4 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 inline-block mr-2"></div>
          Checking rooms...
        </div>
      )}

      {selectedDate && !roomsLoading && availableRooms !== null && (
        <div className="mt-4 text-sm">
          <div className="text-green-700 font-semibold">
            Available Rooms: {availableRooms}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
