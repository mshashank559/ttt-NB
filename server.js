import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import fs from 'fs';
import multer from 'multer';

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------------------------------------------------
// File Uploads Configuration (Attachments)
// -------------------------------------------------------------
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeUniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${baseName}${ext}`;
    cb(null, safeUniqueName);
  },
});

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'text/plain',
];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file limit
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.webp', '.txt'];
    if (allowedExts.includes(ext) || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed. Supported formats: PDF, DOC/DOCX, XLS/XLSX, CSV, PNG, JPG, JPEG, WEBP, TXT.`));
    }
  },
});

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
  attachments: { type: Array, default: [] },
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
  tseCodeName: String,
  tseRealName: String,
  rating: Number,
  comments: String,
  slaHours: { type: Number, default: 24 },
  deadline: String,
  isOverdue: { type: Boolean, default: false },
  responsibleTsm: { type: String, default: 'Tech Support Manager' },
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
  avatar: { type: String, default: '' },
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
    const { USERS } = await import('./src/data/mockData.js');
    if (Array.isArray(USERS) && USERS.length > 0) {
      let added = 0;
      for (const u of USERS) {
        const exists = await User.findOne({ $or: [{ id: u.id }, { email: u.email }] });
        if (!exists) {
          await new User(u).save();
          added++;
        }
      }
      if (added > 0) {
        console.log(`✅ Provisioned ${added} authoritative members to MongoDB Atlas.`);
      } else {
        console.log('✅ Database is already configured with real authoritative members.');
      }

      // Automatically normalize any legacy "Code Name Unassigned" or Harit Verma tasks/feedbacks to Abhishek (TSE-NB-001)
      await Feedback.updateMany(
        { $or: [{ techSupport: 'Code Name Unassigned' }, { techSupport: 'Unassigned', employeeName: { $regex: /harit/i } }, { employeeName: { $regex: /harit/i }, techSupport: { $ne: 'Abhishek' } }] },
        { $set: { techSupport: 'Abhishek', techSupportId: 'TSE-NB-001', employeeName: 'Harit verma', techSupportEmail: 'nbtech1@netbounceplacement.com' } }
      );
      await Task.updateMany(
        { $or: [{ codeName: 'Code Name Unassigned' }, { techPerson: { $regex: /harit/i }, codeName: { $in: ['', null, 'Unassigned', 'Code Name Unassigned'] } }] },
        { $set: { codeName: 'Abhishek' } }
      );
    }
  } catch (err) {
    console.error('⚠️ Seeding error:', err.message);
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

// Clean Reset Database Route (Purges business records, strictly preserves User Management)
app.post('/api/clean-reset-database', async (req, res) => {
  try {
    await Task.deleteMany({});
    await Feedback.deleteMany({});
    await SlaTicket.deleteMany({});

    // Ensure all real users exist
    const { USERS } = await import('./src/data/mockData.js');
    for (const u of USERS) {
      const exists = await User.findOne({ $or: [{ id: u.id }, { email: u.email }] });
      if (!exists) {
        await new User(u).save();
      }
    }
    const currentUsers = await User.find({});
    res.json({
      success: true,
      message: 'Database cleaned! Fake business records removed. All user accounts and roles preserved.',
      users: currentUsers,
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
    const requesterRole = req.query.role || req.query.requesterRole || req.headers['x-user-role'];
    let query = {};
    // TSM can ONLY view TSE and TSM users
    if (requesterRole === 'tsm') {
      query = { role: { $in: ['tse', 'tsm'] } };
    }
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const requesterRole = req.body.requesterRole || req.headers['x-user-role'];

    // TSM can ONLY create TSE and TSM users
    if (requesterRole === 'tsm' && !['tse', 'tsm'].includes(userData.role)) {
      return res.status(403).json({ error: 'TSM is only authorized to create credentials for TSE and TSM.' });
    }

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
    const requesterRole = req.body.requesterRole || req.headers['x-user-role'];

    // TSM can ONLY update TSE and TSM users, and cannot elevate to other roles
    if (requesterRole === 'tsm') {
      const targetUser = await User.findOne({ $or: [{ id: userId }, { empId: userId }, { tttNbId: userId }] });
      if (!targetUser || !['tse', 'tsm'].includes(targetUser.role)) {
        return res.status(403).json({ error: 'TSM is only authorized to edit TSE and TSM accounts.' });
      }
      if (updateData.role && !['tse', 'tsm'].includes(updateData.role)) {
        return res.status(403).json({ error: 'TSM cannot assign roles other than TSE or TSM.' });
      }
    }

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
    const requesterRole = req.query.requesterRole || req.query.role || req.headers['x-user-role'];

    // TSM can ONLY delete TSE and TSM users
    if (requesterRole === 'tsm') {
      const targetUser = await User.findOne({ $or: [{ id: userId }, { empId: userId }, { tttNbId: userId }] });
      if (!targetUser || !['tse', 'tsm'].includes(targetUser.role)) {
        return res.status(403).json({ error: 'TSM is only authorized to delete TSE and TSM accounts.' });
      }
    }

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
      const { TECH_SUPPORT_TEAM, TSE_IDS, getTseRealName } = await import('./src/data/mockData.js');
      const assignedTse = TECH_SUPPORT_TEAM.find(t => 
        (task.codeName && t.supportName.toLowerCase() === task.codeName.toLowerCase()) ||
        (task.techPerson && t.supportName.toLowerCase() === task.techPerson.toLowerCase()) ||
        (task.techPerson && t.employeeName.toLowerCase().includes(task.techPerson.toLowerCase())) ||
        (task.assigneeId && (t.id === task.assigneeId || TSE_IDS[task.assigneeId] === t.id))
      );

      const resolvedCodeName = assignedTse?.supportName || task.codeName || (task.techPerson && task.techPerson !== 'Unassigned' ? task.techPerson : 'Unassigned');
      const resolvedOfficialId = assignedTse?.id || (resolvedCodeName && TSE_IDS[resolvedCodeName]) || (task.assigneeId && TSE_IDS[task.assigneeId]) || (task.techPersonId?.startsWith('TSE-NB') ? task.techPersonId : '') || '';
      const resolvedRealName = assignedTse?.employeeName || getTseRealName(resolvedCodeName) || (task.techPerson !== 'Unassigned' ? task.techPerson : '') || '';
      const resolvedEmail = assignedTse?.email || '';

      const isShivam = task.teamId === 'team-shivam' || (task.teamName && task.teamName.includes('Shivam'));
      const fallbackLeadId = isShivam ? 'u-1791911115518' : 'u-1791911058812';
      const fallbackTeamName = isShivam ? 'Team Shivam' : 'Team Mukesh';

      const linkedFeedback = new Feedback({
        id: feedbackId,
        taskId: task.id,
        date: task.date || new Date().toISOString().slice(0, 10),
        techSupport: resolvedCodeName,
        techSupportId: resolvedOfficialId,
        techSupportEmail: resolvedEmail,
        employeeName: resolvedRealName,
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

    // Sync to linked feedback record when assignedSr, TSE assignment, or position changed
    const feedbackPatch = {};
    if (req.body.assignedSrName) feedbackPatch.recruiterName = req.body.assignedSrName;
    if (req.body.assignedSrId) feedbackPatch.pocId = req.body.assignedSrId;
    if (req.body.position) feedbackPatch.jobRole = req.body.position;
    if (req.body.companyName) feedbackPatch.company = req.body.companyName;
    if (req.body.candidateName) feedbackPatch.candidateName = req.body.candidateName;

    if (req.body.assigneeId || req.body.techPerson) {
      const { tseRealName, tseCodeName, tseOfficialId } = await resolveTseAndTsm(
        req.body.assigneeId || updated.assigneeId,
        req.body.techPerson || updated.techPerson
      );
      feedbackPatch.techSupport = tseCodeName;
      feedbackPatch.techSupportId = tseOfficialId;
      feedbackPatch.employeeName = tseRealName;
      feedbackPatch.codeName = tseCodeName;
    }

    if (Object.keys(feedbackPatch).length > 0) {
      await Feedback.findOneAndUpdate(
        { $or: [{ id: `fb-task-${updated.id}` }, { taskId: updated.id }] },
        { $set: feedbackPatch }
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
    const deleted = await Task.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, id: req.params.id, message: 'Task deleted successfully. Feedback and audit records preserved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- TASK ATTACHMENTS ENDPOINTS -----------------
app.post('/api/tasks/upload-attachments', upload.array('files', 10), (req, res) => {
  try {
    const files = req.files || [];
    const attachments = files.map(f => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimeType: f.mimetype,
      path: `/api/attachments/${f.filename}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.body.uploadedBy || 'TSM',
    }));
    res.json({ success: true, count: attachments.length, attachments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attachments/:filename', (req, res) => {
  try {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Attachment file not found' });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const inlineExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt'];

    if (!isDownload && inlineExts.includes(ext)) {
      res.setHeader('Content-Disposition', 'inline');
      res.sendFile(filePath);
    } else {
      res.download(filePath, req.query.name || safeFilename);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- TSE AVAILABILITY ENGINE -----------------
function parseDurationMinutes(dur) {
  if (!dur) return 30;
  const s = String(dur).toLowerCase();
  if (s.includes('hr') || s.includes('hour')) {
    const num = parseFloat(s) || 1;
    return Math.round(num * 60);
  }
  const match = s.match(/\d+/);
  return match ? parseInt(match[0], 10) : 30;
}

app.post('/api/tse/check-availability', async (req, res) => {
  try {
    const { tseId, interviewDateTime, duration, excludeTaskId } = req.body;
    if (!tseId || !interviewDateTime) {
      return res.json({ available: true, conflicts: [] });
    }

    const reqStart = new Date(interviewDateTime).getTime();
    if (isNaN(reqStart)) {
      return res.json({ available: true, conflicts: [] });
    }

    const durMins = parseDurationMinutes(duration);
    const reqEnd = reqStart + durMins * 60000;

    // Find active scheduled tasks for this TSE
    const tasks = await Task.find({
      status: { $ne: 'Cancelled' },
      interviewDateTime: { $exists: true, $ne: '' },
      $or: [
        { assigneeId: tseId },
        { techPerson: { $regex: new RegExp(`^${tseId}$`, 'i') } },
        { codeName: { $regex: new RegExp(`^${tseId}$`, 'i') } }
      ]
    });

    const conflicts = [];
    for (const t of tasks) {
      if (excludeTaskId && t.id === excludeTaskId) continue;
      const existStart = new Date(t.interviewDateTime).getTime();
      if (isNaN(existStart)) continue;
      const existDur = parseDurationMinutes(t.duration);
      const existEnd = existStart + existDur * 60000;

      // Overlap formula: existing_start < requested_end && existing_end > requested_start
      if (existStart < reqEnd && existEnd > reqStart) {
        conflicts.push({
          taskId: t.id,
          candidateName: t.candidateName || t.title,
          interviewDateTime: t.interviewDateTime,
          duration: t.duration || '30 mins',
          status: t.status,
          companyName: t.companyName || '',
        });
      }
    }

    res.json({ available: conflicts.length === 0, conflicts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TSM TSE Unassign Endpoint
app.put('/api/tasks/:id/unassign', async (req, res) => {
  try {
    const unassignPatch = {
      assigneeId: '',
      techPerson: 'Unassigned',
      codeName: 'Unassigned',
      techPersonId: '',
    };
    const updated = await Task.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: unassignPatch,
        $push: {
          timeline: {
            at: new Date().toISOString().slice(0, 10),
            event: 'TSE unassigned. Task ready for reassignment.',
            by: req.body.by || 'TSM',
          }
        }
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
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

    const allTasks = await Task.find({}).lean();
    const taskMap = new Map();
    allTasks.forEach(t => {
      if (t.id) taskMap.set(t.id, t);
    });

    const { TECH_SUPPORT_TEAM, TSE_IDS, getTseRealName } = await import('./src/data/mockData.js');

    feedbacks = feedbacks.map(fb => {
      const obj = fb.toObject ? fb.toObject() : { ...fb };
      const rawTaskId = obj.taskId || (obj.id ? obj.id.replace('fb-task-', '') : '');
      const linkedTask = rawTaskId ? taskMap.get(rawTaskId) : null;

      if (linkedTask) {
        const assignedName = linkedTask.techPerson || linkedTask.codeName;
        const matchingTse = TECH_SUPPORT_TEAM.find(t =>
          (assignedName && t.supportName.toLowerCase() === assignedName.toLowerCase()) ||
          (assignedName && t.employeeName.toLowerCase().includes(assignedName.toLowerCase())) ||
          (linkedTask.assigneeId && (t.id === linkedTask.assigneeId || TSE_IDS[linkedTask.assigneeId] === t.id))
        );
        if (matchingTse) {
          obj.techSupportId = matchingTse.id;
          obj.techSupport = matchingTse.supportName;
          obj.employeeName = matchingTse.employeeName;
          obj.techSupportEmail = matchingTse.email;
        } else if (linkedTask.techPersonId && linkedTask.techPersonId.startsWith('TSE-NB')) {
          obj.techSupportId = linkedTask.techPersonId;
          obj.techSupport = linkedTask.codeName || linkedTask.techPerson;
          obj.employeeName = getTseRealName(linkedTask.codeName || linkedTask.techPerson);
        }
      }

      // Unify "Code Name Unassigned" or Harit Verma records into Abhishek (TSE-NB-001)
      if (
        obj.techSupport === 'Code Name Unassigned' ||
        obj.techSupportId === 'TSE-NB-001' ||
        (obj.employeeName && obj.employeeName.toLowerCase().includes('harit'))
      ) {
        obj.techSupport = 'Abhishek';
        obj.employeeName = 'Harit verma';
        obj.techSupportId = 'TSE-NB-001';
        obj.techSupportEmail = 'nbtech1@netbounceplacement.com';
      }

      // Sanitize identity privacy for Marketing roles: ONLY show IDs, never real names or aliases
      if (role === 'marketing_tl' || role === 'marketing_sr') {
        const safeId = obj.techSupportId || 'TSE-NB-008';
        obj.techSupport = safeId;
        obj.employeeName = safeId;
        obj.codeName = safeId;
        obj.techSupportEmail = 'techsupport@netbounceplacement.com';
      }

      return obj;
    });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Dynamically resolve TSE Code/Real Name and responsible TSM
async function resolveTseAndTsm(tseIdentifier, employeeName) {
  const { TECH_SUPPORT_TEAM, TSE_IDS } = await import('./src/data/mockData.js');

  const matchingTse = TECH_SUPPORT_TEAM.find(t =>
    (tseIdentifier && t.id === tseIdentifier) ||
    (tseIdentifier && TSE_IDS[tseIdentifier] === t.id) ||
    (tseIdentifier && t.supportName.toLowerCase() === tseIdentifier.toLowerCase()) ||
    (employeeName && t.employeeName.toLowerCase().includes(employeeName.toLowerCase())) ||
    (employeeName && t.supportName.toLowerCase() === employeeName.toLowerCase())
  );

  let tseUser = null;
  if (tseIdentifier) {
    tseUser = await User.findOne({
      $or: [
        { id: tseIdentifier },
        { empId: tseIdentifier },
        { tttNbId: tseIdentifier },
        { name: tseIdentifier },
        { codeName: tseIdentifier },
      ],
    });
  }
  if (!tseUser && employeeName) {
    tseUser = await User.findOne({ name: employeeName });
  }

  const tseRealName = matchingTse?.employeeName || tseUser?.name || employeeName || tseIdentifier || 'TSE';
  const tseCodeName = matchingTse?.supportName || tseUser?.codeName || tseUser?.name || 'Shreya';
  const tseOfficialId = matchingTse?.id || TSE_IDS[tseCodeName] || 'TSE-NB-008';

  let tsmUser = null;
  if (tseUser?.teamId) {
    tsmUser = await User.findOne({ role: 'tsm', teamId: tseUser.teamId });
  }
  if (!tsmUser) {
    tsmUser = await User.findOne({ role: 'tsm' });
  }
  const responsibleTsm = tsmUser?.name || 'Tech Support Manager';
  const responsibleTsmId = tsmUser?.id || 'u-tsm-01';

  return { tseUser, tseRealName, tseCodeName, tseOfficialId, responsibleTsm, responsibleTsmId };
}

app.post('/api/feedbacks', async (req, res) => {
  try {
    const callerRole = req.headers['x-user-role'] || req.body.callerRole;
    if (callerRole === 'tsm' || callerRole === 'tse') {
      return res.status(403).json({ error: 'TSM is not authorized to generate Candidate SAGA feedback links.' });
    }

    const feedback = new Feedback(req.body);
    await feedback.save();

    // Auto-create SLA Ticket if rating <= 3 stars with strict 24-hour SLA
    const cRating = feedback.candidateFeedback?.performanceRating || feedback.candidateFeedback?.experienceRating;
    if (cRating && Number(cRating) <= 3) {
      const existingTicket = await SlaTicket.findOne({ interviewId: feedback.id });
      if (!existingTicket) {
        const ticketId = `SLA-${Date.now()}`;
        const { tseRealName, tseCodeName, responsibleTsm, responsibleTsmId } = await resolveTseAndTsm(
          feedback.techSupportId || feedback.techSupport,
          feedback.employeeName
        );
        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const slaTicket = new SlaTicket({
          id: ticketId,
          ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          candidateName: feedback.candidateName || 'Candidate',
          companyName: feedback.company || 'Client',
          interviewId: feedback.id,
          techSupport: tseRealName,
          techSupportId: feedback.techSupportId || tseCodeName,
          tseCodeName,
          tseRealName,
          rating: Number(cRating),
          comments: feedback.candidateFeedback?.comments || 'Low rating logged on feedback creation.',
          slaHours: 24,
          deadline,
          responsibleTsm,
          responsibleTsmId,
          status: 'Open',
          actionTaken: '',
          resolutionDetails: '',
        });
        await slaTicket.save();
      }
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

    // Strict 24-Hour SLA Ticket creation if rating <= 3 stars
    if (ratingNum <= 3) {
      const existingTicket = await SlaTicket.findOne({ interviewId: req.params.id });
      if (!existingTicket) {
        const ticketId = `SLA-${Date.now()}`;
        const { tseRealName, tseCodeName, responsibleTsm, responsibleTsmId } = await resolveTseAndTsm(
          updated.techSupportId || updated.techSupport,
          updated.employeeName
        );
        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const slaTicket = new SlaTicket({
          id: ticketId,
          ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          candidateName: updated.candidateName || 'Candidate',
          companyName: updated.company || 'Client Assessment',
          interviewId: req.params.id,
          techSupport: tseRealName,
          techSupportId: updated.techSupportId || tseCodeName,
          tseCodeName,
          tseRealName,
          rating: ratingNum,
          comments: comments || 'Candidate reported unsatisfactory rating (3 stars or below).',
          slaHours: 24,
          deadline,
          responsibleTsm,
          responsibleTsmId,
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
    const callerRole = req.headers['x-user-role'] || req.body.role;
    if (callerRole === 'marketing_tl') {
      return res.status(403).json({ error: 'Marketing TL is not authorized to submit internal TSE reviews.' });
    }

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

// ----------------- SLA TICKETS ENDPOINTS (Milestone 6 - 24-Hour SLA) -----------------
app.get('/api/sla-tickets', async (req, res) => {
  try {
    const now = new Date();
    const tickets = await SlaTicket.find().sort({ createdAt: -1 });
    const mapped = tickets.map(t => {
      const obj = t.toObject();
      const isOverdue = obj.status !== 'Resolved' && Boolean(obj.deadline && new Date(obj.deadline) < now);
      obj.isOverdue = isOverdue;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sla-tickets', async (req, res) => {
  try {
    const data = req.body;
    if (data.interviewId) {
      const existing = await SlaTicket.findOne({ interviewId: data.interviewId });
      if (existing) return res.status(200).json(existing);
    }

    const ticketId = data.id || `SLA-${Date.now()}`;
    const deadline = data.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newTicket = new SlaTicket({
      ...data,
      id: ticketId,
      ticketNumber: data.ticketNumber || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      slaHours: 24,
      deadline,
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sla-tickets/:id', async (req, res) => {
  try {
    const patch = { ...req.body };
    if (patch.status === 'Resolved') {
      patch.isOverdue = false;
    }
    const updated = await SlaTicket.findOneAndUpdate(
      { id: req.params.id },
      { $set: patch },
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
