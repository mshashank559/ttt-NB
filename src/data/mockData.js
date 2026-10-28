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
  // Real Name -> Code Name mappings
  'Harit verma': 'Abhishek',
  'Harit Verma': 'Abhishek',
  'Harit': 'Abhishek',
  'Prem makwana': 'Kiran',
  'Prem': 'Kiran',
  'Shaurya mishra': 'Henil',
  'Shaurya': 'Henil',
  'Nikunj kataria': 'Saurav',
  'Nikunj': 'Saurav',
  'Jindal patel': 'Divya',
  'Jindal': 'Divya',
  'Amber Afreen': 'Smriti',
  'Amber': 'Smriti',
  'Rashika Sharma': 'Jemimah',
  'Rashika': 'Jemimah',
  'AARTI VISHWAKARMA': 'Shreya',
  'Aarti Vishwakarma': 'Shreya',
  'Aarti': 'Shreya',
  'Rahul Sharma': 'Rishi',
  'Ananya Verma': 'Aria',
  'Vikram Singh': 'Vivan',
  'Sana Qureshi': 'Sara',

  // Code Name -> Code Name mappings
  'Abhishek': 'Abhishek',
  'Kiran': 'Kiran',
  'Henil': 'Henil',
  'Saurav': 'Saurav',
  'Divya': 'Divya',
  'Smriti': 'Smriti',
  'Jemimah': 'Jemimah',
  'jemimah': 'Jemimah',
  'Shreya': 'Shreya',
  'Rishi': 'Rishi',
  'Aria': 'Aria',
  'Vivan': 'Vivan',
  'Sara': 'Sara',
};

export const TSM_CODE_NAMES = {
  'Aditya Mishra': 'TSM Titan',
  'Aditya': 'TSM Titan',
  'Rohan Kapoor': 'TSM Titan',
  'Rohan': 'TSM Titan',
  'Neha Iyer': 'TSM Nova',
  'Neha': 'TSM Nova',
  'TSM Titan': 'TSM Titan',
  'TSM Nova': 'TSM Nova',
};

export const getTseCodeName = (name) => {
  if (!name || name === 'Unassigned' || name === 'Code Name Unassigned') return 'Unassigned';
  if (TSE_CODE_NAMES[name]) return TSE_CODE_NAMES[name];
  const matching = TECH_SUPPORT_TEAM.find(t => 
    t.employeeName.toLowerCase().includes(name.toLowerCase()) || 
    t.supportName.toLowerCase() === name.toLowerCase() ||
    t.id === name
  );
  if (matching) return matching.supportName;
  return 'Unassigned';
};

export const getTsmCodeName = (name) => {
  if (!name || name === 'Unassigned' || name === 'Code Name Unassigned') return 'Unassigned';
  return TSM_CODE_NAMES[name] || 'Unassigned';
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
    empId: 'TSE-NB-001',
    tttNbId: 'TSE-NB-001',
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
    empId: 'TSE-NB-003',
    tttNbId: 'TSE-NB-003',
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
    empId: 'TSE-NB-002',
    tttNbId: 'TSE-NB-002',
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
    empId: 'TSE-NB-004',
    tttNbId: 'TSE-NB-004',
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
    empId: 'TSE-NB-005',
    tttNbId: 'TSE-NB-005',
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
    empId: 'TSE-NB-006',
    tttNbId: 'TSE-NB-006',
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
    empId: 'TSE-NB-007',
    tttNbId: 'TSE-NB-007',
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
    empId: 'TSE-NB-008',
    tttNbId: 'TSE-NB-008',
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
  'Interview Rescheduled',
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
  tsm: ['dashboard', 'tasks', 'interviews', 'calendar', 'feedback', 'analytics', 'notifications', 'team', 'users', 'profile'],
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
  'Abhishek': 'TSE-NB-001',
  'Harit verma': 'TSE-NB-001',
  'Harit Verma': 'TSE-NB-001',
  'Harit': 'TSE-NB-001',
  'u-1791910812799': 'TSE-NB-001',
  'Kiran': 'TSE-NB-002',
  'Prem makwana': 'TSE-NB-002',
  'Prem Makwana': 'TSE-NB-002',
  'Prem': 'TSE-NB-002',
  'u-1791910844293': 'TSE-NB-002',
  'Henil': 'TSE-NB-003',
  'Shaurya mishra': 'TSE-NB-003',
  'Shaurya Mishra': 'TSE-NB-003',
  'Shaurya': 'TSE-NB-003',
  'u-1791910865708': 'TSE-NB-003',
  'Saurav': 'TSE-NB-004',
  'Nikunj kataria': 'TSE-NB-004',
  'Nikunj Kataria': 'TSE-NB-004',
  'Nikunj': 'TSE-NB-004',
  'u-1791910900310': 'TSE-NB-004',
  'Divya': 'TSE-NB-005',
  'Jindal patel': 'TSE-NB-005',
  'Jindal Patel': 'TSE-NB-005',
  'Jindal': 'TSE-NB-005',
  'u-1791910926064': 'TSE-NB-005',
  'Smriti': 'TSE-NB-006',
  'Amber Afreen': 'TSE-NB-006',
  'Amber': 'TSE-NB-006',
  'u-1791910948923': 'TSE-NB-006',
  'jemimah': 'TSE-NB-007',
  'Jemimah': 'TSE-NB-007',
  'Rashika Sharma': 'TSE-NB-007',
  'Rashika': 'TSE-NB-007',
  'u-1791910976518': 'TSE-NB-007',
  'Shreya': 'TSE-NB-008',
  'AARTI VISHWAKARMA': 'TSE-NB-008',
  'Aarti Vishwakarma': 'TSE-NB-008',
  'Aarti': 'TSE-NB-008',
  'u-1791910998393': 'TSE-NB-008',
};

export const getTseId = (name, record) => {
  if (record && record.techSupportId && record.techSupportId.startsWith('TSE-NB')) {
    return record.techSupportId;
  }
  const cleanName = (name || record?.techPerson || record?.techSupport || record?.employeeName || '').trim();
  if (cleanName && TSE_IDS[cleanName]) return TSE_IDS[cleanName];

  const assignedId = record?.assigneeId || record?.techSupportId || record?.id;
  if (assignedId && TSE_IDS[assignedId]) return TSE_IDS[assignedId];

  const matchingTse = TECH_SUPPORT_TEAM.find(t =>
    (cleanName && t.supportName.toLowerCase() === cleanName.toLowerCase()) ||
    (cleanName && t.employeeName.toLowerCase().includes(cleanName.toLowerCase())) ||
    t.id === record?.techSupportId ||
    t.id === record?.assigneeId
  );
  if (matchingTse) return matchingTse.id;

  return 'TSE-NB-001';
};

export const TSE_REAL_NAMES = {
  'Abhishek': 'Harit Verma',
  'Harit verma': 'Harit Verma',
  'Harit Verma': 'Harit Verma',
  'Harit': 'Harit Verma',
  'u-1791910812799': 'Harit Verma',
  'TSE-NB-001': 'Harit Verma',
  'Kiran': 'Prem Makwana',
  'Prem makwana': 'Prem Makwana',
  'Prem Makwana': 'Prem Makwana',
  'Prem': 'Prem Makwana',
  'u-1791910844293': 'Prem Makwana',
  'TSE-NB-002': 'Prem Makwana',
  'Henil': 'Shaurya Mishra',
  'Shaurya mishra': 'Shaurya Mishra',
  'Shaurya Mishra': 'Shaurya Mishra',
  'Shaurya': 'Shaurya Mishra',
  'u-1791910865708': 'Shaurya Mishra',
  'TSE-NB-003': 'Shaurya Mishra',
  'Saurav': 'Nikunj Kataria',
  'Nikunj kataria': 'Nikunj Kataria',
  'Nikunj Kataria': 'Nikunj Kataria',
  'Nikunj': 'Nikunj Kataria',
  'u-1791910900310': 'Nikunj Kataria',
  'TSE-NB-004': 'Nikunj Kataria',
  'Divya': 'Jindal Patel',
  'Jindal patel': 'Jindal Patel',
  'Jindal Patel': 'Jindal Patel',
  'Jindal': 'Jindal Patel',
  'u-1791910926064': 'Jindal Patel',
  'TSE-NB-005': 'Jindal Patel',
  'Smriti': 'Amber Afreen',
  'Amber Afreen': 'Amber Afreen',
  'Amber': 'Amber Afreen',
  'u-1791910948923': 'Amber Afreen',
  'TSE-NB-006': 'Amber Afreen',
  'jemimah': 'Rashika Sharma',
  'Jemimah': 'Rashika Sharma',
  'Rashika Sharma': 'Rashika Sharma',
  'Rashika': 'Rashika Sharma',
  'u-1791910976518': 'Rashika Sharma',
  'TSE-NB-007': 'Rashika Sharma',
  'Shreya': 'Aarti Vishwakarma',
  'AARTI VISHWAKARMA': 'Aarti Vishwakarma',
  'Aarti Vishwakarma': 'Aarti Vishwakarma',
  'Aarti': 'Aarti Vishwakarma',
  'u-1791910998393': 'Aarti Vishwakarma',
  'TSE-NB-008': 'Aarti Vishwakarma',
};

export const getTseRealName = (nameOrId) => {
  if (!nameOrId) return '';
  const clean = String(nameOrId).trim();
  if (TSE_REAL_NAMES[clean]) return TSE_REAL_NAMES[clean];
  const matching = TECH_SUPPORT_TEAM.find(t =>
    t.id === clean ||
    t.supportName.toLowerCase() === clean.toLowerCase() ||
    t.employeeName.toLowerCase().includes(clean.toLowerCase())
  );
  return matching?.employeeName || '';
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
    const currentTeamId = currentUser.teamId || currentUser.team || (
      currentUser?.id === 'u-1791911058812' || (currentUser?.name || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
      currentUser?.id === 'u-1791911115518' || (currentUser?.name || '').toLowerCase().includes('shivam') ? 'team-shivam' : ''
    );
    const currentUserId = currentUser.id;
    const currentTeamName = (currentUser.teamName || (currentTeamId === 'team-shivam' ? 'Team Shivam' : currentTeamId === 'team-mukesh' ? 'Team Mukesh' : '')).toLowerCase();

    return items
      .filter(item => {
        const itemTeamId = (item.teamId || item.team || item.marketingTeam || '').toLowerCase();
        const itemTeamName = (item.teamName || '').toLowerCase();
        const itemLeadId = item.teamLeadId || '';

        const matchesTeamId = currentTeamId && (
          itemTeamId === currentTeamId.toLowerCase() ||
          (currentTeamId === 'team-shivam' && (itemTeamName.includes('shivam') || itemLeadId === 'u-1791911115518')) ||
          (currentTeamId === 'team-mukesh' && (itemTeamName.includes('mukesh') || itemLeadId === 'u-1791911058812'))
        );
        const matchesTeamLeadId = itemLeadId && (itemLeadId === currentUserId || (currentUserId === 'u-1791911115518' && itemLeadId === 'u-1791911115518') || (currentUserId === 'u-1791911058812' && itemLeadId === 'u-1791911058812'));
        const matchesTeamName = currentTeamName && itemTeamName && (itemTeamName.includes(currentTeamName) || currentTeamName.includes(itemTeamName));
        return matchesTeamId || matchesTeamLeadId || matchesTeamName;
      })
      .map(item => sanitizeForIdentityPrivacy(item, currentRole));
  }

  // 5. Marketing SR:
  // Can ONLY see records belonging to their assigned team, and if assigned specifically to an SR, only their own assigned items + code names only
  if (currentRole === 'marketing_sr') {
    const currentTeamId = currentUser.teamId || currentUser.team || (
      (currentUser.teamName || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
      (currentUser.teamName || '').toLowerCase().includes('shivam') ? 'team-shivam' : ''
    );
    const currentUserId = currentUser.id;
    const currentName = (currentUser.name || '').toLowerCase();
    const currentTeamName = (currentUser.teamName || (currentTeamId === 'team-shivam' ? 'Team Shivam' : currentTeamId === 'team-mukesh' ? 'Team Mukesh' : '')).toLowerCase();

    return items
      .filter(item => {
        const itemTeamId = (item.teamId || item.team || item.marketingTeam || '').toLowerCase();
        const itemTeamName = (item.teamName || '').toLowerCase();

        // Direct assignment check takes highest priority
        const isMyItem = Boolean(
          (item.assignedSrId && item.assignedSrId === currentUserId) ||
          (item.pocId && item.pocId === currentUserId) ||
          (item.createdById && item.createdById === currentUserId) ||
          (currentName && (
            (item.assignedSrName && item.assignedSrName.toLowerCase() === currentName) ||
            (item.recruiterName && item.recruiterName.toLowerCase() === currentName)
          ))
        );

        if (isMyItem) return true;

        // Check if item belongs to user's team pool
        const matchesTeamId = currentTeamId && (
          itemTeamId === currentTeamId.toLowerCase() ||
          (currentTeamId === 'team-shivam' && itemTeamName.includes('shivam')) ||
          (currentTeamId === 'team-mukesh' && itemTeamName.includes('mukesh'))
        );
        const matchesTeamName = currentTeamName && itemTeamName && (itemTeamName.includes(currentTeamName) || currentTeamName.includes(itemTeamName));
        const matchesTeam = matchesTeamId || matchesTeamName;

        if (!matchesTeam) return false;

        // If item belongs to team pool, check if assigned specifically to another SR
        const hasSpecificOtherSr = Boolean(
          (item.assignedSrId && item.assignedSrId !== currentUserId) ||
          (item.assignedSrName && currentName && item.assignedSrName.toLowerCase() !== currentName && !item.assignedSrName.toLowerCase().startsWith('team '))
        );

        return !hasSpecificOtherSr;
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
  const hasSubmittedFeedback = Boolean(
    fb?.feedbackSubmitted ||
    fb?.candidateFeedback?.submitted ||
    (fb?.candidateFeedback?.performanceRating != null && Number(fb?.candidateFeedback?.performanceRating) > 0) ||
    (fb?.candidateFeedback?.rating != null && Number(fb?.candidateFeedback?.rating) > 0)
  );

  let status = 'Scheduled';
  const outcome = t.interviewOutcome || fb?.marketingReview?.decision || fb?.candidateFeedback?.decision;

  if (t.interviewStatus) {
    if (t.interviewStatus === 'Interview Completed') {
      status = hasSubmittedFeedback ? 'Interview Completed - Feedback Received' : 'Interview Completed - Feedback Pending';
    } else if (t.interviewStatus === 'Feedback Pending') {
      status = 'Interview Completed - Feedback Pending';
    } else if (t.interviewStatus === 'Rescheduled' || t.interviewStatus === 'Reschedule') {
      status = 'Interview Rescheduled';
    } else {
      status = t.interviewStatus;
    }
  } else if (outcome === 'Cleared' || outcome === 'Passed' || outcome === 'Moved to Next Round' || outcome === 'Offer Received' || outcome === 'Selected' || t.status === 'Cleared') {
    status = 'Cleared';
  } else if (outcome === 'Failed' || outcome === 'Rejected' || t.status === 'Rejected') {
    status = 'Rejected';
  } else if (outcome === 'Hold' || outcome === 'On Hold' || t.status === 'Hold') {
    status = 'Hold';
  } else if (t.status === 'Reschedule' || t.status === 'Rescheduled' || t.status === 'Interview Rescheduled') {
    status = 'Interview Rescheduled';
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
  const cLower = (candidateName || '').trim().toLowerCase();

  // Find candidate's past interview tasks & feedback if candidateName provided
  const pastCandidateTasks = cLower
    ? allTasks.filter(t => (t.candidateName || '').toLowerCase() === cLower)
    : [];
  const pastCandidateFeedbacks = cLower
    ? allFeedbacks.filter(f => (f.candidateName || '').toLowerCase() === cLower)
    : [];

  return (tseUsers || []).map(tse => {
    const rawCodeName = tse.codeName || getTseCodeName(tse.name) || tse.name;
    const rawRealName = getTseRealName(tse.id) || getTseRealName(rawCodeName) || getTseRealName(tse.name) || (tse.role === 'tse' ? tse.name : rawCodeName);
    const officialId = tse.empId || TSE_IDS[rawCodeName] || TSE_IDS[rawRealName] || TSE_IDS[tse.id] || getTseId(rawCodeName);

    const tseTasks = allTasks.filter(t =>
      t.assigneeId === tse.id ||
      (t.techPerson && t.techPerson.toLowerCase() === tse.name.toLowerCase()) ||
      (t.codeName && t.codeName.toLowerCase() === rawCodeName.toLowerCase()) ||
      (t.techPersonId && t.techPersonId === officialId)
    );
    const activeTasksCount = tseTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;

    // Check past feedback for this TSE with this specific candidate
    const priorFeedback = pastCandidateFeedbacks.find(f =>
      (f.techSupportId && (f.techSupportId === tse.id || f.techSupportId === officialId)) ||
      (f.techSupport && f.techSupport.toLowerCase() === rawCodeName.toLowerCase()) ||
      (f.employeeName && f.employeeName.toLowerCase() === rawRealName.toLowerCase())
    );

    const priorRating = priorFeedback?.candidateFeedback?.performanceRating ||
                        priorFeedback?.candidateFeedback?.experienceRating ||
                        priorFeedback?.marketingReview?.overallRating;
    const priorComment = priorFeedback?.candidateFeedback?.comments || priorFeedback?.marketingReview?.feedbackRemarks;

    let score = 50; // base score
    let isRecommended = true;
    let isWarning = false;
    let bestRationale = '';
    let feedbackRationale = '';

    // KA BEST: Capacity, Workload & Readiness
    if (activeTasksCount === 0) {
      score += 35;
      bestRationale = 'Optimal Capacity • 0 active tasks in queue • Ready for immediate session';
    } else if (activeTasksCount === 1) {
      score += 25;
      bestRationale = 'Low Workload • 1 active task • High availability and focus';
    } else if (activeTasksCount <= 3) {
      score += 15;
      bestRationale = `Balanced Workload • ${activeTasksCount} active tasks • Active on schedule`;
    } else if (activeTasksCount <= 5) {
      score -= 10;
      bestRationale = `Moderate Workload • ${activeTasksCount} active tasks in progress`;
    } else {
      score -= 30;
      bestRationale = `High Workload • ${activeTasksCount} active tasks • May require schedule coordination`;
      if (!priorRating) isRecommended = false;
    }

    // AS PER FEEDBACK: Candidate prior history & ratings
    if (priorRating != null && Number(priorRating) > 0) {
      const numRating = Number(priorRating);
      if (numRating >= 4.0) {
        score += 45;
        feedbackRationale = `⭐ Candidate gave ${numRating}/5.0 in prior round${priorComment ? ` — "${priorComment.slice(0, 60)}..."` : ' (Strong candidate feedback)'}`;
      } else if (numRating <= 3.0) {
        score -= 55;
        isRecommended = false;
        isWarning = true;
        feedbackRationale = `⚠️ Low Rating (${numRating}/5.0) in past round with this candidate${priorComment ? ` — "${priorComment.slice(0, 60)}..."` : ''}`;
      } else {
        feedbackRationale = `Candidate previously evaluated: ${numRating}/5.0 (Satisfactory performance)`;
      }
    } else if (pastCandidateTasks.length > 0) {
      feedbackRationale = 'Prior rounds completed with candidate • No negative feedback logged';
    } else {
      feedbackRationale = 'No prior interactions with this candidate • Excellent overall track record across technical rounds';
    }

    return {
      tse,
      tseId: tse.id,
      codeName: rawCodeName,
      realName: rawRealName,
      officialId,
      score,
      isRecommended: isRecommended && !isWarning,
      isWarning,
      activeTasksCount,
      bestRationale,
      feedbackRationale,
      priorRating: priorRating || null,
      message: `${bestRationale} • ${feedbackRationale}`,
      tseName: rawCodeName,
    };
  }).sort((a, b) => b.score - a.score);
}

// ----------------- REAL-TIME TSE AVAILABILITY ENGINE -----------------
export function parseDurationMinutes(durationStr) {
  if (!durationStr) return 30;
  const s = String(durationStr).toLowerCase().trim();
  if (s.includes('hr') || s.includes('hour')) {
    const num = parseFloat(s) || 1;
    return Math.round(num * 60);
  }
  const match = s.match(/\d+/);
  return match ? parseInt(match[0], 10) : 30;
}

export function checkTseAvailability(tseId, interviewDateTime, duration, allTasks = [], excludeTaskId = null) {
  if (!tseId || !interviewDateTime) {
    return { available: true, conflicts: [] };
  }

  const requestedStart = new Date(interviewDateTime).getTime();
  if (isNaN(requestedStart)) {
    return { available: true, conflicts: [] };
  }

  const durMins = parseDurationMinutes(duration);
  const requestedEnd = requestedStart + durMins * 60000;

  const conflicts = [];

  for (const t of allTasks) {
    if (excludeTaskId && t.id === excludeTaskId) continue;
    if (t.status === 'Cancelled') continue;
    if (!t.interviewDateTime) continue;

    // Match by assigneeId or techPerson or codeName
    const isThisTse = t.assigneeId === tseId ||
      (t.techPerson && t.techPerson.toLowerCase() === tseId.toLowerCase()) ||
      (t.codeName && t.codeName.toLowerCase() === tseId.toLowerCase());

    if (!isThisTse) continue;

    const existingStart = new Date(t.interviewDateTime).getTime();
    if (isNaN(existingStart)) continue;

    const existingDurMins = parseDurationMinutes(t.duration);
    const existingEnd = existingStart + existingDurMins * 60000;

    // Time Overlap Formula: existing_start < requested_end && existing_end > requested_start
    if (existingStart < requestedEnd && existingEnd > requestedStart) {
      const startEst = new Date(existingStart).toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const endEst = new Date(existingEnd).toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      conflicts.push({
        taskId: t.id,
        candidateName: t.candidateName || t.title || 'Candidate',
        interviewDateTime: t.interviewDateTime,
        duration: t.duration || '30 mins',
        companyName: t.companyName || '',
        status: t.status,
        timeWindowFormatted: `${startEst} – ${endEst} EST`,
      });
    }
  }

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}
