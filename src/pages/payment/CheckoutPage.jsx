import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import {
  ArrowLeft,
  CreditCard,
  ChevronDown,
  Shield,
  Calendar,
  Loader2,
  Lock,
  Plus,
} from "lucide-react";
import {
  getPaymentMethods,
  createCheckoutSession,
} from "../../services/paymentService";
import { getMyProfile } from "../../services/profileService";
import { checkoutBillingSchema } from "../../validation/checkoutBillingSchema";
import egyptLocations from "../../data/egyptLocations";

function CheckoutPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bookingState = location.state || {};

  // Payment methods
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState("");

  // Location dropdowns
  const [governorates, setGovernorates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [loadingStates, setLoadingStates] = useState(true);
  const [savedCity, setSavedCity] = useState("");

  // Submit
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutBillingSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      city: "",
      country: "EG",
      street: "",
      zipCode: "",
    },
  });

  // Fetch governorates
  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: "Egypt" }),
          }
        );
        const data = await res.json();
        if (!data.error && data.data?.states) {
          setGovernorates(data.data.states.map((s) => s.name));
        } else {
          setGovernorates(egyptLocations.map((g) => g.state));
        }
      } catch {
        setGovernorates(egyptLocations.map((g) => g.state));
      } finally {
        setLoadingStates(false);
      }
    };
    fetchGovernorates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: "Egypt", state: selectedState }),
          }
        );
        const data = await res.json();
        let loadedCities = [];
        if (!data.error && data.data?.length) {
          loadedCities = data.data;
        } else {
          const found = egyptLocations.find((g) => g.state === selectedState);
          loadedCities = found ? found.cities : [];
        }
        setCities(loadedCities);
        if (savedCity && loadedCities.includes(savedCity)) {
          setValue("city", savedCity);
        }
      } catch {
        const found = egyptLocations.find((g) => g.state === selectedState);
        const loadedCities = found ? found.cities : [];
        setCities(loadedCities);
        if (savedCity && loadedCities.includes(savedCity)) {
          setValue("city", savedCity);
        }
      }
    };
    fetchCities();
  }, [selectedState, savedCity, setValue]);

  // Fetch saved cards + profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsResult, profileResult] = await Promise.all([
          getPaymentMethods(),
          getMyProfile(),
        ]);

        if (cardsResult.succeeded && cardsResult.data) {
          setSavedCards(cardsResult.data);
          const defaultCard = cardsResult.data.find((c) => c.isDefault);
          if (defaultCard) {
            setSelectedCardId(defaultCard.id);
          } else if (cardsResult.data.length > 0) {
            setSelectedCardId(cardsResult.data[0].id);
          }
        }

        if (profileResult.succeeded) {
          const p = profileResult.data;
          reset({
            firstName: p.firstName || "",
            lastName: p.lastName || "",
            email: p.email || "",
            phoneNumber: p.phoneNumber?.replace(/^\+20/, "0") || "",
            city: p.city || "",
            country: "EG",
            street: p.street || "",
            zipCode: p.zipCode || "",
          });
          if (p.city) setSavedCity(p.city);
          if (p.state) setSelectedState(p.state);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCards(false);
      }
    };
    fetchData();
  }, [reset]);

  const onSubmit = async (data) => {
    if (!selectedCardId) {
      toast.error("Please select a payment method.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingId,
        idempotencyKey: crypto.randomUUID(),
        currency: bookingState.currency || "EGP",
        methodType: 1,
        savedPaymentMethodId: selectedCardId,
        billingDetails: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          city: data.city,
          country: data.country,
          street: data.street,
          zipCode: data.zipCode,
        },
      };

      const result = await createCheckoutSession(payload);

      if (result.succeeded) {
        const checkoutUrl = result.data?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast.success("Payment completed successfully!");
          navigate("/dashboard");
        }
      } else {
        toast.error(result.message || "Checkout failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCardLabel = (card) => {
    const brand = card.cardBrand || "Card";
    const digits = card.last4Digits || "••••";
    const def = card.isDefault ? " — Default" : "";
    return `${brand}  ••••  ${digits}${def}`;
  };

  if (loadingCards) {
    return (
      <div className="min-h-screen bg-[var(--dark)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={28}
            className="text-[var(--gold)] animate-spin"
          />
          <p className="text-[#f5f0e8]/30 tracking-widest uppercase text-xs">
            Preparing checkout...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-jost relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/90 via-[#0d0d0d]/80 to-[#0d0d0d]/95" />

      <div className="relative z-10">
        <Navbar />
        <div className="max-w-4xl mx-auto px-8 pt-28 pb-20">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors duration-300 text-xs tracking-[3px] uppercase mb-10"
          >
            <ArrowLeft size={14} />
            Back to Property
          </button>

          {/* Page Header */}
          <div className="mb-12">
            <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-3">
              Secure Checkout
            </p>
            <h1 className="font-cormorant text-5xl text-[var(--cream)] font-light mb-2">
              Complete Your Payment
            </h1>
            <p className="text-[#f5f0e8]/40 text-sm tracking-wide">
              Review your booking and finalize your payment securely.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column — Form */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Section 1: Payment Method */}
              <div className="bg-[#1a1a1a]/60 border border-[#c1aa77]/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 border border-[var(--gold)]/30 flex items-center justify-center">
                    <span className="text-[var(--gold)] text-xs font-medium">1</span>
                  </div>
                  <h2 className="font-cormorant text-2xl text-[var(--cream)]">
                    Payment Method
                  </h2>
                </div>

                {savedCards.length === 0 ? (
                  <div className="border border-dashed border-[#c1aa77]/20 p-6 text-center">
                    <CreditCard
                      size={32}
                      className="text-[#f5f0e8]/20 mx-auto mb-3"
                    />
                    <p className="text-[#f5f0e8]/40 text-sm tracking-wide mb-4">
                      No saved payment methods found.
                    </p>
                    <button
                      onClick={() => navigate("/payment-methods")}
                      className="inline-flex items-center gap-2 border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark)] px-6 py-2.5 text-xs tracking-[3px] uppercase transition-all duration-300"
                    >
                      <Plus size={14} />
                      Add a Card
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {savedCards.map((card) => (
                      <label
                        key={card.id}
                        className={`flex items-center gap-4 p-4 border cursor-pointer transition-all duration-300 group ${selectedCardId === card.id
                          ? "border-[var(--gold)] bg-[var(--gold)]/5"
                          : "border-[#c1aa77]/10 hover:border-[#c1aa77]/30 bg-[#0d0d0d]/30"
                          }`}
                      >
                        <input
                          type="radio"
                          name="savedCard"
                          value={card.id}
                          checked={selectedCardId === card.id}
                          onChange={() => setSelectedCardId(card.id)}
                          className="sr-only"
                        />
                        {/* Radio indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${selectedCardId === card.id
                            ? "border-[var(--gold)]"
                            : "border-[#c1aa77]/30"
                            }`}
                        >
                          {selectedCardId === card.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />
                          )}
                        </div>

                        {/* Card icon */}
                        <div className="w-10 h-10 border border-[#c1aa77]/20 flex items-center justify-center flex-shrink-0">
                          <CreditCard
                            size={18}
                            className={`transition-colors duration-300 ${selectedCardId === card.id
                              ? "text-[var(--gold)]"
                              : "text-[#f5f0e8]/30"
                              }`}
                          />
                        </div>

                        {/* Card details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-[var(--cream)] text-sm font-medium capitalize">
                              {card.cardBrand || "Card"}
                            </span>
                            <span className="text-[#f5f0e8]/40 text-sm">
                              •••• {card.last4Digits}
                            </span>
                            {card.isDefault && (
                              <span className="text-[9px] tracking-[2px] uppercase bg-[var(--gold)]/15 text-[var(--gold)] px-2 py-0.5 border border-[var(--gold)]/20">
                                Default
                              </span>
                            )}
                          </div>
                          {card.expiryDate && (
                            <p className="text-[#f5f0e8]/25 text-xs mt-0.5">
                              Expires {card.expiryDate}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}

                    {/* Add new card link */}
                    <button
                      onClick={() => navigate("/payment-methods")}
                      className="flex items-center gap-2 p-4 border border-dashed border-[#c1aa77]/15 hover:border-[#c1aa77]/30 text-[#f5f0e8]/40 hover:text-[var(--gold)] transition-all duration-300 text-xs tracking-[2px] uppercase"
                    >
                      <Plus size={14} />
                      Add a new card
                    </button>
                  </div>
                )}
              </div>

              {/* Section 2: Billing Details */}
              <form
                id="checkout-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="bg-[#1a1a1a]/60 border border-[#c1aa77]/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 border border-[var(--gold)]/30 flex items-center justify-center">
                      <span className="text-[var(--gold)] text-xs font-medium">2</span>
                    </div>
                    <h2 className="font-cormorant text-2xl text-[var(--cream)]">
                      Billing Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        {...register("firstName")}
                        className={`w-full bg-transparent border-b pb-2 text-[var(--cream)] text-sm outline-none transition-colors duration-300 ${errors.firstName
                          ? "border-red-500/60"
                          : "border-[#c1aa77]/20 focus:border-[var(--gold)]"
                          }`}
                      />
                      {errors.firstName && (
                        <p className="text-red-400 text-[10px] mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        {...register("lastName")}
                        className={`w-full bg-transparent border-b pb-2 text-[var(--cream)] text-sm outline-none transition-colors duration-300 ${errors.lastName
                          ? "border-red-500/60"
                          : "border-[#c1aa77]/20 focus:border-[var(--gold)]"
                          }`}
                      />
                      {errors.lastName && (
                        <p className="text-red-400 text-[10px] mt-1">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        className={`w-full bg-transparent border-b pb-2 text-[var(--cream)] text-sm outline-none transition-colors duration-300 ${errors.email
                          ? "border-red-500/60"
                          : "border-[#c1aa77]/20 focus:border-[var(--gold)]"
                          }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-[10px] mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        {...register("phoneNumber")}
                        className={`w-full bg-transparent border-b pb-2 text-[var(--cream)] text-sm outline-none transition-colors duration-300 ${errors.phoneNumber
                          ? "border-red-500/60"
                          : "border-[#c1aa77]/20 focus:border-[var(--gold)]"
                          }`}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-400 text-[10px] mt-1">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        Country
                      </label>
                      <select
                        {...register("country")}
                        className="w-full bg-transparent border-b border-[#c1aa77]/20 pb-2 text-[var(--cream)] text-sm outline-none"
                      >
                        <option value="EG" className="bg-[#1a1a1a]">
                          Egypt
                        </option>
                      </select>
                    </div>

                    {/* Governorate */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        Governorate
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setCities([]);
                          setValue("city", "");
                        }}
                        disabled={loadingStates}
                        className="w-full bg-transparent border-b border-[#c1aa77]/20 pb-2 text-[var(--cream)] text-sm outline-none focus:border-[var(--gold)] transition-colors duration-300"
                      >
                        <option value="" className="bg-[#1a1a1a]">
                          {loadingStates
                            ? "Loading..."
                            : "Select Governorate"}
                        </option>
                        {governorates.map((gov) => (
                          <option
                            key={gov}
                            value={gov}
                            className="bg-[#1a1a1a]"
                          >
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        City
                      </label>
                      <select
                        {...register("city")}
                        className={`w-full bg-transparent border-b pb-2 text-[var(--cream)] text-sm outline-none transition-colors duration-300 ${errors.city
                          ? "border-red-500/60"
                          : "border-[#c1aa77]/20 focus:border-[var(--gold)]"
                          }`}
                      >
                        <option value="" className="bg-[#1a1a1a]">
                          {!selectedState
                            ? "Select Governorate first"
                            : cities.length === 0
                              ? "Loading..."
                              : "Select City"}
                        </option>
                        {cities.map((city) => (
                          <option
                            key={city}
                            value={city}
                            className="bg-[#1a1a1a]"
                          >
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-red-400 text-[10px] mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    {/* Street */}
                    <div>
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        Street
                      </label>
                      <input
                        type="text"
                        {...register("street")}
                        className={`w-full bg-transparent border-b pb-2 text-[var(--cream)] text-sm outline-none transition-colors duration-300 ${errors.street
                          ? "border-red-500/60"
                          : "border-[#c1aa77]/20 focus:border-[var(--gold)]"
                          }`}
                      />
                      {errors.street && (
                        <p className="text-red-400 text-[10px] mt-1">
                          {errors.street.message}
                        </p>
                      )}
                    </div>

                    {/* Zip Code */}
                    <div className="col-span-2 max-w-[calc(50%-1rem)]">
                      <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/60 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        {...register("zipCode")}
                        className={`w-full bg-transparent border-b pb-2 text-[var(--cream)] text-sm outline-none transition-colors duration-300 ${errors.zipCode
                          ? "border-red-500/60"
                          : "border-[#c1aa77]/20 focus:border-[var(--gold)]"
                          }`}
                      />
                      {errors.zipCode && (
                        <p className="text-red-400 text-[10px] mt-1">
                          {errors.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column — Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1a]/60 border border-[#c1aa77]/20 p-8 sticky top-28">
                <h3 className="font-cormorant text-2xl text-[var(--cream)] mb-6">
                  Booking Summary
                </h3>

                <div className="flex flex-col gap-4 mb-6">
                  {/* Dates */}
                  <div className="flex items-start gap-3">
                    <Calendar
                      size={16}
                      className="text-[var(--gold)] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] tracking-[2px] uppercase text-[#c1aa77]/50 mb-1">
                        Check-in
                      </p>
                      <p className="text-[var(--cream)] text-sm">
                        {bookingState.checkInDate || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar
                      size={16}
                      className="text-[var(--gold)] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-[10px] tracking-[2px] uppercase text-[#c1aa77]/50 mb-1">
                        Check-out
                      </p>
                      <p className="text-[var(--cream)] text-sm">
                        {bookingState.checkOutDate || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#c1aa77]/10 my-2" />

                  {/* Price */}
                  {bookingState.amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#f5f0e8]/40 text-sm">
                        Rate
                      </span>
                      <span className="text-[var(--cream)] text-sm font-medium">
                        {bookingState.currency}{" "}
                        {bookingState.amount?.toLocaleString()}{" "}
                        <span className="text-[#f5f0e8]/30 text-xs lowercase">
                          {bookingState.priceUnit}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Selected card preview */}
                {selectedCardId && (
                  <>
                    <div className="border-t border-[#c1aa77]/10 pt-4 mb-6">
                      <p className="text-[10px] tracking-[2px] uppercase text-[#c1aa77]/50 mb-2">
                        Paying with
                      </p>
                      {(() => {
                        const card = savedCards.find(
                          (c) => c.id === selectedCardId
                        );
                        return card ? (
                          <div className="flex items-center gap-2">
                            <CreditCard
                              size={14}
                              className="text-[var(--gold)]"
                            />
                            <span className="text-[var(--cream)] text-sm capitalize">
                              {card.cardBrand}
                            </span>
                            <span className="text-[#f5f0e8]/40 text-sm">
                              •••• {card.last4Digits}
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </>
                )}

                {/* Pay button */}
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting || !selectedCardId}
                  className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--dark)] py-4 text-[11px] tracking-[3px] uppercase font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      Pay Securely
                    </>
                  )}
                </button>

                {/* Security note */}
                <div className="flex items-center gap-2 mt-4 justify-center">
                  <Shield size={12} className="text-[#f5f0e8]/20" />
                  <p className="text-[#f5f0e8]/20 text-[10px] tracking-wider uppercase">
                    256-bit SSL Encrypted
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

export default CheckoutPage;
