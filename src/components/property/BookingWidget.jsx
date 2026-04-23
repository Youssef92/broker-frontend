import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format, addMonths } from "date-fns";
import toast from "react-hot-toast";
import { getBlockedDates, createBooking } from "../../services/bookingService";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingWidget.css";

export default function BookingWidget({ propertyListingId, price, priceUnit }) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [blockedIntervals, setBlockedIntervals] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!propertyListingId) return;

    const fetchBlockedDates = async () => {
      try {
        const today = new Date();
        const sixMonthsLater = addMonths(today, 6);

        const startStr = format(today, "yyyy-MM-dd");
        const endStr = format(sixMonthsLater, "yyyy-MM-dd");

        const result = await getBlockedDates(propertyListingId, startStr, endStr);
        if (result.succeeded && result.data) {
          const intervals = result.data.map((b) => ({
            start: new Date(b.startDate),
            end: new Date(b.endDate),
          }));
          setBlockedIntervals(intervals);
        }
      } catch (error) {
        console.error("Failed to load blocked dates:", error);
      }
    };

    fetchBlockedDates();
  }, [propertyListingId]);

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleBook = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a check-in and check-out date.");
      return;
    }

    setIsBooking(true);
    try {
      const payload = {
        propertyListingId,
        checkInDate: format(startDate, "yyyy-MM-dd"),
        checkOutDate: format(endDate, "yyyy-MM-dd"),
        paymentMethod: 1,
      };

      const result = await createBooking(payload);
      if (result.succeeded) {
        const bookingId = result.data?.id || result.data?.bookingId || result.data;
        toast.success("Booking created! Redirecting to payment...");
        // Navigate to the checkout page with booking details
        navigate(`/checkout/${bookingId}`, {
          state: {
            bookingId,
            checkInDate: format(startDate, "yyyy-MM-dd"),
            checkOutDate: format(endDate, "yyyy-MM-dd"),
            currency: price?.currency || "EGP",
            amount: price?.amount,
            priceUnit,
          },
        });
      } else {
        toast.error(result.message || "Booking failed.");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : "Validation Error");
      } else {
        toast.error("An error occurred while booking.");
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#c1aa77]/20 p-6 flex flex-col gap-6">
      <div>
        <h3 className="text-[var(--cream)] font-cormorant text-2xl mb-1">Book your stay</h3>
        <p className="text-[11px] tracking-[2px] uppercase text-[var(--gold)]">
          {price?.currency} {price?.amount?.toLocaleString()} <span className="lowercase">{priceUnit}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] tracking-[2px] uppercase text-[#f5f0e8]/50">Select Dates</label>
        <div className="booking-datepicker-wrapper">
          <DatePicker
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            minDate={new Date()}
            excludeDateIntervals={blockedIntervals}
          />
        </div>
      </div>

      <button
        onClick={handleBook}
        disabled={isBooking || !startDate || !endDate}
        className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--dark)] py-4 text-[11px] tracking-[3px] uppercase font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isBooking ? "Booking..." : "Book Now"}
      </button>
    </div>
  );
}
