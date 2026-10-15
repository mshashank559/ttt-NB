
const FALLBACK_TECH_SUPPORT = [
  { id: 'TTT-NB-008', supportName: 'Abhishek', employeeName: 'Harit Verma', email: 'nbtech1@netbounceplacement.com' },
  { id: 'TTT-NB-009', supportName: 'Kiran', employeeName: 'Prem Makwana', email: 'nbtech3@netbounceplacement.com' },
  { id: 'TTT-NB-010', supportName: 'Henil', employeeName: 'Shaurya Mishra', email: 'nbtech2@netbounceplacement.com' },
  { id: 'TTT-NB-011', supportName: 'Saurav', employeeName: 'Nikunj Kataria', email: 'nbtech4@netbounceplacement.com' },
  { id: 'TTT-NB-012', supportName: 'Divya', employeeName: 'Jindal Patel', email: 'divya.c@netbounceplacement.com' },
  { id: 'TTT-NB-013', supportName: 'Smriti', employeeName: 'Amber Afreen', email: 'nbtech6@netbounceplacement.com' },
  { id: 'TTT-NB-014', supportName: 'Jemimah', employeeName: 'Rashika Sharma', email: 'nbtech5@netbounceplacement.com' },
  { id: 'TTT-NB-015', supportName: 'Shreya', employeeName: 'Aarti Vishwakarma', email: 'nbtech7@netbounceplacement.com' },
];

const FALLBACK_TSM_CODES = {
  'Mukesh Chaudhary': 'Mukesh',
  'Shivam Barot': 'Shivam',
};

const FALLBACK_TSE_CODES = {
  'Harit Verma': 'Abhishek', 'Harit': 'Abhishek', 'Abhishek': 'Abhishek',
  'Prem Makwana': 'Kiran', 'Prem': 'Kiran', 'Kiran': 'Kiran',
  'Shaurya Mishra': 'Henil', 'Shaurya': 'Henil', 'Henil': 'Henil',
  'Nikunj Kataria': 'Saurav', 'Nikunj': 'Saurav', 'Saurav': 'Saurav',
  'Jindal Patel': 'Divya', 'Jindal': 'Divya', 'Divya': 'Divya',
  'Amber Afreen': 'Smriti', 'Amber': 'Smriti', 'Smriti': 'Smriti',
  'Rashika Sharma': 'Jemimah', 'Rashika': 'Jemimah', 'Jemimah': 'Jemimah',
  'Aarti Vishwakarma': 'Shreya', 'Aarti': 'Shreya', 'Shreya': 'Shreya'
};

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix Node.js Windows SRV DNS resolution for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// MongoDB Connection
// -------------------------------------------------------------
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  })
    .then(() => {
      console.log(' Connected to MongoDB Atlas (Mumbai Region - TTT-Database)');
      seedDatabaseIfEmpty();
    })
    .catch((err) => {
      console.error(' MongoDB Connection Error:', err.message);
    });
} else {
  console.warn(' MONGODB_URI not set. Running in local/offline memory mode with Realtime SSE.');
}

// -------------------------------------------------------------
// Mongoose Models
// -------------------------------------------------------------
const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  candidateId: String,
  date: String,
  dueDate: String,
  createdAt: String,
  techPerson: String,
  codeName: String,
  assigneeId: String,
  duration: String,
  taskType: String,
  candidateName: String,
  title: String,
  position: String,
  companyName: String,
  status: String,
  remark: String,
  priority: String,
  category: String,
  teamId: String,
  teamName: String,
  teamLeadId: String,
  pocId: String,
  recruiterName: String,
  createdById: String,
  description: String,
  notes: String,
  timeline: Array,
}, { timestamps: true });

const FeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: String,
  techSupport: String,
  techSupportId: String,
  techSupportEmail: String,
  employeeName: String,
  candidateName: String,
  candidateEmail: String,
  recruiterName: String,
  pocId: String,
  teamId: String,
  teamName: String,
  teamLeadId: String,
  codeName: String,
  jobRole: String,
  company: String,
  round: String,
  techSupportType: String,
  timestamp: String,
  candidateFeedback: {
    submitted: { type: Boolean, default: false },
    performanceRating: Number,
    experienceRating: Number,
    comments: String,
    timestamp: String,
  },
  marketingReview: {
    reviewed: { type: Boolean, default: false },
    performance: Number,
    professionalism: Number,
    technicalKnowledge: Number,
    communication: Number,
    overallRating: Number,
    comments: String,
    reviewedBy: String,
    reviewerRole: String,
    timestamp: String,
  },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  codeName: String,
  teamId: String,
  teamName: String,
  teamLeadId: String,
  dept: String,
  empId: String,
  tttNbId: String,
  password: { type: String, default: 'NetBounce@2026' },
  joined: String,
  avatar: String,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const User = mongoose.model('User', UserSchema);

// -------------------------------------------------------------
// Real-Time SSE (Server-Sent Events) Architecture
// -------------------------------------------------------------
const sseClients = new Set();

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const client = {
    id: clientId,
    res,
    role: req.query.role || '',
    userId: req.query.userId || '',
    teamId: req.query.teamId || '',
    pocId: req.query.pocId || '',
    name: decodeURIComponent(req.query.name || ''),
  };

  sseClients.add(client);

  // Immediate handshake
  res.write(`data: ${JSON.stringify({ type: 'init', status: 'connected', clientId })}\n\n`);

  // Heartbeat keep-alive every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(':keepalive\n\n');
    } catch (e) {
      clearInterval(heartbeat);
      sseClients.delete(client);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(client);
  });
});

// Check authorization and team isolation for each SSE event
async function isClientAuthorizedForEvent(client, event) {
  const { role, userId, teamId, name } = client;
  if (!role) return false;

  // 1. Upper Management: sees all authorized operational records
  if (role === 'upper_management') return true;

  // 2. Management: sees all cross-team operational records
  if (role === 'management') return true;

  // 3. Direct user-targeted notification
  if (event.targetUserId && event.targetUserId === userId) return true;

  // 4. Role-targeted notification
  if (event.targetRole && event.targetRole === role) {
    if (event.teamId && (role === 'marketing_tl' || role === 'marketing_sr')) {
      return event.teamId === teamId;
    }
    return true;
  }

  // 5. TSM: Operational scope for all TSE tasks and interviews
  if (role === 'tsm') return true;

  // 6. TSE: ONLY sees tasks/interviews specifically assigned to them!
  if (role === 'tse') {
    const isAssignee = event.assigneeId && event.assigneeId === userId;
    const isSupportId = event.techSupportId && event.techSupportId === userId;
    const isTechPerson = event.techPerson && name && event.techPerson.toLowerCase() === name.toLowerCase();
    const isTargetUser = event.targetUserId && event.targetUserId === userId;
    return Boolean(isAssignee || isSupportId || isTechPerson || isTargetUser);
  }

  // 7. Recruiter (Marketing SR / POC): ONLY sees their own assigned candidates!
  if (role === 'recruiter') {
    const isPocId = event.pocId && event.pocId === userId;
    const isRecruiterName = event.recruiterName && name && event.recruiterName.toLowerCase() === name.toLowerCase();
    const isTargetUser = event.targetUserId && event.targetUserId === userId;
    return Boolean(isPocId || isRecruiterName || isTargetUser);
  }

  // 8. Marketing TL (Mukesh, Shivam, Vijesh):
  // STRICT TEAM ISOLATION: Mukesh sees ONLY Mukesh's team; Shivam sees ONLY Shivam; Vijesh sees ONLY Vijesh!
  if (role === 'marketing_tl') {
    const matchesTeamId = event.teamId && teamId && event.teamId === teamId;
    const matchesTeamLeadId = event.teamLeadId && event.teamLeadId === userId;
    const matchesTeamName = event.teamName && client.teamName && event.teamName.toLowerCase() === client.teamName.toLowerCase();
    const isTargetUser = event.targetUserId && event.targetUserId === userId;
    return Boolean(matchesTeamId || matchesTeamLeadId || matchesTeamName || isTargetUser);
  }

  // 9. Marketing SR: ONLY sees their assigned team
  if (role === 'marketing_sr') {
    const matchesTeamId = event.teamId && teamId && event.teamId === teamId;
    const isTargetUser = event.targetUserId && event.targetUserId === userId;
    return Boolean(matchesTeamId || isTargetUser);
  }

  return false;
}

// Server-side identity privacy: Never leak real TSE/TSM names to Marketing roles
async function sanitizePayloadForClient(event, client) {
  const { role } = client;
  if (role !== 'marketing_tl' && role !== 'marketing_sr' && role !== 'recruiter') {
    return event;
  }

  try {
    let TSE_CODE_NAMES = FALLBACK_TSE_CODES; let TSM_CODE_NAMES = {};
try { const m = await import('./src/data/mockData.js'); if (m.TSE_CODE_NAMES) TSE_CODE_NAMES = m.TSE_CODE_NAMES; if (m.TSM_CODE_NAMES) TSM_CODE_NAMES = m.TSM_CODE_NAMES; } catch (e) {}
    const copy = JSON.parse(JSON.stringify(event));

    if (copy.data) {
      if (copy.data.techPerson) {
        copy.data.techPerson = copy.data.codeName || TSE_CODE_NAMES[copy.data.techPerson] || copy.data.techPerson;
      }
      if (copy.data.techSupport) {
        copy.data.techSupport = copy.data.codeName || TSE_CODE_NAMES[copy.data.techSupport] || copy.data.techSupport;
      }
      if (copy.data.employeeName) {
        copy.data.employeeName = copy.data.codeName || TSE_CODE_NAMES[copy.data.employeeName] || 'TSE';
      }
      if (Array.isArray(copy.data.timeline)) {
        copy.data.timeline = copy.data.timeline.map(tl => ({
          ...tl,
          by: (TSM_CODE_NAMES && TSM_CODE_NAMES[tl.by]) || (TSE_CODE_NAMES && TSE_CODE_NAMES[tl.by]) || tl.by,
        }));
      }
    }
    return copy;
  } catch (e) {
    return event;
  }
}

// Broadcast Realtime Event to all authorized, isolated clients
async function broadcastRealtimeEvent(eventType, payload, meta = {}) {
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const event = {
    eventId,
    type: eventType,
    data: payload,
    candidateId: payload?.candidateId,
    candidateName: payload?.candidateName,
    taskType: payload?.taskType,
    teamId: payload?.teamId,
    teamName: payload?.teamName,
    teamLeadId: payload?.teamLeadId,
    pocId: payload?.pocId,
    recruiterName: payload?.recruiterName,
    assigneeId: payload?.assigneeId,
    techSupportId: payload?.techSupportId,
    techPerson: payload?.techPerson,
    codeName: payload?.codeName,
    previousStatus: meta.previousStatus,
    newStatus: payload?.status || meta.newStatus,
    actorId: meta.actorId,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  for (const client of sseClients) {
    try {
      const authorized = await isClientAuthorizedForEvent(client, event);
      if (authorized) {
        const sanitized = await sanitizePayloadForClient(event, client);
        client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(sanitized)}\n\n`);
      }
    } catch (err) {
      console.warn('Error broadcasting SSE event:', err.message);
    }
  }

  // Automated Targeted Notifications
  handleAutomatedNotifications(eventType, payload, meta, eventId);
}

// Generate targeted, isolated notifications for events
async function handleAutomatedNotifications(eventType, payload, meta, eventId) {
  if (!payload) return;
  const isDone = payload.status === 'Done' || eventType === 'task.completed' || eventType === 'interview.completed';
  const isCreated = eventType === 'task.created' || eventType === 'interview.created';

  const timeFormatted = 'just now';

  if (isDone) {
    // 1. Notification for Assigned TSE
    if (payload.assigneeId) {
      sendDirectNotification({
        id: `notif-${Date.now()}-tse`,
        eventId,
        targetUserId: payload.assigneeId,
        type: 'interview',
        title: 'Interview Completed',
        message: `Interview marked as Done for ${payload.candidateName || 'Candidate'}.`,
        time: timeFormatted,
        read: false,
      });
    }

    // 2. Notification for Assigned Recruiter / POC
    if (payload.pocId) {
      sendDirectNotification({
        id: `notif-${Date.now()}-poc`,
        eventId,
        targetUserId: payload.pocId,
        type: 'interview',
        title: 'Candidate Interview Done',
        message: `${payload.candidateName || 'Candidate'} completed evaluation. Recruiter: ${payload.recruiterName || 'Assigned'}.`,
        time: timeFormatted,
        read: false,
      });
    }

    // 3. Notification for Marketing TL (e.g. Mukesh - NEVER Shivam or Vijesh)
    if (payload.teamLeadId) {
      sendDirectNotification({
        id: `notif-${Date.now()}-tl`,
        eventId,
        targetUserId: payload.teamLeadId,
        teamId: payload.teamId,
        type: 'interview',
        title: 'Team Candidate Completed',
        message: `Interview Done: ${payload.candidateName || 'Candidate'} (${payload.teamName || 'Your Team'}).`,
        time: timeFormatted,
        read: false,
      });
    }

    // 4. Notification for TSM
    sendDirectNotification({
      id: `notif-${Date.now()}-tsm`,
      eventId,
      targetRole: 'tsm',
      type: 'task',
      title: 'TSE Completed Interview',
      message: `${payload.techPerson || 'TSE'} completed ${payload.candidateName} (${payload.taskType || 'Interview'}).`,
      time: timeFormatted,
      read: false,
    });

    // 5. Notification for Management & Upper Management
    sendDirectNotification({
      id: `notif-${Date.now()}-mgmt`,
      eventId,
      targetRole: 'management',
      type: 'interview',
      title: 'Interview Completed',
      message: `${payload.candidateName || 'Candidate'} marked Done (${payload.teamName || 'Team'}).`,
      time: timeFormatted,
      read: false,
    });
    sendDirectNotification({
      id: `notif-${Date.now()}-umgmt`,
      eventId,
      targetRole: 'upper_management',
      type: 'interview',
      title: 'Interview Completed',
      message: `${payload.candidateName || 'Candidate'} marked Done (${payload.teamName || 'Team'}).`,
      time: timeFormatted,
      read: false,
    });
  } else if (isCreated) {
    // Notify assigned TSE of new task
    if (payload.assigneeId) {
      sendDirectNotification({
        id: `notif-${Date.now()}-newtse`,
        eventId,
        targetUserId: payload.assigneeId,
        type: 'task',
        title: 'New Task Assigned',
        message: `${payload.candidateName || 'Candidate'} (${payload.taskType || 'Task'}) assigned to you.`,
        time: timeFormatted,
        read: false,
      });
    }
    // Notify Marketing TL that a new task has arrived for their team
    if (payload.teamLeadId) {
      sendDirectNotification({
        id: `notif-${Date.now()}-newtl`,
        eventId,
        targetUserId: payload.teamLeadId,
        teamId: payload.teamId,
        type: 'task',
        title: 'New Candidate Task for Team',
        message: `New task for ${payload.candidateName || 'Candidate'} (${payload.taskType || 'Interview'}). Please assign an SR.`,
        time: timeFormatted,
        read: false,
      });
    }
  }
}

// Push notification to authorized connected clients
function sendDirectNotification(notif) {
  for (const client of sseClients) {
    let match = false;
    if (notif.targetUserId && client.userId === notif.targetUserId) match = true;
    else if (notif.targetRole && client.role === notif.targetRole) {
      if (notif.teamId && (client.role === 'marketing_tl' || client.role === 'marketing_sr')) {
        match = client.teamId === notif.teamId;
      } else {
        match = true;
      }
    }

    if (match) {
      try {
        client.res.write(`event: notification\ndata: ${JSON.stringify(notif)}\n\n`);
      } catch (err) {}
    }
  }
}

// -------------------------------------------------------------
// Auto-Seed Initial Data if Collections are Empty
// -------------------------------------------------------------
async function seedDatabaseIfEmpty() {
  try {
    const { USERS } = await import('./src/data/mockData.js');
    const userCount = await User.countDocuments();
    if (userCount < USERS.length) {
      console.log(' Syncing all authorized team members into MongoDB...');
      for (const u of USERS) {
        await User.findOneAndUpdate(
          { id: u.id },
          { $set: u },
          { upsert: true, new: true }
        );
      }
      console.log(` All ${USERS.length} team members verified in MongoDB.`);
    } else {
      console.log(' Database is configured with team members.');
    }
  } catch (err) {
    console.error(' Seeding check error:', err.message);
  }
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseName: 'TTT-Database',
    region: 'ap-south-1 (Mumbai)',
    activeSseClients: sseClients.size,
    timestamp: new Date().toISOString(),
  });
});

// Broadcast custom client event endpoint
app.post('/api/events/broadcast', async (req, res) => {
  try {
    const { eventType, payload, meta } = req.body;
    await broadcastRealtimeEvent(eventType || 'custom.event', payload, meta);
    res.json({ success: true, message: 'Event broadcast to authorized clients' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clean Reset Database Route
app.post('/api/clean-reset-database', async (req, res) => {
  try {
    await Task.deleteMany({});
    await Feedback.deleteMany({});
    await User.deleteMany({});

    const initialUser = new User({
      id: 'u-shashank-01',
      name: 'Shashank Mishra',
      email: 'shashank.m@netbounceplacement.com',
      password: '_Shas@061',
      role: 'management',
      dept: 'Operations',
      empId: 'TTT-NB-001',
      tttNbId: 'TTT-NB-001',
      joined: new Date().toISOString().slice(0, 10),
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });
    await initialUser.save();

    res.json({
      success: true,
      message: 'Database cleaned! Fake data removed. Shashank Mishra provisioned as 1st member (TTT-NB-001).',
      users: [initialUser],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Manual Seed & Clean Route (Users 100% Preserved)
app.post('/api/seed', async (req, res) => {
  try {
    let INITIAL_TASKS = [];
    let INITIAL_FEEDBACK_RECORDS = [];
    try {
      const m = await import('./src/data/mockData.js');
      if (m.INITIAL_TASKS) INITIAL_TASKS = m.INITIAL_TASKS;
      if (m.INITIAL_FEEDBACK_RECORDS) INITIAL_FEEDBACK_RECORDS = m.INITIAL_FEEDBACK_RECORDS;
    } catch (e) {}

    if (mongoose.connection.readyState === 1) {
      await Task.deleteMany({});
      await Feedback.deleteMany({});
      if (INITIAL_TASKS.length > 0) await Task.insertMany(INITIAL_TASKS);
      if (INITIAL_FEEDBACK_RECORDS.length > 0) await Feedback.insertMany(INITIAL_FEEDBACK_RECORDS);
    }
    res.json({ success: true, message: 'Database test tasks and feedbacks cleared successfully. Users preserved intact.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clear Test Data Route (Removes test tasks and feedbacks, strictly keeps all users)
app.post('/api/clean-test-data', async (req, res) => {
  try {
    let tasksDeleted = 0;
    let feedbacksDeleted = 0;
    if (mongoose.connection.readyState === 1) {
      const tRes = await Task.deleteMany({});
      const fRes = await Feedback.deleteMany({});
      tasksDeleted = tRes.deletedCount || 0;
      feedbacksDeleted = fRes.deletedCount || 0;
    }
    const userCount = await User.countDocuments();
    broadcastRealtimeEvent('tasks.cleared', {});
    res.json({
      success: true,
      message: 'Test tasks and feedbacks cleared successfully. All users preserved.',
      tasksDeleted,
      feedbacksDeleted,
      usersPreserved: userCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------- AUTHENTICATION ENDPOINT -----------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrId, password } = req.body;
    if (!emailOrId || !password) {
      return res.status(400).json({ error: 'Please enter both Email/ID and Password.' });
    }

    const cleanInput = emailOrId.trim();
    const cleanLower = cleanInput.toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;

    // 1. Query MongoDB if connected
    if (isDbConnected) {
      user = await User.findOne({
        $or: [
          { email: cleanLower },
          { id: cleanInput },
          { empId: cleanInput },
          { tttNbId: cleanInput },
        ],
      });
    }

    // 2. Fallback to authorized users directory if not found in MongoDB or if offline
    if (!user) {
      let USERS = [];
      try {
        const m = await import('./src/data/mockData.js');
        if (m.USERS) USERS = m.USERS;
      } catch (e) {}
      const staticUser = USERS.find(u =>
        u.email.toLowerCase() === cleanLower ||
        u.id.toLowerCase() === cleanLower ||
        (u.empId && u.empId.toLowerCase() === cleanLower) ||
        (u.tttNbId && u.tttNbId.toLowerCase() === cleanLower)
      );
      if (staticUser) {
        if (isDbConnected) {
          try {
            user = new User(staticUser);
            await user.save();
          } catch (saveErr) {
            user = staticUser;
          }
        } else {
          user = staticUser;
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials: No account found with this Email or ID.' });
    }

    if (user.status && user.status.toLowerCase() !== 'active') {
      return res.status(403).json({ error: 'Your account is inactive. Please contact Management.' });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials: Incorrect password.' });
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({
      success: true,
      message: `Signed in as ${userObj.name}`,
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- USERS ENDPOINTS -----------------
app.get('/api/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().sort({ createdAt: -1 });
      if (users && users.length > 0) return res.json(users);
    }
    let USERS = [];
    try {
      const m = await import('./src/data/mockData.js');
      if (m.USERS) USERS = m.USERS;
    } catch (e) {}
    res.json(USERS);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const existing = await User.findOne({ email: userData.email?.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const user = new User({
      ...userData,
      email: userData.email?.toLowerCase(),
    });
    await user.save();
    broadcastRealtimeEvent('user.created', user.toObject ? user.toObject() : user);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const user = await User.findOneAndUpdate(
      { $or: [{ id: userId }, { empId: userId }, { tttNbId: userId }] },
      { $set: updateData },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    broadcastRealtimeEvent('user.updated', user.toObject ? user.toObject() : user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await User.findOneAndDelete({
      $or: [{ id: userId }, { empId: userId }, { tttNbId: userId }]
    });
    broadcastRealtimeEvent('user.deleted', { id: userId });
    res.json({ message: 'User deleted successfully', deleted: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Valid Marketing Teams & POC assignment boundaries (Team Mukesh & Team Shivam)
const VALID_TEAMS = ['team-mukesh', 'team-shivam'];
const VALID_POCS_BY_TEAM = {
  'team-mukesh': [],
  'team-shivam': [],
};

// In-memory cache to guarantee real-time task sync even during DB transitions
const serverTasksCache = new Map();

// ----------------- TASKS ENDPOINTS -----------------
app.get('/api/tasks', async (req, res) => {
  try {
    const { role, userId, teamId } = req.query;
    let filter = {};

    if (role === 'tse' && userId) {
      let searchTerms = [userId];
      try {
        const mock = await import('./src/data/mockData.js');
        const foundUser = (mock.USERS || []).find(u => u.id === userId || u.empId === userId || u.tttNbId === userId);
        if (foundUser) {
          if (foundUser.name) searchTerms.push(foundUser.name);
          if (foundUser.codeName) searchTerms.push(foundUser.codeName);
          if (foundUser.empId) searchTerms.push(foundUser.empId);
        }
      } catch (e) {}
      const regexStr = searchTerms.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\    if (role === 'tse' && userId) {
      filter = { $or: [{ assigneeId: userId }, { techPerson: { $regex: new RegExp(userId, 'i') } }, { codeName: { $regex: new RegExp(userId, 'i') } }] };
    }')).join('|');
      filter = { 
        $or: [
          { assigneeId: { $in: searchTerms } },
          { techPerson: { $regex: new RegExp(regexStr, 'i') } },
          { codeName: { $regex: new RegExp(regexStr, 'i') } }
        ] 
      };
    } else if (role === 'recruiter' && userId) {
      filter = { $or: [{ pocId: userId }, { recruiterName: { $regex: new RegExp(userId, 'i') } }] };
    } else if (role === 'marketing_tl') {
      const tId = teamId || (userId === 'u-tl-shivam' ? 'team-shivam' : 'team-mukesh');
      const teamRegex = tId === 'team-shivam' ? /shivam/i : /mukesh/i;
      filter = {
        $or: [
          { teamLeadId: userId },
          { teamId: tId },
          { teamName: { $regex: teamRegex } },
          { teamId: { $exists: false } },
          { teamId: '' },
        ]
      };
      if (!resolvedTeam && userId) {
        if (userId === 'u-tl-mukesh' || userId.includes('mukesh')) resolvedTeam = 'team-mukesh';
        else if (userId === 'u-tl-shivam' || userId.includes('shivam')) resolvedTeam = 'team-shivam';
      }
      filter = { 
        $or: [
          { teamLeadId: userId }, 
          { teamId: resolvedTeam || { $in: ['team-mukesh', 'team-shivam'] } },
          { teamName: { $regex: new RegExp(resolvedTeam ? resolvedTeam.replace('team-', '') : 'mukesh|shivam', 'i') } },
          { marketingTl: { $regex: new RegExp(resolvedTeam ? resolvedTeam.replace('team-', '') : 'mukesh|shivam', 'i') } }
        ] 
      };
    } else if (role === 'marketing_sr') {
      filter = { teamId: teamId || 'team-mukesh' };
    }

    let tasks = [];
    if (mongoose.connection.readyState === 1) {
      tasks = await Task.find(filter).sort({ createdAt: -1 });
    }
    // Merge any memory-cached tasks to guarantee instantaneous consistency
    if (serverTasksCache.size > 0) {
      const taskMap = new Map();
      (tasks || []).forEach(t => {
        const obj = t.toObject ? t.toObject() : t;
        if (obj && obj.id) taskMap.set(obj.id, obj);
      });
      for (const [id, mTask] of serverTasksCache.entries()) {
        const existing = taskMap.get(id);
        taskMap.set(id, existing ? { ...existing, ...mTask } : mTask);
      }
      tasks = Array.from(taskMap.values());
    }

    if (!tasks || tasks.length === 0) {
      let INITIAL_TASKS = [];
try { const m = await import('./src/data/mockData.js'); if (m.INITIAL_TASKS) INITIAL_TASKS = m.INITIAL_TASKS; } catch (e) {}
      tasks = INITIAL_TASKS;
    }

    // Server-side identity privacy: never expose TSE/TSM real names to Marketing roles
    if (role === 'marketing_tl' || role === 'marketing_sr') {
      let TSE_CODE_NAMES = FALLBACK_TSE_CODES;
      let TSM_CODE_NAMES = FALLBACK_TSM_CODES;
      try {
        const m = await import('./src/data/mockData.js');
        if (m.TSE_CODE_NAMES) TSE_CODE_NAMES = m.TSE_CODE_NAMES;
        if (m.TSM_CODE_NAMES) TSM_CODE_NAMES = m.TSM_CODE_NAMES;
      } catch (e) {}
      tasks = tasks.map(t => {
        const obj = t.toObject ? t.toObject() : { ...t };
        const tseCode = obj.codeName || (TSE_CODE_NAMES && TSE_CODE_NAMES[obj.techPerson]) || 'Code Name Unassigned';
        obj.techPerson = tseCode;
        if (Array.isArray(obj.timeline)) {
          obj.timeline = obj.timeline.map(tl => ({
            ...tl,
            by: (TSM_CODE_NAMES && TSM_CODE_NAMES[tl.by]) || (TSE_CODE_NAMES && TSE_CODE_NAMES[tl.by]) || tl.by,
          }));
        }
        return obj;
      });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const taskData = req.body;
    const { teamId, pocId, candidateName } = taskData;

    if (!candidateName || !candidateName.trim()) {
      return res.status(400).json({ error: 'Candidate name is required.' });
    }

    // Dynamic server-side validation: allow valid team POCs, dynamic DB users with role marketing_sr/recruiter
    if (teamId && pocId && pocId !== 'unassigned') {
      const isLegacyWhitelisted = VALID_POCS_BY_TEAM[teamId] && VALID_POCS_BY_TEAM[teamId].includes(pocId);
      let isValidUser = isLegacyWhitelisted;
      if (!isValidUser && mongoose.connection.readyState === 1) {
        const userDoc = await User.findOne({
          $or: [{ id: pocId }, { empId: pocId }, { tttNbId: pocId }]
        });
        if (userDoc && (userDoc.role === 'marketing_sr' || userDoc.role === 'recruiter' || userDoc.role === 'marketing_tl')) {
          if (!userDoc.teamId || userDoc.teamId === teamId) {
            isValidUser = true;
          }
        }
      }
      if (!isValidUser && !isLegacyWhitelisted) {
        try {
          const mock = await import('./src/data/mockData.js');
          if (mock.resolveSr) {
            const resolved = mock.resolveSr(pocId);
            if (resolved) isValidUser = true;
          }
        } catch (e) {}
      }
      if (!isValidUser && VALID_POCS_BY_TEAM[teamId]) {
        return res.status(400).json({
          error: 'Unauthorized assignment: Recruiter / POC does not belong to the selected Marketing Team.',
        });
      }
    }

    let task;
    if (mongoose.connection.readyState === 1) {
      task = new Task(taskData);
      await task.save();
    } else {
      task = taskData;
    }

    // Auto-create linked feedback session
    const feedbackId = `fb-task-${task.id}`;
    let existingFeedback = null;
    if (mongoose.connection.readyState === 1) {
      existingFeedback = await Feedback.findOne({ id: feedbackId });
    }

    if (!existingFeedback) {
      let TECH_SUPPORT_TEAM = FALLBACK_TECH_SUPPORT;
try { const m = await import('./src/data/mockData.js'); if (m.TECH_SUPPORT_TEAM) TECH_SUPPORT_TEAM = m.TECH_SUPPORT_TEAM; } catch (e) {}
      const assignedTse = TECH_SUPPORT_TEAM.find(t => 
        t.supportName.toLowerCase() === (task.techPerson || '').toLowerCase()
      ) || TECH_SUPPORT_TEAM[0];

      const linkedFeedback = {
        id: feedbackId,
        date: task.date || new Date().toISOString().slice(0, 10),
        techSupport: task.codeName || assignedTse.supportName,
        techSupportId: assignedTse.id,
        techSupportEmail: assignedTse.email,
        employeeName: assignedTse.employeeName,
        candidateName: task.candidateName || 'Candidate',
        candidateEmail: '',
        recruiterName: task.recruiterName || 'Aditi Sharma',
        pocId: task.pocId || 'u-poc-aditi',
        teamId: task.teamId || 'team-mukesh',
        teamLeadId: task.teamLeadId || 'u-tl-mukesh',
        teamName: task.teamName || 'Team Mukesh',
        jobRole: task.position || 'Software Engineer',
        company: task.companyName || 'Amazon',
        round: task.taskType || 'TQC',
        techSupportType: task.taskType || 'TQC',
        timestamp: new Date().toLocaleString('en-GB'),
        candidateFeedback: { submitted: false },
        marketingReview: null,
      };

      if (mongoose.connection.readyState === 1) {
        const fbModel = new Feedback(linkedFeedback);
        await fbModel.save();
      }
    }

    // Broadcast Realtime Event
    const payload = task.toObject ? task.toObject() : task;
    serverTasksCache.set(task.id, payload);
    broadcastRealtimeEvent('task.created', payload, {
      actorId: taskData.createdById,
      newStatus: task.status || 'Pending',
    });

    res.status(201).json({ task, linkedFeedbackId: feedbackId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    let task = null;
    if (mongoose.connection.readyState === 1) {
      task = await Task.findOne({
        $or: [
          { id: req.params.id },
          { id: req.params.id.toUpperCase() },
          { id: req.params.id.toLowerCase() },
          { candidateId: req.params.id },
        ]
      });
    }
    if (!task) {
      task = serverTasksCache.get(req.params.id);
    }
    if (!task) {
      try {
        const mock = await import('./src/data/mockData.js');
        task = (mock.INITIAL_TASKS || []).find(t => t.id === req.params.id || (t.id && t.id.toLowerCase() === req.params.id.toLowerCase()));
      } catch (e) {}
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const payload = task.toObject ? task.toObject() : task;
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    let existing = null;
    let updated = null;

    if (mongoose.connection.readyState === 1) {
      existing = await Task.findOne({ id: req.params.id });
      updated = await Task.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true, upsert: true }
      );
    } else {
      const cached = serverTasksCache.get(req.params.id) || {};
      updated = { ...cached, ...req.body, id: req.params.id };
    }

    if (!updated) return res.status(404).json({ error: 'Task not found' });

    const payload = updated.toObject ? updated.toObject() : updated;
    serverTasksCache.set(req.params.id, payload);

    const prevStatus = existing?.status;
    const newStatus = payload.status;
    const isDone = newStatus === 'Done' || newStatus === 'Completed';

    let eventType = 'task.updated';
    if (isDone && prevStatus !== 'Done' && prevStatus !== 'Completed') {
      eventType = 'task.completed';
    } else if (newStatus && prevStatus && newStatus !== prevStatus) {
      eventType = 'task.status_changed';
    } else if (req.body.assigneeId && existing?.assigneeId && req.body.assigneeId !== existing.assigneeId) {
      eventType = 'task.reassigned';
    }

    broadcastRealtimeEvent(eventType, payload, {
      previousStatus: prevStatus,
      newStatus,
    });

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Task.findOneAndDelete({ id: req.params.id });
    }
    broadcastRealtimeEvent('task.deleted', { id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- FEEDBACKS ENDPOINTS -----------------
app.get('/api/feedbacks', async (req, res) => {
  try {
    const { role, userId, teamId } = req.query;
    let filter = {};

    if (role === 'tse' && userId) {
      filter = { $or: [{ techSupportId: userId }, { employeeName: { $regex: new RegExp(userId, 'i') } }] };
    } else if (role === 'recruiter' && userId) {
      filter = { $or: [{ pocId: userId }, { recruiterName: { $regex: new RegExp(userId, 'i') } }] };
    } else if (role === 'marketing_tl') {
      filter = { $or: [{ teamLeadId: userId }, { teamId: teamId || 'team-mukesh' }] };
    } else if (role === 'marketing_sr') {
      filter = { teamId: teamId || 'team-mukesh' };
    }

    let feedbacks = [];
    if (mongoose.connection.readyState === 1) {
      feedbacks = await Feedback.find(filter).sort({ createdAt: -1 });
    }
    if (!feedbacks || feedbacks.length === 0) {
      let INITIAL_FEEDBACK_RECORDS = [];
try { const m = await import('./src/data/mockData.js'); if (m.INITIAL_FEEDBACK_RECORDS) INITIAL_FEEDBACK_RECORDS = m.INITIAL_FEEDBACK_RECORDS; } catch (e) {}
      feedbacks = INITIAL_FEEDBACK_RECORDS;
    }

    // Sanitize identity privacy for Marketing roles
    if (role === 'marketing_tl' || role === 'marketing_sr') {
      let TSE_CODE_NAMES = FALLBACK_TSE_CODES;
try { const m = await import('./src/data/mockData.js'); if (m.TSE_CODE_NAMES) TSE_CODE_NAMES = m.TSE_CODE_NAMES; } catch (e) {}
      feedbacks = feedbacks.map(fb => {
        const obj = fb.toObject ? fb.toObject() : { ...fb };
        const codeName = obj.codeName || (TSE_CODE_NAMES && TSE_CODE_NAMES[obj.techSupport]) || 'Code Name Unassigned';
        obj.techSupport = codeName;
        obj.employeeName = codeName; // Never leak real employee name
        obj.techSupportEmail = 'techsupport@netbounceplacement.com';
        return obj;
      });
    }

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Guard Candidate SAGA Feedback link generation (Only Marketing SR, TL, Management authorized)
app.delete('/api/feedbacks/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Feedback.findOneAndDelete({ $or: [{ id: req.params.id }, { taskId: req.params.id }, { _id: req.params.id }] });
    }
    broadcastRealtimeEvent('candidate.feedback_deleted', { id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedbacks/generate-link', (req, res) => {
  const role = req.body?.role || req.headers['x-user-role'];
  const authorizedRoles = ['marketing_sr', 'recruiter', 'marketing_tl', 'management', 'upper_management'];

  if (role === 'tse') {
    return res.status(403).json({ error: 'TSE is not authorized to generate Candidate SAGA feedback links.' });
  }
  if (role === 'tsm') {
    return res.status(403).json({ error: 'TSM is not authorized to generate Candidate SAGA feedback links.' });
  }
  if (role && !authorizedRoles.includes(role)) {
    return res.status(403).json({ error: 'Your role is not authorized to generate Candidate SAGA feedback links.' });
  }
  res.json({ success: true, message: 'Authorized' });
});

app.post('/api/feedbacks', async (req, res) => {
  try {
    const callerRole = req.body?.role || req.headers['x-user-role'];
    if (callerRole === 'tse' || callerRole === 'tsm') {
      return res.status(403).json({ error: `${callerRole.toUpperCase()} is not authorized to generate feedback links or initialize feedback records.` });
    }
    let feedback;
    if (mongoose.connection.readyState === 1) {
      feedback = new Feedback(req.body);
      await feedback.save();
    } else {
      feedback = req.body;
    }
    broadcastRealtimeEvent('candidate.feedback_created', feedback.toObject ? feedback.toObject() : feedback);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Candidate Submission from Candidate SAGA Portal
// Candidate Submission from Candidate SAGA Portal (Auto-links with Task & team metadata)
app.put('/api/feedbacks/:id/candidate', async (req, res) => {
  try {
    const { performanceRating, experienceRating, comments } = req.body;
    const nowFormatted = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    // 1. Authoritative lookup from linked Task in MongoDB Atlas
    let linkedTask = null;
    if (mongoose.connection.readyState === 1) {
      linkedTask = await Task.findOne({
        $or: [
          { id: req.params.id },
          { id: req.params.id.toUpperCase() },
          { id: req.params.id.toLowerCase() },
          { candidateId: req.params.id },
        ]
      });
    }

    const candidateFeedbackData = {
      submitted: true,
      performanceRating: Number(performanceRating) || Number(req.body.candidateFeedback?.performanceRating) || 5.0,
      experienceRating: Number(experienceRating) || Number(req.body.candidateFeedback?.experienceRating) || 5.0,
      comments: comments || req.body.candidateFeedback?.comments || 'Support session completed.',
      timestamp: nowFormatted,
    };

    const updateData = {
      id: req.params.id,
      taskId: req.params.id,
      candidateName: req.body.candidateName || linkedTask?.candidateName || 'Candidate',
      candidateEmail: req.body.candidateEmail || '',
      company: req.body.company || linkedTask?.companyName || 'Client Assessment',
      recruiterName: linkedTask?.recruiterName || req.body.recruiterName || 'Unassigned',
      pocId: linkedTask?.pocId || req.body.pocId || '',
      teamId: linkedTask?.teamId || req.body.teamId || 'team-mukesh',
      teamName: linkedTask?.teamName || req.body.teamName || 'Team Mukesh',
      teamLeadId: linkedTask?.teamLeadId || req.body.teamLeadId || 'u-tl-mukesh',
      techSupport: req.body.techSupport || linkedTask?.codeName || linkedTask?.techPerson || 'TSE',
      techSupportId: req.body.techSupportId || linkedTask?.assigneeId || 'TTT-NB-008',
      techSupportType: req.body.techSupportType || linkedTask?.taskType || 'Interview',
      date: linkedTask?.date || req.body.date || new Date().toISOString().slice(0, 10),
      candidateFeedback: candidateFeedbackData,
      updatedAt: new Date().toISOString(),
    };

    let updated;
    if (mongoose.connection.readyState === 1) {
      updated = await Feedback.findOneAndUpdate(
        { $or: [{ id: req.params.id }, { taskId: req.params.id }] },
        { $set: updateData },
        { new: true, upsert: true }
      );
    } else {
      updated = { id: req.params.id, ...updateData };
    }

    const payload = updated.toObject ? updated.toObject() : updated;
    broadcastRealtimeEvent('candidate.feedback_submitted', payload);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marketing Review Submission
app.put('/api/feedbacks/:id/marketing', async (req, res) => {
  try {
    const reviewData = req.body;
    const nowFormatted = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const updateData = {
      marketingReview: {
        ...reviewData,
        reviewed: true,
        timestamp: nowFormatted,
      },
    };

    let updated;
    if (mongoose.connection.readyState === 1) {
      updated = await Feedback.findOneAndUpdate(
        { id: req.params.id },
        { $set: updateData },
        { new: true }
      );
    } else {
      updated = { id: req.params.id, ...updateData };
    }

    if (!updated) return res.status(404).json({ error: 'Feedback record not found' });
    broadcastRealtimeEvent('candidate.feedback_reviewed', updated.toObject ? updated.toObject() : updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AI DIRECT DATABASE QUERY ENDPOINT (/api/ai/ask)
// -------------------------------------------------------------
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    let tasks = [];
    let feedbacks = [];
    let users = [];

    if (mongoose.connection.readyState === 1) {
      [tasks, feedbacks, users] = await Promise.all([
        Task.find().lean(),
        Feedback.find().lean(),
        User.find().lean(),
      ]);
    } else {
      let mock = {};
      try {
        mock = await import('./src/data/mockData.js');
      } catch (e) {}
      tasks = mock.INITIAL_TASKS || [];
      feedbacks = mock.INITIAL_FEEDBACK_RECORDS || [];
      users = mock.USERS || [];
    }

    // 2. Aggregate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done' || t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const rescheduleTasks = tasks.filter(t => t.status === 'Reschedule').length;
    const cancelTasks = tasks.filter(t => t.status === 'Cancel').length;
    const notPossibleTasks = tasks.filter(t => t.status === 'Not Possible').length;
    const totalUsers = users.length;

    // TSE stats
    const tseBreakdown = {};
    tasks.forEach(t => {
      const name = t.techPerson || 'Unassigned';
      if (!tseBreakdown[name]) tseBreakdown[name] = { total: 0, done: 0, pending: 0, other: 0 };
      tseBreakdown[name].total += 1;
      if (t.status === 'Done' || t.status === 'Completed') tseBreakdown[name].done += 1;
      else if (t.status === 'Pending') tseBreakdown[name].pending += 1;
      else tseBreakdown[name].other += 1;
    });

    // Feedback stats
    const totalFeedbacks = feedbacks.length;
    const submittedFeedbacks = feedbacks.filter(f => f.candidateFeedback?.submitted).length;
    const pendingFeedbacks = totalFeedbacks - submittedFeedbacks;
    const reviewedTseCount = feedbacks.filter(f => f.marketingReview?.reviewed).length;

    // Team breakdown
    const mukeshTasks = tasks.filter(t => (t.teamName || '').toLowerCase().includes('mukesh')).length;
    const shivamTasks = tasks.filter(t => (t.teamName || '').toLowerCase().includes('shivam')).length;

    // Construct live MongoDB Atlas Snapshot
    const dbSnapshot = `
--- LIVE MONGODB ATLAS DATABASE SNAPSHOT (Cluster: TTT-Database, Mumbai ap-south-1) ---
 Total Team Members: ${totalUsers} active members in roster.
 Team Roster Members:
${users.map(u => `  - ${u.name} (Role: ${u.role}, Dept: ${u.dept || 'Operations'}, ID: ${u.empId || u.tttNbId || u.id})`).join('\n')}
 Total Tasks in Database: ${totalTasks}
  - Done: ${completedTasks} | Pending: ${pendingTasks} | Reschedule: ${rescheduleTasks} | Cancel: ${cancelTasks} | Not Possible: ${notPossibleTasks}
 Tasks by Team: Team Mukesh: ${mukeshTasks} | Team Shivam: ${shivamTasks}
 TSE Task Breakdown:
${Object.entries(tseBreakdown).map(([name, s]) => `  - ${name}: Total ${s.total} (Done: ${s.done}, Pending: ${s.pending}, Other: ${s.other})`).join('\n')}
 Feedback & Evaluations:
  - Total Sessions: ${totalFeedbacks} | Candidate Submitted: ${submittedFeedbacks} | Pending Candidate: ${pendingFeedbacks}
  - Marketing TSE Reviews Completed: ${reviewedTseCount}
 Sample Recent Tasks:
${tasks.slice(0, 15).map(t => `  - [${t.date}] Candidate: ${t.candidateName || 'N/A'} | TSE: ${t.techPerson} | Company: ${t.companyName || t.company} | Type: ${t.taskType} | Status: ${t.status}${t.remark ? ` | Remark: ${t.remark}` : ''}`).join('\n')}
 Sample Feedback Records:
${feedbacks.slice(0, 10).map(f => `  - Candidate: ${f.candidateName} | TSE: ${f.techSupport} (${f.techSupportId}) | Recruiter: ${f.recruiterName} (${f.teamName}) | Submitted: ${f.candidateFeedback?.submitted ? 'YES (Rating: ' + (f.candidateFeedback.performanceRating || 5) + '/5)' : 'NO (Pending)'}`).join('\n')}
----------------------------------------------------------------------------------------`;

    const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || '';
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    const qLower = (query || '').toLowerCase();
    if (
      qLower.includes('kaise bane') ||
      qLower.includes('kisne banaya') ||
      qLower.includes('who made') ||
      qLower.includes('who created') ||
      qLower.includes('who designed') ||
      qLower.includes('who built') ||
      qLower.includes('neural schema') ||
      qLower.includes('your creator') ||
      qLower.includes('your architecture') ||
      qLower.includes('how were you made') ||
      qLower.includes('how were you built') ||
      qLower.includes('how were you designed')
    ) {
      return res.json({
        answer: 'My neural schema and operational architecture have been designed and engineered by Shashank for the NetBounce Operations Platform.',
        model: 'nb-ai-core',
      });
    }

    const systemPrompt = `You are "NB AI", an advanced, highly intelligent conversational AI assistant (like ChatGPT), equipped with live real-time access to the NetBounce Operations database (MongoDB Atlas - Mumbai Cluster).

${dbSnapshot}

Operational Directives:
1. Conversational Intelligence (Like ChatGPT): You possess vast general intelligence across all domains science, Mars, astronomy, general knowledge, business strategy, coding, and drafting communications. When asked general questions (e.g. "tell me about mars", "write an email", "what is photosynthesis"), answer naturally, thoroughly, and intelligently just like ChatGPT. DO NOT mention NetBounce or database metrics, and DO NOT add any preamble headers (like "NB AI live connection...") when answering general, unrelated questions.
2. Answering NetBounce & Dashboard Inquiries: When the user asks about the NetBounce dashboard, team members, tasks, interviews, or ratings, answer PRECISELY and SPECIFICALLY to what was asked. DO NOT output a broad copy-paste dashboard template or dump all metrics. Answer only the exact question asked using the live MongoDB database snapshot above.
3. Identity & Neural Architecture: If asked who built, created, or designed you or about your neural schema (in English, Hindi, or any language), answer strictly in English:
   "My neural schema and operational architecture have been designed and engineered by Shashank for the NetBounce Operations Platform."
4. Tone & Salutation: NEVER use "Sir" or "Ma'am" under any circumstances. Address the user directly by name or friendly, polished professional tone.
5. Language: Always answer in English. Do not use Hindi or Hinglish.
6. Clean Formatting: Never use markdown asterisks (never use ** around words or bolding). Write in clean, legible text. Use neat bullet points and line breaks when presenting multiple points.
7. Identity: Identify yourself as "NB AI".`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: query },
    ];

    let answer = 'No response generated.';
    try {
      const groqRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages,
          temperature: 0.6,
          max_tokens: 800,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        answer = data.choices?.[0]?.message?.content || answer;
      } else {
        const fallbackRes = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            messages,
            temperature: 0.6,
            max_tokens: 800,
          }),
        });
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          answer = fbData.choices?.[0]?.message?.content || answer;
        }
      }
    } catch (apiErr) {
      console.warn('Groq fetch error in backend:', apiErr);
    }

    res.json({
      answer,
      source: 'mongodb_atlas',
      database: 'TTT-Database',
      region: 'ap-south-1 (Mumbai)',
      totalTasks,
      totalFeedbacks,
    });
  } catch (err) {
    console.error('AI DB query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(` TTT-NB Backend Server running on http://localhost:${PORT}`);
});
