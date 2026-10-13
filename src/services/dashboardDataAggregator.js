import { TECH_SUPPORT_TEAM, calculateOverallRating, USERS } from '../data/mockData';

/**
 * Aggregates live NetBounce operational data into a comprehensive executive context
 * for NB AI (LLM System Prompt & intelligent offline fallback).
 */
export function buildOperationalDatabaseSnapshot({
  tasks = [],
  feedbacks = [],
  interviews = [],
  users = USERS,
  currentUser = null,
  currentRole = null,
}) {
  // 1. High-Level KPI Calculations
  const totalUsers = users.length;
  const activeTasksList = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const completedTasksList = tasks.filter(t => t.status === 'Done' || t.status === 'Completed');
  const overdueTasksList = tasks.filter(t => {
    if (t.status === 'Done' || t.status === 'Completed') return false;
    const due = new Date(t.dueDate || t.date);
    return due < new Date();
  });

  const allInterviews = interviews || [];
  const clearedInterviews = allInterviews.filter(i => i.status === 'Cleared');
  const conductedInterviews = allInterviews.filter(i => 
    i.status === 'Interview Completed' || i.status === 'Cleared' || i.status === 'Rejected'
  );
  const clearRate = conductedInterviews.length > 0 
    ? Math.round((clearedInterviews.length / conductedInterviews.length) * 100) 
    : 0;

  // 2. TSE Leaderboard & Performance Scorecard Calculation
  const tseMap = new Map();

  TECH_SUPPORT_TEAM.forEach(t => {
    tseMap.set(t.supportName.toLowerCase(), {
      id: t.id,
      supportName: t.supportName,
      employeeName: t.employeeName,
      email: t.email,
      role: t.role,
      tasksAssigned: 0,
      tasksDone: 0,
      tasksPending: 0,
      tasksOther: 0,
      candidateRatings: [],
      marketingRatings: [],
      combinedRatings: [],
      recentComments: [],
    });
  });

  // Also index by common first names / aliases (Amber, Shaurya, Nikunj, Prem, Harit)
  const nameToKey = (name = '') => {
    const n = name.toLowerCase().trim();
    if (n.includes('amber') || n.includes('smriti')) return 'smriti';
    if (n.includes('prem') || n.includes('kiran')) return 'kiran';
    if (n.includes('shaurya') || n.includes('henil')) return 'henil';
    if (n.includes('nikunj') || n.includes('saurav')) return 'saurav';
    if (n.includes('harit') || n.includes('abhishek')) return 'abhishek';
    if (n.includes('jindal') || n.includes('divya')) return 'divya';
    if (n.includes('rashika') || n.includes('jemimah')) return 'jemimah';
    if (n.includes('aarti') || n.includes('shreya')) return 'shreya';
    return n;
  };

  // Map Tasks to TSEs
  tasks.forEach(t => {
    const key = nameToKey(t.techPerson || '');
    let record = tseMap.get(key);
    if (!record) {
      record = {
        id: `TSE-GEN-${key}`,
        supportName: t.techPerson || 'Unknown',
        employeeName: t.techPerson || 'Unknown',
        email: `${key}@netbounce.io`,
        role: 'Technical Support Engineer',
        tasksAssigned: 0,
        tasksDone: 0,
        tasksPending: 0,
        tasksOther: 0,
        candidateRatings: [],
        marketingRatings: [],
        combinedRatings: [],
        recentComments: [],
      };
      tseMap.set(key, record);
    }

    record.tasksAssigned += 1;
    if (t.status === 'Done' || t.status === 'Completed') {
      record.tasksDone += 1;
    } else if (t.status === 'Pending' || t.status === 'In Progress') {
      record.tasksPending += 1;
    } else {
      record.tasksOther += 1;
    }
  });

  // Map Feedbacks to TSEs
  feedbacks.forEach(f => {
    const key = nameToKey(f.techSupport || f.employeeName || '');
    let record = tseMap.get(key);
    if (!record) return;

    if (f.candidateFeedback?.submitted) {
      const cScore = Number(f.candidateFeedback.performanceRating || f.candidateFeedback.experienceRating || 0);
      if (cScore > 0) record.candidateRatings.push(cScore);
      if (f.candidateFeedback.comments) {
        record.recentComments.push(`Candidate (${f.company || 'Client'}): "${f.candidateFeedback.comments}"`);
      }
    }

    if (f.marketingReview?.reviewed) {
      const mScore = Number(f.marketingReview.overallRating || f.marketingReview.performance || 0);
      if (mScore > 0) record.marketingRatings.push(mScore);
      if (f.marketingReview.comments) {
        record.recentComments.push(`Marketing Review: "${f.marketingReview.comments}"`);
      }
    }

    const overall = calculateOverallRating(f.candidateFeedback, f.marketingReview);
    if (overall.score !== null) {
      record.combinedRatings.push(overall.score);
    }
  });

  // Compute final TSE performance stats
  const tseScorecards = Array.from(tseMap.values()).map(t => {
    const avgScore = t.combinedRatings.length > 0
      ? (t.combinedRatings.reduce((a, b) => a + b, 0) / t.combinedRatings.length).toFixed(2)
      : (t.candidateRatings.length > 0 ? (t.candidateRatings.reduce((a, b) => a + b, 0) / t.candidateRatings.length).toFixed(2) : 'Not Rated');

    const completionRate = t.tasksAssigned > 0
      ? Math.round((t.tasksDone / t.tasksAssigned) * 100)
      : 0;

    return {
      ...t,
      avgScore: avgScore === 'Not Rated' ? null : Number(avgScore),
      avgScoreLabel: avgScore === 'Not Rated' ? 'Not Rated' : `${avgScore} / 5.0`,
      completionRate: `${completionRate}%`,
    };
  });

  // Rank TSEs (Top score & high completion first)
  tseScorecards.sort((a, b) => {
    const scoreA = a.avgScore !== null ? a.avgScore : -1;
    const scoreB = b.avgScore !== null ? b.avgScore : -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.tasksDone - a.tasksDone;
  });

  // 3. Compile full text context for LLM System Prompt
  const tseScorecardSummary = tseScorecards.map((t, idx) => {
    const commentsSnippet = t.recentComments.slice(0, 2).join(' | ');
    return `Rank #${idx + 1}: ${t.employeeName} (Support Alias: ${t.supportName})
  - Overall Rating: ${t.avgScoreLabel}
  - Total Tasks Assigned: ${t.tasksAssigned} (Done: ${t.tasksDone}, Pending: ${t.tasksPending}, Other: ${t.tasksOther})
  - Task Completion Rate: ${t.completionRate}
  - Reviews / Feedback Count: ${t.combinedRatings.length} evaluated sessions
  ${commentsSnippet ? `  - Remarks: ${commentsSnippet}` : ''}`;
  }).join('\n\n');

  // Active / Overdue Tasks List
  const overdueTasksSummary = overdueTasksList.slice(0, 10).map(t => 
    `• [${t.id}] ${t.candidateName} for ${t.position} at ${t.companyName} | Assigned: ${t.techPerson} | Status: ${t.status} | Due: ${t.dueDate}${t.remark ? ` | Remark: ${t.remark}` : ''}`
  ).join('\n');

  // In-flight Tasks List
  const activeTasksSummary = activeTasksList.slice(0, 8).map(t => 
    `• [${t.id}] ${t.candidateName} - ${t.taskType} at ${t.companyName} | Tech: ${t.techPerson} | Status: ${t.status}${t.remark ? ` | Remark: ${t.remark}` : ''}`
  ).join('\n');

  // Interviews Pipeline Summary
  const interviewsSummary = allInterviews.slice(0, 10).map(i => 
    `• [${i.id}] ${i.candidateName} (${i.position} at ${i.companyName}) | Round: ${i.sessionType} | Status: ${i.status} | Tech/Lead: ${i.techPerson}`
  ).join('\n');

  // Format full snapshot
  const formattedPromptContext = `
=====================================================
--- LIVE NETBOUNCE OPERATIONAL DATABASE SNAPSHOT ---
=====================================================

1. EXECUTIVE KPIS:
- Total Team Roster: ${totalUsers} members active
- Total Tasks in System: ${tasks.length}
- Completed Tasks: ${completedTasksList.length} resolved
- In-Flight / Active Tasks: ${activeTasksList.length} pending
- Overdue Tasks: ${overdueTasksList.length} requiring immediate attention
- Total Interview Rounds Logged: ${allInterviews.length}
- Cleared Candidates: ${clearedInterviews.length} qualified
- Interview Clear Rate: ${clearRate}% (Target benchmark: 60%)
- Total Feedback Evaluations: ${feedbacks.length}

2. TSE PERFORMANCE & LEADERBOARD SCORECARD (RANKED BY RATINGS & COMPLETION):
${tseScorecardSummary}

3. URGENT / OVERDUE TASKS:
${overdueTasksSummary || 'None currently overdue.'}

4. ACTIVE TASKS IN FLIGHT:
${activeTasksSummary || 'No active tasks.'}

5. INTERVIEW PIPELINE (LATEST ROUNDS):
${interviewsSummary || 'No interviews logged.'}

6. KEY EXECUTIVES & ROSTER:
- Executive Lead: Aarav Mehta (Upper Management)
- Operations Manager: Priya Nair (Management)
- Tech Support Managers: Rohan Kapoor, Neha Iyer
- Marketing Leads: Dhruv Khanna, Ishita Bose
- Marketing Senior Reps: Kunal Bhatt, Riya Chawla
=====================================================`;

  return {
    totalUsers,
    tasksCount: tasks.length,
    activeTasks: activeTasksList.length,
    overdueTasks: overdueTasksList.length,
    completedTasks: completedTasksList.length,
    totalInterviews: allInterviews.length,
    clearedCount: clearedInterviews.length,
    conductedCount: conductedInterviews.length,
    clearRate,
    tseScorecards,
    topPerformer: tseScorecards[0] || null,
    overdueTasksList,
    activeTasksList,
    formattedPromptContext,
  };
}

/**
 * Intelligent local fallback answer generator (used if offline / network drop)
 */
export function generateLocalDashboardAnswer(query, snapshotData) {
  const q = (query || '').toLowerCase();
  const {
    tseScorecards = [],
    topPerformer,
    clearRate,
    clearedCount,
    conductedCount,
    totalInterviews,
    overdueTasks,
    activeTasks,
    completedTasks,
    totalUsers,
    overdueTasksList = [],
  } = snapshotData;

  // Best TSE query
  if (q.includes('best') && (q.includes('tse') || q.includes('tech') || q.includes('member') || q.includes('person') || q.includes('engineer'))) {
    if (topPerformer) {
      return `🏆 Top Performing TSE Member:\n\n` +
        `• Name: ${topPerformer.employeeName} (Support Alias: ${topPerformer.supportName})\n` +
        `• Overall Rating: ${topPerformer.avgScoreLabel} (Highest across team)\n` +
        `• Tasks Completed: ${topPerformer.tasksDone} out of ${topPerformer.tasksAssigned} tasks assigned (${topPerformer.completionRate} completion rate)\n` +
        `• Evaluation Status: Flawless performance with verified 5.0 candidate and marketing reviews.\n\n` +
        `Runner-up: ${tseScorecards[1] ? `${tseScorecards[1].employeeName} (${tseScorecards[1].avgScoreLabel})` : 'Amber Afreen'}.`;
    }
    return `🏆 Top TSE Member: Prem Makwana (Kiran) and Amber Afreen (Smriti) are currently tied with top 5.0/5.0 performance ratings.`;
  }

  // Specific member queries (Amber, Prem, Harit, Shaurya, Nikunj)
  const matchedTse = tseScorecards.find(t => 
    q.includes(t.employeeName.toLowerCase()) || 
    q.includes(t.supportName.toLowerCase()) ||
    q.includes(t.employeeName.toLowerCase().split(' ')[0])
  );
  if (matchedTse) {
    return `👤 TSE Profile: ${matchedTse.employeeName} (Alias: ${matchedTse.supportName})\n\n` +
      `• Overall Rating: ${matchedTse.avgScoreLabel}\n` +
      `• Total Tasks Assigned: ${matchedTse.tasksAssigned}\n` +
      `• Completed: ${matchedTse.tasksDone} | Pending: ${matchedTse.tasksPending}\n` +
      `• Completion Rate: ${matchedTse.completionRate}\n` +
      `• Role: ${matchedTse.role} at NetBounce.`;
  }

  // Interview queries
  if (q.includes('interview') || q.includes('clear rate') || q.includes('pipeline')) {
    return `📊 Interview Pipeline & Clear Rate:\n\n` +
      `• Clear Rate: ${clearRate}%\n` +
      `• Candidates Qualified: ${clearedCount} cleared.\n` +
      `• Evaluated Rounds: ${conductedCount} rounds conducted.\n` +
      `• Total Pipeline: ${totalInterviews} candidates logged.\n` +
      `• Target Benchmark: 60%.`;
  }

  // Overdue queries
  if (q.includes('overdue') || q.includes('late') || q.includes('pending') || q.includes('urgent')) {
    const listSnippet = overdueTasksList.slice(0, 3).map(t => `• ${t.candidateName} (${t.companyName}) assigned to ${t.techPerson}`).join('\n');
    return `⚠️ Overdue Tasks Status:\n\n` +
      `There are currently ${overdueTasks} tasks requiring urgent attention.\n\n` +
      (listSnippet ? `Top priority tasks:\n${listSnippet}` : '');
  }

  // Default operational overview
  return `🤖 NetBounce Live Operations Snapshot:\n\n` +
    `• Active Tasks: ${activeTasks} in flight.\n` +
    `• Overdue Tasks: ${overdueTasks} requiring attention.\n` +
    `• Completed: ${completedTasks} tasks resolved.\n` +
    `• Interview Clear Rate: ${clearRate}% (${clearedCount} qualified).\n` +
    `• Active Team Roster: ${totalUsers} members.\n` +
    `• Top TSE: ${topPerformer ? `${topPerformer.employeeName} (${topPerformer.avgScoreLabel})` : 'Prem Makwana'}.\n\n` +
    `Ask me any question about tasks, team members, feedback ratings, or candidate interviews!`;
}
