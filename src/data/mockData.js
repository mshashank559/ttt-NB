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

// Authoritative Marketing Teams (Team Mukesh & Team Shivam for interview workflow)
export const MARKETING_TEAMS = [
  { id: 'team-mukesh', name: 'Team Mukesh', leadId: 'u-tl-mukesh', leadName: 'Mukesh Chaudhary' },
  { id: 'team-shivam', name: 'Team Shivam', leadId: 'u-tl-shivam', leadName: 'Shivam Barot' },
];

export const POC_USERS_BY_TEAM = {
  'team-mukesh': [
    { id: 'u-sr-snehal', name: 'Prajapati Snehal Vijaykumar', email: 'snehal.p@netbounceplacement.com', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-sr-ritik', name: 'Ritik Kumar Gupta', email: 'ritik.g@netbounceplacement.com', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-sr-ausafkhan', name: 'Ausafkhan Yasinkhan Pathan', email: 'ausafkhan.p@netbounceplacement.com', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-sr-chimanshu', name: 'Chaudhari Himanshu', email: 'himanshu.c@netbounceplacement.com', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-sr-deepkumar', name: 'Vaidh Deepkumar Janakkumar', email: 'deepkumar.v@netbounceplacement.com', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-sr-rohan', name: 'Rohan N Soni', email: 'rohan.s@netbounceplacement.com', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-sr-mukesh-sr', name: 'Mukesh Chaudhary SR', email: 'mukesh.sr@netbounceplacement.com', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-poc-aditi', name: 'Aditi Sharma', email: 'aditi.sharma@netbounce.io', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
    { id: 'u-poc-rahul', name: 'Rahul Verma', email: 'rahul.verma@netbounce.io', teamId: 'team-mukesh', teamLeadId: 'u-tl-mukesh', teamName: 'Team Mukesh' },
  ],
  'team-shivam': [
    { id: 'u-sr-vishal', name: 'Vishal Suthar', email: 'vishal.s@netbounceplacement.com', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-sr-riyen', name: 'Riyen Sukhadiya', email: 'riyen.s@netbounceplacement.com', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-sr-smit', name: 'Smit H Patel', email: 'smit.p@netbounceplacement.com', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-sr-rehan', name: 'Mohammed Rehan Shaikh', email: 'rehan.s@netbounceplacement.com', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-sr-bhimanshu', name: 'Himanshu Barot', email: 'himanshu.b@netbounceplacement.com', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-sr-yug', name: 'Yug Patel', email: 'yug.p@netbounceplacement.com', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-sr-jinesh', name: 'Jinesh Pandya', email: 'jinesh.p@netbounceplacement.com', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-poc-priya', name: 'Priya Singh', email: 'priya.singh@netbounce.io', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
    { id: 'u-poc-amit', name: 'Amit Mishra', email: 'amit.mishra@netbounce.io', teamId: 'team-shivam', teamLeadId: 'u-tl-shivam', teamName: 'Team Shivam' },
  ],
};

// Stable Code Name Lookup Mappings
export const TSE_CODE_NAMES = {
  'Harit Verma': 'Abhishek',
  'Harit': 'Abhishek',
  'Abhishek': 'Abhishek',
  'Prem Makwana': 'Kiran',
  'Prem': 'Kiran',
  'Kiran': 'Kiran',
  'Shaurya Mishra': 'Henil',
  'Shaurya': 'Henil',
  'Henil': 'Henil',
  'Nikunj Kataria': 'Saurav',
  'Nikunj': 'Saurav',
  'Saurav': 'Saurav',
  'Jindal Patel': 'Divya',
  'Jindal': 'Divya',
  'Divya': 'Divya',
  'Amber Afreen': 'Smriti',
  'Amber': 'Smriti',
  'Smriti': 'Smriti',
  'Rashika Sharma': 'Jemimah',
  'Rashika': 'Jemimah',
  'Jemimah': 'Jemimah',
  'Aarti Vishwakarma': 'Shreya',
  'Aarti': 'Shreya',
  'AARTI VISHWAKARMA': 'Shreya',
  'Shreya': 'Shreya',
  'Rahul Sharma': 'Rishi',
  'Ananya Verma': 'Aria',
  'Vikram Singh': 'Vivan',
  'Sana Qureshi': 'Sara',
  'Rishi': 'Rishi',
  'Aria': 'Aria',
  'Vivan': 'Vivan',
  'Sara': 'Sara'
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
    id: 'u-02',
    name: 'Priya Nair',
    email: 'priya.nair@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'management',
    dept: 'Operations',
    empId: 'TTT-NB-002',
    tttNbId: 'TTT-NB-002',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-01',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'upper_management',
    dept: 'Executive Leadership',
    empId: 'TTT-NB-003',
    tttNbId: 'TTT-NB-003',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-03',
    name: 'Rohan Kapoor',
    email: 'rohan.kapoor@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'tsm',
    codeName: 'TSM Titan',
    dept: 'Technical Support',
    empId: 'TTT-NB-008',
    tttNbId: 'TTT-NB-008',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-04',
    name: 'Neha Iyer',
    email: 'neha.iyer@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'tsm',
    codeName: 'TSM Nova',
    dept: 'Technical Support',
    empId: 'TTT-NB-004',
    tttNbId: 'TTT-NB-004',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-mgmt-rudra',
    name: 'Rudra',
    email: 'rudra@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'management',
    dept: 'Marketing Management',
    empId: 'TTT-NB-M01',
    tttNbId: 'TTT-NB-M01',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-mgmt-shilp',
    name: 'Shilp',
    email: 'shilp@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'management',
    dept: 'Marketing Management',
    empId: 'TTT-NB-M02',
    tttNbId: 'TTT-NB-M02',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tl-mukesh',
    name: 'Mukesh Chaudhary',
    email: 'mukesh.chaudhary@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_tl',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing',
    empId: 'TTT-NB-005',
    tttNbId: 'TTT-NB-005',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tl-shivam',
    name: 'Shivam Barot',
    email: 'shivam.barot@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_tl',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing',
    empId: 'TTT-NB-006',
    tttNbId: 'TTT-NB-006',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tl-vijesh',
    name: 'Vijesh Kumar',
    email: 'vijesh.kumar@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_tl',
    teamId: 'team-vijesh',
    teamName: 'Team Vijesh',
    teamLeadId: 'u-tl-vijesh',
    dept: 'Marketing',
    empId: 'TTT-NB-007',
    tttNbId: 'TTT-NB-007',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-msr-kavita',
    name: 'Kavita Rao',
    email: 'kavita.rao@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    dept: 'Marketing',
    empId: 'TTT-NB-016',
    tttNbId: 'TTT-NB-016',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
  // --- Verified Marketing SRs: Team Mukesh ---
  {
    id: 'u-sr-snehal',
    name: 'Prajapati Snehal Vijaykumar',
    email: 'snehal.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR01',
    tttNbId: 'TTT-NB-MSR01',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-ritik',
    name: 'Ritik Kumar Gupta',
    email: 'ritik.g@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR02',
    tttNbId: 'TTT-NB-MSR02',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-ausafkhan',
    name: 'Ausafkhan Yasinkhan Pathan',
    email: 'ausafkhan.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR03',
    tttNbId: 'TTT-NB-MSR03',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-chimanshu',
    name: 'Chaudhari Himanshu',
    email: 'himanshu.c@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR04',
    tttNbId: 'TTT-NB-MSR04',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-deepkumar',
    name: 'Vaidh Deepkumar Janakkumar',
    email: 'deepkumar.v@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR05',
    tttNbId: 'TTT-NB-MSR05',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-rohan',
    name: 'Rohan N Soni',
    email: 'rohan.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR06',
    tttNbId: 'TTT-NB-MSR06',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-mukesh-sr',
    name: 'Mukesh Chaudhary SR',
    email: 'mukesh.sr@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR07',
    tttNbId: 'TTT-NB-MSR07',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  },

  // --- Verified Marketing SRs: Team Shivam ---
  {
    id: 'u-sr-vishal',
    name: 'Vishal Suthar',
    email: 'vishal.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR08',
    tttNbId: 'TTT-NB-MSR08',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-riyen',
    name: 'Riyen Sukhadiya',
    email: 'riyen.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR09',
    tttNbId: 'TTT-NB-MSR09',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-smit',
    name: 'Smit H Patel',
    email: 'smit.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR10',
    tttNbId: 'TTT-NB-MSR10',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-rehan',
    name: 'Mohammed Rehan Shaikh',
    email: 'rehan.s@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR11',
    tttNbId: 'TTT-NB-MSR11',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-bhimanshu',
    name: 'Himanshu Barot',
    email: 'himanshu.b@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR12',
    tttNbId: 'TTT-NB-MSR12',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-yug',
    name: 'Yug Patel',
    email: 'yug.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR13',
    tttNbId: 'TTT-NB-MSR13',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-sr-jinesh',
    name: 'Jinesh Pandya',
    email: 'jinesh.p@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Marketing / Recruitment',
    empId: 'TTT-NB-MSR14',
    tttNbId: 'TTT-NB-MSR14',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-poc-aditi',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@netbounce.io',
    password: 'NetBounce@2026',
    role: 'marketing_sr',
    teamId: 'team-mukesh',
    teamName: 'Team Mukesh',
    teamLeadId: 'u-tl-mukesh',
    dept: 'Recruitment',
    empId: 'TTT-NB-017',
    tttNbId: 'TTT-NB-017',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-poc-priya',
    name: 'Priya Singh',
    email: 'priya.singh@netbounce.io',
    password: 'NetBounce@2026',
    role: 'recruiter',
    teamId: 'team-shivam',
    teamName: 'Team Shivam',
    teamLeadId: 'u-tl-shivam',
    dept: 'Recruitment',
    empId: 'TTT-NB-019',
    tttNbId: 'TTT-NB-019',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-poc-sneha',
    name: 'Sneha Joshi',
    email: 'sneha.joshi@netbounce.io',
    password: 'NetBounce@2026',
    role: 'recruiter',
    teamId: 'team-vijesh',
    teamName: 'Team Vijesh',
    teamLeadId: 'u-tl-vijesh',
    dept: 'Recruitment',
    empId: 'TTT-NB-021',
    tttNbId: 'TTT-NB-021',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tse-harit',
    name: 'Harit Verma',
    email: 'nbtech1@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'tse',
    codeName: 'Abhishek',
    dept: 'Technical Support',
    empId: 'TTT-NB-008',
    tttNbId: 'TTT-NB-008',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tse-prem',
    name: 'Prem Makwana',
    email: 'nbtech3@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'tse',
    codeName: 'Kiran',
    dept: 'Technical Support',
    empId: 'TTT-NB-009',
    tttNbId: 'TTT-NB-009',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tse-shaurya',
    name: 'Shaurya Mishra',
    email: 'nbtech2@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'tse',
    codeName: 'Henil',
    dept: 'Technical Support',
    empId: 'TTT-NB-010',
    tttNbId: 'TTT-NB-010',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tse-nikunj',
    name: 'Nikunj Kataria',
    email: 'nbtech4@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'tse',
    codeName: 'Saurav',
    dept: 'Technical Support',
    empId: 'TTT-NB-011',
    tttNbId: 'TTT-NB-011',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'u-tse-amber',
    name: 'Amber Afreen',
    email: 'smriti.m@netbounceplacement.com',
    password: 'NetBounce@2026',
    role: 'tse',
    codeName: 'Smriti',
    dept: 'Technical Support',
    empId: 'TTT-NB-013',
    tttNbId: 'TTT-NB-013',
    joined: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
];

const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };

// Sheet Column Options
export const TASK_TYPES = ['Interview', 'TAC', 'TQC', 'JDC', 'Demo', 'RUC'];
export const TASK_STATUSES = ['Done', 'Pending', 'Reschedule', 'Cancel', 'Not Possible'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const CATEGORIES = ['Technical Assessment', 'Coding Evaluation', 'Live Interview', 'Demo Session', 'Screening'];

export const INITIAL_TASKS = [];
export const INTERVIEW_STATUSES = ['Scheduled', 'Interview Completed', 'Feedback Pending', 'Cleared', 'Rejected', 'Hold'];
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
  { id: 'TTT-NB-008', supportName: 'Abhishek', employeeName: 'Harit Verma', email: 'nbtech1@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TTT-NB-009', supportName: 'Kiran', employeeName: 'Prem Makwana', email: 'nbtech3@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TTT-NB-010', supportName: 'Henil', employeeName: 'Shaurya Mishra', email: 'nbtech2@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TTT-NB-011', supportName: 'Saurav', employeeName: 'Nikunj Kataria', email: 'nbtech4@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TTT-NB-012', supportName: 'Divya', employeeName: 'Jindal Patel', email: 'divya.c@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TTT-NB-013', supportName: 'Smriti', employeeName: 'Amber Afreen', email: 'nbtech6@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TTT-NB-014', supportName: 'Jemimah', employeeName: 'Rashika Sharma', email: 'nbtech5@netbounceplacement.com', role: 'Technical Support Engineer' },
  { id: 'TTT-NB-015', supportName: 'Shreya', employeeName: 'Aarti Vishwakarma', email: 'nbtech7@netbounceplacement.com', role: 'Technical Support Engineer' },
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

// Identity Privacy Sanitizer: Never expose TSE real names or emails to Marketing TL / SR (ONLY their Support Name)
export const sanitizeForIdentityPrivacy = (record, role) => {
  if (!record) return record;
  if (roleIsMarketing(role)) {
    const copy = { ...record };
    const rawTse = record.techPerson || record.techSupport || record.employeeName || record.assigneeId;
    const supportName = (TSE_MAP && TSE_MAP[rawTse]?.supportName) || record.codeName || (TSE_CODE_NAMES && TSE_CODE_NAMES[rawTse]) || 'Tech Support';

    copy.techPerson = supportName;
    copy.techSupport = supportName;
    copy.codeName = supportName;
    // Strictly mask employee real name with support name
    if (copy.employeeName !== undefined) copy.employeeName = supportName;
    // Mask tech support email
    if (copy.techSupportEmail) copy.techSupportEmail = 'techsupport@netbounceplacement.com';
    return copy;
  }
  return record;
};

// Strict Central Data Scoping Filter
export const filterAuthorizedData = (items, currentUser, currentRole) => {
  if (!items || !Array.isArray(items)) return [];
  if (!currentUser || !currentRole) return items;

  // Handle Targeted Notifications
  const isNotificationList = items.length > 0 && ('title' in items[0] && 'message' in items[0]);
  if (isNotificationList) {
    const currentId = currentUser.id;
    const currentEmpId = currentUser.empId || '';
    const currentTeamId = currentUser.teamId;

    return items.filter(n => {
      // 1. Direct user targeting
      if (n.targetUserId) {
        return n.targetUserId === currentId || n.targetUserId === currentEmpId;
      }
      // 2. Direct role targeting
      if (n.targetRole) {
        if (n.targetRole === currentRole) {
          if (n.teamId && (currentRole === 'marketing_tl' || currentRole === 'marketing_sr')) {
            return n.teamId === currentTeamId;
          }
          return true;
        }
        return false;
      }
      // 3. Fallback for role-specific notifications
      if (currentRole === 'management' || currentRole === 'upper_management') return true;
      if (currentRole === 'tsm') return true;
      if (currentRole === 'marketing_tl' || currentRole === 'marketing_sr') {
        return !n.teamId || n.teamId === currentTeamId;
      }
      if (currentRole === 'recruiter') {
        return !n.pocId || n.pocId === currentId;
      }
      if (currentRole === 'tse') {
        return !n.assigneeId || n.assigneeId === currentId || n.assigneeId === currentEmpId;
      }
      return true;
    });
  }

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
      const isAssigneeId = item.assigneeId === currentId || item.assigneeId === currentEmpId || (currentUser?.tttNbId && item.assigneeId === currentUser.tttNbId) || item.techSupportId === currentId || item.techSupportId === currentEmpId;
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

  // 3. Recruiter & Marketing SR: Can ONLY see their own assigned candidates (Strict SR-level isolation)
  if (currentRole === 'recruiter' || currentRole === 'marketing_sr') {
    const currentId = currentUser.id;
    const currentName = (currentUser.name || '').toLowerCase();

    return items
      .filter(item => {
        const isPocId = item.pocId === currentId;
        const isRecruiterName = item.recruiterName && item.recruiterName.toLowerCase() === currentName;
        return isPocId || isRecruiterName;
      })
      .map(item => sanitizeForIdentityPrivacy(item, currentRole));
  }

    // 4. Marketing TL (Mukesh, Shivam):
  // Robust bidirectional team mapping ensuring all TSM-assigned tasks appear on the TL dashboard
  if (currentRole === 'marketing_tl') {
    const currentName = (currentUser?.name || '').toLowerCase();
    const currentEmail = (currentUser?.email || '').toLowerCase();
    const currentId = currentUser?.id || '';
    const currentEmpId = currentUser?.empId || '';

    // Automatically resolve team for Mukesh or Shivam
    const isMukesh = currentName.includes('mukesh') || currentEmail.includes('mukesh') || currentId === 'u-tl-mukesh' || currentUser?.teamId === 'team-mukesh';
    const isShivam = currentName.includes('shivam') || currentEmail.includes('shivam') || currentId === 'u-tl-shivam' || currentUser?.teamId === 'team-shivam';

    const userTeamId = currentUser?.teamId || (isMukesh ? 'team-mukesh' : (isShivam ? 'team-shivam' : ''));

    return items
      .filter(item => {
        // Direct teamId matching (case-insensitive)
        if (userTeamId && item.teamId && item.teamId.toLowerCase() === userTeamId.toLowerCase()) return true;

        // Team Lead ID match
        if (item.teamLeadId && (item.teamLeadId === currentId || item.teamLeadId === currentEmpId)) return true;

        // If Mukesh: matches any task/feedback for Team Mukesh, Mukesh Chaudhary, or u-tl-mukesh
        if (isMukesh) {
          const itemTeam = (item.teamName || item.teamId || '').toLowerCase();
          const itemLead = (item.marketingTl || item.teamLeadName || item.teamLeadId || '').toLowerCase();
          if (itemTeam.includes('mukesh') || itemLead.includes('mukesh') || item.teamLeadId === 'u-tl-mukesh' || item.teamId === 'team-mukesh') {
            return true;
          }
          if (!item.teamId || item.teamId === 'team-mukesh' || !item.teamName || item.teamName.toLowerCase().includes('mukesh')) {
            return true;
          }
        }

        // If Shivam: matches any task for Team Shivam, Shivam Barot, or u-tl-shivam
        if (isShivam) {
          const itemTeam = (item.teamName || item.teamId || '').toLowerCase();
          const itemLead = (item.marketingTl || item.teamLeadName || item.teamLeadId || '').toLowerCase();
          if (itemTeam.includes('shivam') || itemLead.includes('shivam') || item.teamLeadId === 'u-tl-shivam' || item.teamId === 'team-shivam') {
            return true;
          }
        }

        // Team Name matching (case-insensitive)
        if (currentUser?.teamName && item.teamName && currentUser.teamName.toLowerCase().trim() === item.teamName.toLowerCase().trim()) {
          return true;
        }

        return false;
      })
      .map(item => sanitizeForIdentityPrivacy(item, currentRole));
  }

  // 5. Marketing SR:
  // Can ONLY see records belonging to their assigned team + code names only
  if (currentRole === 'marketing_sr') {
    const currentTeamId = currentUser.teamId;
    const currentTeamName = (currentUser.teamName || '').toLowerCase();

    return items
      .filter(item => {
        const matchesTeamId = item.teamId && currentTeamId && item.teamId === currentTeamId;
        const matchesTeamName = item.teamName && currentTeamName && item.teamName.toLowerCase() === currentTeamName;
        return matchesTeamId || matchesTeamName;
      })
      .map(item => sanitizeForIdentityPrivacy(item, currentRole));
  }

  // 6. TSM: Operational scope
  if (currentRole === 'tsm') {
    return items;
  }

  return items;
};

export const anonymizeInterview = (interview) => ({
  ...interview,
  candidateName: interview.candidateName,
  candidateId: interview.candidateId,
});

export const getUserById = (id, users = USERS) => users.find(u => u.id === id);


export const TSE_MAP = {
  'Harit Verma': { realName: 'Harit Verma', supportName: 'Abhishek', email: 'nbtech1@netbounceplacement.com', empId: 'TTT-NB-008', id: 'u-1791910812799' },
  'Harit': { realName: 'Harit Verma', supportName: 'Abhishek', email: 'nbtech1@netbounceplacement.com', empId: 'TTT-NB-008', id: 'u-1791910812799' },
  'Abhishek': { realName: 'Harit Verma', supportName: 'Abhishek', email: 'nbtech1@netbounceplacement.com', empId: 'TTT-NB-008', id: 'u-1791910812799' },
  'u-1791910812799': { realName: 'Harit Verma', supportName: 'Abhishek', email: 'nbtech1@netbounceplacement.com', empId: 'TTT-NB-008', id: 'u-1791910812799' },
  'u-tse-harit': { realName: 'Harit Verma', supportName: 'Abhishek', email: 'nbtech1@netbounceplacement.com', empId: 'TTT-NB-008', id: 'u-1791910812799' },
  'TTT-NB-008': { realName: 'Harit Verma', supportName: 'Abhishek', email: 'nbtech1@netbounceplacement.com', empId: 'TTT-NB-008', id: 'u-1791910812799' },

  'Prem Makwana': { realName: 'Prem Makwana', supportName: 'Kiran', email: 'nbtech3@netbounceplacement.com', empId: 'TTT-NB-009', id: 'u-1791910844293' },
  'Prem': { realName: 'Prem Makwana', supportName: 'Kiran', email: 'nbtech3@netbounceplacement.com', empId: 'TTT-NB-009', id: 'u-1791910844293' },
  'Kiran': { realName: 'Prem Makwana', supportName: 'Kiran', email: 'nbtech3@netbounceplacement.com', empId: 'TTT-NB-009', id: 'u-1791910844293' },
  'u-1791910844293': { realName: 'Prem Makwana', supportName: 'Kiran', email: 'nbtech3@netbounceplacement.com', empId: 'TTT-NB-009', id: 'u-1791910844293' },
  'u-tse-prem': { realName: 'Prem Makwana', supportName: 'Kiran', email: 'nbtech3@netbounceplacement.com', empId: 'TTT-NB-009', id: 'u-1791910844293' },
  'TTT-NB-009': { realName: 'Prem Makwana', supportName: 'Kiran', email: 'nbtech3@netbounceplacement.com', empId: 'TTT-NB-009', id: 'u-1791910844293' },

  'Shaurya Mishra': { realName: 'Shaurya Mishra', supportName: 'Henil', email: 'nbtech2@netbounceplacement.com', empId: 'TTT-NB-010', id: 'u-1791910865708' },
  'Shaurya': { realName: 'Shaurya Mishra', supportName: 'Henil', email: 'nbtech2@netbounceplacement.com', empId: 'TTT-NB-010', id: 'u-1791910865708' },
  'Henil': { realName: 'Shaurya Mishra', supportName: 'Henil', email: 'nbtech2@netbounceplacement.com', empId: 'TTT-NB-010', id: 'u-1791910865708' },
  'u-1791910865708': { realName: 'Shaurya Mishra', supportName: 'Henil', email: 'nbtech2@netbounceplacement.com', empId: 'TTT-NB-010', id: 'u-1791910865708' },
  'u-tse-shaurya': { realName: 'Shaurya Mishra', supportName: 'Henil', email: 'nbtech2@netbounceplacement.com', empId: 'TTT-NB-010', id: 'u-1791910865708' },
  'TTT-NB-010': { realName: 'Shaurya Mishra', supportName: 'Henil', email: 'nbtech2@netbounceplacement.com', empId: 'TTT-NB-010', id: 'u-1791910865708' },

  'Nikunj Kataria': { realName: 'Nikunj Kataria', supportName: 'Saurav', email: 'nbtech4@netbounceplacement.com', empId: 'TTT-NB-011', id: 'u-1791910900310' },
  'Nikunj': { realName: 'Nikunj Kataria', supportName: 'Saurav', email: 'nbtech4@netbounceplacement.com', empId: 'TTT-NB-011', id: 'u-1791910900310' },
  'Saurav': { realName: 'Nikunj Kataria', supportName: 'Saurav', email: 'nbtech4@netbounceplacement.com', empId: 'TTT-NB-011', id: 'u-1791910900310' },
  'u-1791910900310': { realName: 'Nikunj Kataria', supportName: 'Saurav', email: 'nbtech4@netbounceplacement.com', empId: 'TTT-NB-011', id: 'u-1791910900310' },
  'u-tse-nikunj': { realName: 'Nikunj Kataria', supportName: 'Saurav', email: 'nbtech4@netbounceplacement.com', empId: 'TTT-NB-011', id: 'u-1791910900310' },
  'TTT-NB-011': { realName: 'Nikunj Kataria', supportName: 'Saurav', email: 'nbtech4@netbounceplacement.com', empId: 'TTT-NB-011', id: 'u-1791910900310' },

  'Jindal Patel': { realName: 'Jindal Patel', supportName: 'Divya', email: 'divya.c@netbounceplacement.com', empId: 'TTT-NB-012', id: 'u-1791910926064' },
  'Jindal': { realName: 'Jindal Patel', supportName: 'Divya', email: 'divya.c@netbounceplacement.com', empId: 'TTT-NB-012', id: 'u-1791910926064' },
  'Divya': { realName: 'Jindal Patel', supportName: 'Divya', email: 'divya.c@netbounceplacement.com', empId: 'TTT-NB-012', id: 'u-1791910926064' },
  'u-1791910926064': { realName: 'Jindal Patel', supportName: 'Divya', email: 'divya.c@netbounceplacement.com', empId: 'TTT-NB-012', id: 'u-1791910926064' },
  'u-tse-jindal': { realName: 'Jindal Patel', supportName: 'Divya', email: 'divya.c@netbounceplacement.com', empId: 'TTT-NB-012', id: 'u-1791910926064' },
  'TTT-NB-012': { realName: 'Jindal Patel', supportName: 'Divya', email: 'divya.c@netbounceplacement.com', empId: 'TTT-NB-012', id: 'u-1791910926064' },

  'Amber Afreen': { realName: 'Amber Afreen', supportName: 'Smriti', email: 'nbtech6@netbounceplacement.com', empId: 'TTT-NB-013', id: 'u-1791910948923' },
  'Amber': { realName: 'Amber Afreen', supportName: 'Smriti', email: 'nbtech6@netbounceplacement.com', empId: 'TTT-NB-013', id: 'u-1791910948923' },
  'Smriti': { realName: 'Amber Afreen', supportName: 'Smriti', email: 'nbtech6@netbounceplacement.com', empId: 'TTT-NB-013', id: 'u-1791910948923' },
  'u-1791910948923': { realName: 'Amber Afreen', supportName: 'Smriti', email: 'nbtech6@netbounceplacement.com', empId: 'TTT-NB-013', id: 'u-1791910948923' },
  'u-tse-amber': { realName: 'Amber Afreen', supportName: 'Smriti', email: 'nbtech6@netbounceplacement.com', empId: 'TTT-NB-013', id: 'u-1791910948923' },
  'TTT-NB-013': { realName: 'Amber Afreen', supportName: 'Smriti', email: 'nbtech6@netbounceplacement.com', empId: 'TTT-NB-013', id: 'u-1791910948923' },

  'Rashika Sharma': { realName: 'Rashika Sharma', supportName: 'Jemimah', email: 'nbtech5@netbounceplacement.com', empId: 'TTT-NB-014', id: 'u-1791910976518' },
  'Rashika': { realName: 'Rashika Sharma', supportName: 'Jemimah', email: 'nbtech5@netbounceplacement.com', empId: 'TTT-NB-014', id: 'u-1791910976518' },
  'Jemimah': { realName: 'Rashika Sharma', supportName: 'Jemimah', email: 'nbtech5@netbounceplacement.com', empId: 'TTT-NB-014', id: 'u-1791910976518' },
  'u-1791910976518': { realName: 'Rashika Sharma', supportName: 'Jemimah', email: 'nbtech5@netbounceplacement.com', empId: 'TTT-NB-014', id: 'u-1791910976518' },
  'u-tse-rashika': { realName: 'Rashika Sharma', supportName: 'Jemimah', email: 'nbtech5@netbounceplacement.com', empId: 'TTT-NB-014', id: 'u-1791910976518' },
  'TTT-NB-014': { realName: 'Rashika Sharma', supportName: 'Jemimah', email: 'nbtech5@netbounceplacement.com', empId: 'TTT-NB-014', id: 'u-1791910976518' },

  'Aarti Vishwakarma': { realName: 'Aarti Vishwakarma', supportName: 'Shreya', email: 'nbtech7@netbounceplacement.com', empId: 'TTT-NB-015', id: 'u-1791910998393' },
  'Aarti': { realName: 'Aarti Vishwakarma', supportName: 'Shreya', email: 'nbtech7@netbounceplacement.com', empId: 'TTT-NB-015', id: 'u-1791910998393' },
  'AARTI VISHWAKARMA': { realName: 'Aarti Vishwakarma', supportName: 'Shreya', email: 'nbtech7@netbounceplacement.com', empId: 'TTT-NB-015', id: 'u-1791910998393' },
  'Shreya': { realName: 'Aarti Vishwakarma', supportName: 'Shreya', email: 'nbtech7@netbounceplacement.com', empId: 'TTT-NB-015', id: 'u-1791910998393' },
  'u-1791910998393': { realName: 'Aarti Vishwakarma', supportName: 'Shreya', email: 'nbtech7@netbounceplacement.com', empId: 'TTT-NB-015', id: 'u-1791910998393' },
  'u-tse-aarti': { realName: 'Aarti Vishwakarma', supportName: 'Shreya', email: 'nbtech7@netbounceplacement.com', empId: 'TTT-NB-015', id: 'u-1791910998393' },
  'TTT-NB-015': { realName: 'Aarti Vishwakarma', supportName: 'Shreya', email: 'nbtech7@netbounceplacement.com', empId: 'TTT-NB-015', id: 'u-1791910998393' },
};

export const resolveTse = (itemOrId) => {
  if (!itemOrId) return null;
  if (typeof itemOrId === 'string') {
    const trimmed = itemOrId.trim();
    if (!trimmed || trimmed === 'Code Name Unassigned' || trimmed === 'Unassigned') return null;
    if (TSE_MAP[trimmed]) return TSE_MAP[trimmed];
    const lower = trimmed.toLowerCase();
    const found = Object.values(TSE_MAP).find(
      e => (e.supportName && e.supportName.toLowerCase() === lower) ||
           (e.realName && e.realName.toLowerCase() === lower) ||
           (e.empId && e.empId.toLowerCase() === lower) ||
           (e.id && e.id.toLowerCase() === lower)
    );
    if (found) return found;
    if (lower.includes('shreya') || lower.includes('aarti') || lower.includes('015') || lower.includes('1791910998393')) return TSE_MAP['Shreya'];
    if (lower.includes('abhishek') || lower.includes('harit') || lower.includes('008') || lower.includes('1791910812799')) return TSE_MAP['Abhishek'];
    if (lower.includes('kiran') || lower.includes('prem') || lower.includes('009') || lower.includes('1791910844293')) return TSE_MAP['Kiran'];
    if (lower.includes('henil') || lower.includes('shaurya') || lower.includes('010') || lower.includes('1791910865708')) return TSE_MAP['Henil'];
    if (lower.includes('saurav') || lower.includes('nikunj') || lower.includes('011') || lower.includes('1791910900310')) return TSE_MAP['Saurav'];
    if (lower.includes('divya') || lower.includes('jindal') || lower.includes('012') || lower.includes('1791910926064')) return TSE_MAP['Divya'];
    if (lower.includes('smriti') || lower.includes('amber') || lower.includes('013') || lower.includes('1791910948923')) return TSE_MAP['Smriti'];
    if (lower.includes('jemimah') || lower.includes('rashika') || lower.includes('014') || lower.includes('1791910976518')) return TSE_MAP['Jemimah'];
    return null;
  }
  if (typeof itemOrId === 'object') {
    const rawId = (itemOrId.assigneeId || itemOrId.techSupportId || itemOrId.empId || itemOrId.id || '').trim();
    const rawSupport = (itemOrId.supportName || itemOrId.codeName || itemOrId.techSupport || '').trim();
    const rawName = (itemOrId.name || itemOrId.techPerson || itemOrId.employeeName || '').trim();

    if (rawId && rawId !== 'Code Name Unassigned') {
      const res = resolveTse(rawId);
      if (res) return res;
    }
    if (rawSupport && rawSupport !== 'Code Name Unassigned') {
      const res = resolveTse(rawSupport);
      if (res) return res;
    }
    if (rawName && rawName !== 'Code Name Unassigned') {
      const res = resolveTse(rawName);
      if (res) return res;
    }
  }
  return null;
};

export const formatTseNameForRole = (itemOrName, currentRole) => {
  if (!itemOrName) return 'Unassigned';
  const resolved = resolveTse(itemOrName);
  const realName = resolved?.realName || (typeof itemOrName === 'object' ? (itemOrName.employeeName || itemOrName.name) : itemOrName);
  const supportName = resolved?.supportName || (typeof itemOrName === 'object' ? (itemOrName.supportName || itemOrName.codeName || itemOrName.techSupport) : itemOrName);

  // Marketing TL & SR: ONLY Support/Pseudo Name! Under no circumstances show real name or email
  if (roleIsMarketing(currentRole)) {
    return supportName || 'Tech Support';
  }

  // Management, Upper Management & TSM: Both Real Name and Pseudo Name MUST be clearly visible!
  // Format: "Real Name (Pseudo Name)" e.g. "Aarti Vishwakarma (Shreya)"
  if (['upper_management', 'management', 'tsm'].includes(currentRole)) {
    if (realName && supportName && realName.toLowerCase() !== supportName.toLowerCase()) {
      return `${realName} (${supportName})`;
    }
    return realName || supportName || 'Unassigned';
  }

  // TSE and other roles: Real Name (Pseudo Name)
  if (realName && supportName && realName.toLowerCase() !== supportName.toLowerCase()) {
    return `${realName} (${supportName})`;
  }
  return realName || supportName || 'Unassigned';
};
