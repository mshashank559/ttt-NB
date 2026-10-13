import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from '../context/AppContext';
import { ALL_AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import { ASSIGNABLE_ROLES, DEPARTMENTS } from './CreateUserModal';
import {
  Eye, EyeOff, Pencil, Trash2, ShieldCheck, Mail, User, Briefcase, Hash,
  KeyRound, Calendar, Shuffle, AlertTriangle, CheckCircle2, Lock
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// 1. VIEW USER MODAL
// ==========================================
export function ViewUserModal({ user, open, onOpenChange, onEditClick }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  const roleMeta = ASSIGNABLE_ROLES.find(r => r.id === user.role) || {
    label: user.role || 'Member',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  const userPassword = user.password || 'NetBounce@2026';
  const displayId = user.tttNbId || user.empId || 'TTT-NB-00000';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0B1EE6] to-[#3B82F6] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Eye size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                User Details
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0B1EE6] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Profile Overview
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                View complete credentials and organizational placement.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Avatar & Hero Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-white/5 dark:to-white/5 border border-slate-200/70 dark:border-white/10">
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#0B1EE6] shadow-md bg-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {user.status || 'Active'}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {user.email}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${roleMeta.color}`}>
                  {roleMeta.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  • {user.dept || 'Operations'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Credentials Grid (Naam, ID, Pass, Dept) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* TTT-NB ID */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/50">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Hash size={13} className="text-[#0B1EE6] dark:text-cyan-400" />
                <span>TTT-NB ID</span>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {displayId}
              </div>
            </div>

            {/* Department */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/50">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Briefcase size={13} className="text-blue-500" />
                <span>Department</span>
              </div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white">
                {user.dept || 'Operations'}
              </div>
            </div>

            {/* Password */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/50 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-amber-500" />
                  <span>Password</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#0B1EE6] dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {showPassword ? userPassword : '••••••••••••'}
              </div>
            </div>

            {/* Joined Date */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/50 sm:col-span-2">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-slate-400" />
                <span>Joined On</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user.joined || '2026-10-01'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                if (onEditClick) onEditClick(user);
              }}
              className="btn-primary h-9.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Pencil size={13} />
              <span>Edit User</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// 2. EDIT USER MODAL
// ==========================================
export function EditUserModal({ user, open, onOpenChange }) {
  const { updateUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dept, setDept] = useState('Tech Support');
  const [role, setRole] = useState('tse');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setEmpId(user.tttNbId || user.empId || '');
      setPassword(user.password || 'NetBounce@2026');
      setDept(user.dept || 'Tech Support');
      setRole(user.role || 'tse');
      setAvatar(user.avatar || DEFAULT_AVATAR);
    }
  }, [user, open]);

  if (!user) return null;

  const shuffleAvatar = () => {
    const random = ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)];
    if (random) setAvatar(random.url);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const roleMeta = ASSIGNABLE_ROLES.find(r => r.id === newRole);
    if (roleMeta) {
      setDept(roleMeta.defaultDept);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('User name cannot be empty.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!empId.trim()) {
      toast.error('TTT-NB ID cannot be empty.');
      return;
    }

    setIsSubmitting(true);

    const updatedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      empId: empId.trim(),
      tttNbId: empId.trim(),
      password: password.trim() || 'NetBounce@2026',
      dept,
      role,
      avatar,
    };

    updateUser(user.id, updatedData);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Pencil size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Edit User Profile
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Management Console
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Update name, email, TTT-NB ID, password, department, and role credentials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Avatar Preview & Shuffle */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-[#0B1EE6] shadow-sm bg-white"
              />
              <button
                type="button"
                onClick={shuffleAvatar}
                title="Shuffle Avatar"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
              >
                <Shuffle size={12} />
              </button>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Profile Avatar</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Click shuffle button to pick an alternate avatar from the official catalog.
              </div>
            </div>
          </div>

          {/* Full Name & Email Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Kapoor"
                  required
                  data-testid="edit-user-name"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arjun.k@netbounce.io"
                  required
                  data-testid="edit-user-email"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* TTT-NB ID & Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                TTT-NB ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash size={15} />
                </div>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="TTT-NB-001"
                  required
                  data-testid="edit-user-id"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-sm focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter user password"
                  data-testid="edit-user-password"
                  className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Department Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Briefcase size={15} />
              </div>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                data-testid="edit-user-dept"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role Selection Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Role Assignment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ASSIGNABLE_ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleChange(r.id)}
                    data-testid={`edit-role-${r.id}`}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0B1EE6] bg-blue-50/70 dark:bg-blue-900/30 ring-2 ring-[#0B1EE6]/20'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {r.label}
                      </span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${r.color}`}>
                        {r.short}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Dept: {r.defaultDept}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="btn-save-user-edit"
              className="btn-primary h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// 3. DELETE USER CONFIRMATION MODAL
// ==========================================
export function DeleteUserDialog({ user, open, onOpenChange }) {
  const { deleteUser } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleDelete = () => {
    setIsDeleting(true);
    deleteUser(user.id);
    setIsDeleting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50 shadow-xs">
              <Trash2 size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Delete User Account?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-300">
            <p className="font-semibold">
              Warning: User will be permanently deleted from:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-800 dark:text-rose-400">
              <li>MongoDB Atlas Database</li>
              <li>Active Team Roster & Organization table</li>
              <li>Assigned roles and access permissions</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 bg-white"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {user.name}
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                {user.tttNbId || user.empId} • {user.email}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            data-testid="btn-confirm-delete-user"
            className="h-10 px-5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/30 hover:shadow-lg transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
