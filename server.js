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

// Valid Marketing Teams & POC assignment boundaries
const VALID_TEAMS = ['team-mukesh', 'team-shivam', 'team-vijesh'];
const VALID_POCS_BY_TEAM = {
  'team-mukesh': ['u-poc-aditi', 'u-poc-rahul'],
  'team-shivam': ['u-poc-priya', 'u-poc-amit'],
  'team-vijesh': ['u-poc-sneha', 'u-poc-vikas'],
};

// ----------------- TASKS ENDPOINTS -----------------
app.get('/api/tasks', async (req, res) => {
  try {
    const { role, userId, teamId } = req.query;
    let filter = {};

    if (role === 'tse' && userId) {
      filter = { $or: [{ assigneeId: userId }, { techPerson: { $regex: new RegExp(userId, 'i') } }] };
    } else if (role === 'recruiter' && userId) {
      filter = { $or: [{ pocId: userId }, { recruiterName: { $regex: new RegExp(userId, 'i') } }] };
    } else if (role === 'marketing_tl') {
      filter = { $or: [{ teamLeadId: userId }, { teamId: teamId || 'team-mukesh' }] };
    } else if (role === 'marketing_sr') {
      filter = { teamId: teamId || 'team-mukesh' };
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
    const { teamId, pocId, candidateName } = taskData;

    if (!candidateName || !candidateName.trim()) {
      return res.status(400).json({ error: 'Candidate name is required.' });
    }

    // Strict server-side validation: reject invalid or mismatched team/POC combinations
    if (teamId && pocId && VALID_POCS_BY_TEAM[teamId]) {
      if (!VALID_POCS_BY_TEAM[teamId].includes(pocId)) {
        return res.status(400).json({
          error: 'Unauthorized assignment: Recruiter / POC does not belong to the selected Marketing Team.',
        });
      }
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

      const linkedFeedback = new Feedback({
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

    // Sanitize identity privacy for Marketing roles
    if (role === 'marketing_tl' || role === 'marketing_sr') {
      const { TSE_CODE_NAMES } = await import('./src/data/mockData.js');
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

app.post('/api/feedbacks', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
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

    const updateData = {
      'candidateFeedback.submitted': true,
      'candidateFeedback.performanceRating': Number(performanceRating) || 5.0,
      'candidateFeedback.experienceRating': Number(experienceRating) || 5.0,
      'candidateFeedback.comments': comments || 'Support session completed.',
      'candidateFeedback.timestamp': nowFormatted,
    };

    const updated = await Feedback.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true, upsert: true }
    );
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

// -------------------------------------------------------------
// AI DIRECT DATABASE QUERY ENDPOINT (/api/ai/ask)
// -------------------------------------------------------------
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // 1. Fetch live records straight from MongoDB Atlas
    const [tasks, feedbacks] = await Promise.all([
      Task.find().lean(),
      Feedback.find().lean(),
    ]);

    // 2. Aggregate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const rescheduleTasks = tasks.filter(t => t.status === 'Reschedule').length;
    const cancelTasks = tasks.filter(t => t.status === 'Cancel').length;
    const notPossibleTasks = tasks.filter(t => t.status === 'Not Possible').length;

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

    const systemPrompt = `You are "NB AI", the official intelligent operations copilot for NetBounce (Management & Tech Team Tracker).
You are DIRECTLY CONNECTED TO MONGODB ATLAS (Mumbai Region - Cluster: TTT-Database) and have full real-time access to all records in the database.

${dbSnapshot}

Operational Directives:
1. Always base your numbers directly on the live MongoDB Atlas database snapshot above.
2. Address the user respectfully as Sir or Ma'am.
3. Keep answers neatly formatted with clean bullet points (•) and line breaks.
4. Never use markdown asterisks (never use ** around words). Write in clean text.
5. You can answer in English, Hindi, or Hinglish depending on what language the user used.
6. Identify yourself strictly as "NB AI" connected live to NetBounce MongoDB Atlas.`;

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
