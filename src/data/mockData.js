// Mock data for Tech Team Tracker matching Google Sheet columns

export const ROLES = {
  upper_management: { id: 'upper_management', label: 'Upper Management', short: 'UM' },
  management: { id: 'management', label: 'Management', short: 'MG' },
  tsm: { id: 'tsm', label: 'TSM', short: 'TSM' },
  tse: { id: 'tse', label: 'TSE', short: 'TSE' },
  marketing_tl: { id: 'marketing_tl', label: 'Marketing TL', short: 'MTL' },
  marketing_sr: { id: 'marketing_sr', label: 'Marketing SR', short: 'MSR' },
  recruiter: { id: 'recruiter', label: 'Recruiter / POC', short: 'POC' },
};

// Marketing Teams (Team Mukesh & Team Shivam)
export const MARKETING_TEAMS = [
  { id: 'team-mukesh', name: 'Team Mukesh', leadId: 'u-1791911058812', leadName: 'Mukesh Chaudhary', leadEmail: 'mukesh@netbounceplacement.com' },
  { id: 'team-shivam', name: 'Team Shivam', leadId: 'u-1791911115518', leadName: 'Shivam Barot', leadEmail: 'shivam.b@netbounceplacement.com' },
];

export const POC_USERS_BY_TEAM = {
  'team-mukesh': [],
  'team-shivam': [],
};

// Stable Code Name Lookup Mappings
export const TSE_CODE_NAMES = {
  'Amber': 'Smriti',
  'Shaurya': 'Henil',
  'Nikunj': 'Saurav',
  'Prem': 'Kiran',
  'Harit': 'Abhishek',
  'Rahul Sharma': 'Rishi',
  'Ananya Verma': 'Aria',
  'Vikram Singh': 'Vivan',
  'Sana Qureshi': 'Sara',
  'Smriti': 'Smriti',
  'Henil': 'Henil',
  'Saurav': 'Saurav',
  'Kiran': 'Kiran',
  'Abhishek': 'Abhishek',
  'Rishi': 'Rishi',
  'Aria': 'Aria',
  'Vivan': 'Vivan',
  'Sara': 'Sara',
};

export const TSM_CODE_NAMES = {
  'Rohan Kapoor': 'TSM Titan',
  'Neha Iyer': 'TSM Nova',
  'TSM Titan': 'TSM Titan',
  'TSM Nova': 'TSM Nova',
};

export const getTseCodeName = (name) => {
  if (!name) return 'Code Name Unassigned';
  return TSE_CODE_NAMES[name] || 'Code Name Unassigned';
};

export const getTsmCodeName = (name) => {
  if (!name) return 'Code Name Unassigned';
  return TSM_CODE_NAMES[name] || 'Code Name Unassigned';
};

export const MARKETING_SR_USERS = [
  // Team Mukesh SRs
  {
    id: 'u-sr-mukesh-01',
    name: 'Prajapati Snehal Vijaykumar',
    email: 'snehal.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-01',
    tttNbId: 'TTT-NB-MSR-01',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-1791911058812',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sr_snehal',
  },
  {
    id: 'u-sr-mukesh-02',
    name: 'Ritik Kumar Gupta',
    email: 'ritik.g@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-02',
    tttNbId: 'TTT-NB-MSR-02',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-1791911058812',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sr_ritik',
  },
  {
    id: 'u-sr-mukesh-03',
    name: 'Ausafkhan Yasinkhan Pathan',
    email: 'ausafkhan.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-03',
    tttNbId: 'TTT-NB-MSR-03',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-1791911058812',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=sr_ausafkhan',
  },
  {
    id: 'u-sr-mukesh-04',
    name: 'Chaudhari Himanshu',
    email: 'himanshu.c@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-04',
    tttNbId: 'TTT-NB-MSR-04',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-1791911058812',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sr_himanshu_c',
  },
  {
    id: 'u-sr-mukesh-05',
    name: 'Vaidh Deepkumar Janakkumar',
    email: 'deepkumar.v@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-05',
    tttNbId: 'TTT-NB-MSR-05',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-1791911058812',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sr_deepkumar',
  },
  {
    id: 'u-sr-mukesh-06',
    name: 'Rohan N Soni',
    email: 'rohan.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-06',
    tttNbId: 'TTT-NB-MSR-06',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-1791911058812',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sr_rohan_soni',
  },
  {
    id: 'u-sr-mukesh-07',
    name: 'Mukesh Chaudhary SR',
    email: 'mukesh.sr@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-07',
    tttNbId: 'TTT-NB-MSR-07',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-1791911058812',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=sr_mukesh_sr',
  },
  // Team Shivam SRs
  {
    id: 'u-sr-shivam-01',
    name: 'Vishal Suthar',
    email: 'vishal.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-08',
    tttNbId: 'TTT-NB-MSR-08',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-1791911115518',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sr_vishal',
  },
  {
    id: 'u-sr-shivam-02',
    name: 'Riyen Sukhadiya',
    email: 'riyen.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-09',
    tttNbId: 'TTT-NB-MSR-09',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-1791911115518',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sr_riyen',
  },
  {
    id: 'u-sr-shivam-03',
    name: 'Smit H Patel',
    email: 'smit.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-10',
    tttNbId: 'TTT-NB-MSR-10',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-1791911115518',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sr_smit',
  },
  {
    id: 'u-sr-shivam-04',
    name: 'Mohammed Rehan Shaikh',
    email: 'rehan.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-11',
    tttNbId: 'TTT-NB-MSR-11',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-1791911115518',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=sr_rehan',
  },
  {
    id: 'u-sr-shivam-05',
    name: 'Himanshu Barot',
    email: 'himanshu.b@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-12',
    tttNbId: 'TTT-NB-MSR-12',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-1791911115518',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sr_himanshu_b',
  },
  {
    id: 'u-sr-shivam-06',
    name: 'Yug Patel',
    email: 'yug.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-13',
    tttNbId: 'TTT-NB-MSR-13',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-1791911115518',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sr_yug',
  },
  {
    id: 'u-sr-shivam-07',
    name: 'Jinesh Pandya',
    email: 'jinesh.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    dept: 'Marketing',
    empId: 'TTT-NB-MSR-14',
    tttNbId: 'TTT-NB-MSR-14',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-1791911115518',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sr_jinesh',
  },
];

export const USERS = [
  {
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
  },
  {
    id: 'u-1791910268004',
    name: 'Aditi Mohapatra',
    email: 'aditi.m@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'management',
    dept: 'Operations',
    empId: 'TTT-NB-002',
    tttNbId: 'TTT-NB-002',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avt_Cameron_11',
  },
  {
    id: 'u-1791910325800',
    name: 'Sneha Agrawal',
    email: 'sneha.a@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'management',
    dept: 'Operations',
    empId: 'TTT-NB-003',
    tttNbId: 'TTT-NB-003',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avt_Logan_8',
  },
  {
    id: 'u-1792015875137',
    name: 'Shilp Patel MM',
    email: 'shilp@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'management',
    dept: 'Operations',
    empId: 'TTT-NB-022',
    tttNbId: 'TTT-NB-022',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avt_Jordan_2',
  },
  {
    id: 'u-1791910498589',
    name: 'Dwijen Barot',
    email: 'dwijen@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'upper_management',
    dept: 'Executive',
    empId: 'TTT-NB-007',
    tttNbId: 'TTT-NB-007',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=port_Finley_19',
  },
  {
    id: 'u-1791910366610',
    name: 'Rudra Patel',
    email: 'rudra.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'upper_management',
    dept: 'Executive',
    empId: 'TTT-NB-004',
    tttNbId: 'TTT-NB-004',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=port_Avery_7',
  },
  {
    id: 'u-1791910405849',
    name: 'Shilp Patel',
    email: 'shilp.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'upper_management',
    dept: 'Executive',
    empId: 'TTT-NB-005',
    tttNbId: 'TTT-NB-005',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tech_Amari_24',
  },
  {
    id: 'u-1791910463173',
    name: 'Nisrag Patel',
    email: 'nisarg@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'upper_management',
    dept: 'Executive',
    empId: 'TTT-NB-006',
    tttNbId: 'TTT-NB-006',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tech_Alex_1',
  },
  {
    id: 'u-1791926042864',
    name: 'Aditya Mishra',
    email: 'aditya.m@netbounceplacement.com',
    password: 'TSM@123',
    role: 'tsm',
    dept: 'Tech Support',
    empId: 'TTT-NB-020',
    tttNbId: 'TTT-NB-020',
    codeName: 'TSM Titan',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=port_Kendall_17',
  },
  {
    id: 'u-tsm-rohan',
    name: 'Rohan Kapoor',
    email: 'rohan.k@netbounceplacement.com',
    password: 'TSM@123',
    role: 'tsm',
    dept: 'Tech Support',
    empId: 'TTT-NB-TSM-01',
    tttNbId: 'TTT-NB-TSM-01',
    codeName: 'TSM Titan',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-1791911058812',
    name: 'Mukesh Chaudhary',
    email: 'mukesh@netbounceplacement.com',
    password: 'MTL@123',
    role: 'marketing_tl',
    dept: 'Marketing',
    empId: 'TTT-NB-016',
    tttNbId: 'TTT-NB-016',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=port_Kendall_17',
  },
  {
    id: 'u-1791911115518',
    name: 'Shivam Barot',
    email: 'shivam.b@netbounceplacement.com',
    password: 'MTL@123',
    role: 'marketing_tl',
    dept: 'Marketing',
    empId: 'TTT-NB-017',
    tttNbId: 'TTT-NB-017',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tech_Dakota_12',
  },
  {
    id: 'u-1791910812799',
    name: 'Abhishek',
    email: 'nbtech1@netbounceplacement.com',
    password: 'TSM@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-008',
    tttNbId: 'TTT-NB-008',
    codeName: 'Abhishek',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=port_Blake_26',
  },
  {
    id: 'u-1791910865708',
    name: 'Henil',
    email: 'nbtech2@netbounceplacement.com',
    password: 'TSE@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-010',
    tttNbId: 'TTT-NB-010',
    codeName: 'Henil',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=crea_Dakota_12',
  },
  {
    id: 'u-1791910844293',
    name: 'Kiran',
    email: 'nbtech3@netbounceplacement.com',
    password: 'TSE@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-009',
    tttNbId: 'TTT-NB-009',
    codeName: 'Kiran',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avt_Rowan_14',
  },
  {
    id: 'u-1791910900310',
    name: 'Saurav',
    email: 'nbtech4@netbounceplacement.com',
    password: 'TSE@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-011',
    tttNbId: 'TTT-NB-011',
    codeName: 'Saurav',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=crea_Jordan_2',
  },
  {
    id: 'u-1791910926064',
    name: 'Divya',
    email: 'divya.c@netbounceplacement.com',
    password: 'TSE@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-012',
    tttNbId: 'TTT-NB-012',
    codeName: 'Divya',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tech_Finley_19',
  },
  {
    id: 'u-1791910948923',
    name: 'Smriti',
    email: 'nbtech6@netbounceplacement.com',
    password: 'TSE@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-013',
    tttNbId: 'TTT-NB-013',
    codeName: 'Smriti',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=avt_Kai_21',
  },
  {
    id: 'u-1791910976518',
    name: 'jemimah',
    email: 'nbtech5@netbounceplacement.com',
    password: 'TSE@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-014',
    tttNbId: 'TTT-NB-014',
    codeName: 'jemimah',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=crea_Peyton_16',
  },
  {
    id: 'u-1791910998393',
    name: 'Shreya',
    email: 'nbtech7@netbounceplacement.com',
    password: 'TSE@123',
    role: 'tse',
    dept: 'Tech Support',
    empId: 'TTT-NB-015',
    tttNbId: 'TTT-NB-015',
    codeName: 'Shreya',
    status: 'Active',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tech_Logan_8',
  },
  ...MARKETING_SR_USERS,
];

const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };

// Sheet Column Options (Includes RUC)
export const TASK_TYPES = ['Interview', 'TAC', 'TQC', 'JDC', 'Demo', 'RUC'];
export const TASK_STATUSES = ['Done', 'Pending', 'Reschedule', 'Cancel', 'Not Possible'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const CATEGORIES = ['Technical Assessment', 'Coding Evaluation', 'Live Interview', 'Demo Session', 'Screening'];

export const INITIAL_TASKS = [];
export const INTERVIEW_STATUSES = [
  'Scheduled',
  'Interview Completed',
  'Feedback Pending',
  'Interview Completed - Feedback Received',
  'Interview Completed - Feedback Pending',
  'Cleared',
  'Rejected',
  'Hold'
];
export const INITIAL_INTERVIEWS = [];
export const INITIAL_NOTIFICATIONS = [];
export const INITIAL_EVENTS = [];

export const permissionsByRole = {
  upper_management: ['dashboard', 'feedback', 'analytics', 'reports', 'notifications', 'profile'],
  management: ['dashboard', 'tasks', 'interviews', 'calendar', 'feedback', 'analytics', 'notifications', 'team', 'reports', 'users', 'settings', 'profile'],
  tsm: ['dashboard', 'tasks', 'interviews', 'calendar', 'analytics', 'notifications', 'team', 'profile'],
  tse: ['dashboard', 'tasks', 'calendar', 'notifications', 'profile'],
  marketing_tl: ['dashboard', 'tasks', 'interviews', 'calendar', 'feedback', 'reports', 'notifications', 'profile'],
  marketing_sr: ['dashboard', 'tasks', 'interviews', 'calendar', 'feedback', 'notifications', 'profile'],
  recruiter: ['dashboard', 'tasks', 'interviews', 'calendar', 'notifications', 'profile'],
};

export function calculateOverallRating(candidateFeedback, marketingReview) {
  // Case A: Candidate feedback exists + Marketing review does NOT exist
  if (candidateFeedback?.submitted && !marketingReview?.reviewed) {
    const candidateScore = Number(candidateFeedback.performanceRating || candidateFeedback.experienceRating || 0);
    return {
      score: candidateScore,
      formatted: candidateScore.toFixed(2),
      state: 'CANDIDATE_ONLY',
      hasCandidate: true,
      hasMarketing: false,
      label: `${candidateScore.toFixed(1)} / 5`,
    };
  }

  // Case B: Candidate feedback exists + Marketing review EXISTS
  if (candidateFeedback?.submitted && marketingReview?.reviewed) {
    const candidateScore = Number(candidateFeedback.performanceRating || candidateFeedback.experienceRating || 0);
    const marketingScore = Number(marketingReview.overallRating || 0);
    // Default recommended weighting: Candidate Feedback = 70%, Marketing Review = 30%
    const combined = (candidateScore * 0.70) + (marketingScore * 0.30);
    const rounded = Math.round(combined * 100) / 100;
    return {
      score: rounded,
      formatted: rounded.toFixed(2),
      state: 'COMBINED',
      hasCandidate: true,
      hasMarketing: true,
      label: `${rounded.toFixed(2)} / 5`,
    };
  }

  // Case C: Candidate feedback does NOT exist + Marketing review EXISTS
  if (!candidateFeedback?.submitted && marketingReview?.reviewed) {
    const marketingScore = Number(marketingReview.overallRating || 0);
    return {
      score: marketingScore,
      formatted: marketingScore.toFixed(2),
      state: 'MARKETING_ONLY',
      hasCandidate: false,
      hasMarketing: true,
      label: `${marketingScore.toFixed(1)} / 5`,
    };
  }

  // Case D: Neither exists
  return {
    score: null,
    formatted: null,
    state: 'NOT_RATED',
    hasCandidate: false,
    hasMarketing: false,
    label: 'Not Rated',
  };
}

export const TECH_SUPPORT_TEAM = [
  { id: 'TSE-NB-001', supportName: 'Abhishek', employeeName: 'Harit verma', email: 'nbtech1@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TSE-NB-002', supportName: 'Kiran', employeeName: 'Prem makwana', email: 'nbtech3@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TSE-NB-003', supportName: 'Henil', employeeName: 'Shaurya mishra', email: 'nbtech2@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TSE-NB-004', supportName: 'Saurav', employeeName: 'Nikunj kataria', email: 'nbtech4@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TSE-NB-005', supportName: 'Divya', employeeName: 'Jindal patel', email: 'divya.c@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TSE-NB-006', supportName: 'Smriti', employeeName: 'Amber Afreen', email: 'smriti.m@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TSE-NB-007', supportName: 'Jemimah', employeeName: 'Rashika Sharma', email: 'jemimah.r@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TSE-NB-008', supportName: 'Shreya', employeeName: 'AARTI VISHWAKARMA', email: 'shreya.p@netbounceplacement.com', role: 'Technical Support Engineer' },
];

export const INITIAL_FEEDBACK_RECORDS = [];

export const roleIsMarketing = (role) => role === 'marketing_tl' || role === 'marketing_sr' || role === 'recruiter';

export const TSE_IDS = {
  'Abhishek': 'TTT-NB-008',
  'Harit verma': 'TTT-NB-008',
  'Harit': 'TTT-NB-008',
  'Kiran': 'TTT-NB-009',
  'Prem makwana': 'TTT-NB-009',
  'Prem': 'TTT-NB-009',
  'Henil': 'TTT-NB-010',
  'Shaurya mishra': 'TTT-NB-010',
  'Shaurya': 'TTT-NB-010',
  'Saurav': 'TTT-NB-011',
  'Nikunj kataria': 'TTT-NB-011',
  'Nikunj': 'TTT-NB-011',
  'Divya': 'TTT-NB-012',
  'Jindal patel': 'TTT-NB-012',
  'Jindal': 'TTT-NB-012',
  'Smriti': 'TTT-NB-013',
  'Amber Afreen': 'TTT-NB-013',
  'Amber': 'TTT-NB-013',
  'jemimah': 'TTT-NB-014',
  'Jemimah': 'TTT-NB-014',
  'Rashika Sharma': 'TTT-NB-014',
  'Rashika': 'TTT-NB-014',
  'Shreya': 'TTT-NB-015',
  'AARTI VISHWAKARMA': 'TTT-NB-015',
  'Aarti': 'TTT-NB-015',
};

export const getTseId = (name, record) => {
  if (record && (record.techSupportId || record.assigneeId || record.empId || record.tttNbId)) {
    const idVal = record.empId || record.tttNbId || record.techSupportId || record.assigneeId;
    if (typeof idVal === 'string' && idVal.startsWith('TTT-NB')) return idVal;
  }
  if (name && TSE_IDS[name]) return TSE_IDS[name];
  if (record?.techPerson && TSE_IDS[record.techPerson]) return TSE_IDS[record.techPerson];
  if (record?.techSupport && TSE_IDS[record.techSupport]) return TSE_IDS[record.techSupport];
  return record?.techSupportId || record?.assigneeId || 'TTT-NB-TSE';
};

export const TSM_IDS = {
  'Abhishek': 'TTT-NB-008',
  'Rohan Kapoor': 'TTT-NB-008',
  'TSM Titan': 'TTT-NB-008',
  'TSM Nova': 'TTT-NB-008',
};

export const getTsmId = (name, record) => {
  if (record && (record.createdById || record.empId || record.tttNbId)) {
    const idVal = record.empId || record.tttNbId || record.createdById;
    if (typeof idVal === 'string' && idVal.startsWith('TTT-NB')) return idVal;
  }
  if (name && TSM_IDS[name]) return TSM_IDS[name];
  return 'TTT-NB-TSM';
};

// Identity Privacy Sanitizer: Never expose TSE or TSM real names or code names to Marketing TL / SR (ONLY their IDs)
export const sanitizeForIdentityPrivacy = (record, role) => {
  if (!record) return record;
  if (roleIsMarketing(role)) {
    const tseId = getTseId(record.techPerson || record.techSupport || record.employeeName, record);
    const tsmId = getTsmId(record.by || record.createdByName, record);
    const copy = { ...record };
    if (copy.techPerson) copy.techPerson = tseId;
    if (copy.techSupport) copy.techSupport = tseId;
    if (copy.codeName) copy.codeName = tseId;
    if (copy.techSupportId) copy.techSupportId = tseId;
    // Strictly mask employee real name
    if (copy.employeeName !== undefined) copy.employeeName = tseId;
    // Mask real tech support email
    if (copy.techSupportEmail) copy.techSupportEmail = '—';
    if (Array.isArray(copy.timeline)) {
      copy.timeline = copy.timeline.map(tl => ({
        ...tl,
        event: (tl.event || '').replace(/\b(Abhishek|Harit|Kiran|Prem|Henil|Shaurya|Saurav|Nikunj|Divya|Jindal|Smriti|Amber|Jemimah|Rashika|Shreya|Aarti)\b/gi, tseId),
        by: tsmId,
      }));
    }
    return copy;
  }
  return record;
};

// Strict Central Data Scoping Filter
export const filterAuthorizedData = (items, currentUser, currentRole) => {
  if (!items || !Array.isArray(items)) return [];
  if (!currentUser || !currentRole) return items;

  // 1. Management & Upper Management: authorized cross-team access with real names & code names
  if (currentRole === 'management' || currentRole === 'upper_management') {
    return items;
  }

  // 2. TSE: Can ONLY see candidate tasks/interviews specifically assigned to them!
  if (currentRole === 'tse') {
    const currentName = (currentUser.name || '').toLowerCase();
    const currentCode = (currentUser.codeName || '').toLowerCase();
    const currentId = currentUser.id;
    const currentEmpId = currentUser.empId || '';

    return items.filter(item => {
      const isAssigneeId = item.assigneeId === currentId ||
        item.interviewerId === currentId ||
        item.techSupportId === currentId ||
        item.techSupportId === currentEmpId;
      const isTechPersonName = item.techPerson && (
        item.techPerson.toLowerCase() === currentName ||
        (currentCode && item.techPerson.toLowerCase() === currentCode)
      );
      const isSupportName = item.techSupport && (
        item.techSupport.toLowerCase() === currentName ||
        (currentCode && item.techSupport.toLowerCase() === currentCode)
      );
      const isEmployeeName = item.employeeName && item.employeeName.toLowerCase().includes(currentName);
      return isAssigneeId || isTechPersonName || isSupportName || isEmployeeName;
    });
  }

  // 3. Recruiter / POC (Marketing SR): Can ONLY see their own assigned candidates + ID only!
  if (currentRole === 'recruiter') {
    const currentId = currentUser.id;
    const currentName = (currentUser.name || '').toLowerCase();

    return items
      .filter(item => {
        const isPocId = item.pocId === currentId || item.assignedSrId === currentId;
        const isRecruiterName = (item.recruiterName && item.recruiterName.toLowerCase() === currentName) ||
          (item.assignedSrName && item.assignedSrName.toLowerCase() === currentName);
        return isPocId || isRecruiterName;
      })
      .map(item => sanitizeForIdentityPrivacy(item, currentRole));
  }

  // 4. Marketing TL (Mukesh, Shivam, Vijesh):
  // Can ONLY see candidates belonging to their own team + code names only
  if (currentRole === 'marketing_tl') {
    const currentTeamId = currentUser.teamId || currentUser.team;
    const currentUserId = currentUser.id;
    const currentTeamName = (currentUser.teamName || '').toLowerCase();

    return items
      .filter(item => {
        const matchesTeamId = item.teamId && currentTeamId && item.teamId === currentTeamId;
        const matchesTeamLeadId = item.teamLeadId && item.teamLeadId === currentUserId;
        const matchesTeamName = item.teamName && currentTeamName && item.teamName.toLowerCase() === currentTeamName;
        return matchesTeamId || matchesTeamLeadId || matchesTeamName;
      })
      .map(item => sanitizeForIdentityPrivacy(item, currentRole));
  }

  // 5. Marketing SR:
  // Can ONLY see records belonging to their assigned team, and if assigned specifically to an SR, only their own assigned items + code names only
  if (currentRole === 'marketing_sr') {
    const currentTeamId = currentUser.teamId || currentUser.team;
    const currentUserId = currentUser.id;
    const currentName = (currentUser.name || '').toLowerCase();
    const currentTeamName = (currentUser.teamName || '').toLowerCase();

    return items
      .filter(item => {
        const matchesTeamId = item.teamId && currentTeamId && item.teamId === currentTeamId;
        const matchesTeamName = item.teamName && currentTeamName && item.teamName.toLowerCase() === currentTeamName;
        const matchesTeam = matchesTeamId || matchesTeamName;
        if (!matchesTeam) return false;

        // Check if item is assigned specifically to an SR
        const hasSpecificSr = Boolean(
          (item.assignedSrId && item.assignedSrId.trim() !== '') ||
          (item.pocId && item.pocId.trim() !== '') ||
          (item.assignedSrName && item.assignedSrName.trim() !== '') ||
          (item.recruiterName && item.recruiterName.trim() !== '' && !item.recruiterName.toLowerCase().startsWith('team '))
        );

        if (hasSpecificSr) {
          const isMyItem = item.assignedSrId === currentUserId ||
            item.pocId === currentUserId ||
            (item.assignedSrName && item.assignedSrName.toLowerCase() === currentName) ||
            (item.recruiterName && item.recruiterName.toLowerCase() === currentName) ||
            item.createdById === currentUserId;
          return isMyItem;
        }

        // If not assigned to any specific SR yet (general team pool created by TL)
        return true;
      })
      .map(item => sanitizeForIdentityPrivacy(item, currentRole));
  }

  // 6. TSM: Operational scope
  if (currentRole === 'tsm') {
    return items;
  }

  return items;
};

// Maps a Task record to standard Interview schema for pipeline display & stages
export const mapTaskToInterview = (t, feedbacks = []) => {
  if (!t) return null;
  const fb = (feedbacks || []).find(f => f.taskId === t.id || f.id === `fb-task-${t.id}` || f.id === `fb-${t.id}`);
  const hasSubmittedFeedback = Boolean(fb?.candidateFeedback?.submitted);

  let status = 'Scheduled';
  const outcome = t.interviewOutcome || fb?.marketingReview?.decision || fb?.candidateFeedback?.decision;

  if (t.interviewStatus) {
    status = t.interviewStatus;
  } else if (outcome === 'Cleared' || outcome === 'Passed' || outcome === 'Moved to Next Round' || outcome === 'Offer Received' || t.status === 'Cleared') {
    status = 'Cleared';
  } else if (outcome === 'Failed' || outcome === 'Rejected' || t.status === 'Rejected') {
    status = 'Rejected';
  } else if (outcome === 'Hold' || t.status === 'Hold') {
    status = 'Hold';
  } else if (t.status === 'Done' || t.status === 'Completed') {
    status = hasSubmittedFeedback ? 'Interview Completed - Feedback Received' : 'Interview Completed - Feedback Pending';
  } else if (t.status === 'Cancel' || t.status === 'Not Possible') {
    status = 'Rejected';
  } else {
    status = 'Scheduled';
  }

  let date = t.date || t.dueDate || '';
  let time = 'EST';
  if (t.interviewDateTime) {
    try {
      const dt = new Date(t.interviewDateTime);
      if (!isNaN(dt.getTime())) {
        date = t.interviewDateTime.slice(0, 10);
        time = t.interviewDateTime.slice(11, 16);
      }
    } catch (e) {}
  }

  return {
    id: t.id,
    taskId: t.id,
    candidateId: t.candidateId || `CND-${t.id}`,
    candidateName: t.candidateName || t.title?.split('—')?.[0]?.trim() || 'Candidate',
    position: t.position || '',
    company: t.companyName || t.company || '',
    companyName: t.companyName || t.company || '',
    date,
    time,
    interviewDateTime: t.interviewDateTime,
    interviewOutcome: outcome || null,
    outcomeAuditTrail: t.outcomeAuditTrail || [],
    status,
    teamId: t.teamId,
    teamName: t.teamName,
    teamLeadId: t.teamLeadId,
    assignedSrId: t.assignedSrId,
    assignedSrName: t.assignedSrName,
    assignedSrEmail: t.assignedSrEmail,
    pocId: t.pocId || t.assignedSrId,
    recruiterName: t.assignedSrName || t.recruiterName,
    assigneeId: t.assigneeId,
    interviewerId: t.assigneeId,
    techPerson: t.techPerson,
    techSupport: t.techPerson,
    techSupportId: t.assigneeId,
    codeName: t.codeName,
    employeeName: t.techPerson,
    feedback: fb,
    feedbackSubmitted: hasSubmittedFeedback,
    createdById: t.createdById,
  };
};

export const anonymizeInterview = (interview) => ({
  ...interview,
  candidateName: interview.candidateName,
  candidateId: interview.candidateId,
});

export const getUserById = (id, users = USERS) => users.find(u => u.id === id);

// ----------------- MILESTONE 2: EST TIMING & URGENCY HELPERS -----------------
export const INTERVIEW_OUTCOMES = [
  'Selected',
  'Rejected',
  'On Hold',
  'Next Round',
  'No Show',
  'Offer Released',
  'Joined',
  'Passed',
  'Failed',
  'Moved to Next Round',
  'Offer Received'
];

export function getInterviewTimingMeta(interviewDateTime) {
  if (!interviewDateTime) {
    return { isUrgent: false, isElevated: false, minutesUntil: null, estString: '', urgencyLabel: '', urgencyBadge: 'normal' };
  }

  const target = new Date(interviewDateTime);
  if (isNaN(target.getTime())) {
    return { isUrgent: false, isElevated: false, minutesUntil: null, estString: interviewDateTime, urgencyLabel: '', urgencyBadge: 'normal' };
  }

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  // Format in EST (Eastern Standard Time)
  const estString = target.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' EST';

  if (diffMinutes >= 0 && diffMinutes <= 30) {
    return {
      isUrgent: true,
      isElevated: true,
      minutesUntil: diffMinutes,
      estString,
      urgencyLabel: `🚨 URGENT (Starts in ${diffMinutes}m)`,
      urgencyBadge: 'urgent',
    };
  } else if (diffMinutes > 30 && diffMinutes <= 60) {
    return {
      isUrgent: false,
      isElevated: true,
      minutesUntil: diffMinutes,
      estString,
      urgencyLabel: `⚡ Elevated Priority (In ${diffMinutes}m)`,
      urgencyBadge: 'elevated',
    };
  } else {
    return {
      isUrgent: false,
      isElevated: false,
      minutesUntil: diffMinutes,
      estString,
      urgencyLabel: diffMinutes < 0 ? `Concluded (${estString})` : estString,
      urgencyBadge: 'normal',
    };
  }
}

// Priority Queue sorting: Urgent (<30m) > Elevated (<60m) > Earlier interview time
export function sortTasksByInterviewPriority(tasks = []) {
  return [...tasks].sort((a, b) => {
    const metaA = getInterviewTimingMeta(a.interviewDateTime);
    const metaB = getInterviewTimingMeta(b.interviewDateTime);

    if (metaA.isUrgent && !metaB.isUrgent) return -1;
    if (!metaA.isUrgent && metaB.isUrgent) return 1;

    if (metaA.isElevated && !metaB.isElevated) return -1;
    if (!metaA.isElevated && metaB.isElevated) return 1;

    if (a.interviewDateTime && b.interviewDateTime) {
      return new Date(a.interviewDateTime).getTime() - new Date(b.interviewDateTime).getTime();
    }
    return 0;
  });
}

// ----------------- MILESTONE 7: SMART TSE RECOMMENDATIONS -----------------
export function getSmartTseRecommendations(candidateName, allTasks = [], allFeedbacks = [], tseUsers = []) {
  if (!candidateName) return [];
  const cLower = candidateName.trim().toLowerCase();

  // Find candidate's past interview tasks & feedback
  const pastCandidateTasks = allTasks.filter(t => (t.candidateName || '').toLowerCase() === cLower);
  const pastCandidateFeedbacks = allFeedbacks.filter(f => (f.candidateName || '').toLowerCase() === cLower);

  return tseUsers.map(tse => {
    const tseTasks = allTasks.filter(t => t.assigneeId === tse.id || (t.techPerson && t.techPerson.toLowerCase() === tse.name.toLowerCase()));
    const activeTasksCount = tseTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;

    // Check past feedback for this TSE with this specific candidate
    const priorFeedback = pastCandidateFeedbacks.find(f =>
      (f.techSupportId === tse.id) ||
      (f.techSupport && f.techSupport.toLowerCase() === (tse.codeName || '').toLowerCase()) ||
      (f.employeeName && f.employeeName.toLowerCase() === tse.name.toLowerCase())
    );

    const priorRating = priorFeedback?.candidateFeedback?.performanceRating || priorFeedback?.candidateFeedback?.experienceRating;

    let score = 50; // base score
    let rationale = [];
    let isRecommended = true;
    let isWarning = false;

    if (priorRating) {
      if (priorRating >= 4.0) {
        score += 40;
        rationale.push(`⭐ Candidate previously rated this TSE ${priorRating}/5.0`);
      } else if (priorRating <= 3.0) {
        score -= 60;
        isRecommended = false;
        isWarning = true;
        rationale.push(`⚠️ Not recommended: Candidate gave a low rating (${priorRating}/5.0) in previous round`);
      }
    }

    if (activeTasksCount > 4) {
      score -= 20;
      rationale.push(`Heavy workload (${activeTasksCount} active tasks)`);
    } else {
      score += 10;
      rationale.push(`Available capacity (${activeTasksCount} active tasks)`);
    }

    return {
      tse,
      score,
      isRecommended: isRecommended && !isWarning,
      isWarning,
      activeTasksCount,
      priorRating: priorRating || null,
      rationaleText: rationale.join(' • '),
    };
  }).sort((a, b) => b.score - a.score);
}
