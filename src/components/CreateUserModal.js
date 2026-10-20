import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from '../context/AppContext';
import { ALL_AVATARS, DEFAULT_AVATAR } from '../data/avatars';
import { UserPlus, Sparkles, Shuffle, ShieldCheck, Mail, User, Briefcase, Hash, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const ASSIGNABLE_ROLES = [
  { id: 'upper_management', label: 'Upper Management', short: 'UM', defaultDept: 'Executive', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { id: 'management', label: 'Management', short: 'MG', defaultDept: 'Operations', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { id: 'tse', label: 'TSE', short: 'TSE', defaultDept: 'Tech Support', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  { id: 'tsm', label: 'TSM', short: 'TSM', defaultDept: 'Tech Support', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  { id: 'marketing_tl', label: 'Marketing TL', short: 'MTL', defaultDept: 'Marketing', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  { id: 'marketing_sr', label: 'Marketing SR', short: 'MSR', defaultDept: 'Marketing', color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
];

export const DEPARTMENTS = [
  'Tech Support',
  'Operations',
  'Marketing',
  'Executive',
];

export const getNextTttNbId = (userList) => {
  let maxIdNum = 0;
  if (Array.isArray(userList)) {
    userList.forEach((u) => {
      const idStr = u.tttNbId || u.empId || '';
      if (idStr) {
        const matches = idStr.match(/\d+/);
        if (matches) {
          const num = parseInt(matches[0], 10);
          if (!isNaN(num) && num > maxIdNum && num < 90000) {
            maxIdNum = num;
          }
        }
      }
    });
  }
  const nextNum = maxIdNum + 1;
  return `TTT-NB-${String(nextNum).padStart(3, '0')}`;
};

export default function CreateUserModal({ open, onOpenChange }) {
  const { users, addUser, currentRole } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('tse');
  const [dept, setDept] = useState('Tech Support');
  const [avatar, setAvatar] = useState(() => ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)]?.url || DEFAULT_AVATAR);
  const [marketingManagerId, setMarketingManagerId] = useState('u-1791910972412');
  const [marketingTlId, setMarketingTlId] = useState('u-1791911058812');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Marketing Managers List
  const marketingManagers = useMemo(() => {
    const list = (users || []).filter(u => u.role === 'management' || u.role === 'upper_management');
    const defaults = [
      { id: 'u-1791910972412', name: 'Shashank Mishra', roleLabel: 'Super Admin / Operations' },
      { id: 'u-1791911019553', name: 'Pradyuman Kothiya', roleLabel: 'Admin / Management' },
    ];
    const combined = [...defaults];
    list.forEach(u => {
      if (!combined.some(c => c.id === u.id || c.name.toLowerCase() === u.name.toLowerCase())) {
        combined.push({ id: u.id, name: u.name, roleLabel: u.dept || 'Management' });
      }
    });
    return combined;
  }, [users]);

  // Marketing TLs List (Mukesh Chaudhary & Shivam Barot)
  const marketingTls = useMemo(() => {
    const defaults = [
      { id: 'u-1791911058812', name: 'Mukesh Chaudhary', teamId: 'team-mukesh', teamName: 'Team Mukesh' },
      { id: 'u-1791911115518', name: 'Shivam Barot', teamId: 'team-shivam', teamName: 'Team Shivam' },
    ];
    const fromUsers = (users || []).filter(u => u.role === 'marketing_tl');
    const combined = [...defaults];
    fromUsers.forEach(u => {
      if (!combined.some(c => c.id === u.id)) {
        combined.push({
          id: u.id,
          name: u.name,
          teamId: u.teamId || (u.name.toLowerCase().includes('shivam') ? 'team-shivam' : 'team-mukesh'),
          teamName: u.teamName || (u.name.toLowerCase().includes('shivam') ? 'Team Shivam' : 'Team Mukesh'),
        });
      }
    });
    return combined;
  }, [users]);

  // Automatically computed next TTT-NB ID (no manual entry required)
  const nextTttNbId = useMemo(() => getNextTttNbId(users), [users]);

  // Permission guard: Only Management or Upper Management
  const isAuthorized = currentRole === 'management' || currentRole === 'upper_management';

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const roleMeta = ASSIGNABLE_ROLES.find(r => r.id === newRole);
    if (roleMeta) {
      setDept(roleMeta.defaultDept);
    }
  };

  const shuffleAvatar = () => {
    const random = ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)];
    if (random) setAvatar(random.url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAuthorized) {
      toast.error('Permission Denied: User creation is restricted to Management.');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter the user full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Check duplicate email
    if (users?.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      toast.error('A user with this email address already exists.');
      return;
    }

    setIsSubmitting(true);

    const autoAssignedId = getNextTttNbId(users);
    const selectedManager = marketingManagers.find(m => m.id === marketingManagerId) || marketingManagers[0];
    const selectedTl = marketingTls.find(tl => tl.id === marketingTlId) || marketingTls[0];

    const newUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim() || 'NetBounce@2026',
      role,
      dept: (role === 'marketing_sr' || role === 'marketing_tl') ? 'Marketing' : dept,
      teamId: role === 'marketing_sr' ? selectedTl.teamId : (role === 'marketing_tl' ? (marketingTlId === 'u-1791911058812' ? 'team-mukesh' : 'team-shivam') : undefined),
      teamName: role === 'marketing_sr' ? selectedTl.teamName : (role === 'marketing_tl' ? (marketingTlId === 'u-1791911058812' ? 'Team Mukesh' : 'Team Shivam') : undefined),
      teamLeadId: role === 'marketing_sr' ? selectedTl.id : undefined,
      marketingManagerId: role === 'marketing_sr' ? selectedManager.id : undefined,
      marketingManagerName: role === 'marketing_sr' ? selectedManager.name : undefined,
      empId: autoAssignedId,
      tttNbId: autoAssignedId,
      joined: new Date().toISOString().slice(0, 10),
      avatar,
      status: 'Active',
    };

    addUser(newUser);

    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setRole('tse');
    setDept('Tech Support');
    setMarketingManagerId('u-1791910972412');
    setMarketingTlId('u-1791911058812');
    shuffleAvatar();
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0B1EE6] to-[#3B82F6] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <UserPlus size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Create New User
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0B1EE6] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Management Console
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Provision access for team members across NetBounce operations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isAuthorized ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Management Authorization Required</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This feature is restricted to Management users only. Please sign in as Management to create users.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Avatar & Basic Info Header */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
              <div className="relative">
                <img
                  src={avatar}
                  alt="Avatar Preview"
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
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Assigned Avatar</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Profile avatar automatically generated from the official gallery. Click shuffle to change.
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
                    data-testid="input-user-name"
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
                    data-testid="input-user-email"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password Field for Management */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password <span className="text-slate-400 font-normal">(Login Credentials)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#0B1EE6] dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set user password (e.g. _Pass@061 or NetBounce@2026)"
                  data-testid="input-user-password"
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-sm focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all"
                />
              </div>
            </div>

            {/* Role Selection (6 Specific Roles from User Request) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Role Assignment <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ASSIGNABLE_ROLES.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      data-testid={`role-option-${r.id}`}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0B1EE6] bg-blue-50/70 dark:bg-blue-900/30 ring-2 ring-[#0B1EE6]/20'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
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

            {/* Marketing Hierarchy Assignment for Marketing SR */}
            {role === 'marketing_sr' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800/80 space-y-3 shadow-xs">
                <div className="text-xs font-bold text-blue-950 dark:text-blue-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#0B1EE6] dark:text-cyan-400" />
                    Marketing SR Reporting Hierarchy
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                    Required for SR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Marketing Manager Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Marketing Manager <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={marketingManagerId}
                      onChange={(e) => setMarketingManagerId(e.target.value)}
                      data-testid="select-marketing-manager"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all cursor-pointer shadow-2xs"
                    >
                      {marketingManagers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.roleLabel || 'Manager'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Marketing TL Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Marketing Team Lead (TL) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={marketingTlId}
                      onChange={(e) => setMarketingTlId(e.target.value)}
                      data-testid="select-marketing-tl"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 outline-none transition-all cursor-pointer shadow-2xs"
                    >
                      {marketingTls.map((tl) => (
                        <option key={tl.id} value={tl.id}>
                          {tl.name} ({tl.teamName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  Yeh SR automatically selected Marketing TL ke team me map ho jayega aur task creation ke time candidate assign karne ke liye drop down me aayega.
                </p>
              </div>
            )}

            {/* Department & Employee ID Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    data-testid="select-user-dept"
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    TTT-NB ID
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ⚡ Auto-Generated
                  </span>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between w-full h-10 px-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-slate-900 text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-[#0B1EE6] dark:text-cyan-400" />
                      <span className="font-mono font-bold text-sm tracking-wide text-[#0B1EE6] dark:text-cyan-300" data-testid="auto-generated-tttnb-id">
                        {nextTttNbId}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Auto Sequence
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Create par click karne par automatically assign hoga (manual enter nahi karna padega).
                </p>
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
                data-testid="btn-submit-create-user"
                className="btn-primary h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>{isSubmitting ? 'Creating...' : 'Create User'}</span>
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
