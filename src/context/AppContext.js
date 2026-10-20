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
  filterAuthorizedData,
  mapTaskToInterview,
  sanitizeForIdentityPrivacy,
  anonymizeInterview,
  getUserById,
} from '../data/mockData';
import { DEFAULT_AVATAR } from '../data/avatars';

const AppCtx = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(null); // null = login screen
  const [currentUserId, setCurrentUserId] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
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

  const [slaTickets, setSlaTickets] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ttt_sla_tickets');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [dbConnected, setDbConnected] = useState(false);

  // Live Sync with MongoDB Atlas Backend (Mumbai Region)
  React.useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [tasksRes, feedbacksRes, usersRes, healthRes, slaRes] = await Promise.all([
          fetch('/api/tasks').catch(() => null),
          fetch('/api/feedbacks').catch(() => null),
          fetch('/api/users').catch(() => null),
          fetch('/api/health').catch(() => null),
          fetch('/api/sla-tickets').catch(() => null),
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
            setTasks(liveTasks);
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

        if (slaRes && slaRes.ok) {
          const liveSla = await slaRes.json();
          if (Array.isArray(liveSla)) {
            setSlaTickets(liveSla);
            try {
              localStorage.setItem('ttt_sla_tickets', JSON.stringify(liveSla));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Backend server offline, falling back to local storage/state:', err);
      }
    };

    fetchLiveData();
  }, []);

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

  const loginAs = useCallback((roleId, userId) => {
    let user = null;
    if (userId) {
      user = users.find(u => u.id === userId) || USERS.find(u => u.id === userId);
    } else {
      user = users.find(u => u.role === roleId) || USERS.find(u => u.role === roleId);
    }
    const finalRole = user?.role || roleId;
    setCurrentRole(finalRole);
    setCurrentUserId(user?.id || null);
    toast.success(`Signed in as ${user?.name || ROLES[finalRole]?.label || finalRole}`);
  }, [users]);

  const logout = useCallback(() => {
    setCurrentRole(null);
    setCurrentUserId(null);
    toast.info('Signed out successfully.');
  }, []);

  const currentUser = useMemo(() => (currentUserId ? (users.find(u => u.id === currentUserId) || getUserById(currentUserId)) : null), [currentUserId, users]);

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
      title: `${candidateName} — ${taskType}${task.companyName ? ` (${task.companyName})` : ''}`,
      position: task.position || 'Software Engineer',
      companyName: task.companyName || '',
      taskType,
      interviewDateTime: task.interviewDateTime || '',
      interviewOutcome: task.interviewOutcome || null,
      duration: task.duration || '30 mins',
      status: task.status || 'Pending',
      remark: task.remark || '',
      description: task.description || '',
      notes: task.notes || '',
      teamId: assignedTeam.id,
      teamName: assignedTeam.name,
      teamLeadId: assignedTeam.leadId,
      assignedSrId: task.assignedSrId || '',
      assignedSrName: task.assignedSrName || '',
      assignedSrEmail: task.assignedSrEmail || '',
      pocId: task.assignedSrId || task.pocId || '',
      recruiterName: task.assignedSrName || task.recruiterName || assignedTeam.name,
      completionRemark: '',
      assigneeId: assignee?.id || task.assigneeId,
      createdById: creator?.id,
      timeline: [
        { at: date, event: `Assigned to ${assignee?.name || 'Unassigned'} for ${taskType}`, by: creator?.name || 'TSM' },
      ],
    };
    setTasks(prev => [newTask, ...prev]);

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
      recruiterName: task.assignedSrName || task.recruiterName || assignedTeam.name,
      pocId: task.assignedSrId || task.pocId || '',
      teamId: assignedTeam.id,
      teamLeadId: assignedTeam.leadId,
      teamName: assignedTeam.name,
      jobRole: task.position || 'Software Engineer',
      company: task.companyName || '',
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

    setNotifications(prev => [{
      id: `n-${Date.now()}`,
      type: 'task',
      title: 'New task assigned',
      message: `${id}: ${candidateName} (${taskType}) assigned to ${assignee?.name || 'TSE'}`,
      time: 'just now',
      read: false,
    }, ...prev]);
    toast.success('Task created successfully.');
    return newTask;
  }, [tasks.length, currentUser, updateFeedbacksWithStorage]);

  const updateTask = useCallback((id, patch, note) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...patch };
      if (note) {
        updated.timeline = [
          ...(t.timeline || []),
          { at: new Date().toISOString().slice(0, 10), event: note, by: currentUser?.name || 'System' },
        ];
      }
      return updated;
    }));

    // Persist to MongoDB Atlas via PUT endpoint
    fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {});

    toast.success(note || 'Task updated.');
  }, [currentUser]);

  const assignMarketingSr = useCallback((taskId, srUser) => {
    if (!srUser) return;
    if (currentRole === 'tse') {
      toast.error('TSE cannot assign or change Senior Recruiter.');
      return;
    }
    const currentTask = (tasks || []).find(t => t.id === taskId);
    if (currentRole === 'tsm' && currentTask && (currentTask.assignedSrId || currentTask.assignedSrName)) {
      toast.error('Senior Recruiter is already assigned and locked for TSM.');
      return;
    }
    const patch = {
      assignedSrId: srUser.id,
      assignedSrName: srUser.name,
      assignedSrEmail: srUser.email,
      pocId: srUser.id,
      recruiterName: srUser.name,
    };
    updateTask(taskId, patch, `Assigned to Senior Recruiter ${srUser.name} by ${currentUser?.name || 'Marketing TL'}`);
  }, [currentUser, currentRole, tasks, updateTask]);

  const reassignTask = useCallback((id, newAssigneeId) => {
    const newUser = getUserById(newAssigneeId);
    updateTask(id, { assigneeId: newAssigneeId }, `Reassigned to ${newUser?.name}`);
  }, [updateTask]);

  const changeTaskStatus = useCallback((id, status, completionRemark) => {
    const patch = { status };
    if (completionRemark) {
      patch.completionRemark = completionRemark;
      patch.remark = completionRemark;
    }
    const note = status === 'Done' && completionRemark
      ? `Task marked as Done by ${currentUser?.name || 'TSE'}: ${completionRemark}`
      : `Status changed to ${status}`;
    updateTask(id, patch, note);
  }, [currentUser, updateTask]);

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

  const submitInterviewFeedback = useCallback((interviewId, feedback) => {
    const outcome = feedback.decision; // 'Cleared', 'Rejected', 'Hold', etc.
    const newStatus = feedback.stage || (
      ['Cleared', 'Passed', 'Moved to Next Round', 'Offer Received'].includes(outcome)
        ? 'Cleared'
        : (outcome === 'Rejected' || outcome === 'Failed') ? 'Rejected' : 'Hold'
    );

    // 1. Update task in MongoDB & App state
    const taskId = interviewId;
    updateTask(taskId, {
      interviewOutcome: outcome,
      status: ['Cleared', 'Rejected', 'Hold', 'Interview Completed'].includes(newStatus) ? 'Done' : 'Pending',
      completionRemark: feedback.remarks || `Interview evaluation: ${outcome}`,
    }, `Interview evaluated by ${currentUser?.name || 'Reviewer'}: ${outcome}`);

    // 2. Also record in feedbacks state and /api/feedbacks
    const fbId = `fb-task-${taskId}`;
    addMarketingReview(fbId, {
      technical: feedback.technical,
      communication: feedback.communication,
      overallRating: feedback.overall,
      feedbackRemarks: feedback.remarks,
      decision: outcome,
      reviewerName: currentUser?.name || 'Reviewer',
    });

    // 3. Update local standalone interview state if any
    setInterviews(prev => prev.map(iv => {
      if (iv.id !== interviewId) return iv;
      return { ...iv, feedback, feedbackSubmitted: true, status: newStatus, interviewOutcome: outcome };
    }));

    setNotifications(prev => [{
      id: `n-${Date.now()}`,
      type: 'interview',
      title: 'Feedback submitted',
      message: `${interviewId} evaluated: ${feedback.decision}`,
      time: 'just now',
      read: false,
    }, ...prev]);
    toast.success('Interview feedback and stage updated successfully.');
  }, [currentUser, updateTask, addMarketingReview]);

  const updateInterviewStatus = useCallback((id, status) => {
    let patch = {};
    if (status === 'Cleared') {
      patch = { status: 'Done', interviewOutcome: 'Cleared' };
    } else if (status === 'Rejected') {
      patch = { status: 'Done', interviewOutcome: 'Failed' };
    } else if (status === 'Hold') {
      patch = { status: 'Done', interviewOutcome: 'Hold' };
    } else if (status === 'Interview Completed') {
      patch = { status: 'Done' };
    } else if (status === 'Scheduled') {
      patch = { status: 'Pending', interviewOutcome: null };
    }
    updateTask(id, patch, `Interview status changed to ${status}`);
    setInterviews(prev => prev.map(iv => iv.id === id ? { ...iv, status } : iv));
    toast.success(`Interview moved to ${status}`);
  }, [updateTask]);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  }, []);

  // Milestone 6: SLA Ticket Management & Auto-Escalation
  const addSlaTicket = useCallback((ticketData) => {
    const id = ticketData.id || `SLA-${Date.now()}`;
    const newTicket = {
      ...ticketData,
      id,
      ticketNumber: ticketData.ticketNumber || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: ticketData.status || 'Open',
      createdAt: ticketData.createdAt || new Date().toISOString(),
      actionTaken: ticketData.actionTaken || '',
      resolutionDetails: ticketData.resolutionDetails || '',
    };

    setSlaTickets(prev => {
      const exists = prev.some(t => t.id === id || (t.interviewId && t.interviewId === newTicket.interviewId));
      if (exists) return prev;
      const updated = [newTicket, ...prev];
      try { localStorage.setItem('ttt_sla_tickets', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    fetch('/api/sla-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTicket),
    }).catch(() => {});

    toast.error(`⚠️ Low Rating Escalation: SLA Ticket ${newTicket.ticketNumber} created for TSM review.`);
    return newTicket;
  }, []);

  const updateSlaTicket = useCallback((ticketId, patch) => {
    setSlaTickets(prev => {
      const updated = prev.map(t => t.id === ticketId ? { ...t, ...patch } : t);
      try { localStorage.setItem('ttt_sla_tickets', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    fetch(`/api/sla-tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {});

    toast.success('SLA Ticket updated successfully.');
  }, []);

  const updateInterviewOutcome = useCallback((taskId, outcome) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, interviewOutcome: outcome } : t));
    fetch(`/api/tasks/${taskId}/outcome`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome }),
    }).catch(() => {});
    toast.success(`Interview outcome recorded: ${outcome}`);
  }, []);

  // Milestone 2: 30-Minute Interview Reminder Monitor for TSE
  React.useEffect(() => {
    if (currentRole !== 'tse' || !currentUser) return;

    const checkUpcomingReminders = () => {
      const now = new Date();
      tasks.forEach(t => {
        if (t.taskType === 'Interview' && t.interviewDateTime && (t.assigneeId === currentUser.id || t.techPerson === currentUser.name)) {
          const target = new Date(t.interviewDateTime);
          const diffMin = Math.round((target.getTime() - now.getTime()) / (1000 * 60));
          if (diffMin >= 0 && diffMin <= 30 && !t._reminderNotified) {
            toast.error(`⏰ INTERVIEW REMINDER: Candidate session with ${t.candidateName} starts in ${diffMin} minutes!`, {
              duration: 8000,
            });
            t._reminderNotified = true;
          }
        }
      });
    };

    checkUpcomingReminders();
    const interval = setInterval(checkUpcomingReminders, 60000);
    return () => clearInterval(interval);
  }, [currentRole, currentUser, tasks]);

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

    // Auto-escalate if rating <= 3 stars
    const rating = Number(feedbackData.performanceRating) || Number(feedbackData.experienceRating) || 5;
    if (rating <= 3) {
      const session = feedbacks.find(f => f.id === feedbackId);
      addSlaTicket({
        candidateName: session?.candidateName || feedbackData.candidateName || 'Candidate',
        companyName: session?.company || 'Client Assessment',
        interviewId: feedbackId,
        techSupport: session?.employeeName || session?.techSupport || 'TSE',
        techSupportId: session?.techSupportId || 'TSE-ID',
        rating,
        comments: feedbackData.comments || 'Low rating logged by candidate (<= 3 stars).',
        responsibleTsm: 'Shashank Mishra',
        responsibleTsmId: 'u-shashank-01',
      });
    }

    // Update in MongoDB Atlas
    fetch(`/api/feedbacks/${feedbackId}/candidate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    }).catch(() => { });

    toast.success('Candidate feedback updated successfully.');
  }, [updateFeedbacksWithStorage, feedbacks, addSlaTicket]);

  const addSagaFeedback = useCallback((newRecord) => {
    updateFeedbacksWithStorage(prev => [newRecord, ...prev]);

    // Auto-escalate if rating <= 3 stars
    const cRating = Number(newRecord.candidateFeedback?.performanceRating) || Number(newRecord.candidateFeedback?.experienceRating) || 5;
    if (cRating <= 3) {
      addSlaTicket({
        candidateName: newRecord.candidateName || 'Candidate',
        companyName: newRecord.company || 'Client Assessment',
        interviewId: newRecord.id,
        techSupport: newRecord.employeeName || newRecord.techSupport || 'TSE',
        techSupportId: newRecord.techSupportId || 'TSE-ID',
        rating: cRating,
        comments: newRecord.candidateFeedback?.comments || 'Low rating submitted in Candidate SAGA.',
        responsibleTsm: 'Shashank Mishra',
        responsibleTsmId: 'u-shashank-01',
      });
    }

    // Save in MongoDB Atlas
    fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(() => { });

    toast.success(`Feedback recorded successfully.`);
  }, [updateFeedbacksWithStorage, addSlaTicket]);

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

  // Derive all interview records dynamically from tasks + feedbacks + standalone interviews
  const rawInterviews = useMemo(() => {
    const taskInterviews = (tasks || [])
      .filter(t => t.taskType === 'Interview' || t.category === 'Interview' || Boolean(t.interviewDateTime))
      .map(t => mapTaskToInterview(t, feedbacks))
      .filter(Boolean);

    const existingIds = new Set(taskInterviews.map(i => i.id));
    const extraInterviews = (interviews || []).filter(i => !existingIds.has(i.id));

    return [...taskInterviews, ...extraInterviews];
  }, [tasks, feedbacks, interviews]);

  const scopedInterviews = useMemo(() => {
    return filterAuthorizedData(rawInterviews, currentUser, currentRole);
  }, [rawInterviews, currentUser, currentRole]);

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
    setFeedbacks,
    addMarketingReview,
    submitCandidateFeedback,
    addSagaFeedback,
    createPendingFeedbackLink,
    sidebarCollapsed,
    cmdOpen,
    setCmdOpen,
    setSidebarCollapsed,
    loginAs,
    logout,
    addTask,
    updateTask,
    reassignTask,
    changeTaskStatus,
    assignMarketingSr,
    submitInterviewFeedback,
    updateInterviewStatus,
    markNotificationRead,
    markAllRead,
    setEvents,
    slaTickets,
    addSlaTicket,
    updateSlaTicket,
    updateInterviewOutcome,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
