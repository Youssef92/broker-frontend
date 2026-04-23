import { useState, useEffect, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Calendar, MapPin, Search, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { getHostReservations } from "../../services/hostReservationService";

const BOOKING_STATUS = {
  Pending: {
    label: "Pending",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  },
  Confirmed: {
    label: "Confirmed",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  },
  Active: {
    label: "Active",
    color: "text-green-400 bg-green-400/10 border-green-400/30",
  },
  Completed: {
    label: "Completed",
    color: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  },
  Cancelled: {
    label: "Cancelled",
    color: "text-red-400 bg-red-400/10 border-red-400/30",
  },
};

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Active", value: "Active" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const SkeletonCard = () => (
  <div className="bg-[var(--dark-2)] border border-white/5 rounded-2xl p-5 animate-pulse">
    <div className="flex gap-4">
      <div className="w-24 h-20 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  </div>
);

const ReservationCard = ({ reservation }) => {
  const status =
    BOOKING_STATUS[reservation.status] ?? BOOKING_STATUS["Pending"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--dark-2)] border border-white/5 rounded-2xl overflow-hidden hover:border-[var(--gold)]/20 transition-colors duration-300"
    >
      <div className="p-5 flex gap-4">
        {/* Property Image */}
        <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-white/5">
          {reservation.primaryImageUrl ? (
            <img
              src={reservation.primaryImageUrl}
              alt={reservation.propertyTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin size={20} className="text-white/10" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3
              className="text-white font-semibold text-base line-clamp-1"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              {reservation.propertyTitle}
            </h3>
            <span
              className={`shrink-0 px-3 py-1 rounded-full border text-xs font-medium ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          {/* Guest */}
          {reservation.clientName && (
            <p className="text-white/40 text-xs mb-2">
              Guest: {reservation.clientName}
            </p>
          )}

          {/* Dates */}
          <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
            <Calendar size={13} className="text-[var(--gold)] shrink-0" />
            <span>{formatDate(reservation.checkInDate)}</span>
            <span className="text-white/20">→</span>
            <span>{formatDate(reservation.checkOutDate)}</span>
          </div>
          {/* Amount */}
          <div className="flex items-center gap-2 text-sm">
            <CreditCard size={13} className="text-[var(--gold)] shrink-0" />
            <span className="text-white/40">Your Payout:</span>
            <span className="text-[var(--gold)] font-semibold">
              {reservation.landlordPayoutAmount?.toLocaleString()}{" "}
              {reservation.currency}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HostReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const PAGE_SIZE = 10;

  const fetchReservations = useCallback(async (page, status, search) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: page,
        PageSize: PAGE_SIZE,
      };
      if (status !== "") params.StatusFilter = status;
      if (search) params.SearchTerm = search;

      const result = await getHostReservations(params);
      if (result.succeeded) {
        setReservations(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.totalCount || 0);
      } else {
        toast.error(result.message || "Failed to load reservations.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchReservations(1, statusFilter, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    fetchReservations(currentPage, statusFilter, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, fetchReservations]);

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.9) 50%, rgba(13,13,13,1) 100%), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="relative w-full h-52 rounded-3xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1800&q=80"
              alt="Reservations"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <h1
                className="text-5xl font-semibold text-white"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Reservations
              </h1>
              {!loading && (
                <p className="text-white/50 mt-2 text-sm">
                  {totalCount}{" "}
                  {totalCount === 1 ? "reservation" : "reservations"} found
                </p>
              )}
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by guest or property..."
                className="flex-1 bg-[var(--dark-2)] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-[var(--gold)]/40 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.label}
                  onClick={() => handleStatusFilter(f.value)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                    statusFilter === f.value
                      ? "bg-[var(--gold)] text-[var(--dark)] border-[var(--gold)]"
                      : "border-white/10 text-white/50 hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Calendar size={48} className="text-white/10 mb-4" />
              <p className="text-white/40 text-lg">No reservations found</p>
              <p className="text-white/25 text-sm mt-1">
                Reservations will appear here once guests book your properties
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reservations.map((r) => (
                <ReservationCard key={r.bookingId} reservation={r} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:border-[var(--gold)]/40 hover:text-[var(--gold)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-[var(--gold)] text-[var(--dark)] font-semibold"
                        : "border border-white/10 text-white/50 hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:border-[var(--gold)]/40 hover:text-[var(--gold)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
