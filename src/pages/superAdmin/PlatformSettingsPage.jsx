import { useState, useEffect } from "react";
import { Settings, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import {
  getPlatformSettings,
  updatePlatformSetting,
} from "../../services/superAdminService";

const SettingField = ({ setting, onSave }) => {
  const [value, setValue] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const isDirty = value !== setting.value;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(setting.key, value);
    } finally {
      setSaving(false);
    }
  };

  const renderInput = () => {
    if (setting.dataType === "Boolean") {
      return (
        <button
          onClick={() => setValue((v) => (v === "true" ? "false" : "true"))}
          disabled={!setting.canUpdate}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            value === "true" ? "bg-[var(--gold)]" : "bg-white/10"
          } ${!setting.canUpdate ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
              value === "true" ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      );
    }

    return (
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!setting.canUpdate}
        className={`w-32 bg-[var(--dark-2)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none transition-colors ${
          setting.canUpdate
            ? "focus:border-[var(--gold)]/40"
            : "cursor-not-allowed opacity-50"
        }`}
      />
    );
  };

  return (
    <div className="bg-[var(--dark-2)] border border-white/5 rounded-2xl p-5 hover:border-[var(--gold)]/10 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-white font-medium text-sm">
              {setting.displayName}
            </h3>
            <span className="text-[10px] tracking-[2px] uppercase text-white/20 border border-white/10 px-2 py-0.5 rounded-full">
              {setting.dataType}
            </span>
            {!setting.canUpdate && (
              <span className="text-[10px] tracking-[2px] uppercase text-red-400/60 border border-red-400/20 px-2 py-0.5 rounded-full">
                Read Only
              </span>
            )}
          </div>
          <p className="text-white/30 text-xs mb-1">{setting.description}</p>
          <p className="text-white/15 text-[10px] tracking-wide font-mono">
            {setting.key}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {renderInput()}
          {setting.canUpdate && setting.dataType !== "Boolean" && isDirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          {setting.dataType === "Boolean" && isDirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>

      {/* Last updated */}
      <p className="text-white/15 text-[10px] mt-3 tracking-wide">
        Last updated:{" "}
        {new Date(setting.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const result = await getPlatformSettings();
        if (result.succeeded) {
          setSettings(result.data || []);
        } else {
          toast.error(result.message || "Failed to load settings.");
        }
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (key, newValue) => {
    try {
      const result = await updatePlatformSetting(key, newValue);
      if (result.succeeded) {
        toast.success("Setting updated.");
        setSettings((prev) =>
          prev.map((s) => (s.key === key ? { ...s, value: newValue } : s)),
        );
      } else {
        toast.error(result.message || "Failed to update setting.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  // Group settings by prefix
  const grouped = settings.reduce((acc, setting) => {
    const group = setting.key.split(".").slice(0, 2).join(".");
    if (!acc[group]) acc[group] = [];
    acc[group].push(setting);
    return acc;
  }, {});

  const groupLabels = {
    "Financial.Fees": "Financial Fees",
    "Financial.Payments": "Payment Settings",
    "Rentals.Booking": "Booking Settings",
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.7) 50%, rgba(13,13,13,8) 100%), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="relative w-full h-52 rounded-3xl overflow-hidden mb-10">
            <img
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1800&q=80"
              alt="Platform Settings"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <h1
                className="text-5xl font-semibold text-white"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Platform Settings
              </h1>
              {!loading && (
                <p className="text-white/50 mt-2 text-sm">
                  {settings.length} settings
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : settings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Settings size={48} className="text-white/10 mb-4" />
              <p className="text-white/40 text-lg">No settings found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {Object.entries(grouped).map(([group, groupSettings]) => (
                <div key={group}>
                  <p className="text-xs tracking-[4px] uppercase text-[var(--gold)] mb-4 font-medium">
                    {groupLabels[group] ?? group}
                  </p>
                  <div className="flex flex-col gap-3">
                    {groupSettings.map((setting) => (
                      <SettingField
                        key={setting.key}
                        setting={setting}
                        onSave={handleSave}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
