import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  USERS,
  INITIAL_TASKS,
  INITIAL_INTERVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EVENTS,
  INITIAL_FEEDBACK_RECORDS,
  TECH_SUPPORT_TEAM,
  ROLES,
  MARKETING_TEAMS,
  POC_USERS_BY_TEAM,
  roleIsMarketing,
  getTseCodeName,
  getTsmCodeName,
  formatTseNameForRole, resolveTse, resolveSr, getEligibleSrsForTeam,
  TSE_MAP,
  filterAuthorizedData,
  sanitizeForIdentityPrivacy,
  anonymizeInterview,
  getUserById,
} from '../data/mockData';
import { DEFAULT_AVATAR } from '../data/avatars';

const AppCtx = createContext(null);

// Realtime cross-tab and cross-window sync channel
const realtimeChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('ttt_realtime_stream')
  : null;

export const AppProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ttt_auth_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.userId && parsed.role) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse auth session:', e);
      }
    }
    return { userId: null, role: null };
  });

  const [currentRole, setCurrentRole] = useState(() => session.role);
  const [currentUserId, setCurrentUserId] = useState(() => session.userId);
  const [authLoading, setAuthLoading] = useState(false);
  const [tasks, setTasks] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ttt_tasks');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(t => t && !['TSK-TEST-01', 'TSK-1001', 'TSK-1002', 'TSK-1006', 'TSK-1007', 'TSK-1008', 'TSK-1009', 'TSK-1010', 'TSK-1011'].includes(t.id));
            if (filtered.length !== parsed.length) {
              localStorage.setItem('ttt_tasks', JSON.stringify(filtered));
            }
            return filtered;
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved tasks:', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Cross-tab & multi-window instant synchronization for tasks
  React.useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ttt_tasks' && e.newValue) {
        try {
          setTasks(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);

    // Instant BroadcastChannel listener (0ms cross-tab latency)
    const handleBroadcast = (e) => {
      const data = e?.data;
      if (!data) return;
      if (data.type === 'TASK_UPDATED' && data.task) {
        const incomingId = (data.task.id || '').toString().trim().toLowerCase();
        setTasks(prev => {
          const idx = (prev || []).findIndex(t => 
            t && (
              t.id === data.task.id || 
              t._id === data.task.id || 
              t.candidateId === data.task.id ||
              (t.id && t.id.toString().trim().toLowerCase() === incomingId)
            )
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...data.task };
            try { localStorage.setItem('ttt_tasks', JSON.stringify(next)); } catch (err) {}
            return next;
          }
          const next = [data.task, ...prev];
          try { localStorage.setItem('ttt_tasks', JSON.stringify(next)); } catch (err) {}
          return next;
        });
      } else if (data.type === 'TASK_CREATED' && data.task) {
        const incomingId = (data.task.id || '').toString().trim().toLowerCase();
        setTasks(prev => {
          const next = [data.task, ...(prev || []).filter(t => 
            !t || (t.id !== data.task.id && (t.id && t.id.toString().trim().toLowerCase() !== incomingId))
          )];
          try { localStorage.setItem('ttt_tasks', JSON.stringify(next)); } catch (err) {}
          return next;
        });
      }
    };
if (realtimeChannel) {
      realtimeChannel.addEventListener('message', handleBroadcast);
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (realtimeChannel) {
        realtimeChannel.removeEventListener('message', handleBroadcast);
      }
    };
  }, []);

  const updateTasksWithStorage = useCallback((updater) => {
    setTasks(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ttt_tasks', JSON.stringify(next));
        } catch (err) { }
      }
      return next;
    });
  }, []);
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [users, setUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ttt_users');
        if (saved) {
          const parsed = JSON.parse(saved);
          const hasOldFake = Array.isArray(parsed) && parsed.some(u =>
            u.email === 'aarav.mehta@netbounce.io' ||
            u.name === 'Aarav Mehta' ||
            u.name === 'Amber' ||
            u.id === 'u-mgmt-aarav'
          );
          if (hasOldFake) {
            localStorage.setItem('ttt_users', JSON.stringify(USERS));
            return USERS;
          }
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved users:', e);
      }
    }
    return USERS;
  });

  // Cross-tab synchronization for users
  React.useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ttt_users' && e.newValue) {
        try {
          setUsers(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [feedbacks, setFeedbacks] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ttt_feedbacks');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(f => f && !['test-check-fb', 'TSK-1009', 'TSK-1010', 'TSK-1011', 'fb-101'].includes(f.id));
            if (filtered.length !== parsed.length) {
              localStorage.setItem('ttt_feedbacks', JSON.stringify(filtered));
            }
            return filtered;
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved feedbacks:', e);
      }
    }
    return INITIAL_FEEDBACK_RECORDS;
  });

  // Cross-tab synchronization for feedbacks (e.g. candidate submitting in separate tab)
  React.useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ttt_feedbacks' && e.newValue) {
        try {
          setFeedbacks(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    let u = users.find(x => x.id === currentUserId) || getUserById(currentUserId);
    if (u) {
      if (u.role === 'marketing_tl') {
        const lowerName = (u.name || '').toLowerCase();
        const lowerEmail = (u.email || '').toLowerCase();
        const isMukesh = lowerName.includes('mukesh') || lowerEmail.includes('mukesh') || u.id === 'u-tl-mukesh' || u.teamId === 'team-mukesh';
        const isShivam = lowerName.includes('shivam') || lowerEmail.includes('shivam') || u.id === 'u-tl-shivam' || u.teamId === 'team-shivam';
        return {
          ...u,
          teamId: u.teamId || (isMukesh ? 'team-mukesh' : (isShivam ? 'team-shivam' : 'team-mukesh')),
          teamName: u.teamName || (isMukesh ? 'Team Mukesh' : (isShivam ? 'Team Shivam' : 'Team Mukesh')),
          teamLeadId: u.teamLeadId || u.id,
        };
      }
      return u;
    }
    return null;
  }, [currentUserId, users]);

  // Sync feedbacks to localStorage whenever changed
  const updateFeedbacksWithStorage = useCallback((updater) => {
    setFeedbacks(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ttt_feedbacks', JSON.stringify(next));
        } catch (err) { }
      }
      return next;
    });
  }, []);

  const [dbConnected, setDbConnected] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Live Fetch & Reconcile with MongoDB Atlas Backend
  const fetchLiveData = useCallback(async () => {
    try {
      let freshLiveTasks = [];
      const [tasksRes, feedbacksRes, usersRes, healthRes] = await Promise.all([
        fetch('/api/tasks').catch(() => null),
        fetch('/api/feedbacks').catch(() => null),
        fetch('/api/users').catch(() => null),
        fetch('/api/health').catch(() => null),
      ]);

      if (healthRes && healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.database === 'connected') {
          setDbConnected(true);
        }
      }

            if (tasksRes && tasksRes.ok) {
        const liveTasks = await tasksRes.json();
        if (Array.isArray(liveTasks)) {
          freshLiveTasks = liveTasks;
          updateTasksWithStorage(prev => {
            const map = new Map();
            // Authoritative server tasks
            liveTasks.forEach(t => {
              if (t && t.id) map.set(t.id, t);
            });

            // Protect in-flight local modifications created in the last 6 seconds
            (prev || []).forEach(localTask => {
              if (!localTask || !localTask.id) return;
              const localModTime = localTask._localModifiedAt || localTask._localCreatedAt || 0;
              if (localModTime && (Date.now() - localModTime < 6000)) {
                const existing = map.get(localTask.id);
                if (!existing) {
                  map.set(localTask.id, localTask);
                } else if (existing.status !== localTask.status) {
                  map.set(localTask.id, { ...existing, status: localTask.status, timeline: localTask.timeline });
                }
              }
            });

            const merged = Array.from(map.values());
            // Sort newest first
            merged.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
            return merged;
          });
        }
      }

      let finalFeedbacks = null;
      if (feedbacksRes && feedbacksRes.ok) {
        finalFeedbacks = await feedbacksRes.json().catch(() => null);
      }

      if (Array.isArray(finalFeedbacks)) {
        const currentTasks = freshLiveTasks.length > 0 ? freshLiveTasks : (tasks || []);
        // Ignore test probe records or feedbacks from deleted test tasks
        const validFeedbacks = finalFeedbacks.filter(fb => {
          if (!fb || !fb.id) return false;
          if (fb.id === 'test-check-fb') return false;
          if (fb.id.startsWith('TSK-') || fb.taskId?.startsWith('TSK-')) {
            const hasTask = currentTasks.some(t => t && (t.id === fb.id || t.id === fb.taskId));
            if (!hasTask) return false;
          }
          return true;
        });

        // Enrich feedback records with linked task metadata (candidateName, company, teamId, teamName, recruiterName, techSupport)
        const enriched = validFeedbacks.map(fb => {
          const tId = fb.taskId || fb.id;
          const match = currentTasks.find(t => t && (t.id === tId || t.candidateId === tId || (t.id && t.id.toLowerCase() === (tId || '').toLowerCase())));
          if (!match) return fb;
          return {
            ...fb,
            candidateName: fb.candidateName || match.candidateName || 'Candidate',
            company: fb.company || match.companyName || 'Client Assessment',
            recruiterName: fb.recruiterName || match.recruiterName || 'Unassigned',
            pocId: fb.pocId || match.pocId || '',
            teamId: fb.teamId || match.teamId || 'team-mukesh',
            teamName: fb.teamName || match.teamName || 'Team Mukesh',
            teamLeadId: fb.teamLeadId || match.teamLeadId || 'u-tl-mukesh',
            techSupport: (resolveTse(match?.assigneeId) || resolveTse(match?.techPerson) || resolveTse(match?.codeName) || resolveTse(fb.techSupportId) || resolveTse(fb.techSupport))?.supportName || match.codeName || match.techPerson || fb.techSupport || 'TSE',
            techSupportId: (resolveTse(match?.assigneeId) || resolveTse(match?.techPerson) || resolveTse(match?.codeName) || resolveTse(fb.techSupportId))?.empId || match.assigneeId || fb.techSupportId || 'TTT-NB-008',
            employeeName: (resolveTse(match?.assigneeId) || resolveTse(match?.techPerson) || resolveTse(match?.codeName) || resolveTse(fb.techSupportId) || resolveTse(fb.techSupport))?.realName || match.techPerson || fb.employeeName,
            techSupportType: fb.techSupportType || match.taskType || 'Interview',
            date: fb.date || match.date || fb.createdAt?.slice(0, 10),
          };
        });

        setFeedbacks(enriched);
        try {
          localStorage.setItem('ttt_feedbacks', JSON.stringify(enriched));
        } catch (e) { }
      }

      if (usersRes && usersRes.ok) {
        const liveUsers = await usersRes.json();
        if (Array.isArray(liveUsers) && liveUsers.length > 0) {
          setUsers(liveUsers);
          try {
            localStorage.setItem('ttt_users', JSON.stringify(liveUsers));
          } catch (e) { }
        }
      }
    } catch (err) {
      console.warn('Backend server offline, falling back to local storage/state:', err);
    }
  }, [currentRole, currentUserId, currentUser]);

    // Real-Time Cross-Dashboard Synchronization Engine
  React.useEffect(() => {
    // 1. Initial live sync
    fetchLiveData();

    // 2. High-frequency background sync (every 3.5s) to guarantee real-time reflection across all dashboards
    const interval = setInterval(() => {
      fetchLiveData();
    }, 3500);

    // 3. Immediate sync on window focus or tab visibility
    const handleFocus = () => fetchLiveData();
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchLiveData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchLiveData]);

  // Real-Time Cross-Role Sync Status
  React.useEffect(() => {
    // Cross-role updates are synchronized in real time via the 3.5s high-frequency polling engine & BroadcastChannel.
    // EventSource is omitted to prevent 404 console errors on environments where SSE reverse-proxying is not configured.
    setRealtimeConnected(true);
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ttt_user_avatar') || DEFAULT_AVATAR;
    }
    return DEFAULT_AVATAR;
  });

  const updateUserAvatar = useCallback((url) => {
    setUserAvatar(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ttt_user_avatar', url);
    }
    toast.success('Profile avatar updated!');
  }, []);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ttt_theme') || 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ttt_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const login = useCallback(async (emailOrId, password) => {
    if (!emailOrId || !password) {
      throw new Error('Please enter both Email/ID and Password.');
    }
    const cleanInput = emailOrId.trim();
    const cleanLower = cleanInput.toLowerCase();

    setAuthLoading(true);

    try {
      let authUser = null;

      // 1. First attempt to authenticate against MongoDB backend
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrId: cleanInput, password }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.user) {
            authUser = data.user;
          }
        } else {
          const errData = await res.json().catch(() => null);
          if (errData && errData.error) {
            throw new Error(errData.error);
          }
        }
      } catch (apiErr) {
        // If error message indicates invalid credentials or inactive account, fail immediately
        if (apiErr.message && (
          apiErr.message.includes('credentials') ||
          apiErr.message.includes('password') ||
          apiErr.message.includes('inactive') ||
          apiErr.message.includes('No account found')
        )) {
          throw apiErr;
        }
        // If server is unreachable/offline, continue to local registry below
      }

      // 2. Validate against known users registry if backend didn't return
      if (!authUser) {
        const allKnownUsers = users && users.length > 0 ? users : USERS;
        const matched = allKnownUsers.find(u =>
          (u.email && u.email.toLowerCase() === cleanLower) ||
          (u.id && u.id.toLowerCase() === cleanLower) ||
          (u.empId && u.empId.toLowerCase() === cleanLower) ||
          (u.tttNbId && u.tttNbId.toLowerCase() === cleanLower)
        );

        if (!matched) {
          throw new Error('Invalid credentials: No account found with this Email or ID.');
        }

        if (matched.status && matched.status.toLowerCase() !== 'active') {
          throw new Error('Your account is currently inactive. Please contact Management.');
        }

        if (matched.password && matched.password !== password) {
          throw new Error('Invalid credentials: Incorrect password.');
        }

        authUser = matched;
      }

      if (!authUser || !authUser.role) {
        throw new Error('Authentication failed: No assigned role found for this user.');
      }

      const finalRole = authUser.role;
      const finalUserId = authUser.id;

      // Persist session to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ttt_auth_session', JSON.stringify({
            userId: finalUserId,
            role: finalRole,
            email: authUser.email,
            name: authUser.name,
          }));
        } catch (e) {}
      }

      setCurrentRole(finalRole);
      setCurrentUserId(finalUserId);
      setSession({ userId: finalUserId, role: finalRole });

      toast.success(`Welcome, ${authUser.name}!`);
      return authUser;
    } finally {
      setAuthLoading(false);
    }
  }, [users]);

  const loginAs = useCallback((roleId, userId) => {
    const allUsers = users && users.length > 0 ? users : USERS;
    let user = null;
    if (userId) {
      user = allUsers.find(u => u.id === userId);
    } else {
      user = allUsers.find(u => u.role === roleId);
    }
    if (!user) {
      toast.error(`Account for ${roleId} not found.`);
      return;
    }
    const finalRole = user.role;
    const finalUserId = user.id;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ttt_auth_session', JSON.stringify({
          userId: finalUserId,
          role: finalRole,
          email: user.email,
          name: user.name,
        }));
      } catch (e) {}
    }

    setCurrentRole(finalRole);
    setCurrentUserId(finalUserId);
    setSession({ userId: finalUserId, role: finalRole });
    toast.success(`Signed in as ${user.name}`);
  }, [users]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ttt_auth_session');
      } catch (e) {}
    }
    setCurrentRole(null);
    setCurrentUserId(null);
    setSession({ userId: null, role: null });
    toast.info('Signed out successfully.');
  }, []);

  const addUser = useCallback((newUser) => {
    setUsers(prev => {
      const updated = [newUser, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ttt_users', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Also sync to backend API if available
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(() => { });

    const roleName = ROLES[newUser.role]?.label || newUser.role;
    toast.success(`User "${newUser.name}" provisioned as ${roleName}!`);
  }, []);

  const updateUser = useCallback((userId, updatedData) => {
    setUsers(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.empId === userId || u.tttNbId === userId) {
          return { ...u, ...updatedData };
        }
        return u;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ttt_users', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Sync to MongoDB Atlas backend
    fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    }).catch(err => console.warn('Failed to sync user update to server:', err));

    toast.success('User updated successfully.');
  }, []);

  const deleteUser = useCallback((userId) => {
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== userId && u.empId !== userId && u.tttNbId !== userId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ttt_users', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Sync deletion to MongoDB Atlas backend
    fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Failed to delete user on server:', err));

    toast.success('User deleted successfully from database and roster.');
  }, []);

  const addTask = useCallback((task) => {
    const id = `TSK-${1001 + tasks.length}`;
    const candidateId = task.candidateId || `CND-${2001 + tasks.length}`;
    const assignee = getUserById(task.assigneeId);
    const creator = currentUser;
    const candidateName = task.candidateName || 'Candidate';
    const taskType = task.taskType || 'Interview';
    const date = task.date || new Date().toISOString().slice(0, 10);
    const assignedTeam = MARKETING_TEAMS.find(t => t.id === task.teamId || t.name === task.teamName) || MARKETING_TEAMS[0];
    const hasExplicitPoc = task.pocId && task.pocId !== 'unassigned' && task.pocId !== '';
    const assignedPoc = hasExplicitPoc ? (resolveSr(task.pocId || task.recruiterName, users) || { id: task.pocId, name: task.recruiterName }) : null;
    const finalPocId = assignedPoc?.id || (hasExplicitPoc ? task.pocId : '');
    const finalRecruiterName = assignedPoc?.name || (hasExplicitPoc ? task.recruiterName : 'Unassigned');
    const codeName = assignee?.codeName || getTseCodeName(assignee?.name);

    const newTask = {
      ...task,
      id,
      candidateId,
      date,
      dueDate: date,
      createdAt: date,
      techPerson: assignee?.name || task.techPerson || 'Unassigned',
      codeName,
      candidateName,
      title: `${candidateName} — ${taskType} (${task.companyName || 'Assessment'})`,
      position: task.position || 'Software Engineer',
      companyName: (task.companyName || task.company || '').trim() || '—',
      company: (task.companyName || task.company || '').trim() || '—',
      taskType,
      duration: task.duration || '30 mins',
      status: task.status || 'Pending',
      remark: task.remark || '',
      description: task.description || '',
      notes: task.notes || '',
      teamId: assignedTeam.id,
      teamName: assignedTeam.name,
      teamLeadId: assignedTeam.leadId,
      marketingTl: assignedTeam.leadName,
      teamLeadName: assignedTeam.leadName,
      pocId: finalPocId,
      recruiterName: finalRecruiterName,
      assigneeId: assignee?.id || task.assigneeId,
      createdById: creator?.id || 'u-tsm-01',
      createdByRole: currentRole || 'tsm',
      timeline: [
        { at: date, event: `Assigned to ${assignee?.name || 'Unassigned'} for ${taskType}`, by: creator?.name || 'TSM' },
      ],
    };
    updateTasksWithStorage(prev => [newTask, ...prev.filter(t => t.id !== newTask.id)]);

    if (realtimeChannel) {
      try {
        realtimeChannel.postMessage({
          type: 'TASK_CREATED',
          task: newTask,
          timestamp: Date.now(),
        });
      } catch (err) {}
    }

    // Also auto-create linked feedback session for Marketing console
    const matchingTse = TECH_SUPPORT_TEAM.find(t =>
      t.supportName.toLowerCase() === (assignee?.name || '').toLowerCase() ||
      t.employeeName.toLowerCase().includes((assignee?.name || '').toLowerCase())
    ) || TECH_SUPPORT_TEAM[0];

    const linkedFeedback = {
      id: `fb-task-${id}`,
      taskId: id,
      date,
      techSupport: codeName,
      techSupportId: assignee?.id || matchingTse.id,
      techSupportEmail: matchingTse.email,
      employeeName: assignee?.name || matchingTse.employeeName,
      candidateName,
      candidateEmail: task.candidateEmail || '',
      recruiterName: finalRecruiterName,
      pocId: finalPocId,
      teamId: assignedTeam.id,
      teamLeadId: assignedTeam.leadId,
      teamName: assignedTeam.name,
      jobRole: task.position || 'Software Engineer',
      company: (task.companyName || task.company || '').trim() || '—',
      round: taskType,
      techSupportType: taskType,
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      candidateFeedback: {
        submitted: false,
        performanceRating: null,
        experienceRating: null,
        comments: '',
        timestamp: null,
      },
      marketingReview: null,
    };
    updateFeedbacksWithStorage(prev => [linkedFeedback, ...prev]);

    // Save in MongoDB Atlas (Mumbai)
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    })
      .then(res => res.json())
      .then(() => {
        fetch('/api/feedbacks')
          .then(res => res.json())
          .then(list => {
            if (Array.isArray(list) && list.length > 0) {
              setFeedbacks(list);
              try { localStorage.setItem('ttt_feedbacks', JSON.stringify(list)); } catch (e) { }
            }
          })
          .catch(() => { });
      })
      .catch(() => { });

    const newNotifications = [
      {
        id: `n-${Date.now()}-tse`,
        type: 'task',
        title: 'New task assigned',
        message: `${id}: ${candidateName} (${taskType}) assigned to you`,
        time: 'just now',
        read: false,
        targetUserId: assignee?.id,
      },
      {
        id: `n-${Date.now()}-creator`,
        type: 'task',
        title: 'Task created',
        message: `${id}: ${candidateName} assigned to ${formatTseNameForRole(assignee || task.techPerson, 'tsm')}`,
        time: 'just now',
        read: false,
        targetUserId: creator?.id,
      },
    ];

    if (assignedTeam?.leadId) {
      newNotifications.push({
        id: `n-${Date.now()}-tl`,
        type: 'task',
        title: 'New task for your team',
        message: finalPocId
          ? `${id}: ${candidateName} (${taskType}) assigned to ${finalRecruiterName}`
          : `${id}: ${candidateName} (${taskType}) awaits Marketing SR assignment`,
        time: 'just now',
        read: false,
        targetUserId: assignedTeam.leadId,
      });
    }

    if (finalPocId) {
      newNotifications.push({
        id: `n-${Date.now()}-sr`,
        type: 'task',
        title: 'New candidate assigned',
        message: `${id}: ${candidateName} (${taskType}) assigned to you`,
        time: 'just now',
        read: false,
        targetUserId: finalPocId,
      });
    }

    setNotifications(prev => [...newNotifications, ...prev]);
    toast.success('Task created successfully.');
    return newTask;
  }, [tasks.length, currentUser, currentRole, users, updateFeedbacksWithStorage]);

  const updateTask = useCallback(async (id, patch, note) => {
    if (!id) return;
    const cleanId = (id || '').toString().trim().toLowerCase();

    // 1. Synchronously resolve current task from active tasks state or storage
    let currentTask = (tasks || []).find(t => 
      t && (
        t.id === id || 
        t._id === id || 
        t.candidateId === id || 
        (t.id && t.id.toString().trim().toLowerCase() === cleanId)
      )
    );

    if (!currentTask && typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('ttt_tasks') || '[]');
        currentTask = saved.find(t => 
          t && (
            t.id === id || 
            t._id === id || 
            t.candidateId === id || 
            (t.id && t.id.toString().trim().toLowerCase() === cleanId)
          )
        );
      } catch (e) {}
    }

    if (!currentTask) {
      currentTask = { id };
    }

    const previousTask = { ...currentTask };
    const nowIso = new Date().toISOString();
    const updatedTask = {
      ...currentTask,
      ...patch,
      id: currentTask.id || id,
      _localModifiedAt: Date.now(),
      updatedAt: nowIso
    };

    if (note) {
      updatedTask.timeline = [
        ...(currentTask.timeline || []),
        { at: nowIso.slice(0, 10), event: note, by: currentUser?.name || 'System' },
      ];
    }

    // 2. Safe optimistic update in local state & localStorage
    updateTasksWithStorage(prev => {
      let matched = false;
      const next = (prev || []).map(t => {
        const match = t && (
          t.id === id || 
          t._id === id || 
          t.candidateId === id || 
          (t.id && t.id.toString().trim().toLowerCase() === cleanId)
        );
        if (!match) return t;
        matched = true;
        return updatedTask;
      });
      return matched ? next : [updatedTask, ...next];
    });

    // 3. Instant BroadcastChannel delivery across all open tabs/windows (0ms latency)
    if (realtimeChannel) {
      try {
        realtimeChannel.postMessage({
          type: 'TASK_UPDATED',
          task: updatedTask,
          timestamp: Date.now(),
        });
      } catch (err) {}
    }

    // 4. Persist to backend and confirm database commit
    try {
      const sanitizedPayload = { ...updatedTask };
      delete sanitizedPayload._id; // Prevent MongoDB immutable field error
      delete sanitizedPayload._localModifiedAt;

      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedPayload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const serverTask = await res.json().catch(() => null);
      if (serverTask && serverTask.id) {
        updateTasksWithStorage(prev => prev.map(t => (t.id === serverTask.id ? { ...t, ...serverTask } : t)));
      }

      // Show confirmed success notification
      toast.success(note || `Status changed to ${patch.status || 'Updated'}`);

      // Trigger background sync to refresh all dependent analytics and views
      fetchLiveData();
      return updatedTask;
    } catch (err) {
      console.error('Failed to save task status to backend:', err);
      // Safe rollback if server rejected update
      if (previousTask && previousTask.id) {
        updateTasksWithStorage(prev => prev.map(t => (t.id === previousTask.id ? previousTask : t)));
        if (realtimeChannel) {
          try {
            realtimeChannel.postMessage({ type: 'TASK_UPDATED', task: previousTask, timestamp: Date.now() });
          } catch (e) {}
        }
      }
      toast.error(`Failed to update status: ${err.message || 'Database error'}. Reverted to previous status.`);
      throw err;
    }
  }, [tasks, currentUser, updateTasksWithStorage, fetchLiveData]);

  const reassignTask = useCallback((id, newAssigneeId) => {
    const allUsers = users && users.length > 0 ? users : USERS;
    const newUser = allUsers.find(u => u.id === newAssigneeId) || getUserById(newAssigneeId);
    updateTask(id, {
      assigneeId: newAssigneeId,
      techPerson: newUser?.name || 'Unassigned',
      codeName: newUser?.codeName || getTseCodeName(newUser?.name),
    }, `Reassigned to ${newUser?.name}`);
    toast.success('Task reassigned successfully.');
  }, [updateTask, users]);

  const assignMarketingSr = useCallback((taskId, srId) => {
    const allUsers = users && users.length > 0 ? users : USERS;
    const sr = allUsers.find(u => u.id === srId || u.empId === srId || u.tttNbId === srId) || resolveSr(srId, allUsers);
    if (!sr) {
      toast.error('Selected Marketing SR not found.');
      return;
    }

    updateTask(taskId, {
      pocId: sr.id,
      recruiterName: sr.name,
    }, `Marketing SR assigned: ${sr.name}`);

    // Update linked feedback session
    updateFeedbacksWithStorage(prev => prev.map(f => {
      if (f.taskId === taskId) {
        return {
          ...f,
          pocId: sr.id,
          recruiterName: sr.name,
        };
      }
      return f;
    }));

    // Notify the Marketing SR
    setNotifications(prev => [
      {
        id: `n-${Date.now()}-sr-assign`,
        type: 'task',
        title: 'New candidate assigned to you',
        message: `Task ${taskId} assigned to you by ${currentUser?.name || 'Marketing TL'}`,
        time: 'just now',
        read: false,
        targetUserId: sr.id,
      },
      ...prev
    ]);

    toast.success(`Assigned to ${sr.name}`);
  }, [users, updateTask, currentUser, updateFeedbacksWithStorage]);

  const changeTaskStatus = useCallback((id, status) => {
    updateTask(id, { status }, `Status changed to ${status}`);
  }, [updateTask]);

  const submitInterviewFeedback = useCallback((interviewId, feedback) => {
    let targetIv = null;
    setInterviews(prev => prev.map(iv => {
      if (iv.id !== interviewId) return iv;
      const newStatus = feedback.decision === 'Cleared' ? 'Cleared' : feedback.decision === 'Rejected' ? 'Rejected' : 'Hold';
      targetIv = { ...iv, feedback, feedbackSubmitted: true, status: newStatus };
      return targetIv;
    }));

    // Broadcast interview completed/feedback submitted to backend
    fetch('/api/events/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'interview.completed',
        payload: {
          id: interviewId,
          status: 'Done',
          candidateName: targetIv?.candidateName || 'Candidate',
          decision: feedback.decision,
        },
      }),
    }).catch(() => {});

    setNotifications(prev => [{
      id: `n-${Date.now()}`,
      type: 'interview',
      title: 'Feedback submitted',
      message: `${interviewId} evaluated: ${feedback.decision}`,
      time: 'just now',
      read: false,
    }, ...prev]);
    toast.success('Interview feedback submitted.');
  }, []);

  const updateInterviewStatus = useCallback((id, status) => {
    setInterviews(prev => prev.map(iv => iv.id === id ? { ...iv, status } : iv));

    // Broadcast interview status change
    fetch('/api/events/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'interview.status_changed',
        payload: { id, status },
      }),
    }).catch(() => {});

    toast.success('Interview status updated.');
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  }, []);

  const addMarketingReview = useCallback((feedbackId, reviewData) => {
    updateFeedbacksWithStorage(prev => prev.map(item => {
      if (item.id !== feedbackId) return item;
      return {
        ...item,
        marketingReview: {
          reviewed: true,
          ...reviewData,
          reviewedBy: reviewData.reviewedBy || currentUser?.name || 'Marketing Reviewer',
          timestamp: reviewData.timestamp || new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
      };
    }));

    // Update in MongoDB Atlas
    fetch(`/api/feedbacks/${feedbackId}/marketing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    }).catch(() => { });

    toast.success('Marketing Review saved successfully.');
  }, [currentUser, updateFeedbacksWithStorage]);

  const submitCandidateFeedback = useCallback((feedbackId, feedbackData) => {
    updateFeedbacksWithStorage(prev => {
      const exists = prev.some(item => item && (item.id === feedbackId || item.taskId === feedbackId));
      if (exists) {
        return prev.map(item => {
          if (item.id !== feedbackId && item.taskId !== feedbackId) return item;
          return {
            ...item,
            ...feedbackData,
            candidateFeedback: {
              submitted: true,
              ...(feedbackData.candidateFeedback || feedbackData),
              timestamp: feedbackData.timestamp || new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            },
          };
        });
      }
      return [feedbackData, ...prev];
    });

    // Update in MongoDB Atlas
    fetch(`/api/feedbacks/${encodeURIComponent(feedbackId)}/candidate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    })
      .then(() => fetchLiveData())
      .catch(() => { });

    // Broadcast across tabs (0ms latency)
    if (realtimeChannel) {
      try {
        realtimeChannel.postMessage({
          type: 'FEEDBACK_SUBMITTED',
          feedbackId,
          feedbackData,
          timestamp: Date.now(),
        });
      } catch (err) {}
    }

    toast.success('Candidate feedback submitted successfully.');
  }, [updateFeedbacksWithStorage, fetchLiveData]);

  const addSagaFeedback = useCallback((newRecord) => {
    updateFeedbacksWithStorage(prev => [newRecord, ...prev]);

    // Save in MongoDB Atlas
    fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(() => { });

    toast.success(`Feedback for ${newRecord.techSupport} recorded successfully.`);
  }, [updateFeedbacksWithStorage]);

  const createPendingFeedbackLink = useCallback((newRecord) => {
    const authorizedRoles = ['marketing_sr', 'recruiter', 'marketing_tl', 'management', 'upper_management'];
    if (!authorizedRoles.includes(currentRole)) {
      toast.error('You are not authorized to generate candidate feedback links.');
      return;
    }

    updateFeedbacksWithStorage(prev => [newRecord, ...prev]);

    // Save in MongoDB Atlas
    fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': currentRole || '',
      },
      body: JSON.stringify({ ...newRecord, role: currentRole }),
    }).catch(() => { });

    toast.success(`Feedback link created for ${newRecord.candidateName || 'Candidate'}`);
  }, [currentRole, updateFeedbacksWithStorage]);

  // Centrally Scoped Datasets Enforcing Role-Based Visibility, Team Isolation & Identity Privacy
  const scopedTasks = useMemo(() => {
    return filterAuthorizedData(tasks, currentUser, currentRole);
  }, [tasks, currentUser, currentRole]);

  const scopedInterviews = useMemo(() => {
    return filterAuthorizedData(interviews, currentUser, currentRole);
  }, [interviews, currentUser, currentRole]);

  const scopedFeedbacks = useMemo(() => {
    return filterAuthorizedData(feedbacks, currentUser, currentRole);
  }, [feedbacks, currentUser, currentRole]);

  const scopedEvents = useMemo(() => {
    return filterAuthorizedData(events, currentUser, currentRole);
  }, [events, currentUser, currentRole]);

  const scopedNotifications = useMemo(() => {
    return filterAuthorizedData(notifications, currentUser, currentRole);
  }, [notifications, currentUser, currentRole]);

  const value = {
    currentRole,
    currentUser,
    users,
    addUser,
    updateUser,
    deleteUser,
    setUsers,
    tasks: scopedTasks,
    rawTasks: tasks,
    interviews: scopedInterviews,
    visibleInterviews: scopedInterviews,
    feedbacks: scopedFeedbacks,
    rawFeedbacks: feedbacks,
    theme,
    toggleTheme,
    userAvatar,
    updateUserAvatar,
    notifications: scopedNotifications,
    unreadCount: scopedNotifications.filter(n => !n.read).length,
    events: scopedEvents,
    dbConnected,
    realtimeConnected,
    fetchLiveData,
    setFeedbacks,
    addMarketingReview,
    submitCandidateFeedback,
    addSagaFeedback,
    createPendingFeedbackLink,
    sidebarCollapsed,
    cmdOpen,
    setCmdOpen,
    setSidebarCollapsed,
    authLoading,
    login,
    loginAs,
    logout,
    addTask,
    updateTask,
    reassignTask,
    assignMarketingSr,
    changeTaskStatus,
    submitInterviewFeedback,
    updateInterviewStatus,
    markNotificationRead,
    markAllRead,
    setEvents,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
