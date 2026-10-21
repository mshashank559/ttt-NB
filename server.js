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
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 8000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas (Mumbai Region - TTT-Database)');
    seedDatabaseIfEmpty();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

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
  assignedSrId: String,
  assignedSrName: String,
  assignedSrEmail: String,
  completionRemark: String,
  createdById: String,
  description: String,
  notes: String,
  interviewDateTime: String,
  interviewOutcome: String,
  interviewStatus: String,
  outcomeAuditTrail: Array,
  isUrgent: Boolean,
  isElevated: Boolean,
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

const SlaTicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ticketNumber: String,
  candidateName: String,
  companyName: String,
  interviewId: String,
  techSupport: String,
  techSupportId: String,
  rating: Number,
  comments: String,
  responsibleTsm: { type: String, default: 'Shashank Mishra' },
  responsibleTsmId: String,
  status: { type: String, default: 'Open' }, // 'Open', 'In Follow-up', 'Resolved'
  actionTaken: { type: String, default: '' },
  resolutionDetails: { type: String, default: '' },
  resolvedAt: String,
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
  marketingManagerId: String,
  marketingManagerName: String,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const User = mongoose.model('User', UserSchema);
const SlaTicket = mongoose.model('SlaTicket', SlaTicketSchema);

// -------------------------------------------------------------
// Auto-Seed Initial Data if Collections are Empty
// -------------------------------------------------------------
async function seedDatabaseIfEmpty() {
  try {
    // Check if stale mock data is in DB
    const oldUser = await User.findOne({ email: { $in: ['aarav.mehta@netbounce.io', 'amber.afreen@netbounce.io', 'admin@netbounce.io'] } });
    const shashankExists = await User.findOne({ email: 'shashank.m@netbounceplacement.com' });

    if (oldUser || !shashankExists) {
      console.log('🧹 Purging old mock data from MongoDB Atlas and provisioning 1st member...');
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
      console.log('✅ 1st member provisioned in MongoDB: Shashank Mishra (TTT-NB-001)');
    } else {
      console.log('✅ Database is already configured with real members.');
    }

    // Auto-provision 14 Marketing SR users if missing
    await syncMarketingSrUsersInternal();
  } catch (err) {
    console.error('⚠️ Seeding error:', err.message);
  }
}

async function syncMarketingSrUsersInternal() {
  try {
    const { MARKETING_SR_USERS } = await import('./src/data/mockData.js');
    if (Array.isArray(MARKETING_SR_USERS) && MARKETING_SR_USERS.length > 0) {
      let added = 0;
      for (const sr of MARKETING_SR_USERS) {
        const exists = await User.findOne({ $or: [{ id: sr.id }, { email: sr.email }, { empId: sr.empId }] });
        if (!exists) {
          await new User(sr).save();
          added++;
        }
      }
      if (added > 0) {
        console.log(`✅ Provisioned ${added} Marketing SR users to MongoDB Atlas.`);
      }
    }
  } catch (e) {
    console.warn('⚠️ SR sync warning:', e.message);
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
    timestamp: new Date().toISOString(),
  });
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

// Manual Seed Route
app.post('/api/seed', async (req, res) => {
  try {
    const { INITIAL_TASKS, INITIAL_FEEDBACK_RECORDS } = await import('./src/data/mockData.js');
    await Task.deleteMany({});
    await Feedback.deleteMany({});
    if (INITIAL_TASKS.length > 0) await Task.insertMany(INITIAL_TASKS);
    if (INITIAL_FEEDBACK_RECORDS.length > 0) await Feedback.insertMany(INITIAL_FEEDBACK_RECORDS);
    res.json({ success: true, message: 'Database reset & seeded successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------- USERS ENDPOINTS -----------------
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
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
    res.json({ message: 'User deleted successfully', deleted: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Valid Marketing Teams (Team Mukesh & Team Shivam)
const VALID_TEAMS = ['team-mukesh', 'team-shivam'];

// Manual sync route for Marketing SR users
app.post('/api/sync-marketing-srs', async (req, res) => {
  try {
    await syncMarketingSrUsersInternal();
    const srs = await User.find({ role: 'marketing_sr' });
    res.json({ success: true, count: srs.length, users: srs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- TASKS ENDPOINTS -----------------
app.get('/api/tasks', async (req, res) => {
  try {
    const { role, userId, teamId } = req.query;
    let filter = {};

    if (role === 'tse' && userId) {
      filter = { $or: [{ assigneeId: userId }, { techPerson: { $regex: new RegExp(userId, 'i') } }] };
    } else if (role === 'recruiter' && userId) {
      filter = { $or: [{ pocId: userId }, { recruiterName: { $regex: new RegExp(userId, 'i') } }, { assignedSrId: userId }] };
    } else if (role === 'marketing_tl') {
      const isShivam = userId === 'u-1791911115518' || (req.query.teamName && req.query.teamName.includes('Shivam'));
      const defaultTeam = isShivam ? 'team-shivam' : 'team-mukesh';
      filter = { $or: [{ teamLeadId: userId }, { teamId: teamId || defaultTeam }] };
    } else if (role === 'marketing_sr') {
      if (userId) {
        filter = { $or: [{ assignedSrId: userId }, { teamId: teamId || 'team-mukesh' }] };
      } else {
        filter = { teamId: teamId || 'team-mukesh' };
      }
    }

    let tasks = await Task.find(filter).sort({ createdAt: -1 });

    // Server-side identity privacy: never expose TSE/TSM real names to Marketing roles
    if (role === 'marketing_tl' || role === 'marketing_sr') {
      const { TSE_CODE_NAMES, TSM_CODE_NAMES } = await import('./src/data/mockData.js');
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
    const { teamId, candidateName } = taskData;

    if (!candidateName || !candidateName.trim()) {
      return res.status(400).json({ error: 'Candidate name is required.' });
    }

    const task = new Task(taskData);
    await task.save();

    // Auto-create linked feedback session
    const feedbackId = `fb-task-${task.id}`;
    const existingFeedback = await Feedback.findOne({ id: feedbackId });
    if (!existingFeedback) {
      const { TECH_SUPPORT_TEAM } = await import('./src/data/mockData.js');
      const assignedTse = TECH_SUPPORT_TEAM.find(t => 
        t.supportName.toLowerCase() === (task.techPerson || '').toLowerCase()
      ) || TECH_SUPPORT_TEAM[0];

      const isShivam = task.teamId === 'team-shivam' || (task.teamName && task.teamName.includes('Shivam'));
      const fallbackLeadId = isShivam ? 'u-1791911115518' : 'u-1791911058812';
      const fallbackTeamName = isShivam ? 'Team Shivam' : 'Team Mukesh';

      const linkedFeedback = new Feedback({
        id: feedbackId,
        taskId: task.id,
        date: task.date || new Date().toISOString().slice(0, 10),
        techSupport: task.codeName || assignedTse.supportName,
        techSupportId: assignedTse.id,
        techSupportEmail: assignedTse.email,
        employeeName: assignedTse.employeeName,
        candidateName: task.candidateName || 'Candidate',
        candidateEmail: task.candidateEmail || '',
        recruiterName: task.assignedSrName || task.recruiterName || 'Marketing Team',
        pocId: task.assignedSrId || task.pocId || '',
        teamId: task.teamId || (isShivam ? 'team-shivam' : 'team-mukesh'),
        teamLeadId: task.teamLeadId || fallbackLeadId,
        teamName: task.teamName || fallbackTeamName,
        jobRole: task.position || '',
        company: task.companyName || '',
        round: task.taskType || 'Interview',
        techSupportType: task.taskType || 'Interview',
        timestamp: new Date().toLocaleString('en-GB'),
        candidateFeedback: { submitted: false },
        marketingReview: null,
      });
      await linkedFeedback.save();
    }

    res.status(201).json({ task, linkedFeedbackId: feedbackId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Task not found' });

    // Sync to linked feedback record if assignedSr or completion status changed
    if (req.body.assignedSrName || req.body.assignedSrId) {
      await Feedback.findOneAndUpdate(
        { $or: [{ id: `fb-task-${updated.id}` }, { taskId: updated.id }] },
        { 
          recruiterName: req.body.assignedSrName, 
          pocId: req.body.assignedSrId 
        }
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id/outcome', async (req, res) => {
  try {
    const { outcome, outcomeAuditTrail } = req.body;
    const patch = { interviewOutcome: outcome };
    if (outcomeAuditTrail) patch.outcomeAuditTrail = outcomeAuditTrail;
    const updated = await Task.findOneAndUpdate({ id: req.params.id }, { $set: patch }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findOneAndDelete({ id: req.params.id });
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

    let feedbacks = await Feedback.find(filter).sort({ createdAt: -1 });

    // Sanitize identity privacy for Marketing roles: ONLY show IDs, never real names or aliases
    if (role === 'marketing_tl' || role === 'marketing_sr') {
      feedbacks = feedbacks.map(fb => {
        const obj = fb.toObject ? fb.toObject() : { ...fb };
        const safeId = obj.techSupportId || 'TTT-NB-TSE';
        obj.techSupport = safeId;
        obj.employeeName = safeId;
        obj.codeName = safeId;
        obj.techSupportEmail = 'techsupport@netbounceplacement.com';
        return obj;
      });
    }

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedbacks', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();

    // Auto-create SLA Ticket if rating <= 3
    const cRating = feedback.candidateFeedback?.performanceRating || feedback.candidateFeedback?.experienceRating;
    if (cRating && Number(cRating) <= 3) {
      const ticketId = `SLA-${Date.now()}`;
      const slaTicket = new SlaTicket({
        id: ticketId,
        ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        candidateName: feedback.candidateName || 'Candidate',
        companyName: feedback.company || 'Client',
        interviewId: feedback.id,
        techSupport: feedback.employeeName || feedback.techSupport || 'TSE',
        techSupportId: feedback.techSupportId || 'TSE-ID',
        rating: Number(cRating),
        comments: feedback.candidateFeedback?.comments || 'Low rating logged on feedback creation.',
        responsibleTsm: 'Shashank Mishra',
        responsibleTsmId: 'u-shashank-01',
        status: 'Open',
        actionTaken: '',
        resolutionDetails: '',
      });
      await slaTicket.save();
    }

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Candidate Submission from Candidate SAGA Portal
app.put('/api/feedbacks/:id/candidate', async (req, res) => {
  try {
    const { performanceRating, experienceRating, comments } = req.body;
    const nowFormatted = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const ratingNum = Number(performanceRating) || Number(experienceRating) || 5.0;

    const updateData = {
      'candidateFeedback.submitted': true,
      'candidateFeedback.performanceRating': ratingNum,
      'candidateFeedback.experienceRating': Number(experienceRating) || ratingNum,
      'candidateFeedback.comments': comments || 'Support session completed.',
      'candidateFeedback.timestamp': nowFormatted,
    };

    const updated = await Feedback.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Milestone 6: Automatically create SLA Ticket if rating <= 3 stars
    if (ratingNum <= 3) {
      const existingTicket = await SlaTicket.findOne({ interviewId: req.params.id });
      if (!existingTicket) {
        const ticketId = `SLA-${Date.now()}`;
        const slaTicket = new SlaTicket({
          id: ticketId,
          ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          candidateName: updated.candidateName || 'Candidate',
          companyName: updated.company || 'Client Assessment',
          interviewId: req.params.id,
          techSupport: updated.employeeName || updated.techSupport || 'TSE',
          techSupportId: updated.techSupportId || 'TSE-ID',
          rating: ratingNum,
          comments: comments || 'Candidate reported unsatisfactory rating (3 stars or below).',
          responsibleTsm: 'Shashank Mishra',
          responsibleTsmId: 'u-shashank-01',
          status: 'Open',
          actionTaken: '',
          resolutionDetails: '',
        });
        await slaTicket.save();
      }
    }

    res.json(updated);
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

    const updated = await Feedback.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Feedback record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- SLA TICKETS ENDPOINTS (Milestone 6) -----------------
app.get('/api/sla-tickets', async (req, res) => {
  try {
    const tickets = await SlaTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sla-tickets', async (req, res) => {
  try {
    const data = req.body;
    const ticketId = data.id || `SLA-${Date.now()}`;
    const newTicket = new SlaTicket({
      ...data,
      id: ticketId,
      ticketNumber: data.ticketNumber || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sla-tickets/:id', async (req, res) => {
  try {
    const updated = await SlaTicket.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'SLA Ticket not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- INTERVIEW OUTCOME ENDPOINT (Milestone 6) -----------------
app.put('/api/tasks/:id/outcome', async (req, res) => {
  try {
    const { outcome } = req.body;
    const updated = await Task.findOneAndUpdate(
      { id: req.params.id },
      { $set: { interviewOutcome: outcome } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Task not found' });
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

    // 1. Fetch live records straight from MongoDB Atlas
    const [tasks, feedbacks, users] = await Promise.all([
      Task.find().lean(),
      Feedback.find().lean(),
      User.find().lean(),
    ]);

    // 2. Aggregate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
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
      if (t.status === 'Done') tseBreakdown[name].done += 1;
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
• Total Team Members: ${totalUsers} active members in roster.
• Team Roster Members:
${users.map(u => `  - ${u.name} (Role: ${u.role}, Dept: ${u.dept || 'Operations'}, ID: ${u.empId || u.tttNbId || u.id})`).join('\n')}
• Total Tasks in Database: ${totalTasks}
  - Done: ${completedTasks} | Pending: ${pendingTasks} | Reschedule: ${rescheduleTasks} | Cancel: ${cancelTasks} | Not Possible: ${notPossibleTasks}
• Tasks by Team: Team Mukesh: ${mukeshTasks} | Team Shivam: ${shivamTasks}
• TSE Task Breakdown:
${Object.entries(tseBreakdown).map(([name, s]) => `  - ${name}: Total ${s.total} (Done: ${s.done}, Pending: ${s.pending}, Other: ${s.other})`).join('\n')}
• Feedback & Evaluations:
  - Total Sessions: ${totalFeedbacks} | Candidate Submitted: ${submittedFeedbacks} | Pending Candidate: ${pendingFeedbacks}
  - Marketing TSE Reviews Completed: ${reviewedTseCount}
• Sample Recent Tasks:
${tasks.slice(0, 15).map(t => `  - [${t.date}] Candidate: ${t.candidateName || 'N/A'} | TSE: ${t.techPerson} | Company: ${t.companyName || t.company} | Type: ${t.taskType} | Status: ${t.status}${t.remark ? ` | Remark: ${t.remark}` : ''}`).join('\n')}
• Sample Feedback Records:
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
1. Conversational Intelligence (Like ChatGPT): You possess vast general intelligence across all domains—science, Mars, astronomy, general knowledge, business strategy, coding, and drafting communications. When asked general questions (e.g. "tell me about mars", "write an email", "what is photosynthesis"), answer naturally, thoroughly, and intelligently just like ChatGPT. DO NOT mention NetBounce or database metrics, and DO NOT add any preamble headers (like "NB AI – live connection...") when answering general, unrelated questions.
2. Answering NetBounce & Dashboard Inquiries: When the user asks about the NetBounce dashboard, team members, tasks, interviews, or ratings, answer PRECISELY and SPECIFICALLY to what was asked. DO NOT output a broad copy-paste dashboard template or dump all metrics. Answer only the exact question asked using the live MongoDB database snapshot above. For example, if asked "How many members are there?", answer "There are currently 19 active members in the roster." without reciting unrelated clear rates or overdue counts.
3. Identity & Neural Architecture: If asked who built, created, or designed you or about your neural schema (in English, Hindi, or any language), answer strictly in English:
   "My neural schema and operational architecture have been designed and engineered by Shashank for the NetBounce Operations Platform."
4. Tone & Salutation: NEVER use "Sir" or "Ma'am" under any circumstances. Address the user directly by name or friendly, polished professional tone.
5. Language: Always answer in English. Do not use Hindi or Hinglish.
6. Clean Formatting: Never use markdown asterisks (never use ** around words or bolding). Write in clean, legible text. Use neat bullet points (•) and line breaks when presenting multiple points.
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
  console.log(`🚀 TTT-NB Backend Server running on http://localhost:${PORT}`);
});
