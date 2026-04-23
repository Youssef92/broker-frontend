import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Shield, Plus, Edit, Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import {
  getRoles,
  createRole,
  updateRole,
} from "../../services/superAdminService";

// ─── Create Role Modal ───────────────────────────────────────────
const CreateRoleModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    roleName: "",
    displayName: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.roleName.trim()) {
      toast.error("Role name is required.");
      return;
    }
    setLoading(true);
    try {
      const result = await createRole(form);
      if (result.succeeded) {
        toast.success("Role created successfully.");
        onCreated();
        onClose();
      } else {
        toast.error(result.message || "Failed to create role.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d]/80 flex items-center justify-center px-6">
      <div className="bg-[#1a1a1a] border border-[#c1aa77]/20 p-10 max-w-md w-full rounded-2xl">
        <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-3">
          New
        </p>
        <h2 className="font-cormorant text-3xl text-white font-light mb-8">
          Create Role
        </h2>

        <div className="flex flex-col gap-5 mb-8">
          {[
            {
              key: "roleName",
              label: "Role Name",
              placeholder: "e.g. Moderator",
              required: true,
            },
            {
              key: "displayName",
              label: "Display Name",
              placeholder: "e.g. Content Moderator",
            },
            {
              key: "description",
              label: "Description",
              placeholder: "What this role can do...",
            },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/70 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
              </label>
              <input
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                placeholder={placeholder}
                className="w-full bg-transparent border-0 border-b border-[#c1aa77]/20 pb-3 text-white text-sm placeholder-white/20 outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#c1aa77]/30 hover:border-[var(--gold)] text-[var(--gold)] text-xs tracking-[3px] uppercase transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-3 text-[var(--dark)] text-xs tracking-[3px] uppercase font-medium transition-all duration-300 ${
              loading
                ? "bg-[#c1aa77]/50 cursor-not-allowed"
                : "bg-[var(--gold)] hover:bg-[var(--gold-light)]"
            }`}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin mx-auto" />
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Role Modal ─────────────────────────────────────────────
const EditRoleModal = ({ role, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    displayName: role.displayName || "",
    description: role.description || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await updateRole(role.id, form);
      if (result.succeeded) {
        toast.success("Role updated successfully.");
        onUpdated();
        onClose();
      } else {
        toast.error(result.message || "Failed to update role.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d]/80 flex items-center justify-center px-6">
      <div className="bg-[#1a1a1a] border border-[#c1aa77]/20 p-10 max-w-md w-full rounded-2xl">
        <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-3">
          Edit
        </p>
        <h2 className="font-cormorant text-3xl text-white font-light mb-2">
          {role.name}
        </h2>
        <p className="text-white/30 text-xs mb-8 tracking-wide">
          Role name cannot be changed.
        </p>

        <div className="flex flex-col gap-5 mb-8">
          {[
            {
              key: "displayName",
              label: "Display Name",
              placeholder: "e.g. Content Moderator",
            },
            {
              key: "description",
              label: "Description",
              placeholder: "What this role can do...",
            },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] tracking-[3px] uppercase text-[#c1aa77]/70 mb-2">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                placeholder={placeholder}
                className="w-full bg-transparent border-0 border-b border-[#c1aa77]/20 pb-3 text-white text-sm placeholder-white/20 outline-none focus:border-[var(--gold)] transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#c1aa77]/30 hover:border-[var(--gold)] text-[var(--gold)] text-xs tracking-[3px] uppercase transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-3 text-[var(--dark)] text-xs tracking-[3px] uppercase font-medium transition-all duration-300 ${
              loading
                ? "bg-[#c1aa77]/50 cursor-not-allowed"
                : "bg-[var(--gold)] hover:bg-[var(--gold-light)]"
            }`}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin mx-auto" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────
export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const result = await getRoles();
      if (result.succeeded) {
        setRoles(result.data || []);
      } else {
        toast.error(result.message || "Failed to load roles.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.9) 50%, rgba(13,13,13,1) 100%), url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=80')`,
      }}
    >
      <div className="relative z-10 pt-12">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero */}
          <div className="relative w-full h-52 rounded-3xl overflow-hidden mb-8">
            <img
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1800&q=80"
              alt="Roles"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10">
              <h1
                className="text-5xl font-semibold text-white"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Roles
              </h1>
              {!loading && (
                <p className="text-white/50 mt-2 text-sm">
                  {roles.length} {roles.length === 1 ? "role" : "roles"} found
                </p>
              )}
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--gold)]/40 text-[var(--gold)] text-sm hover:bg-[var(--gold)]/10 transition-colors"
            >
              <Plus size={16} />
              Create Role
            </button>
          </div>

          {/* Roles List */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 size={32} className="animate-spin text-[var(--gold)]" />
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Shield size={48} className="text-white/10 mb-4" />
              <p className="text-white/40 text-lg">No roles found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--dark-2)] border border-white/5 rounded-2xl p-5 hover:border-[var(--gold)]/20 transition-colors duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                        <Shield size={18} className="text-[var(--gold)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3
                            className="text-white font-semibold text-base"
                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                          >
                            {role.displayName || role.name}
                          </h3>
                          <span className="text-[10px] tracking-[2px] uppercase text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
                            {role.name}
                          </span>
                          <span
                            className={`text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded-full border ${
                              role.isActive
                                ? "text-green-400 border-green-400/30 bg-green-400/10"
                                : "text-red-400 border-red-400/30 bg-red-400/10"
                            }`}
                          >
                            {role.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {role.description && (
                          <p className="text-white/40 text-sm">
                            {role.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-white/25 text-xs">
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {role.userCount}{" "}
                            {role.userCount === 1 ? "user" : "users"}
                          </span>
                          <span>
                            Created{" "}
                            {new Date(role.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingRole(role)}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-colors text-xs"
                    >
                      <Edit size={13} />
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateRoleModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchRoles}
        />
      )}
      {editingRole && (
        <EditRoleModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onUpdated={fetchRoles}
        />
      )}
    </div>
  );
}
