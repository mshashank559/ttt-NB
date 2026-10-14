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
  formatTseNameForRole,
  TSE_MAP,
  filterAuthorizedData,
  sanitizeForIdentityPrivacy,
  anonymizeInterview,
  getUserById,
} from '../data/mockData';
import { DEFAULT_AVATAR } from '../data/avatars';

const AppCtx = createContext(null);

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
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved tasks:', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Cross-tab synchronization for tasks
  React.useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'ttt_tasks' && e.newValue) {
        try {
          setTasks(JSON.parse(e.newValue));
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
          const hasOldFake = Array.isArray(parsed) && parsed.some(f =>
            f.id === 'fb-101' ||
            f.candidateName === 'Candidate A' ||
            f.candidateEmail === 'candidate.a@example.com'
          );
          if (hasOldFake) {
            localStorage.setItem('ttt_feedbacks', JSON.stringify(INITIAL_FEEDBACK_RECORDS));
            return INITIAL_FEEDBACK_RECORDS;
          }
          if (Array.isArray(parsed)) return parsed;
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

  const currentUser = useMemo(() => (currentUserId ? (users.find(u => u.id === currentUserId) || getUserById(currentUserId)) : null), [currentUserId, users]);

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
      const q = new URLSearchParams();
      if (currentRole) q.set('role', currentRole);
      if (currentUserId) q.set('userId', currentUserId);
      if (currentUser?.teamId) q.set('teamId', currentUser.teamId);

      const qs = q.toString() ? `?${q.toString()}` : '';

      const [tasksRes, feedbacksRes, usersRes, healthRes] = await Promise.all([
        fetch(`/api/tasks${qs}`).catch(() => null),
        fetch(`/api/feedbacks${qs}`).catch(() => null),
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
          updateTasksWithStorage(prev => {
            const map = new Map();
            // Preserve all locally stored/created tasks first
            (prev || []).forEach(t => { if (t && t.id) map.set(t.id, t); });
            // Merge in server tasks
            liveTasks.forEach(t => {
              if (t && t.id) {
                const existing = map.get(t.id);
                map.set(t.id, existing ? { ...existing, ...t } : t);
              }
            });
            const merged = Array.from(map.values());
            // Sort newest first
            merged.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
            return merged;
          });
        }
      }

      if (feedbacksRes && feedbacksRes.ok) {
        const liveFeedbacks = await feedbacksRes.json();
        if (Array.isArray(liveFeedbacks)) {
          setFeedbacks(liveFeedbacks);
          try {
            localStorage.setItem('ttt_feedbacks', JSON.stringify(liveFeedbacks));
          } catch (e) { }
        }
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

  React.useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Live Realtime Server-Sent Events (SSE) Cross-Role Listener
  React.useEffect(() => {
    if (!currentUserId || !currentRole) return;

    let es = null;
    let reconnectTimeout = null;

    const connectSse = () => {
      try {
        const queryParams = new URLSearchParams({
          role: currentRole || '',
          userId: currentUserId || '',
          teamId: currentUser?.teamId || '',
          pocId: currentUser?.pocId || currentUser?.id || '',
          name: currentUser?.name || '',
        });

        es = new EventSource(`/api/events?${queryParams.toString()}`);

        es.onopen = () => {
          setRealtimeConnected(true);
          // Reconcile latest persisted state from DB upon connection/reconnection
          fetchLiveData();
        };

                let retryCount = 0;
        es.onerror = () => {
          setRealtimeConnected(false);
          if (es) {
            es.close();
            es = null;
          }
          retryCount++;
          if (retryCount <= 2) {
            reconnectTimeout = setTimeout(connectSse, 6000);
          }
        };

        // Realtime event handlers for task/interview lifecycle
        const handleTaskLifecycleEvent = (e) => {
          try {
            const eventPayload = JSON.parse(e.data);
            const taskData = eventPayload.data || eventPayload;
            if (!taskData || !taskData.id) return;

            setTasks(prev => {
              const existingIdx = prev.findIndex(t => t.id === taskData.id);
              if (existingIdx >= 0) {
                const nextTasks = [...prev];
                nextTasks[existingIdx] = { ...nextTasks[existingIdx], ...taskData };
                return nextTasks;
              }
              return [taskData, ...prev];
            });

            // Activity feed / audit stream live sync
            setEvents(prev => {
              if (prev.some(ev => ev.eventId === eventPayload.eventId)) return prev;
              return [{
                id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                eventId: eventPayload.eventId,
                type: e.type,
                candidateName: taskData.candidateName,
                taskType: taskData.taskType,
                status: taskData.status,
                at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                description: `${taskData.candidateName || 'Candidate'} (${taskData.taskType || 'Interview'}) - ${taskData.status || 'Updated'}`,
              }, ...prev];
            });
          } catch (err) {
            console.warn('Error processing task SSE event:', err);
          }
        };

        es.addEventListener('task.created', handleTaskLifecycleEvent);
        es.addEventListener('task.updated', handleTaskLifecycleEvent);
        es.addEventListener('task.status_changed', handleTaskLifecycleEvent);
        es.addEventListener('task.completed', handleTaskLifecycleEvent);
        es.addEventListener('task.reassigned', handleTaskLifecycleEvent);
        es.addEventListener('interview.status_changed', handleTaskLifecycleEvent);
        es.addEventListener('interview.completed', handleTaskLifecycleEvent);

        es.addEventListener('task.deleted', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.id) {
              updateTasksWithStorage(prev => prev.filter(t => t.id !== data.id));
            }
          } catch (err) {}
        });

        // Targeted live notifications
        es.addEventListener('notification', (e) => {
          try {
            const notif = JSON.parse(e.data);
            if (!notif || !notif.id) return;

            setNotifications(prev => {
              if (prev.some(n => n.id === notif.id || (notif.eventId && n.eventId === notif.eventId))) {
                return prev;
              }
              toast.info(notif.title, { description: notif.message });
              return [notif, ...prev];
            });
          } catch (err) {}
        });

        // Candidate feedback events
        const handleFeedbackEvent = (e) => {
          try {
            const fbData = JSON.parse(e.data);
            const actualFb = fbData.data || fbData;
            if (!actualFb || !actualFb.id) return;

            updateFeedbacksWithStorage(prev => {
              const idx = prev.findIndex(f => f.id === actualFb.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], ...actualFb };
                return updated;
              }
              return [actualFb, ...prev];
            });
          } catch (err) {}
        };

        es.addEventListener('candidate.feedback_created', handleFeedbackEvent);
        es.addEventListener('candidate.feedback_submitted', handleFeedbackEvent);
        es.addEventListener('candidate.feedback_reviewed', handleFeedbackEvent);

      } catch (err) {
        console.warn('SSE connection error:', err);
      }
    };

    connectSse();

    return () => {
      if (es) es.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [currentRole, currentUserId, currentUser, fetchLiveData, updateFeedbacksWithStorage]);

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
    const teamPocs = POC_USERS_BY_TEAM[assignedTeam.id] || [];
    const hasExplicitPoc = task.pocId && task.pocId !== 'unassigned' && task.pocId !== '';
    const assignedPoc = hasExplicitPoc ? (teamPocs.find(p => p.id === task.pocId || p.name === task.recruiterName) || { id: task.pocId, name: task.recruiterName }) : null;
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
      companyName: task.companyName || 'Amazon',
      taskType,
      duration: task.duration || '30 mins',
      status: task.status || 'Pending',
      remark: task.remark || '',
      description: task.description || '',
      notes: task.notes || '',
      teamId: assignedTeam.id,
      teamName: assignedTeam.name,
      teamLeadId: assignedTeam.leadId,
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
      company: task.companyName || 'Amazon',
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

  const updateTask = useCallback((id, patch, note) => {
    let patchedTask = null;
    updateTasksWithStorage(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...patch };
      if (note) {
        updated.timeline = [
          ...(t.timeline || []),
          { at: new Date().toISOString().slice(0, 10), event: note, by: currentUser?.name || 'System' },
        ];
      }
      patchedTask = updated;
      return updated;
    }));

    // Persist to backend database & trigger server-side realtime SSE broadcast
    if (patchedTask) {
      fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchedTask),
      }).catch(err => console.warn('Failed to sync task update to server:', err));
    }

    toast.success(note || 'Task updated.');
  }, [currentUser]);

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
    const sr = allUsers.find(u => u.id === srId);
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
    updateFeedbacksWithStorage(prev => prev.map(item => {
      if (item.id !== feedbackId) return item;
      return {
        ...item,
        candidateFeedback: {
          submitted: true,
          ...feedbackData,
          timestamp: feedbackData.timestamp || new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
      };
    }));

    // Update in MongoDB Atlas
    fetch(`/api/feedbacks/${feedbackId}/candidate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    }).catch(() => { });

    toast.success('Candidate feedback updated successfully.');
  }, [updateFeedbacksWithStorage]);

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
    updateFeedbacksWithStorage(prev => [newRecord, ...prev]);

    // Save in MongoDB Atlas
    fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(() => { });

    toast.success(`Feedback link created for ${newRecord.candidateName || 'Candidate'}`);
  }, [updateFeedbacksWithStorage]);

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
