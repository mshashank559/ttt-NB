import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, UserRoundCheck, CalendarRange, LineChart, Bell,
  Users, FileBarChart, Settings as SettingsIcon, UserCircle, Sliders, LogOut, Search,
  ChevronLeft, PanelLeft, Menu, X, Boxes, MessageSquareQuote,
  Sparkles, ChevronDown, UserPlus,
} from 'lucide-react';
import AvatarPickerModal from './AvatarPickerModal';
import NbAiPanel from './NbAiPanel';
import { useApp } from '../context/AppContext';
import { ROLES, permissionsByRole } from '../data/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Badge } from './ui/badge';

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { key: 'tasks', label: 'Tasks', to: '/tasks', icon: ClipboardList },
      { key: 'interviews', label: 'Interviews', to: '/interviews', icon: UserRoundCheck },
      { key: 'calendar', label: 'Calendar', to: '/calendar', icon: CalendarRange },
      { key: 'feedback', label: 'Feedback', to: '/feedback', icon: MessageSquareQuote },
      { key: 'analytics', label: 'Analytics', to: '/analytics', icon: LineChart },
      { key: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell },
    ],
  },
  {
    title: 'Management',
    items: [
      { key: 'team', label: 'Team', to: '/team', icon: Users },
      { key: 'users', label: 'Users', to: '/users', icon: Users },
      { key: 'reports', label: 'Reports', to: '/reports', icon: FileBarChart },
      { key: 'settings', label: 'Settings', to: '/settings', icon: SettingsIcon },
    ],
  },
  {
    title: 'User',
    items: [
      { key: 'profile', label: 'My Profile', to: '/profile', icon: UserCircle },
      { key: 'profile', label: 'Preferences', to: '/preferences', icon: Sliders },
    ],
  },
];

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/interviews': 'Interviews',
  '/calendar': 'Calendar',
  '/feedback': 'Feedback',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/team': 'Team',
  '/users': 'Users',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'My Profile',
  '/preferences': 'Preferences',
};

const Sidebar = ({ mobile, onClose, onOpenAvatarModal }) => {
  const { currentRole, currentUser, userAvatar, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const location = useLocation();
  const allowed = permissionsByRole[currentRole] || [];
  const collapsed = !mobile && sidebarCollapsed;

  const sections = useMemo(() => NAV_SECTIONS.map(sec => ({
    ...sec,
    items: sec.items.filter(it => allowed.includes(it.key)),
  })).filter(sec => sec.items.length), [allowed]);

  return (
    <aside
      className={`flex flex-col h-full bg-gradient-to-b from-[#141dc7] via-[#10199e] to-[#0c147e] border-r border-blue-900/30 text-white shadow-2xl rounded-r-[32px] overflow-hidden transition-[width] duration-250 ${collapsed ? 'w-[84px]' : 'w-[264px]'} ${mobile ? 'w-[264px]' : ''}`}
      data-testid="sidebar"
    >
      <div className={`h-16 flex items-center ${collapsed ? 'justify-between px-2.5' : 'justify-between px-4'} border-b border-white/10 shrink-0`}>
        <div
          className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'cursor-pointer' : ''}`}
          onClick={collapsed ? () => setSidebarCollapsed(false) : undefined}
          title={collapsed ? "NetBounce - Click to expand" : undefined}
        >
          <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-md p-1.5 shrink-0">
            <img src="/intro-assets/nb_mark_white.png" alt="NetBounce Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <div className="text-sm font-bold text-white whitespace-nowrap truncate">Tech Team Tracker</div>
              <div className="text-[10px] uppercase tracking-wider text-blue-200/80 font-medium truncate">NetBounce Operations</div>
            </div>
          )}
        </div>
        {mobile ? (
          <button data-testid="sidebar-close-mobile" onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-md shrink-0"><X size={18} /></button>
        ) : (
          <button
            data-testid="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-blue-200 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors shrink-0"
            aria-label="Toggle sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Top Employee Profile Avatar (Image 2 & 3 style, click to choose from 100+ avatars) */}
      <div className="pt-3.5 pb-2.5 px-3 border-b border-white/10 bg-white/5 shrink-0">
        {!collapsed ? (
          <div
            onClick={onOpenAvatarModal}
            role="button"
            tabIndex={0}
            data-testid="sidebar-avatar-card"
            title="Click to customize avatar (100+ available)"
            className="group flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-cyan-300/60 shadow-lg shadow-black/10 transition-all cursor-pointer select-none"
          >
            <div className="relative shrink-0">
              <div className="h-11 w-11 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-white to-blue-300 shadow-md overflow-hidden">
                <img
                  src={userAvatar}
                  alt={currentUser?.name || 'User'}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#1416c1] border border-white text-cyan-300 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Sparkles size={9} />
              </span>
            </div>
            <div className="min-w-0 flex-1 leading-tight text-left">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1 group-hover:text-cyan-200 transition-colors">
                <span>{currentUser?.name || 'Employee Profile'}</span>
              </div>
              <div className="text-[10px] text-blue-200/90 font-medium truncate mt-0.5">
                {ROLES[currentRole]?.label || 'Active Member'}
              </div>
              <div className="text-[9px] text-cyan-300 font-semibold tracking-wide uppercase flex items-center gap-1 mt-1 opacity-85 group-hover:opacity-100">
                <span>100+ Avatars</span>
                <span className="text-white/70">→</span>
              </div>
            </div>
          </div>
        ) : (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onOpenAvatarModal}
                  data-testid="sidebar-avatar-collapsed"
                  className="w-full flex justify-center py-1 group cursor-pointer"
                  aria-label="Change profile avatar"
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-white to-blue-300 shadow-md group-hover:scale-110 transition-transform overflow-hidden">
                      <img
                        src={userAvatar}
                        alt={currentUser?.name || 'User'}
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#1416c1] border border-white text-cyan-300 flex items-center justify-center shadow-xs">
                      <Sparkles size={7} />
                    </span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#10199e] text-white border-blue-400/30 font-semibold text-xs">
                {currentUser?.name || 'User'} • Customize Avatar (100+)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map(sec => (
          <div key={sec.title}>
            {!collapsed && <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-200/80">{sec.title}</div>}
            <ul className="space-y-1">
              {sec.items.map(item => {
                const Active = location.pathname === item.to;
                const Icon = item.icon;
                const content = (
                  <Link
                    to={item.to}
                    onClick={mobile ? onClose : undefined}
                    data-testid={`nav-${item.to.replace('/', '')}`}
                    className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all overflow-hidden ${
                      Active
                        ? 'text-white font-bold border border-white/35 shadow-md shadow-blue-950/30'
                        : 'text-white/80 hover:bg-white/10 hover:text-white font-medium border border-transparent'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    {/* PS4 Smooth Wave Motion (Strictly Inside Active Box, Behind Text) */}
                    {Active && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl z-0">
                        {/* Ambient base translucent tint */}
                        <div className="absolute inset-0 bg-white/12 backdrop-blur-sm" />
                        
                        {/* PS4 Sine Wave 1 (Upper luminous ribbon) */}
                        <svg
                          className="absolute -top-2 left-0 w-[240%] h-[140%] ps4-wave-1 opacity-75 pointer-events-none"
                          viewBox="0 0 400 40"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id={`ps4GradA-${item.key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.0)" />
                              <stop offset="25%" stopColor="rgba(147, 197, 253, 0.45)" />
                              <stop offset="50%" stopColor="rgba(103, 232, 249, 0.8)" />
                              <stop offset="75%" stopColor="rgba(255, 255, 255, 0.55)" />
                              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 0 20 Q 50 2 100 20 T 200 20 T 300 20 T 400 20 L 400 40 L 0 40 Z"
                            fill={`url(#ps4GradA-${item.key})`}
                          />
                        </svg>

                        {/* PS4 Sine Wave 2 (Lower luminous ribbon - counter undulating) */}
                        <svg
                          className="absolute -bottom-2 left-0 w-[240%] h-[140%] ps4-wave-2 opacity-60 pointer-events-none"
                          viewBox="0 0 400 40"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id={`ps4GradB-${item.key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(129, 140, 248, 0.0)" />
                              <stop offset="35%" stopColor="rgba(96, 165, 250, 0.55)" />
                              <stop offset="65%" stopColor="rgba(56, 189, 248, 0.75)" />
                              <stop offset="100%" stopColor="rgba(129, 140, 248, 0.0)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 0 20 Q 50 38 100 20 T 200 20 T 300 20 T 400 20 L 400 40 L 0 40 Z"
                            fill={`url(#ps4GradB-${item.key})`}
                          />
                        </svg>

                        {/* PS4 Ambient Light Glint Sweep */}
                        <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white/25 to-transparent ps4-glint pointer-events-none" />
                      </div>
                    )}

                    <Icon size={17} className={`relative z-10 shrink-0 ${Active ? 'text-white drop-shadow-sm' : 'text-blue-100 group-hover:text-white'}`} />
                    {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                    {Active && !collapsed && (
                      <span className="relative z-10 ml-auto h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.95)]" />
                    )}
                  </Link>
                );
                return (
                  <li key={item.to}>
                    {collapsed ? (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>{content}</TooltipTrigger>
                          <TooltipContent side="right" className="bg-[#10199e] text-white border-blue-400/30">{item.label}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : content}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 bg-black/10">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'}`}>
          <div className="h-8 w-8 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold flex items-center justify-center shadow-xs backdrop-blur-xs">
            {ROLES[currentRole]?.short}
          </div>
          {!collapsed && (
            <div className="text-xs">
              <div className="text-white font-semibold leading-tight">Active role</div>
              <div className="text-blue-200/90 text-[11px]">{ROLES[currentRole]?.label}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const CommandPalette = () => {
  const { cmdOpen, setCmdOpen, tasks, visibleInterviews, users, currentRole } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCmdOpen]);

  const go = (to) => { setCmdOpen(false); navigate(to); };

  return (
    <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
      <CommandInput placeholder="Search tasks, interviews, people, actions..." data-testid="command-input" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {permissionsByRole[currentRole]?.map(mod => (
            <CommandItem key={mod} onSelect={() => go(`/${mod}`)}>Go to {mod}</CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {tasks.slice(0, 8).map(t => (
            <CommandItem key={t.id} onSelect={() => go('/tasks')}>
              <span className="mono text-xs text-blue-300 mr-2">{t.id}</span>{t.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Interviews">
          {visibleInterviews.slice(0, 6).map(i => (
            <CommandItem key={i.id} onSelect={() => go('/interviews')}>
              <span className="mono text-xs text-blue-300 mr-2">{i.id}</span>{i.position} • {i.status}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {users.slice(0, 6).map(u => (
            <CommandItem key={u.id} onSelect={() => go('/team')}>{u.name} — {u.dept}</CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

const TopBar = ({ onOpenMobileNav, onOpenAvatarModal, onOpenAiPanel }) => {
  const { currentUser, currentRole, logout, loginAs, notifications, unreadCount, markNotificationRead, markAllRead, setCmdOpen, userAvatar } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const page = breadcrumbMap[location.pathname] || 'Dashboard';

  return (
    <header className="h-16 flex-shrink-0 flex items-center gap-3 md:gap-4 px-4 md:px-6 border-b border-slate-300/90 dark:border-white/10 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <button data-testid="mobile-nav-toggle" onClick={onOpenMobileNav} className="lg:hidden text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Menu size={18} /></button>
      <div className="hidden sm:flex items-center gap-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Operations</span>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">{page}</span>
      </div>
      <div className="flex-1" />

      {/* Search Input Button */}
      <button
        data-testid="topbar-search-btn"
        onClick={() => setCmdOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-100 dark:bg-[#131D33] border border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 text-slate-500 dark:text-slate-400 text-sm transition-colors min-w-[240px] lg:min-w-[280px]"
      >
        <Search size={14} className="text-slate-400" />
        <span className="flex-1 text-left text-slate-500 dark:text-slate-400">Search tasks, interviews, people…</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 font-mono">Ctrl K</kbd>
      </button>

      {/* Circular NetBounce Logo Button (Circle only, no text) */}
      <button
        type="button"
        onClick={onOpenAiPanel}
        data-testid="topbar-ai-btn"
        title="NetBounce AI Assistant"
        className="relative group h-9 w-9 rounded-full bg-gradient-to-tr from-[#141dc7] via-[#10199e] to-[#0c147e] hover:from-[#1d27ee] hover:to-[#141dc7] text-white flex items-center justify-center shadow-md shadow-blue-900/40 border border-blue-400/40 hover:border-cyan-300/80 transition-all cursor-pointer overflow-hidden shrink-0 hover:scale-105 active:scale-95"
      >
        {/* Ambient shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        
        {/* NetBounce Logo mark only */}
        <div className="h-5 w-5 flex items-center justify-center p-0.5">
          <img src="/intro-assets/nb_mark_white.png" alt="NetBounce Logo" className="w-full h-full object-contain" />
        </div>
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <button data-testid="notifications-bell" className="relative h-9 w-9 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-[#131D33] hover:bg-slate-200/70 dark:hover:bg-[#182645] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-xs">
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[380px] p-0 bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/15 shadow-xl text-slate-800 dark:text-slate-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-white/10">
            <div className="font-bold text-sm text-slate-900 dark:text-white">Notifications</div>
            <button data-testid="mark-all-read-btn" onClick={markAllRead} className="text-xs text-[#1416c1] dark:text-blue-400 hover:underline font-semibold">Mark all read</button>
          </div>
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {notifications.slice(0, 8).map(n => (
              <button
                key={n.id}
                data-testid={`notif-item-${n.id}`}
                onClick={() => markNotificationRead(n.id)}
                className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1416c1] dark:bg-blue-400 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 dark:text-white font-semibold">{n.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{n.time}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
            <button onClick={() => navigate('/notifications')} className="w-full text-center text-xs text-[#1416c1] dark:text-blue-400 hover:underline font-semibold py-1.5">View all notifications</button>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button data-testid="user-menu-btn" className="flex items-center gap-2.5 h-9 px-2 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-[#131D33] text-slate-700 dark:text-slate-200 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-white/10">
            <div className="h-7 w-7 rounded-full p-[1.5px] bg-gradient-to-tr from-[#1416c1] to-cyan-400 shadow-xs overflow-hidden shrink-0">
              <img src={userAvatar} alt="Profile" className="w-full h-full rounded-full object-cover bg-white" />
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-xs text-slate-900 dark:text-white font-bold">{currentUser?.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{ROLES[currentRole]?.label}</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-100 shadow-xl rounded-2xl w-56">
          <DropdownMenuLabel>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Signed in as</div>
            <div className="text-sm text-slate-900 dark:text-white font-semibold">{currentUser?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
          <DropdownMenuItem onClick={onOpenAvatarModal} data-testid="menu-avatar-change" className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer">
            <Sparkles size={14} className="mr-2 text-cyan-500" /> Change Avatar (100+)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile" className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white">
            <UserCircle size={14} className="mr-2 text-slate-500 dark:text-slate-400" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/preferences')} data-testid="menu-prefs" className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white">
            <Sliders size={14} className="mr-2 text-slate-500 dark:text-slate-400" /> Preferences
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/10" />
          <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} data-testid="menu-logout" className="text-rose-600 focus:text-rose-700 font-medium cursor-pointer">
            <LogOut size={14} className="mr-2" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiWaveActive, setAiWaveActive] = useState(false);
  const [waveOrigin, setWaveOrigin] = useState({ x: 0, y: 0 });
  const { theme } = useApp();

  const handleOpenAi = (e) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setWaveOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else if (typeof window !== 'undefined') {
      setWaveOrigin({ x: window.innerWidth - 300, y: 32 });
    }
    setAiWaveActive(true);
    setTimeout(() => {
      setAiWaveActive(false);
    }, 3000); // 3-second transparent blue wave
    setAiPanelOpen(true);
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#080D1A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} transition-colors duration-200`}>
      <div className="hidden lg:flex sticky top-0 h-screen">
        <Sidebar onOpenAvatarModal={() => setAvatarModalOpen(true)} />
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed top-0 left-0 h-screen z-50 lg:hidden"
            >
              <Sidebar mobile onClose={() => setMobileOpen(false)} onOpenAvatarModal={() => setAvatarModalOpen(true)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <main className={`flex-1 min-w-0 flex flex-col relative z-10 ${theme === 'dark' ? 'bg-[#080D1A]' : 'bg-[#F8FAFC]'} transition-colors duration-200`}>
        <TopBar
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenAvatarModal={() => setAvatarModalOpen(true)}
          onOpenAiPanel={handleOpenAi}
        />
        <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 min-w-0">
          <motion.div
            key={typeof window !== 'undefined' ? `${window.location.hash}-${theme}` : 'k'}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* 3-Second Blue Transparent Shockwave / Ripple Wave Effect */}
      <AnimatePresence>
        {aiWaveActive && (
          <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
            <motion.div
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 70, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: [0.1, 0.75, 0.2, 1] }}
              className="absolute rounded-full border-3 border-cyan-400 bg-gradient-to-r from-blue-600/30 via-cyan-400/20 to-transparent backdrop-blur-xs"
              style={{
                left: waveOrigin.x,
                top: waveOrigin.y,
                width: '50px',
                height: '50px',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0.75 }}
              animate={{ scale: 55, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.6, delay: 0.4, ease: [0.1, 0.75, 0.2, 1] }}
              className="absolute rounded-full border-2 border-blue-400/60 bg-blue-500/15"
              style={{
                left: waveOrigin.x,
                top: waveOrigin.y,
                width: '50px',
                height: '50px',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Left Rectangle Chat Box with 3D Holographic AI Core */}
      <NbAiPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />

      <CommandPalette />
      <AvatarPickerModal open={avatarModalOpen} onOpenChange={setAvatarModalOpen} />
    </div>
  );
}
