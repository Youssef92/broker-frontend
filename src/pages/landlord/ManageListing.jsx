import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { ArrowLeft, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getManagePropertyDetails,
  publishPropertyListing,
  deletePropertyListing,
} from "../../services/propertyService";

const PROPERTY_TYPE = {
  1: "Apartment",
  2: "Villa",
  Apartment: "Apartment",
  Villa: "Villa",
};

const LISTING_INTENT = {
  1: "For Sale",
  2: "For Rent",
  ForSale: "For Sale",
  ForRent: "For Rent",
};

const PRICING_UNIT = {
  1: "",
  2: "/ night",
  3: "/ week",
  4: "/ month",
  5: "/ m²",
  None: "",
  PerNight: "/ night",
  PerWeek: "/ week",
  PerMonth: "/ month",
  PerSquareMeter: "/ m²",
};

const LISTING_STATUS = {
  1: { label: "Draft", color: "text-[#f5f0e8]/40 border-[#f5f0e8]/20" },
  2: { label: "Published", color: "text-green-400 border-green-500/40" },
  3: { label: "Archived", color: "text-[#f5f0e8]/40 border-[#f5f0e8]/20" },
  4: { label: "Rejected", color: "text-red-400 border-red-500/40" },
  Draft: { label: "Draft", color: "text-[#f5f0e8]/40 border-[#f5f0e8]/20" },
  Published: {
    label: "Published",
    color: "text-green-400 border-green-500/40",
  },
  Archived: {
    label: "Archived",
    color: "text-[#f5f0e8]/40 border-[#f5f0e8]/20",
  },
  Rejected: { label: "Rejected", color: "text-red-400 border-red-500/40" },
};

function ManageListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getManagePropertyDetails(id);
        if (result.succeeded) setProperty(result.data);
        else toast.error(result.message || "Failed to load listing.");
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const mediaLength =
      property?.media?.filter(
        (m) => m.processingStatus !== 4 && m.processingStatus !== "Rejected",
      ).length ?? 0;
    const handleKey = (e) => {
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i - 1 + mediaLength) % mediaLength);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i + 1) % mediaLength);
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, property]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await publishPropertyListing(id);
      if (result.succeeded) {
        toast.success("Listing published successfully!");
        setProperty((p) => ({ ...p, status: 2 }));
      } else {
        toast.error(result.message || "Failed to publish.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deletePropertyListing(id);
      if (result.succeeded) {
        toast.success("Listing deleted successfully!");
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Failed to delete.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.success("Listing deleted successfully!");
        navigate("/dashboard");
      } else {
        toast.error(err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--dark)] flex items-center justify-center">
        <p className="text-[#f5f0e8]/30 tracking-widest uppercase text-xs">
          Loading...
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[var(--dark)] flex items-center justify-center">
        <p className="text-[#f5f0e8]/30 tracking-widest uppercase text-xs">
          Listing not found.
        </p>
      </div>
    );
  }

  const sortedMedia = [...(property.media || [])]
    .filter(
      (m) => m.processingStatus !== 4 && m.processingStatus !== "Rejected",
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const mainImage = sortedMedia[0];
  const sideImages = sortedMedia.slice(1, 3);
  const typeLabel = PROPERTY_TYPE[property.type] ?? property.type;
  const intentLabel = LISTING_INTENT[property.intent] ?? property.intent;
  const priceUnit = PRICING_UNIT[property.price?.unit] ?? "";
  const status = LISTING_STATUS[property.status];
  const isDraft = property.status === 1 || property.status === "Draft";

  return (
    <div className="min-h-screen bg-[var(--dark)] font-jost">
      <Navbar />

      {/* Lightbox */}
      {lightboxOpen && sortedMedia.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-[#0d0d0d]/95 flex flex-col items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            className="absolute top-6 right-8 text-[#f5f0e8]/40 hover:text-[var(--cream)] text-2xl transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>

          {/* Left Arrow */}
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 text-[#f5f0e8]/40 hover:text-[var(--cream)] transition-colors z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(
                (i) => (i - 1 + sortedMedia.length) % sortedMedia.length,
              );
            }}
          >
            <ChevronLeft size={36} />
          </button>

          {/* Image */}
          <img
            src={sortedMedia[lightboxIndex]?.fileUrl}
            alt=""
            className="max-h-[80vh] max-w-[80vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Right Arrow */}
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#f5f0e8]/40 hover:text-[var(--cream)] transition-colors z-10 p-2"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i + 1) % sortedMedia.length);
            }}
          >
            <ChevronRight size={36} />
          </button>

          {/* Counter */}
          <p className="absolute bottom-20 text-[#f5f0e8]/30 text-xs tracking-widest">
            {lightboxIndex + 1} / {sortedMedia.length}
          </p>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-6 flex gap-2">
            {sortedMedia.map((img, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(i);
                }}
                className={`w-12 h-8 overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                  i === lightboxIndex
                    ? "border-[var(--gold)]"
                    : "border-transparent opacity-50"
                }`}
              >
                <img
                  src={img.fileUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-8 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors duration-300 text-xs tracking-[3px] uppercase"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <span
            className={`text-[9px] tracking-[3px] uppercase border px-3 py-1 ${status?.color}`}
          >
            {status?.label ?? property.status}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-cormorant text-5xl text-[var(--cream)] font-light mb-1">
          {property.title}
        </h1>
        <p className="text-[#f5f0e8]/40 text-sm tracking-wide mb-8">
          {typeLabel} · {property.location?.city}, {property.location?.state}
        </p>

        {/* Image Grid */}
        {sortedMedia.length > 0 && (
          <div className="flex gap-1 h-[400px] mb-10">
            <div
              className="relative w-2/3 overflow-hidden cursor-pointer"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
            >
              <img
                src={mainImage?.fileUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                className="absolute bottom-3 right-3 bg-[#0d0d0d]/70 text-[var(--cream)] px-3 py-1.5 flex items-center gap-2 text-[10px] tracking-[2px] uppercase"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
              >
                <Camera size={12} />
                {sortedMedia.length} photos
              </button>
            </div>
            {sideImages.length > 0 && (
              <div className="flex flex-col gap-1 w-1/3">
                {sideImages.map((img, i) => (
                  <div
                    key={img.fileUrl}
                    className="flex-1 overflow-hidden cursor-pointer"
                    onClick={() => {
                      setLightboxIndex(i + 1);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={img.fileUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price + Stats */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-cormorant text-4xl text-[var(--cream)]">
              {property.price?.currency}{" "}
              {property.price?.amount?.toLocaleString()}
              {priceUnit && (
                <span className="text-xl text-[#f5f0e8]/40 ml-2">
                  {priceUnit}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-6 text-[#f5f0e8]/40 text-sm">
            {property.bedrooms && <span>🛏 {property.bedrooms} beds</span>}
            {property.bathrooms && <span>🚿 {property.bathrooms} baths</span>}
            <span>📐 {property.areaSize} m²</span>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="border-t border-[#c1aa77]/10 pt-8 mb-10">
            <p className="text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 mb-4">
              Description
            </p>
            <p className="text-[#f5f0e8]/60 text-sm leading-relaxed">
              {property.description}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="border-t border-[#c1aa77]/10 pt-8 mb-10">
          <p className="text-[10px] tracking-[3px] uppercase text-[#c1aa77]/50 mb-6">
            Listing Details
          </p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Status", value: status?.label ?? property.status },
              { label: "Type", value: typeLabel },
              { label: "Intent", value: intentLabel },
              {
                label: "Created",
                value: new Date(property.createdAt).toLocaleDateString(),
              },
              {
                label: "Updated",
                value: property.updatedAt
                  ? new Date(property.updatedAt).toLocaleDateString()
                  : "—",
              },
              {
                label: "Published",
                value: property.publishedAt
                  ? new Date(property.publishedAt).toLocaleDateString()
                  : "—",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] tracking-[3px] uppercase text-[#c1aa77]/40 mb-1">
                  {label}
                </p>
                <p className="text-[var(--cream)] text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-[#c1aa77]/10 pt-8 flex flex-wrap gap-4">
          {isDraft && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--dark)] px-8 py-3 text-xs tracking-[3px] uppercase transition-all duration-300 disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish Listing"}
            </button>
          )}
          <button
            onClick={() => navigate(`/update-listing/${id}`)}
            className="border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark)] px-8 py-3 text-xs tracking-[3px] uppercase transition-all duration-300"
          >
            Update Listing
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-red-400/40 text-red-400 hover:bg-red-400 hover:text-[var(--dark)] px-8 py-3 text-xs tracking-[3px] uppercase transition-all duration-300"
          >
            Delete Listing
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-[#0d0d0d]/80 flex items-center justify-center px-6">
            <div className="bg-[#1a1a1a] border border-[#c1aa77]/20 p-10 max-w-md w-full text-center">
              <p className="text-[10px] tracking-[5px] uppercase text-red-400 mb-3">
                Confirm Delete
              </p>
              <h2 className="font-cormorant text-3xl text-[var(--cream)] font-light mb-4">
                Delete this listing?
              </h2>
              <p className="text-[#f5f0e8]/40 text-sm tracking-wide mb-10">
                This action cannot be undone. The listing will be permanently
                removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-[#c1aa77]/30 hover:border-[var(--gold)] text-[var(--gold)] text-xs tracking-[3px] uppercase transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white text-xs tracking-[3px] uppercase transition-all duration-300 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageListing;
