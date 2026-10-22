import React, { useState } from 'react';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText, Shield, User as UserIcon, Settings as SettingsIcon, Sparkles, UserPlus, Search, Filter, Mail, Hash, Eye, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatusBadge, KpiCard } from '../components/common';
import AvatarPickerModal from '../components/AvatarPickerModal';
import CreateUserModal, { ASSIGNABLE_ROLES } from '../components/CreateUserModal';
import { ViewUserModal, EditUserModal, DeleteUserDialog } from '../components/UserActionModals';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ROLES, permissionsByRole } from '../data/mockData';
import { DEFAULT_AVATAR } from '../data/avatars';

const triggerDownload = (filename, content) => {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

export { default as Reports } from './ReportsPage';

export const Users = () => {
  const { users, currentRole } = useApp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Action Modals State
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isManagement = currentRole === 'management' || currentRole === 'upper_management';
  const isTsm = currentRole === 'tsm';
  const canManageUsers = isManagement || isTsm;

  // TSM can ONLY view and manage TSE and TSM accounts. All other roles are hidden and protected.
  const baseUsers = isTsm
    ? (users || []).filter(u => u.role === 'tse' || u.role === 'tsm')
    : (users || []);

  const filteredUsers = baseUsers.filter(u => {
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.tttNbId && u.tttNbId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.empId && u.empId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const availableFilterRoles = isTsm
    ? ASSIGNABLE_ROLES.filter(r => r.id === 'tse' || r.id === 'tsm')
    : ASSIGNABLE_ROLES;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle={isTsm ? "Manage TSE and TSM credentials and accounts." : "Manage access across the organization."}
        actions={
          canManageUsers && (
            <button
              type="button"
              data-testid="btn-open-create-user"
              onClick={() => setCreateModalOpen(true)}
              className="relative group w-60 sm:w-64 h-10 px-3.5 rounded-xl bg-gradient-to-r from-[#141dc7] via-[#10199e] to-[#0c147e] text-white border border-white/30 hover:border-cyan-300/80 shadow-md shadow-blue-950/30 hover:shadow-lg hover:shadow-blue-900/40 flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden"
            >
              {/* PS4 Smooth Wave Motion Inside Button Box */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl z-0">
                {/* Ambient base translucent tint */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xs" />
                
                {/* PS4 Sine Wave 1 (Upper luminous ribbon) */}
                <svg
                  className="absolute -top-1.5 left-0 w-[240%] h-[140%] ps4-wave-1 opacity-75 pointer-events-none"
                  viewBox="0 0 400 40"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="ps4GradA-btnUsersPage" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.0)" />
                      <stop offset="25%" stopColor="rgba(147, 197, 253, 0.45)" />
                      <stop offset="50%" stopColor="rgba(103, 232, 249, 0.8)" />
                      <stop offset="75%" stopColor="rgba(255, 255, 255, 0.55)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 20 Q 50 2 100 20 T 200 20 T 300 20 T 400 20 L 400 40 L 0 40 Z"
                    fill="url(#ps4GradA-btnUsersPage)"
                  />
                </svg>

                {/* PS4 Sine Wave 2 (Lower luminous ribbon - counter undulating) */}
                <svg
                  className="absolute -bottom-1.5 left-0 w-[240%] h-[140%] ps4-wave-2 opacity-60 pointer-events-none"
                  viewBox="0 0 400 40"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="ps4GradB-btnUsersPage" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(129, 140, 248, 0.0)" />
                      <stop offset="35%" stopColor="rgba(96, 165, 250, 0.55)" />
                      <stop offset="65%" stopColor="rgba(56, 189, 248, 0.75)" />
                      <stop offset="100%" stopColor="rgba(129, 140, 248, 0.0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 20 Q 50 38 100 20 T 200 20 T 300 20 T 400 20 L 400 40 L 0 40 Z"
                    fill="url(#ps4GradB-btnUsersPage)"
                  />
                </svg>

                {/* PS4 Ambient Light Glint Sweep */}
                <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent ps4-glint pointer-events-none" />
              </div>

              {/* Content Layer (Above Waves) */}
              <UserPlus size={17} className="relative z-10 shrink-0 text-white drop-shadow-sm group-hover:scale-105 transition-transform" />
              <span className="relative z-10 font-semibold text-sm tracking-wide text-white drop-shadow-xs truncate">
                Create User
              </span>
              <span className="relative z-10 ml-auto flex items-center justify-center shrink-0">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.95)]" />
              </span>
            </button>
          )
        }
      />

      <SectionCard
        title={`${filteredUsers.length} users`}
        subtitle="All provisioned accounts with access rights"
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, TTT-NB ID..."
                className="w-full h-8.5 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0B1EE6] outline-none transition-all"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8.5 px-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">{isTsm ? 'All Roles (TSE & TSM)' : 'All Roles'}</option>
              {availableFilterRoles.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                <th className="py-3 font-semibold">User Profile</th>
                <th className="font-semibold">Email</th>
                <th className="font-semibold">Role</th>
                <th className="font-semibold">Department</th>
                <th className="font-semibold">Status</th>
                <th className="text-right pr-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const roleMeta = ASSIGNABLE_ROLES.find(r => r.id === u.role) || {
                    label: ROLES[u.role]?.label || u.role,
                    color: 'text-slate-600 bg-slate-100 border-slate-200',
                  };

                  return (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || DEFAULT_AVATAR}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10 bg-slate-100"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {u.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {u.tttNbId || u.empId || 'TTT-NB-MEMBER'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                        {u.email}
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${roleMeta.color}`}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {u.dept}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>
                      <td className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Icon */}
                          <button
                            type="button"
                            title="View User Credentials"
                            data-testid={`btn-view-user-${u.id}`}
                            onClick={() => {
                              setSelectedUserForView(u);
                              setViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Pencil Icon (Edit) */}
                          <button
                            type="button"
                            title="Edit User (Naam, ID, Pass, Dept)"
                            data-testid={`btn-edit-user-${u.id}`}
                            onClick={() => {
                              setSelectedUserForEdit(u);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* Dustbin Icon (Delete) */}
                          <button
                            type="button"
                            title="Delete User from DB & Roster"
                            data-testid={`btn-delete-user-${u.id}`}
                            onClick={() => {
                              setSelectedUserForDelete(u);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Management User Creation Modal */}
      <CreateUserModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

      {/* View User Modal */}
      <ViewUserModal
        user={selectedUserForView}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        onEditClick={(u) => {
          setSelectedUserForEdit(u);
          setEditModalOpen(true);
        }}
      />

      {/* Edit User Modal (Naam, ID, Pass, Dept) */}
      <EditUserModal
        user={selectedUserForEdit}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      {/* Delete User Confirmation Dialog */}
      <DeleteUserDialog
        user={selectedUserForDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
};

export const Settings = () => {
  const { userAvatar } = useApp();
  const [org, setOrg] = useState('NetBounce');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const save = () => toast.success('Settings saved.');

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="General configuration and permissions." />
      <Tabs defaultValue="general">
        <TabsList className="bg-slate-100 border border-slate-200">
          <TabsTrigger value="general" data-testid="set-tab-general">General</TabsTrigger>
          <TabsTrigger value="users" data-testid="set-tab-users">User Management</TabsTrigger>
          <TabsTrigger value="perms" data-testid="set-tab-perms">Permissions</TabsTrigger>
          <TabsTrigger value="system" data-testid="set-tab-system">System</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4 space-y-5">
          {/* 100+ Avatars Option in Settings */}
          <SectionCard title="Employee Profile Avatar" subtitle="Choose from 100+ high-resolution avatars to customize your presence">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/20 dark:to-slate-900 border border-blue-200/70 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-[#1416c1] via-cyan-400 to-blue-300 shadow-md overflow-hidden">
                    <img src={userAvatar} alt="Current Avatar" className="w-full h-full rounded-full object-cover bg-white" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#1416c1] text-cyan-300 border border-white flex items-center justify-center shadow-xs">
                    <Sparkles size={11} />
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Active Avatar</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">112 Avatars across 4 curated collections</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#1416c1] dark:text-cyan-400">
                    <span>Tech & Notionists</span> • <span>Portraits</span> • <span>3D Avatars</span> • <span>Personas</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                data-testid="open-avatar-picker-settings"
                className="btn-primary h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles size={14} /> Open 100+ Avatars Gallery
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Organization">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Organization name</label><Input value={org} onChange={e => setOrg(e.target.value)} className="mt-1.5 bg-white border-slate-300 text-slate-900" /></div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div><div className="text-sm font-semibold text-slate-900">Email notifications</div><div className="text-xs text-slate-500 font-medium">Receive updates to your mailbox</div></div><Switch checked={notifEnabled} onCheckedChange={setNotifEnabled} data-testid="set-notif-toggle" /></div>
            </div>
            <div className="mt-4"><button onClick={save} className="btn-primary h-9 px-4 rounded-lg text-sm font-semibold">Save changes</button></div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="users" className="mt-4"><Users /></TabsContent>
        <TabsContent value="perms" className="mt-4">
          <SectionCard title="Role permissions matrix">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 font-semibold">Module</th>
                    {Object.values(ROLES).map(r => <th key={r.id} className="font-semibold">{r.short}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {['dashboard','tasks','interviews','calendar','analytics','notifications','team','users','reports','settings'].map(mod => (
                    <tr key={mod} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 font-semibold text-slate-900 capitalize">{mod}</td>
                      {Object.values(ROLES).map(r => (
                        <td key={r.id} className="text-slate-600 font-medium">{permissionsByRole[r.id].includes(mod) ? <span className="text-emerald-700 font-bold">✓</span> : '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="system" className="mt-4">
          <SectionCard title="System preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Date format</label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger className="mt-1.5 bg-white border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem><SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div><div className="text-sm font-semibold text-slate-900">Weekly digest</div><div className="text-xs text-slate-500 font-medium">Email a summary every Monday</div></div><Switch defaultChecked /></div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
      <AvatarPickerModal open={avatarModalOpen} onOpenChange={setAvatarModalOpen} />
    </div>
  );
};

export const Profile = () => {
  const { currentUser, tasks, userAvatar } = useApp();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  if (!currentUser) return null;
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const completed = myTasks.filter(t => t.status === 'Completed').length;
  const rate = myTasks.length ? Math.round((completed/myTasks.length)*100) : 0;
  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" />
      <SectionCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)} title="Click to change avatar">
              <div className="h-20 w-20 rounded-2xl p-[3px] bg-gradient-to-tr from-[#1416c1] via-cyan-400 to-blue-300 shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                <img src={userAvatar} alt={currentUser.name} className="w-full h-full rounded-[13px] object-cover bg-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#1416c1] text-cyan-300 border-2 border-white flex items-center justify-center shadow-md">
                <Sparkles size={12} />
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
              <div className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">{currentUser.dept} · {currentUser.email}</div>
              <div className="mt-2.5 flex items-center gap-2.5">
                <StatusBadge value="Completed" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">TTT-NB ID: {currentUser.tttNbId || currentUser.empId}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAvatarModalOpen(true)}
            data-testid="profile-change-avatar-btn"
            className="btn-primary h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles size={14} /> Change Avatar (100+)
          </button>
        </div>
      </SectionCard>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Tasks completed" value={completed} icon={UserIcon} />
        <KpiCard label="Completion rate" value={`${rate}%`} icon={Shield} />
        <KpiCard label="Interviews" value={6} icon={UserIcon} />
        <KpiCard label="Productivity" value="A+" icon={SettingsIcon} />
      </div>
      <AvatarPickerModal open={avatarModalOpen} onOpenChange={setAvatarModalOpen} />
    </div>
  );
};

export const Preferences = () => {
  const [dense, setDense] = useState(false);
  const [sound, setSound] = useState(true);
  return (
    <div className="space-y-6">
      <PageHeader title="Preferences" subtitle="Personalize your workspace." />
      <SectionCard title="Interface">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div><div className="text-sm font-semibold text-slate-900">Dense layout</div><div className="text-xs text-slate-500 font-medium">More rows per screen</div></div><Switch checked={dense} onCheckedChange={setDense} /></div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div><div className="text-sm font-semibold text-slate-900">Sound notifications</div><div className="text-xs text-slate-500 font-medium">Chime on new activity</div></div><Switch checked={sound} onCheckedChange={setSound} /></div>
        </div>
      </SectionCard>
    </div>
  );
};
