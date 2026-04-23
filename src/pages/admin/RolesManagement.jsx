import { useEffect, useState } from "react";
import {
  Shield,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Pencil,
  X,
  Check,
  UserPlus,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getRoles, updateRole, assignRoleToUser } from "../../services/identityService";
import toast from "react-hot-toast";

function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Assign role to user
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoleName, setAssignRoleName] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRoles();
      const data = result.succeeded
        ? result.data
        : Array.isArray(result)
          ? result
          : [];
      setRoles(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load roles. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const startEdit = (role) => {
    setEditingId(role.id);
    setEditForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      isActive: role.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const result = await updateRole(id, editForm);
      if (result.succeeded) {
        toast.success(result.message || "Role updated successfully.");
        // apply changes locally without a full refetch
        setRoles((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...editForm } : r)),
        );
        cancelEdit();
      } else {
        toast.error(result.message || "Failed to update role.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignUserId.trim() || !assignRoleName) return;
    setAssigning(true);
    try {
      const result = await assignRoleToUser(assignUserId.trim(), assignRoleName);
      if (result.succeeded) {
        toast.success(result.message || "Role assigned successfully.");
        setAssignUserId("");
        setAssignRoleName("");
        // refresh to reflect updated userCount
        fetchRoles();
      } else {
        toast.error(result.message || "Failed to assign role.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setAssigning(false);
    }
  };

  // Shared input style
  const inputCls =
    "w-full bg-transparent border-b border-[#c1aa77]/30 focus:border-[var(--gold)] pb-1 text-sm text-[var(--cream)] outline-none transition-colors duration-200 placeholder-[#f5f0e8]/20";

  return (
    <div className="min-h-screen font-jost relative bg-[var(--dark)]">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80')",
          filter: "blur(3px)",
        }}
      />
      <div className="fixed inset-0 bg-[#0d0d0d]/75 -z-10" />

      <Navbar />

      <div className="min-h-screen flex flex-col items-center justify-start px-6 py-32">
        {/* Page Header */}
        <div className="w-full max-w-5xl mb-10">
          <p className="text-[10px] tracking-[5px] uppercase text-[var(--gold)] mb-3">
            Identity Management
          </p>
          <div className="flex items-center justify-between">
            <h1 className="font-cormorant text-4xl font-light text-[var(--cream)] flex items-center gap-4">
              <Shield size={28} className="text-[var(--gold)]" />
              System Roles
            </h1>
            <button
              onClick={fetchRoles}
              disabled={loading}
              className="flex items-center gap-2 py-2 px-5 border border-[#c1aa77]/30 hover:border-[var(--gold)] text-[var(--gold)] text-[10px] tracking-[3px] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <div className="mt-4 h-px bg-[#c1aa77]/10" />
        </div>

        {/* Assign Role Panel */}
        <div
          className="w-full max-w-5xl mb-6 bg-[#141414] border border-[#c1aa77]/10 px-10 py-7 relative"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c1aa77] pointer-events-none" />
          <p className="text-[10px] tracking-[4px] uppercase text-[#c1aa77]/50 mb-5 flex items-center gap-2">
            <UserPlus size={12} />
            Assign Role to User
          </p>
          <form onSubmit={handleAssign} className="flex items-end gap-6">
            {/* User ID */}
            <div className="flex-1">
              <label className="block text-[9px] tracking-[3px] uppercase text-[#c1aa77]/40 mb-2">
                User ID
              </label>
              <input
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                placeholder="Paste user UUID…"
                className="w-full bg-transparent border-0 border-b border-[#c1aa77]/20 focus:border-[var(--gold)] pb-2 text-sm text-[var(--cream)] outline-none transition-colors duration-200 placeholder-[#f5f0e8]/15 font-mono"
              />
            </div>
            {/* Role Name */}
            <div className="flex-1">
              <label className="block text-[9px] tracking-[3px] uppercase text-[#c1aa77]/40 mb-2">
                Role
              </label>
              <select
                value={assignRoleName}
                onChange={(e) => setAssignRoleName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#c1aa77]/20 focus:border-[var(--gold)] pb-2 text-sm text-[var(--cream)] outline-none transition-colors duration-200 cursor-pointer"
              >
                <option value="" className="bg-[#1a1a1a]">Select role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name} className="bg-[#1a1a1a]">
                    {r.displayName}
                  </option>
                ))}
              </select>
            </div>
            {/* Submit */}
            <button
              type="submit"
              disabled={assigning || !assignUserId.trim() || !assignRoleName}
              className="flex items-center gap-2 py-2 px-7 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[var(--dark)] text-[10px] tracking-[3px] uppercase font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {assigning ? (
                <RefreshCw size={11} className="animate-spin" />
              ) : (
                <UserPlus size={11} />
              )}
              Assign
            </button>
          </form>
        </div>

        {/* Content Card */}
        <div
          className="w-full max-w-5xl bg-[#141414] border border-[#c1aa77]/10 relative"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        >
          {/* Gold corner accents */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t border-l border-[#c1aa77] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b border-r border-[#c1aa77] pointer-events-none" />

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border border-[#c1aa77]/30 border-t-[var(--gold)] rounded-full animate-spin" />
              <p className="text-[10px] tracking-[4px] uppercase text-[#f5f0e8]/30">
                Loading roles...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <AlertCircle size={32} className="text-red-400/70" />
              <p className="text-sm text-red-400/80 tracking-wide text-center max-w-sm">
                {error}
              </p>
              <button
                onClick={fetchRoles}
                className="mt-2 py-3 px-8 border border-red-400/30 hover:border-red-400 text-red-400 text-[10px] tracking-[3px] uppercase transition-all duration-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* Roles Table */}
          {!loading && !error && (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] gap-6 px-10 py-5 border-b border-[#c1aa77]/8">
                {["#", "Role", "Description", "Users", "Created", "Status", ""].map((h, i) => (
                  <span key={i} className="text-[9px] tracking-[4px] uppercase text-[#c1aa77]/40">
                    {h}
                  </span>
                ))}
              </div>

              {/* Empty State */}
              {roles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Shield size={28} className="text-[#c1aa77]/20" />
                  <p className="text-[10px] tracking-[4px] uppercase text-[#f5f0e8]/20">
                    No roles found
                  </p>
                </div>
              )}

              {/* Role Rows */}
              {roles.map((role, index) => {
                const isEditing = editingId === role.id;

                return (
                  <div
                    key={role.id}
                    className={`grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] gap-6 px-10 py-6 border-b border-[#c1aa77]/5 transition-colors duration-200 group items-center ${
                      isEditing
                        ? "bg-[#c1aa77]/[0.05] border-[#c1aa77]/15"
                        : "hover:bg-[#c1aa77]/[0.03]"
                    }`}
                  >
                    {/* Index */}
                    <span className="text-xs text-[#f5f0e8]/20 font-mono w-6 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Role name + display name */}
                    <div>
                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <input
                            value={editForm.displayName}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, displayName: e.target.value }))
                            }
                            placeholder="Display Name"
                            className={inputCls}
                          />
                          <input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="Internal name"
                            className={`${inputCls} text-[#c1aa77]/70 font-mono text-xs`}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-[var(--cream)] tracking-wide mb-1">
                            {role.displayName}
                          </p>
                          <span className="text-[9px] font-mono text-[#c1aa77]/50 bg-[#c1aa77]/5 px-2 py-0.5 border border-[#c1aa77]/10 group-hover:border-[#c1aa77]/20 transition-colors">
                            {role.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {isEditing ? (
                      <input
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, description: e.target.value }))
                        }
                        placeholder="Description"
                        className={inputCls}
                      />
                    ) : (
                      <p className="text-xs text-[#f5f0e8]/40 leading-relaxed line-clamp-2">
                        {role.description || "—"}
                      </p>
                    )}

                    {/* User Count */}
                    <div className="flex items-center gap-2 justify-center min-w-[56px]">
                      <Users size={12} className="text-[#c1aa77]/40" />
                      <span className="text-sm font-mono text-[var(--cream)]">
                        {role.userCount ?? "—"}
                      </span>
                    </div>

                    {/* Created At + By */}
                    <div className="text-right min-w-[90px]">
                      <p className="text-xs text-[#f5f0e8]/50">
                        {formatDate(role.createdAt)}
                      </p>
                      {role.createdBy && (
                        <p className="text-[9px] text-[#f5f0e8]/20 mt-0.5 font-mono">
                          {role.createdBy}
                        </p>
                      )}
                    </div>

                    {/* isActive */}
                    <div className="flex justify-center min-w-[70px]">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm((f) => ({ ...f, isActive: !f.isActive }))
                          }
                          className={`flex items-center gap-1.5 text-[9px] tracking-[2px] uppercase transition-colors duration-200 ${
                            editForm.isActive
                              ? "text-emerald-400"
                              : "text-[#f5f0e8]/30"
                          }`}
                        >
                          {editForm.isActive ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          {editForm.isActive ? "Active" : "Inactive"}
                        </button>
                      ) : role.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-400/80">
                          <CheckCircle size={14} />
                          <span className="text-[9px] tracking-[2px] uppercase">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#f5f0e8]/20">
                          <XCircle size={14} />
                          <span className="text-[9px] tracking-[2px] uppercase">Inactive</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end min-w-[72px]">
                      {isEditing ? (
                        <>
                          {/* Save */}
                          <button
                            onClick={() => saveEdit(role.id)}
                            disabled={saving}
                            title="Save"
                            className="w-7 h-7 flex items-center justify-center border border-emerald-400/40 hover:border-emerald-400 text-emerald-400 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {saving ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                          </button>
                          {/* Cancel */}
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            title="Cancel"
                            className="w-7 h-7 flex items-center justify-center border border-[#c1aa77]/20 hover:border-red-400 text-[#f5f0e8]/30 hover:text-red-400 transition-colors duration-200"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(role)}
                          title="Edit role"
                          className="w-7 h-7 flex items-center justify-center border border-[#c1aa77]/10 hover:border-[var(--gold)] text-[#f5f0e8]/20 hover:text-[var(--gold)] transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              {roles.length > 0 && (
                <div className="px-10 py-5 flex justify-end items-center gap-2 font-bold text-[10px] text-white">
                  <p className="tracking-[3px] uppercase">
                    role{roles.length !== 1 ? "s" : ""} total:
                  </p>
                  <p className="tracking-[2px] font-mono">{roles.length}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RolesManagement;
