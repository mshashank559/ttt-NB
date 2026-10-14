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
      const isAssigneeId = item.assigneeId === currentId || item.techSupportId === currentId || item.techSupportId === currentEmpId;
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
  // Can ONLY see candidates belonging to their own team + code names only
  if (currentRole === 'marketing_tl') {
    const currentTeamId = currentUser.teamId;
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
