import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { getHostReservations, confirmCashCollection } from "../../services/hostReservationService";
import { acceptHandover } from "../../services/bookingService";
import { ArrowLeft, Search, Filter, Calendar, User, MapPin, CheckCircle, MessageSquare, Key } from "lucide-react";
import toast from "react-hot-toast";

const BOOKING_STATUS = {
  1: { label: "Pending", color: "text-yellow-400 border-yellow-500/40" },
  2: { label: "Confirmed", color: "text-green-400 border-green-500/40" },
  3: { label: "Cancelled", color: "text-red-400 border-red-500/40" },
  4: { label: "Completed", color: "text-blue-400 border-blue-500/40" },
  Pending: { label: "Pending", color: "text-yellow-400 border-yellow-500/40" },
  Confirmed: { label: "Confirmed", color: "text-green-400 border-green-500/40" },
  Cancelled: { label: "Cancelled", color: "text-red-400 border-red-500/40" },
  Completed: { label: "Completed", color: "text-blue-400 border-blue-500/40" },
};

function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const result = await getHostReservations({
        PageNumber: currentPage,
        PageSize: 10,
        StatusFilter: statusFilter || undefined,
        SearchTerm: searchTerm || undefined,
      });
      if (result.succeeded) {
        setReservations(result.data || []);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch reservations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [currentPage, statusFilter]);

  const handleConfirmCash = async (bookingId) => {
    if (!window.confirm("Are you sure you want to confirm cash collection for this booking?")) return;

    const promise = confirmCashCollection(bookingId);

    toast.promise(promise, {
      loading: 'Confirming cash collection...',
      success: (result) => {
        fetchReservations();
        return result.message || "Cash collection confirmed!";
      },
      error: (err) => err.response?.data?.message || err.message || "Failed to confirm."
    });
  };

  const handleAcceptHandover = async (bookingId) => {
    if (!window.confirm("Are you sure you want to accept the property handover?")) return;

    const promise = acceptHandover(bookingId, {});

    toast.promise(promise, {
      loading: 'Accepting handover...',
      success: (result) => {
        fetchReservations();
        return result.message || "Handover accepted!";
      },
      error: (err) => err.response?.data?.message || err.message || "Failed to accept."
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchReservations();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchReservations();
  }, [currentPage, statusFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--dark)] font-jost">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 pt-28 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors duration-300 text-[10px] tracking-[4px] uppercase mb-6"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </button>
            <p className="text-[10px] tracking-[5px] uppercase text-[#c1aa77]/50 mb-2">
              Management
            </p>
            <h1 className="font-cormorant text-6xl text-[var(--cream)] font-light">
              Reservations
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search by property or guest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1a1a1a] border border-[#c1aa77]/20 text-[var(--cream)] pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]/50 transition-all duration-300 w-full sm:w-72"
              />
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c1aa77]/40 group-focus-within:text-[var(--gold)]/60 transition-colors"
              />
            </div>

            <div className="relative group">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#1a1a1a] border border-[#c1aa77]/20 text-[var(--cream)] pl-12 pr-10 py-3 text-sm focus:outline-none focus:border-[var(--gold)]/50 appearance-none transition-all duration-300 w-full sm:w-56 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c1aa77]/40 group-focus-within:text-[var(--gold)]/60 transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-[#c1aa77]/20 pl-2">
                <div className="border-t-2 border-r-2 border-[#c1aa77]/40 w-1.5 h-1.5 rotate-[135deg] mb-1" />
              </div>
            </div>

            {(searchTerm || statusFilter) && (
              <button
                onClick={resetFilters}
                className="text-[var(--gold)] hover:text-[var(--gold-light)] text-[10px] tracking-[3px] uppercase px-4 py-3 border border-[#c1aa77]/20 hover:border-[var(--gold)]/50 transition-all duration-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Reservations Table/List */}
        <div
          className="bg-[#1a1a1a] border border-[#c1aa77]/10 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c1aa77] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#c1aa77] pointer-events-none" />

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-t-2 border-[var(--gold)] rounded-full animate-spin mb-6" />
              <p className="text-[#f5f0e8]/20 text-[10px] tracking-[4px] uppercase animate-pulse">
                Loading Data...
              </p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="py-40 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 border border-[#c1aa77]/10 flex items-center justify-center mb-8 bg-[#0d0d0d]">
                <Calendar size={32} className="text-[var(--gold)]/20" />
              </div>
              <h3 className="font-cormorant text-3xl text-[var(--cream)] font-light mb-3">
                No Reservations Found
              </h3>
              <p className="text-[#f5f0e8]/20 text-xs max-w-sm leading-relaxed tracking-wide">
                We couldn't find any bookings matching your current filters. Try refining your search or clearing the status filter.
              </p>
              {(searchTerm || statusFilter) && (
                <button
                  onClick={resetFilters}
                  className="mt-10 border border-[var(--gold)] text-[var(--gold)] px-10 py-3 text-[10px] tracking-[4px] uppercase hover:bg-[var(--gold)] hover:text-[var(--dark)] transition-all duration-500"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#c1aa77]/10">
                    <th className="px-6 py-5 text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 font-normal">
                      Property
                    </th>
                    <th className="px-6 py-5 text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 font-normal">
                      Guest
                    </th>
                    <th className="px-6 py-5 text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 font-normal">
                      Dates
                    </th>
                    <th className="px-6 py-5 text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 font-normal">
                      Payout
                    </th>
                    <th className="px-6 py-5 text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 font-normal">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 font-normal text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c1aa77]/5">
                  {reservations.map((res, index) => {
                    const statusKey = String(res.status || "").toLowerCase();
                    const status =
                      BOOKING_STATUS[res.status] ||
                      BOOKING_STATUS[statusKey.charAt(0).toUpperCase() + statusKey.slice(1)] ||
                      { label: res.status, color: "text-[#f5f0e8]/40 border-[#f5f0e8]/20" };

                    const propertyTitle = res.propertyTitle || "Property";
                    const clientName = res.clientName || "Guest";
                    const payoutAmount = res.landlordPayoutAmount || 0;
                    const bookingId = res.bookingId || "N/A";
                    const propertyImage = res.primaryImageUrl;

                    return (
                      <tr key={bookingId === "N/A" ? index : bookingId} className="hover:bg-[#f5f0e8]/[0.02] transition-colors group">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 shrink-0 bg-[#0d0d0d] border border-[#c1aa77]/10 overflow-hidden">
                              {propertyImage ? (
                                <img
                                  src={propertyImage}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <MapPin size={16} className="text-[#c1aa77]/20" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[var(--cream)] text-sm font-medium truncate mb-1">
                                {propertyTitle}
                              </p>
                              <p className="text-[#f5f0e8]/40 text-[10px] tracking-wider uppercase">
                                ID: #{bookingId.toString().slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#c1aa77]/10 flex items-center justify-center">
                              <User size={14} className="text-[var(--gold)]/60" />
                            </div>
                            <p className="text-[#f5f0e8]/70 text-sm">{clientName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-sm text-[#f5f0e8]/60">
                          <div className="flex flex-col gap-0.5">
                            <p>{new Date(res.checkInDate).toLocaleDateString()}</p>
                            <p className="text-[#f5f0e8]/20 text-[10px]">to</p>
                            <p>{new Date(res.checkOutDate).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="font-cormorant text-lg text-[var(--cream)]">
                            {payoutAmount?.toLocaleString()} <span className="text-xs text-[var(--gold)]/60 uppercase ml-1">{res.currency || "EGP"}</span>
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`text-[9px] tracking-[2px] uppercase border px-2.5 py-1 ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(true || res.actions?.canConfirmCashCollection) && (
                              <button
                                onClick={() => handleConfirmCash(res.bookingId)}
                                className="p-2 text-green-400 hover:bg-green-400/10 rounded-full transition-colors"
                                title="Confirm Cash Collection"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {(true || res.actions?.canAcceptHandover) && (
                              <button
                                onClick={() => handleAcceptHandover(res.bookingId)}
                                className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors"
                                title="Accept Handover"
                              >
                                <Key size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {(!loading && totalPages > 1) && (
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-[10px] tracking-[4px] uppercase text-[var(--gold)] border border-[var(--gold)]/20 px-6 py-2.5 hover:border-[var(--gold)] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed group"
            >
              <span className="group-hover:-translate-x-1 inline-block transition-transform duration-300 mr-2">←</span> Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[var(--gold)] text-sm font-medium">{currentPage}</span>
              <span className="text-[#f5f0e8]/20 text-xs">/</span>
              <span className="text-[#f5f0e8]/40 text-sm">{totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-[10px] tracking-[4px] uppercase text-[var(--gold)] border border-[var(--gold)]/20 px-6 py-2.5 hover:border-[var(--gold)] transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed group"
            >
              Next <span className="group-hover:translate-x-1 inline-block transition-transform duration-300 ml-2">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reservations;
