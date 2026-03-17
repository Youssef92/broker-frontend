import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import useAuth from "../../hooks/useAuth";
import { getManageListings } from "../../services/propertyService";

const LISTING_STATUS = {
  1: { label: "Draft", color: "text-[#f5f0e8]/40 border-[#f5f0e8]/20" },
  2: { label: "Published", color: "text-green-400 border-green-500/40" },
  3: { label: "Archived", color: "text-[#f5f0e8]/40 border-[#f5f0e8]/20" },
  4: { label: "Rejected", color: "text-red-400 border-red-500/40" },
};

const LISTING_INTENT = {
  1: "For Sale",
  2: "For Rent",
  ForSale: "For Sale",
  ForRent: "For Rent",
};

const PROPERTY_TYPE = {
  1: "Apartment",
  2: "Villa",
  Apartment: "Apartment",
  Villa: "Villa",
};

function LandlordDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const firstName = user?.firstName || "there";

  useEffect(() => {
    const fetchListings = async () => {
      setListingsLoading(true);
      try {
        const result = await getManageListings({
          PageNumber: currentPage,
          PageSize: 6,
          UserId: user?.id,
          UserRoles: user?.roles,
        });
        if (result.succeeded) {
          setListings(result.data || []);
          setTotalPages(result.totalPages || 1);
        }
      } catch {
        // silently fail
      } finally {
        setListingsLoading(false);
      }
    };
    fetchListings();
  }, [currentPage, user]);

  return (
    <div className="min-h-screen font-jost relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/85 via-[#0d0d0d]/75 to-[#0d0d0d]/95" />

      <div className="relative z-10">
        <Navbar />

        <div className="min-h-screen px-6 py-32 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-14">
            <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-3">
              Landlord Dashboard
            </p>
            <h1 className="font-cormorant text-5xl font-light text-[var(--cream)]">
              Welcome back, {firstName}
            </h1>
          </div>

          {/* Top cards row — 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Quick Action — Create Listing */}
            <button
              type="button"
              onClick={() => navigate("/create-listing")}
              className="bg-[var(--gold)] hover:bg-[var(--gold-light)] p-8 text-left transition-all duration-300 group relative"
              style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
            >
              <p className="text-[9px] tracking-[4px] uppercase text-[var(--dark)]/60 mb-4">
                Quick Action
              </p>
              <p className="font-cormorant text-2xl font-normal text-[var(--dark)] mb-2">
                Create New Listing
              </p>
              <p className="text-[var(--dark)]/50 text-xs tracking-wide">
                List a property for sale or rent
              </p>
              <span className="absolute bottom-6 right-6 text-[var(--dark)]/40 group-hover:text-[var(--dark)]/80 text-lg transition-all duration-300">
                →
              </span>
            </button>

            {/* Quick Action — Payout Methods */}
            <button
              type="button"
              onClick={() => navigate("/payout-methods")}
              className="bg-[#1a1a1a] border border-[#c1aa77]/10 hover:border-[var(--gold)]/40 p-8 text-left transition-all duration-300 group relative"
              style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c1aa77] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#c1aa77] pointer-events-none" />
              <p className="text-[9px] tracking-[4px] uppercase text-[#c1aa77]/50 mb-4">
                Quick Action
              </p>
              <p className="font-cormorant text-2xl font-normal text-[var(--cream)] mb-2">
                Payout Methods
              </p>
              <p className="text-[#f5f0e8]/30 text-xs tracking-wide">
                Manage your withdrawal accounts
              </p>
              <span className="absolute bottom-6 right-6 text-[var(--gold)]/30 group-hover:text-[var(--gold)] text-lg transition-all duration-300">
                →
              </span>
            </button>
          </div>

          {/* Listings Section */}
          <div
            className="bg-[#1a1a1a] border border-[#c1aa77]/10 p-8 relative"
            style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
          >
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c1aa77] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#c1aa77] pointer-events-none" />

            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[9px] tracking-[4px] uppercase text-[#c1aa77]/50 mb-1">
                  My Listings
                </p>
                <h2 className="font-cormorant text-2xl font-light text-[var(--cream)]">
                  Your Properties
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/create-listing")}
                className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] border border-[var(--gold)]/30 px-5 py-2 hover:border-[var(--gold)] transition-all duration-300"
              >
                + Add New
              </button>
            </div>

            {listingsLoading ? (
              <p className="text-[#f5f0e8]/20 text-xs tracking-[3px] uppercase text-center py-16">
                Loading...
              </p>
            ) : listings.length === 0 ? (
              <div className="border border-dashed border-[#c1aa77]/10 py-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border border-[#c1aa77]/20 flex items-center justify-center mb-4">
                  <span className="text-[var(--gold)]/40 text-lg">⌂</span>
                </div>
                <p className="text-[#f5f0e8]/20 text-xs tracking-[3px] uppercase">
                  No listings yet
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center gap-4 border border-[#c1aa77]/10 p-4 hover:border-[#c1aa77]/30 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/manage-listing/${listing.id}`)}
                    >
                      {/* Image */}
                      <div className="w-20 h-16 shrink-0 overflow-hidden bg-[#0d0d0d]">
                        {listing.primaryImageUrl ? (
                          <img
                            src={listing.primaryImageUrl}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[var(--gold)]/20 text-xl">
                              ⌂
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--cream)] text-sm font-medium truncate mb-1">
                          {listing.title}
                        </p>
                        <p className="text-[#f5f0e8]/40 text-xs tracking-wide">
                          {PROPERTY_TYPE[listing.type]} ·{" "}
                          {LISTING_INTENT[listing.intent]} · {listing.city}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="font-cormorant text-lg text-[var(--cream)]">
                          {listing.priceAmount?.toLocaleString()}{" "}
                          <span className="text-sm text-[var(--gold)]">
                            {listing.priceCurrency}
                          </span>
                        </p>
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        <span
                          className={`text-[9px] tracking-[3px] uppercase border px-2 py-0.5 ${LISTING_STATUS[listing.status]?.color}`}
                        >
                          {LISTING_STATUS[listing.status]?.label ??
                            listing.status}
                        </span>
                      </div>

                      {/* Arrow */}
                      <span className="text-[var(--gold)]/20 group-hover:text-[var(--gold)] transition-colors duration-300 shrink-0">
                        →
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] border border-[var(--gold)]/30 px-4 py-2 hover:border-[var(--gold)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <span className="text-[#f5f0e8]/30 text-xs">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] border border-[var(--gold)]/30 px-4 py-2 hover:border-[var(--gold)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandlordDashboard;
