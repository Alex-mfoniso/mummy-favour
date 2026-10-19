import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  UserX, 
  UserCheck, 
  Edit3, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminUserService } from '@/services/adminUserService';
import { AdminUser, AdminRole } from '@/services/authService';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as AdminRole,
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'STAFF' as AdminRole,
  });
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminUserService.fetchUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      });
      setUsers(res.users);
    } catch (err: any) {
      setError(err?.message || 'Failed to load staff list.');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      setFormError('Please fill out all required fields.');
      return;
    }
    if (createForm.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminUserService.createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      setIsCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'STAFF' });
      showSuccess('Staff account created successfully.');
      fetchUsers();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    try {
      setIsSubmitting(true);
      await adminUserService.updateUser(selectedUser.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      });
      setIsEditOpen(false);
      setSelectedUser(null);
      showSuccess('User account updated successfully.');
      fetchUsers();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userToToggle: AdminUser) => {
    if (userToToggle.id === currentUser?.id) {
      alert('You cannot deactivate your own account.');
      return;
    }

    const actionText = userToToggle.isActive ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} ${userToToggle.name}'s account?`)) {
      return;
    }

    try {
      await adminUserService.updateStatus(userToToggle.id, !userToToggle.isActive);
      showSuccess(`Account successfully ${userToToggle.isActive ? 'deactivated' : 'reactivated'}.`);
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || `Failed to ${actionText} account.`);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (resetPasswordValue.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminUserService.resetPassword(selectedUser.id, resetPasswordValue);
      setIsResetPasswordOpen(false);
      setSelectedUser(null);
      setResetPasswordValue('');
      showSuccess('Password has been reset. The user must sign in with the new password.');
    } catch (err: any) {
      setFormError(err?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: AdminRole | string) => {
    if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <ShieldAlert className="w-3 h-3 text-emerald-600" />
          Super Admin (Owner)
        </span>
      );
    }
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <ShieldCheck className="w-3 h-3 text-blue-600" />
          Manager (Admin)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-300">
        Staff Member
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E2E0D8] shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#246B45]/10 text-[#246B45] rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#252A27]">
                Staff & Role Management
              </h1>
              <p className="text-sm text-[#5C645F] mt-0.5">
                Manage operational staff accounts, manager permissions, and security roles.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#246B45] text-white text-sm font-medium hover:bg-[#1B5234] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#246B45]/40"
        >
          <UserPlus className="w-4 h-4" />
          Add New Staff
        </button>
      </div>

      {/* =========================================================================
          ALERT MESSAGES
          ========================================================================= */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchUsers}
            className="text-xs font-semibold text-rose-700 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          SEARCH & FILTER BAR
          ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E0D8] shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#88918C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F5F4EF] border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45] focus:bg-white text-[#252A27]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#F5F4EF] border border-[#D5D3C8] rounded-lg text-[#252A27] focus:outline-none focus:border-[#246B45]"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin (Owner)</option>
            <option value="ADMIN">Manager (Admin)</option>
            <option value="STAFF">Staff Member</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#F5F4EF] border border-[#D5D3C8] rounded-lg text-[#252A27] focus:outline-none focus:border-[#246B45]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          USERS TABLE
          ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#E2E0D8] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#246B45] animate-spin mb-3" />
            <p className="text-sm text-[#5C645F]">Loading staff records...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Users className="w-12 h-12 text-[#88918C] mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-[#252A27]">No accounts found</h3>
            <p className="text-sm text-[#5C645F] mt-1">
              No staff members match the selected search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E2E0D8] text-xs font-semibold text-[#5C645F] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Staff Member</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E0D8]">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-medium text-[#252A27] flex items-center gap-2">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#5C645F] font-mono mt-0.5">{u.email}</div>
                      </td>

                      <td className="py-4 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-4 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-[#5C645F]">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditForm({
                                name: u.name,
                                email: u.email,
                                role: u.role,
                              });
                              setFormError(null);
                              setIsEditOpen(true);
                            }}
                            title="Edit User"
                            className="p-1.5 text-[#5C645F] hover:text-[#252A27] hover:bg-[#EAE8DE] rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setResetPasswordValue('');
                              setFormError(null);
                              setIsResetPasswordOpen(true);
                            }}
                            title="Reset Password"
                            className="p-1.5 text-[#5C645F] hover:text-[#246B45] hover:bg-[#EAE8DE] rounded-md transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Deactivate */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title={u.isActive ? 'Deactivate User' : 'Reactivate User'}
                              className={`p-1.5 rounded-md transition-colors ${
                                u.isActive
                                  ? 'text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {u.isActive ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
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

      {/* =========================================================================
          MODAL: CREATE STAFF MEMBER
          ========================================================================= */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E0D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#246B45]" />
                <h3 className="font-semibold text-lg text-[#252A27]">Add New Staff</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. John Okoro"
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="john@divinefavour.com"
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Temporary Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Operational Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as AdminRole })}
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                >
                  <option value="STAFF">Staff (Enquiry management, product viewer)</option>
                  <option value="ADMIN">Manager (Products & Categories management, enquiries)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5C645F] hover:bg-[#F5F4EF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#246B45] hover:bg-[#1B5234] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT STAFF DETAILS & ROLE
          ========================================================================= */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E0D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#246B45]" />
                <h3 className="font-semibold text-lg text-[#252A27]">Edit Account Details</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  Operational Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as AdminRole })}
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                >
                  <option value="STAFF">Staff (Enquiry management, product viewer)</option>
                  <option value="ADMIN">Manager (Products & Categories management, enquiries)</option>
                  <option value="SUPER_ADMIN">Super Admin (Owner - Full operational access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5C645F] hover:bg-[#F5F4EF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#246B45] hover:bg-[#1B5234] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RESET PASSWORD
          ========================================================================= */}
      {isResetPasswordOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E0D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E0D8]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#246B45]" />
                <h3 className="font-semibold text-lg text-[#252A27]">Reset Password</h3>
              </div>
              <button
                onClick={() => setIsResetPasswordOpen(false)}
                className="text-[#88918C] hover:text-[#252A27] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-[#5C645F]">
              Set a new password for <span className="font-semibold text-[#252A27]">{selectedUser.name}</span> ({selectedUser.email}).
              Any active sessions for this user will be terminated immediately.
            </p>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5C645F] mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 text-sm border border-[#D5D3C8] rounded-lg focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E0D8]">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5C645F] hover:bg-[#F5F4EF] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#246B45] hover:bg-[#1B5234] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Set New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
