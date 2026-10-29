import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListChecks, CheckCircle2, Clock3, AlertTriangle, UserRoundCheck, Users as UsersIcon,
  Target, PieChart as PieIcon, Plus, ArrowUpRight, UserPlus, Star, AlertOctagon,
  Calendar, CheckSquare, Sparkles, ShieldAlert, ArrowRight, ShieldCheck, Search,
  Copy, ExternalLink, Lock, Check, UserCheck, ClipboardList, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useApp } from '../context/AppContext';
import { KpiCard, PageHeader, StatusBadge, TaskTypeBadge, SectionCard, EmptyState, ArcGaugeCard, NeumorphicMetricCard, CircularProgressRing } from '../components/common';
import { ROLES, USERS, TECH_SUPPORT_TEAM, getInterviewTimingMeta, getSmartTseRecommendations, roleIsMarketing, getTseRealName, sortTasksByInterviewPriority } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { formatTaskDate, formatTaskDuration } from './Tasks';

const palette = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#64748B'];

const chartTooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #CBD5E1',
  borderRadius: 12,
  color: '#0F172A',
  fontSize: 12,
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
};

const buildTrend = (tasks) => {
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  if (!tasks || tasks.length === 0) {
    return days.map((d, i) => ({ day: `D${i+1}`, completed: 0, pending: 0 }));
  }
  return days.map((d, i) => {
    const dayTasks = tasks.filter(t => (t.date === d || t.dueDate === d || (t.createdAt && t.createdAt.slice(0, 10) === d)));
    return {
      day: `D${i+1}`,
      completed: dayTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length,
      pending: dayTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length,
    };
  });
};

const statusDistribution = (tasks) => {
  const counts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

const perTseBars = (tasks, users) => {
  const tses = users.filter(u => u.role === 'tse');
  return tses.map(u => ({
    name: u.name.split(' ')[0],
    completed: tasks.filter(t => t.assigneeId === u.id && t.status === 'Completed').length,
    pending: tasks.filter(t => t.assigneeId === u.id && t.status === 'Pending').length,
  }));
};

const priorityDistribution = (tasks) => {
  const counts = tasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
  return ['Urgent','High','Medium','Low'].map(p => ({ name: p, value: counts[p] || 0 }));
};

const InterviewFunnel = ({ interviews }) => {
  const stages = ['Scheduled', 'Interview Rescheduled', 'Interview Completed - Feedback Received', 'Cleared'];
  const data = stages.map(s => ({ name: s, value: interviews.filter(i => i.status === s).length }));
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.name}>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{d.name}</span>
            <span className="tabular-nums font-bold text-slate-900 dark:text-white">{d.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: palette[i] }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { currentRole, currentUser, tasks, rawTasks, visibleInterviews, interviews, users, feedbacks, slaTickets, updateSlaTicket, assignMarketingSr, reassignTask } = useApp();
  const navigate = useNavigate();

  const [selectedWorkloadDate, setSelectedWorkloadDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [candidateSearch, setCandidateSearch] = useState('');
  const [activeSlaTicketModal, setActiveSlaTicketModal] = useState(null);
  const [slaResolutionNote, setSlaResolutionNote] = useState('');
  const [slaResolutionStatus, setSlaResolutionStatus] = useState('Resolved');
  const [srAssignments, setSrAssignments] = useState({});

  // Milestone 2: Urgent Priority Queue Detection
  const urgentInterviews = useMemo(() => {
    return (tasks || []).filter(t => {
      if (!t.interviewDateTime) return false;
      const meta = getInterviewTimingMeta(t.interviewDateTime);
      return meta.isUrgent;
    });
  }, [tasks]);

  const elevatedInterviews = useMemo(() => {
    return (tasks || []).filter(t => {
      if (!t.interviewDateTime) return false;
      const meta = getInterviewTimingMeta(t.interviewDateTime);
      return meta.isElevated;
    });
  }, [tasks]);

  // Milestone 5: TSE Star Rating calculation
  const myFeedbacks = useMemo(() => {
    return (feedbacks || []).filter(f =>
      f.techSupportId === currentUser?.id ||
      (currentUser?.name && (f.techSupport || '').toLowerCase() === currentUser?.name?.toLowerCase())
    );
  }, [feedbacks, currentUser]);

  const tseAvgRating = useMemo(() => {
    const rated = myFeedbacks.filter(f => f.candidateFeedback?.performanceRating || f.candidateFeedback?.experienceRating);
    if (rated.length === 0) return '5.0';
    const sum = rated.reduce((acc, f) => acc + Number(f.candidateFeedback?.performanceRating || f.candidateFeedback?.experienceRating || 5), 0);
    return (sum / rated.length).toFixed(1);
  }, [myFeedbacks]);

  // TSE-specific upcoming 30m interview
  const myUrgentInterview = useMemo(() => {
    return (tasks || []).find(t => {
      const isMine = t.assigneeId === currentUser?.id || (currentUser?.name && (t.techPerson || '').toLowerCase() === currentUser?.name?.toLowerCase());
      if (!isMine || !t.interviewDateTime) return false;
      return getInterviewTimingMeta(t.interviewDateTime).isUrgent;
    });
  }, [tasks, currentUser]);

  // Milestone 4 & 7: Candidate History & Smart Advisory Lookup
  const candidateHistoryResult = useMemo(() => {
    if (!candidateSearch.trim()) return null;
    const q = candidateSearch.trim().toLowerCase();
    const cTasks = (tasks || []).filter(t => (t.candidateName || '').toLowerCase().includes(q));
    const cFeedbacks = (feedbacks || []).filter(f => (f.candidateName || '').toLowerCase().includes(q));
    const tseUsers = (users || []).filter(u => u.role === 'tse');
    const recs = getSmartTseRecommendations(candidateSearch.trim(), tasks, feedbacks, tseUsers);
    return {
      candidateName: candidateSearch.trim(),
      tasks: cTasks,
      feedbacks: cFeedbacks,
      recommendations: recs,
    };
  }, [candidateSearch, tasks, feedbacks, users]);

  const trend = useMemo(() => buildTrend(tasks), [tasks]);
  const dist = useMemo(() => statusDistribution(tasks), [tasks]);
  const perTse = useMemo(() => perTseBars(tasks, users), [tasks, users]);
  const prioDist = useMemo(() => priorityDistribution(tasks), [tasks]);

  const totals = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
  };
  const completionRate = totals.total ? Math.round((totals.completed / totals.total) * 100) : 0;

  const allInterviews = (interviews && interviews.length) ? interviews : (visibleInterviews || []);
  const ivTotals = {
    total: allInterviews.length,
    scheduled: allInterviews.filter(i => i.status === 'Scheduled' || i.status === 'Interview Rescheduled' || i.status === 'Rescheduled').length,
    completed: allInterviews.filter(i => i.status === 'Interview Completed - Feedback Received' || i.status === 'Cleared' || i.status === 'Interview Completed').length,
    feedbackPending: allInterviews.filter(i => i.status === 'Interview Completed - Feedback Pending' || i.status === 'Feedback Pending').length,
    cleared: allInterviews.filter(i => i.status === 'Cleared').length,
  };
  const totalRoundsConducted = ivTotals.completed + ivTotals.cleared; // 3 + 2 = 5 rounds
  const interviewClearRate = totalRoundsConducted > 0
    ? Math.round((ivTotals.cleared / totalRoundsConducted) * 100)
    : (ivTotals.total > 0 ? Math.round((ivTotals.cleared / ivTotals.total) * 100) : 0);

  // ---------- UPPER MANAGEMENT ----------
  if (currentRole === 'upper_management') {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Overview" subtitle="Cross-functional operational performance across NetBounce" />
        
        {/* Ghulam Image 1 Style Hero Arc Gauge & Metric Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ArcGaugeCard
            className="xl:col-span-1"
            title="Interview Clear Rate"
            subtitle="Candidate qualification & clearance ratio"
            percentage={interviewClearRate}
            primaryMetric={`${interviewClearRate}%`}
            meterLabel="Clear Rate"
            secondaryLabel="Target Benchmark"
            secondaryValue="60%"
            stat1Label="Interview Rounds"
            stat1Value={`${totalRoundsConducted} Evaluated`}
            stat2Label="Candidates Cleared"
            stat2Value={`${ivTotals.cleared} Qualified`}
          />
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <NeumorphicMetricCard
              testid="kpi-total-tasks"
              label="Total Tasks"
              value={totals.total}
              subValue="All Operations"
              delta={totals.total > 0 ? `+${totals.total}` : null}
              percentage={totals.total > 0 ? 100 : 0}
              ringColor="#1416c1"
            />
            <NeumorphicMetricCard
              testid="kpi-completed"
              label="Completed"
              value={totals.completed}
              subValue="Closed Out"
              delta={totals.completed > 0 ? `+${totals.completed}` : null}
              percentage={completionRate}
              ringColor="#10b981"
            />
            <NeumorphicMetricCard
              testid="kpi-pending"
              label="Pending"
              value={totals.pending}
              subValue="Queued"
              trend={totals.pending > 0 ? "up" : "down"}
              delta={totals.pending > 0 ? `+${totals.pending}` : null}
              percentage={totals.total > 0 ? Math.round((totals.pending / totals.total) * 100) : 0}
              ringColor="#f59e0b"
            />
            <NeumorphicMetricCard
              testid="kpi-rate"
              label="Completion Rate"
              value={`${completionRate}%`}
              subValue="Target: 85%"
              percentage={completionRate}
              ringColor="#06b6d4"
            />
            <NeumorphicMetricCard
              testid="kpi-iv-completed"
              label="Interviews"
              value={allInterviews.length}
              subValue="Rounds Done"
              delta={allInterviews.length > 0 ? `+${allInterviews.length}` : null}
              percentage={allInterviews.length > 0 ? Math.min(allInterviews.length * 10, 100) : 0}
              ringColor="#8b5cf6"
            />
            <NeumorphicMetricCard
              testid="kpi-cleared"
              label="Candidates Cleared"
              value={ivTotals.cleared}
              subValue="Qualified"
              delta={ivTotals.cleared > 0 ? `+${ivTotals.cleared}` : null}
              percentage={allInterviews.length > 0 ? Math.round((ivTotals.cleared / allInterviews.length) * 100) : 0}
              ringColor="#10b981"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionCard className="lg:col-span-2" title="Overall Task Performance" subtitle="Last 7 days daily output">
            {totals.total === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#0B1EE6] dark:text-blue-400 flex items-center justify-center mb-2.5 shadow-xs">
                  <ListChecks className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No task output recorded yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Executive task performance metrics will plot here once operational tasks are provisioned.
                </p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4}/><stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3}/><stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#64748B" /><YAxis stroke="#64748B" />
                    <RTooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2.5} fill="url(#g1)" />
                    <Area type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2.5} fill="url(#g2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
          <SectionCard title="Interview Funnel" subtitle="Pipeline progression stages"><InterviewFunnel interviews={visibleInterviews} /></SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['Tech Support','Marketing','Overall'].map((d, i) => (
            <SectionCard key={d} title={d} subtitle={i === 2 ? 'Aggregate overview' : `${d} operational unit`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tasks</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{Math.round(totals.total * (i===2?1:i===0?0.75:0.25))}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completion</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">{completionRate - i*4}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">{Math.round(totals.pending * (i===2?1:i===0?0.7:0.3))}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Interviews</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">{Math.round(visibleInterviews.length * (i===2?1:i===0?0.4:0.6))}</div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    );
  }

  // ---------- MANAGEMENT ----------
  if (currentRole === 'management') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Management Dashboard"
          subtitle={`Welcome back, ${currentUser?.name?.split(' ')[0]}. Operational pulse at a glance.`}
          actions={
            <button
              data-testid="goto-reports-btn"
              onClick={() => navigate('/reports')}
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-white/10 shadow-xs cursor-pointer"
            >
              View reports <ArrowUpRight size={14} />
            </button>
          }
        />

        {/* Ghulam Image 1 Style Hero Arc Gauge & Metric Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ArcGaugeCard
            className="xl:col-span-1"
            title="Interview Clear Rate"
            subtitle="Candidate qualification & clearance ratio"
            percentage={interviewClearRate}
            primaryMetric={`${interviewClearRate}%`}
            meterLabel="Clear Rate"
            secondaryLabel="Target Benchmark"
            secondaryValue="60%"
            stat1Label="Interview Rounds"
            stat1Value={`${totalRoundsConducted} Evaluated`}
            stat2Label="Candidates Cleared"
            stat2Value={`${ivTotals.cleared} Qualified`}
          />
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <NeumorphicMetricCard
              testid="kpi-team"
              label="Team Members"
              value={users.length}
              subValue="Active Roster"
              percentage={users.length > 0 ? Math.round((users.filter(u => (u.status || 'Active') === 'Active').length / users.length) * 100) : 0}
              ringColor="#1416c1"
            />
            <NeumorphicMetricCard
              testid="kpi-active"
              label="Active Tasks"
              value={totals.inProgress + totals.pending}
              subValue="In Flight"
              delta={(totals.inProgress + totals.pending) > 0 ? `+${totals.inProgress + totals.pending}` : null}
              percentage={totals.total > 0 ? Math.round(((totals.inProgress + totals.pending) / totals.total) * 100) : 0}
              ringColor="#3b82f6"
            />
            <NeumorphicMetricCard
              testid="kpi-completed"
              label="Completed"
              value={totals.completed}
              subValue="Resolved"
              delta={totals.completed > 0 ? `+${totals.completed}` : null}
              percentage={completionRate}
              ringColor="#10b981"
            />
            <NeumorphicMetricCard
              testid="kpi-overdue"
              label="Overdue"
              value={totals.overdue}
              subValue="Needs Attention"
              trend={totals.overdue > 0 ? "down" : "up"}
              delta={totals.overdue > 0 ? `-${totals.overdue}` : null}
              percentage={totals.total > 0 ? Math.round((totals.overdue / totals.total) * 100) : 0}
              ringColor="#f43f5e"
            />
            <NeumorphicMetricCard
              testid="kpi-iv"
              label="Interviews"
              value={allInterviews.length}
              subValue="Pipeline"
              delta={allInterviews.length > 0 ? `+${allInterviews.length}` : null}
              percentage={allInterviews.length > 0 ? Math.min(allInterviews.length * 10, 100) : 0}
              ringColor="#8b5cf6"
            />
            <NeumorphicMetricCard
              testid="kpi-feedback"
              label="Feedback Pending"
              value={ivTotals.feedbackPending}
              subValue="Awaiting Review"
              delta={ivTotals.feedbackPending > 0 ? `+${ivTotals.feedbackPending}` : null}
              percentage={allInterviews.length > 0 ? Math.round((ivTotals.feedbackPending / allInterviews.length) * 100) : 0}
              ringColor="#f59e0b"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionCard className="lg:col-span-2" title="Daily Completion" subtitle="Last 7 days performance trend">
            {totals.total === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#0B1EE6] dark:text-blue-400 flex items-center justify-center mb-2.5 shadow-xs">
                  <ListChecks className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No task activity recorded yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Daily completion and output volume will plot here in real-time as tasks are created and completed.
                </p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#64748B" /><YAxis stroke="#64748B" />
                    <RTooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
          <SectionCard title="Priority Distribution" subtitle="Active tasks by severity">
            {totals.total === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 shadow-xs">
                  <PieIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No active tasks</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Severity breakdown (Urgent, High, Medium, Low) will generate when tasks are logged.
                </p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={prioDist} dataKey="value" nameKey="name" outerRadius={78} innerRadius={48} paddingAngle={2}>
                      {prioDist.map((_, i) => <Cell key={i} fill={palette[i]} />)}
                    </Pie>
                    <RTooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Team Performance"
          subtitle="Click a member to view their profile"
          actions={
            <button onClick={() => navigate('/team')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
              Open team roster →
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                  <th className="py-2.5 font-bold">TSE</th>
                  <th className="font-bold">Assigned</th>
                  <th className="font-bold">Completed</th>
                  <th className="font-bold">Pending</th>
                  <th className="font-bold">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.filter(u => u.role === 'tse').map(u => {
                  const a = tasks.filter(t => t.assigneeId === u.id);
                  const c = a.filter(t => t.status === 'Completed').length;
                  const p = a.filter(t => t.status === 'Pending').length;
                  const rate = a.length ? Math.round((c / a.length) * 100) : 0;
                  return (
                    <tr
                      key={u.id}
                      data-testid={`team-row-${u.id}`}
                      onClick={() => navigate('/team')}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-3 text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                          {u.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                        </div>
                        {u.name}
                      </td>
                      <td className="tabular-nums text-slate-700 dark:text-slate-300 font-medium">{a.length}</td>
                      <td className="tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">{c}</td>
                      <td className="tabular-nums text-amber-600 dark:text-amber-400 font-bold">{p}</td>
                      <td>
                        <div className="flex items-center gap-2.5 w-40">
                          <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-xs text-slate-800 dark:text-slate-200 font-bold tabular-nums w-10 text-right">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ---------- TSM ----------
  if (currentRole === 'tsm') {
    const myTeam = users.filter(u => u.role === 'tse');

    return (
      <div className="space-y-6">
        <PageHeader
          title="TSM Command Center"
          subtitle={`${currentUser?.name} • ${myTeam.length} engineers on your roster`}
          actions={
            <button
              data-testid="create-task-btn-top"
              onClick={() => navigate('/tasks?create=1')}
              className="btn-primary h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} /> Create Task
            </button>
          }
        />

        {/* Milestone 2: Urgent Priority Queue Alert Banner (<30m & <60m EST) */}
        {urgentInterviews.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  <span>URGENT: Interview starting within 30 minutes!</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black uppercase">Urgent SLA</span>
                </div>
                <div className="text-xs text-rose-100 mt-0.5">
                  Candidate: <strong className="text-white">{urgentInterviews[0].candidateName}</strong> · TSE: <strong className="text-white">{urgentInterviews[0].techPerson}</strong> · Time: <strong className="text-white">{getInterviewTimingMeta(urgentInterviews[0].interviewDateTime).estFormatted}</strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 shadow-md shrink-0 cursor-pointer transition-transform hover:scale-105"
            >
              Open Priority Queue →
            </button>
          </div>
        )}

        {elevatedInterviews.length > 0 && urgentInterviews.length === 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Clock3 size={18} className="text-white shrink-0" />
              <span>
                Elevated Priority: Interview starting within 60 mins for <strong>{elevatedInterviews[0].candidateName}</strong> (TSE: {elevatedInterviews[0].techPerson}) at <strong>{getInterviewTimingMeta(elevatedInterviews[0].interviewDateTime).estFormatted}</strong>
              </span>
            </div>
            <button onClick={() => navigate('/tasks')} className="px-3 py-1 rounded-lg bg-white text-amber-800 text-xs font-bold hover:bg-amber-50 shrink-0">
              View Tasks
            </button>
          </div>
        )}

        {/* Ghulam Image 1 Style Hero Arc Gauge & Metric Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ArcGaugeCard
            className="xl:col-span-1"
            title="Interview Clear Rate"
            subtitle="Candidate qualification & clearance ratio"
            percentage={interviewClearRate}
            primaryMetric={`${interviewClearRate}%`}
            meterLabel="Clear Rate"
            secondaryLabel="Target Benchmark"
            secondaryValue="60%"
            stat1Label="Interview Rounds"
            stat1Value={`${totalRoundsConducted} Evaluated`}
            stat2Label="Candidates Cleared"
            stat2Value={`${ivTotals.cleared} Qualified`}
          />
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NeumorphicMetricCard testid="kpi-team" label="My Team" value={myTeam.length} subValue="TSE Engineers" percentage={myTeam.length > 0 ? 100 : 0} ringColor="#1416c1" />
            <NeumorphicMetricCard testid="kpi-active" label="Active Tasks" value={totals.inProgress + totals.pending} subValue="In Flight" percentage={totals.total > 0 ? Math.round(((totals.inProgress + totals.pending) / totals.total) * 100) : 0} ringColor="#3b82f6" />
            <NeumorphicMetricCard testid="kpi-done-today" label="Done Today" value={totals.completed} subValue="Resolved" percentage={completionRate} ringColor="#10b981" />
            <NeumorphicMetricCard
              testid="kpi-sla-open"
              label="SLA Escalations"
              value={slaTickets.filter(t => t.status !== 'Resolved').length}
              subValue="Low-Rating Cases"
              trend={slaTickets.filter(t => t.status !== 'Resolved').length > 0 ? "down" : "up"}
              percentage={slaTickets.length > 0 ? Math.round((slaTickets.filter(t => t.status !== 'Resolved').length / slaTickets.length) * 100) : 0}
              ringColor="#f43f5e"
            />
          </div>
        </div>

        {/* Milestone 4: Date-Selectable TSE Availability & Workload View */}
        <SectionCard
          title="Team Workload & Capacity"
          subtitle={`Inspect engineer capacity on ${selectedWorkloadDate} to avoid over-allocation`}
          actions={
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Selected Date:</label>
              <input
                type="date"
                data-testid="tsm-workload-date-picker"
                value={selectedWorkloadDate}
                onChange={e => setSelectedWorkloadDate(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 shadow-2xs font-medium cursor-pointer"
              />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {myTeam.map(u => {
              // Filter tasks assigned to TSE specifically for this chosen date
              const dayTasks = tasks.filter(t =>
                t.assigneeId === u.id &&
                (t.date === selectedWorkloadDate || t.dueDate === selectedWorkloadDate || (t.interviewDateTime && t.interviewDateTime.slice(0, 10) === selectedWorkloadDate))
              );
              const dayDone = dayTasks.filter(t => t.status === 'Completed').length;
              const dayActive = dayTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;
              const loadLevel = dayTasks.length >= 4 ? 'Heavy' : dayTasks.length >= 1 ? 'Optimal' : 'Available';
              const loadBadgeColor = dayTasks.length >= 4
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : dayTasks.length >= 1
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <div
                  key={u.id}
                  data-testid={`workload-${u.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{u.empId || u.codeName}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${loadBadgeColor}`}>
                      {loadLevel}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center py-2 px-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">{dayTasks.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Scheduled</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{dayDone}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Done</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-blue-600 dark:text-blue-400">{dayActive}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Active</div>
                    </div>
                  </div>
                  <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Overall Rate</span>
                    <span className="font-bold text-slate-800">{tasks.filter(t => t.assigneeId === u.id).length ? Math.round((tasks.filter(t => t.assigneeId === u.id && t.status === 'Completed').length / tasks.filter(t => t.assigneeId === u.id).length) * 100) : 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Milestone 6: Automated SLA Escalation Tickets (Rating <= 3 Stars) */}
        <SectionCard
          title="SLA Escalation Tickets (Candidate Feedback ≤ 3 Stars)"
          subtitle="Auto-escalated quality tickets requiring TSM follow-up and resolution"
          actions={
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              {slaTickets.filter(t => t.status !== 'Resolved').length} Actionable Tickets
            </span>
          }
        >
          {slaTickets.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShieldCheck size={28} className="mx-auto text-emerald-500 mb-2" />
              <div className="text-sm font-bold text-slate-800">Zero SLA Escalations</div>
              <div className="text-xs text-slate-400 mt-0.5">All candidate feedback sessions are rating 4+ stars. Outstanding work!</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 font-bold">Ticket ID</th>
                    <th className="font-bold">Candidate</th>
                    <th className="font-bold">Assigned TSE</th>
                    <th className="font-bold">Rating</th>
                    <th className="font-bold">24h SLA Status</th>
                    <th className="font-bold">Feedback / Concerns</th>
                    <th className="font-bold">Status</th>
                    <th className="font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slaTickets.map(ticket => {
                    const deadlineDate = ticket.deadline ? new Date(ticket.deadline) : new Date(new Date(ticket.createdAt || Date.now()).getTime() + 24 * 60 * 60 * 1000);
                    const isOverdue = ticket.status !== 'Resolved' && (ticket.isOverdue || deadlineDate < new Date());
                    const hoursRemaining = Math.round((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60));
                    const canViewReal = ['upper_management', 'management', 'tsm'].includes(currentRole);

                    return (
                      <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 mono text-xs font-bold text-rose-600">{ticket.id}</td>
                        <td className="font-bold text-slate-900">{ticket.candidateName}</td>
                        <td className="text-xs">
                          {canViewReal ? (
                            <div>
                              <div className="font-bold text-slate-900">{ticket.tseCodeName || ticket.techSupportId || 'TSE-ID'}</div>
                              <div className="text-[11px] text-slate-500">{ticket.tseRealName || ticket.techPerson || ticket.techSupport}</div>
                            </div>
                          ) : (
                            <div className="font-mono font-bold text-blue-700">{ticket.tseCodeName || ticket.techSupportId || 'TSE-ID'}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                            ⭐ {ticket.rating}/5
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-xs">
                          {ticket.status === 'Resolved' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              ✓ SLA Met
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black animate-pulse">
                              🚨 OVERDUE ({Math.abs(hoursRemaining)}h breached)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                              ⏱️ {hoursRemaining}h remaining
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Due: {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                        <td className="text-xs text-slate-600 max-w-xs truncate" title={ticket.remarks || ticket.feedbackDetails || ticket.comments}>
                          {ticket.remarks || ticket.feedbackDetails || ticket.comments || 'Candidate reported low satisfaction.'}
                        </td>
                        <td>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            ticket.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : ticket.status === 'In Review'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => {
                              setActiveSlaTicketModal(ticket);
                              setSlaResolutionStatus(ticket.status || 'Resolved');
                              setSlaResolutionNote(ticket.resolutionNotes || ticket.resolutionDetails || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer border border-slate-200"
                          >
                            Manage →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Milestone 4 & 7: Candidate Historical Assignment & Smart Recommendation Quick-Lookup */}
        <SectionCard
          title="Candidate Historical Assignment &amp; Smart Advisory"
          subtitle="Look up candidate history to view prior TSEs and receive smart assignment recommendations"
        >
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                data-testid="tsm-candidate-history-search"
                value={candidateSearch}
                onChange={e => setCandidateSearch(e.target.value)}
                placeholder="Type candidate name (e.g. Shubhangi Mishra, Rahul)..."
                className="pl-9 bg-white border-slate-300 text-slate-900"
              />
            </div>

            {candidateHistoryResult && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Results for: &quot;{candidateHistoryResult.candidateName}&quot;</span>
                  <span className="text-xs text-slate-500">{candidateHistoryResult.tasks.length} prior tasks found</span>
                </div>

                {/* Smart Advisory */}
                {candidateHistoryResult.recommendations.length > 0 && (
                  <div className="space-y-1.5">
                    {candidateHistoryResult.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-between ${
                          rec.type === 'recommend'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-rose-50 text-rose-900 border-rose-300'
                        }`}
                      >
                        <span>{rec.message}</span>
                        <span className="text-[11px] uppercase font-bold">{rec.type === 'recommend' ? '⭐ Recommended' : '⚠️ Low Rating Caution'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Historical records table */}
                {candidateHistoryResult.tasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs bg-white rounded-lg border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-left">
                          <th className="p-2">Date</th>
                          <th className="p-2">Company</th>
                          <th className="p-2">Assigned TSE</th>
                          <th className="p-2">Task</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidateHistoryResult.tasks.map((t, idx) => (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="p-2 mono">{t.date || t.dueDate}</td>
                            <td className="p-2 font-semibold text-slate-800">{t.companyName}</td>
                            <td className="p-2 font-medium text-blue-700">{t.techPerson}</td>
                            <td className="p-2">{t.taskType || t.category}</td>
                            <td className="p-2"><StatusBadge value={t.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No past assignments found for this candidate name.</div>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Recent Tasks */}
        <SectionCard
          title="Recent Tasks"
          subtitle="Latest assignments across the team"
          actions={
            <button onClick={() => navigate('/tasks')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
              View all tasks →
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                  <th className="py-2.5 font-bold">Date</th>
                  <th className="font-bold">Duration</th>
                  <th className="font-bold">Tech Person (TSE)</th>
                  <th className="font-bold">Task</th>
                  <th className="font-bold">Candidate Name</th>
                  <th className="font-bold">Position</th>
                  <th className="font-bold">Company</th>
                  <th className="font-bold">Status</th>
                  <th className="font-bold text-right">Assign TSE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {sortTasksByInterviewPriority(tasks).slice(0, 8).map(t => {
                  const a = users.find(u => u.id === t.assigneeId);
                  const matchingTse = TECH_SUPPORT_TEAM.find(tse => 
                    tse.id === t.assigneeId || 
                    (a && tse.employeeName.toLowerCase().includes(a.name.toLowerCase())) ||
                    tse.supportName.toLowerCase() === (a?.codeName || t.techPerson || '').toLowerCase()
                  );
                  const isUnassigned = (!t.assigneeId || t.assigneeId === 'Unassigned') &&
                    (!t.techPerson || t.techPerson === 'Unassigned' || t.techPerson === 'Code Name Unassigned') &&
                    (!t.codeName || t.codeName === 'Unassigned' || t.codeName === 'Code Name Unassigned') &&
                    !a;
                  const codeName = isUnassigned
                    ? 'Unassigned'
                    : (a?.codeName || matchingTse?.supportName || (t.techPerson && t.techPerson !== 'Code Name Unassigned' ? t.techPerson : 'Unassigned'));
                  const realName = isUnassigned ? '' : (a?.name || matchingTse?.employeeName || (codeName !== 'Unassigned' ? getTseRealName(codeName) : ''));

                  return (
                    <tr
                      key={t.id}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => navigate('/tasks')}
                    >
                      <td className="py-2.5 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">{formatTaskDate(t)}</td>
                      <td className="py-2.5 text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap font-semibold">{formatTaskDuration(t)}</td>
                      <td className="text-slate-800 dark:text-slate-200 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`h-7 w-7 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isUnassigned ? 'bg-slate-100 dark:bg-white/10 text-slate-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          }`}>
                            {isUnassigned ? '—' : codeName.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div className={`text-xs font-bold leading-tight ${
                              isUnassigned ? 'text-slate-500 italic' : 'text-slate-900 dark:text-white'
                            }`}>
                              {codeName}
                            </div>
                            {realName && realName !== codeName && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                ({realName})
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><TaskTypeBadge value={t.taskType || t.category} /></td>
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900 dark:text-white">{t.candidateName || t.title}</div>
                        <div className="mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{t.id}</div>
                      </td>
                      <td className="text-xs text-slate-600 dark:text-slate-400">{t.position || '—'}</td>
                      <td className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.companyName || '—'}</td>
                      <td><StatusBadge value={t.status} /></td>
                      <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <Select
                            value={t.assigneeId || ''}
                            onValueChange={(val) => {
                              reassignTask(t.id, val);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-white/20 w-36 focus:ring-1 focus:ring-blue-500">
                              <SelectValue placeholder="Assign TSE" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                              {users.filter(u => u.role === 'tse').map(u => (
                                <SelectItem key={u.id} value={u.id} className="text-xs">
                                  <span className="font-bold">{u.codeName || u.name}</span>
                                  {u.name && u.codeName && u.name !== u.codeName && (
                                    <span className="text-[10px] text-slate-400 ml-1">({u.name})</span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* SLA Ticket Resolution Modal */}
        <Dialog open={!!activeSlaTicketModal} onOpenChange={o => !o && setActiveSlaTicketModal(null)}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Manage SLA Escalation Ticket</DialogTitle>
              <DialogDescription className="text-slate-500">
                Ticket: {activeSlaTicketModal?.id} · Candidate: {activeSlaTicketModal?.candidateName}
              </DialogDescription>
            </DialogHeader>
            {activeSlaTicketModal && (
              <div className="space-y-4 mt-2">
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1.5">
                  <div>
                    <strong>TSE Assigned: </strong>
                    <span className="font-bold text-[#1416c1]">{activeSlaTicketModal.tseCodeName || activeSlaTicketModal.techSupportId || 'TSE-ID'}</span>
                    {['upper_management', 'management', 'tsm'].includes(currentRole) && (activeSlaTicketModal.tseRealName || activeSlaTicketModal.techPerson) && (
                      <span className="text-slate-600 font-medium ml-1.5">({activeSlaTicketModal.tseRealName || activeSlaTicketModal.techPerson})</span>
                    )}
                  </div>
                  <div><strong>Rating Given:</strong> ⭐ {activeSlaTicketModal.rating} / 5</div>
                  <div>
                    <strong>24-Hour SLA Target: </strong>
                    <span>24 Hours · Deadline: {activeSlaTicketModal.deadline ? new Date(activeSlaTicketModal.deadline).toLocaleString() : '24h from submission'}</span>
                  </div>
                  <div><strong>Candidate Feedback:</strong> {activeSlaTicketModal.remarks || activeSlaTicketModal.feedbackDetails || activeSlaTicketModal.comments || 'No additional remarks.'}</div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Update Status</label>
                  <Select value={slaResolutionStatus} onValueChange={setSlaResolutionStatus}>
                    <SelectTrigger className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase">Resolution / Follow-up Notes</label>
                  <Textarea
                    rows={3}
                    value={slaResolutionNote}
                    onChange={e => setSlaResolutionNote(e.target.value)}
                    placeholder="Document coaching, candidate follow-up, or corrective steps taken..."
                    className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white resize-none text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setActiveSlaTicketModal(null)}
                    className="h-9 px-4 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateSlaTicket(activeSlaTicketModal.id, {
                        status: slaResolutionStatus,
                        resolutionNotes: slaResolutionNote,
                      });
                      setActiveSlaTicketModal(null);
                    }}
                    className="btn-primary h-9 px-4 rounded-lg text-xs font-bold"
                  >
                    Save Resolution
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---------- TSE ----------
  if (currentRole === 'tse') {
    const myTasks = sortTasksByInterviewPriority(tasks.filter(t => t.assigneeId === currentUser?.id || (currentUser?.name && (t.techPerson || '').toLowerCase() === currentUser?.name?.toLowerCase())));
    const myStats = {
      assigned: myTasks.length,
      inProgress: myTasks.filter(t => t.status === 'In Progress').length,
      pending: myTasks.filter(t => t.status === 'Pending').length,
      completed: myTasks.filter(t => t.status === 'Completed').length,
    };
    const tseRate = myStats.assigned ? Math.round((myStats.completed / myStats.assigned) * 100) : 0;

    return (
      <div className="space-y-6">
        <PageHeader title="My Workspace" subtitle={`${currentUser?.name} · ${currentUser?.dept || 'Tech Support Engineer'}`} />

        {/* Milestone 2: 30-Minute Interview Countdown Alert for TSE */}
        {myUrgentInterview && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Clock3 size={22} className="text-white" />
              </div>
              <div>
                <div className="font-extrabold text-sm">Upcoming Interview in &lt; 30 Minutes!</div>
                <div className="text-xs text-amber-100 mt-0.5">
                  Candidate: <strong>{myUrgentInterview.candidateName}</strong> · Position: <strong>{myUrgentInterview.position}</strong> · Scheduled EST: <strong>{getInterviewTimingMeta(myUrgentInterview.interviewDateTime).estFormatted}</strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 rounded-xl bg-white text-orange-800 font-bold text-xs hover:bg-amber-50 shadow-md shrink-0 cursor-pointer"
            >
              Open Ticket →
            </button>
          </div>
        )}

        {/* Milestone 5: TSE Star Rating KPI & Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <ArcGaugeCard
            className="xl:col-span-1"
            title="Interview Clear Rate"
            subtitle="Candidate qualification & clearance ratio"
            percentage={interviewClearRate}
            primaryMetric={`${interviewClearRate}%`}
            meterLabel="Clear Rate"
            secondaryLabel="Target Benchmark"
            secondaryValue="60%"
            stat1Label="Interview Rounds"
            stat1Value={`${totalRoundsConducted} Evaluated`}
            stat2Label="Candidates Cleared"
            stat2Value={`${ivTotals.cleared} Qualified`}
          />
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <NeumorphicMetricCard
              testid="kpi-rating"
              label="Avg Star Rating"
              value={`⭐ ${tseAvgRating}`}
              subValue={`${myFeedbacks.length} Reviews`}
              percentage={Math.round((Number(tseAvgRating) / 5) * 100)}
              ringColor="#f59e0b"
            />
            <NeumorphicMetricCard testid="kpi-assigned" label="Assigned" value={myStats.assigned} subValue="Total Tickets" percentage={myStats.assigned > 0 ? 100 : 0} ringColor="#1416c1" />
            <NeumorphicMetricCard testid="kpi-inprog" label="In Progress" value={myStats.inProgress} subValue="Underway" percentage={myStats.assigned > 0 ? Math.round((myStats.inProgress / myStats.assigned) * 100) : 0} ringColor="#3b82f6" />
            <NeumorphicMetricCard testid="kpi-pending" label="Pending" value={myStats.pending} subValue="Queued" percentage={myStats.assigned > 0 ? Math.round((myStats.pending / myStats.assigned) * 100) : 0} ringColor="#f59e0b" />
            <NeumorphicMetricCard testid="kpi-done" label="Completed" value={myStats.completed} subValue="Closed Out" percentage={tseRate} ringColor="#10b981" />
          </div>
        </div>

        <SectionCard
          title="My Tasks"
          subtitle="Your active and pending responsibilities"
          actions={
            <button onClick={() => navigate('/tasks')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
              Open task board →
            </button>
          }
        >
          {myTasks.length === 0 ? <EmptyState title="No tasks assigned" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myTasks.slice(0, 6).map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="mono text-blue-700 dark:text-blue-400 font-bold">{t.id}</span>
                    <StatusBadge value={t.status} />
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{t.title}</div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Due {t.dueDate}</span>
                    <StatusBadge value={t.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    );
  }

  // ---------- MARKETING TL ----------
  if (currentRole === 'marketing_tl') {
    const tlTeam = currentUser?.teamId || currentUser?.team || (
      currentUser?.id === 'u-1791911058812' || (currentUser?.name || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
      currentUser?.id === 'u-1791911115518' || (currentUser?.name || '').toLowerCase().includes('shivam') ? 'team-shivam' : ''
    );
    const teamLabel = tlTeam === 'team-mukesh' ? 'Team Mukesh' : tlTeam === 'team-shivam' ? 'Team Shivam' : (currentUser?.teamName || 'Marketing Operations');

    const sourceTasks = (rawTasks && rawTasks.length > 0) ? rawTasks : (tasks || []);
    let teamTasks = sourceTasks.filter(t => {
      if (!tlTeam) return true;
      const tTeam = (t.teamId || t.team || t.marketingTeam || '').toLowerCase();
      const tName = (t.teamName || '').toLowerCase();
      const tLead = t.teamLeadId || '';
      if (tlTeam === 'team-mukesh') {
        return tTeam === 'team-mukesh' || tName.includes('mukesh') || tLead === 'u-1791911058812';
      }
      if (tlTeam === 'team-shivam') {
        return tTeam === 'team-shivam' || tName.includes('shivam') || tLead === 'u-1791911115518';
      }
      return tTeam === tlTeam.toLowerCase() || tName.includes(tlTeam.toLowerCase());
    });
    if (teamTasks.length === 0 && tasks && tasks.length > 0) {
      teamTasks = tasks;
    }

    const tasksAwaitingSr = teamTasks.filter(t => !t.assignedSrId && !t.assignedSrName);
    const activeTasks = teamTasks.filter(t => Boolean(t.assignedSrId || t.assignedSrName));

    const eligibleSrs = (users || []).filter(u =>
      u.role === 'marketing_sr' && (
        !tlTeam ||
        u.teamId === tlTeam ||
        u.team === tlTeam ||
        (tlTeam === 'team-mukesh' && ((u.teamName || '').includes('Mukesh') || u.teamLeadId === 'u-1791911058812')) ||
        (tlTeam === 'team-shivam' && ((u.teamName || '').includes('Shivam') || u.teamLeadId === 'u-1791911115518'))
      )
    );

    const handleAssignSr = (task) => {
      const selectedId = srAssignments[task.id];
      const targetSr = eligibleSrs.find(u => u.id === selectedId);
      if (!targetSr) {
        toast.error('Please select a Senior Recruiter from the list');
        return;
      }
      assignMarketingSr(task.id, targetSr);
      toast.success(`Task ${task.id} assigned to ${targetSr.name}!`);
      setSrAssignments(prev => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    };

    const sourceInterviews = (visibleInterviews && visibleInterviews.length > 0) ? visibleInterviews : (interviews || []);
    let teamInterviews = sourceInterviews.filter(i => {
      if (!tlTeam) return true;
      const iTeam = (i.teamId || i.team || i.marketingTeam || '').toLowerCase();
      const iName = (i.teamName || '').toLowerCase();
      if (tlTeam === 'team-mukesh') {
        return iTeam === 'team-mukesh' || iName.includes('mukesh') || teamTasks.some(t => t.id === i.id || t.id === i.taskId);
      }
      if (tlTeam === 'team-shivam') {
        return iTeam === 'team-shivam' || iName.includes('shivam') || teamTasks.some(t => t.id === i.id || t.id === i.taskId);
      }
      return iTeam === tlTeam.toLowerCase() || iName.includes(tlTeam.toLowerCase()) || teamTasks.some(t => t.id === i.id || t.id === i.taskId);
    });
    if (teamInterviews.length === 0 && visibleInterviews && visibleInterviews.length > 0) {
      teamInterviews = visibleInterviews;
    }

    const teamSelected = teamInterviews.filter(i =>
      i.interviewOutcome === 'Selected' || i.interviewOutcome === 'Cleared' || i.status === 'Cleared' || i.status === 'Selected'
    ).length;

    const isFeedbackSubmitted = (i) => Boolean(
      i.status === 'Interview Completed - Feedback Received' ||
      i.feedbackSubmitted === true ||
      i.feedback?.candidateFeedback?.submitted === true ||
      (i.feedback?.candidateFeedback?.performanceRating != null && Number(i.feedback?.candidateFeedback?.performanceRating) > 0) ||
      (i.feedback?.candidateFeedback?.rating != null && Number(i.feedback?.candidateFeedback?.rating) > 0) ||
      (i.feedback?.rating != null && Number(i.feedback?.rating) > 0)
    );

    const isFeedbackPending = (i) => Boolean(
      !isFeedbackSubmitted(i) && (
        i.status === 'Interview Completed - Feedback Pending' ||
        i.status === 'Feedback Pending' ||
        ((i.status === 'Done' || i.status === 'Completed') && !isFeedbackSubmitted(i))
      )
    );

    const teamFeedbackReceived = teamInterviews.filter(isFeedbackSubmitted).length;
    const teamFeedbackPending = teamInterviews.filter(isFeedbackPending).length;

    const inProgressTasksCount = teamTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending' || t.status === 'Assigned' || t.status === 'Scheduled').length;
    const completedTasksCount = teamTasks.filter(t => t.status === 'Done' || t.status === 'Completed' || t.status === 'Cleared').length;

    return (
      <div className="space-y-6">
        <PageHeader
          title={`${currentUser?.name || 'Marketing Team Lead'} Dashboard`}
          subtitle={`${teamLabel} · Task Assignment & Workflow Coordination`}
        />

        {/* TL Team Workflow KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NeumorphicMetricCard
            testid="kpi-tl-total"
            label="Total Team Tasks"
            value={teamTasks.length}
            subValue="In Scope"
            percentage={100}
            ringColor="#1416c1"
          />
          <NeumorphicMetricCard
            testid="kpi-tl-awaiting-sr"
            label="Awaiting SR"
            value={tasksAwaitingSr.length}
            subValue="Action Required"
            percentage={teamTasks.length > 0 ? Math.round((tasksAwaitingSr.length / teamTasks.length) * 100) : 0}
            ringColor="#ef4444"
          />
          <NeumorphicMetricCard
            testid="kpi-tl-in-progress"
            label="With TSE"
            value={inProgressTasksCount}
            subValue="In Progress"
            percentage={teamTasks.length > 0 ? Math.round((inProgressTasksCount / teamTasks.length) * 100) : 0}
            ringColor="#f59e0b"
          />
          <NeumorphicMetricCard
            testid="kpi-tl-completed"
            label="TSE Done"
            value={completedTasksCount}
            subValue="Completed"
            percentage={teamTasks.length > 0 ? Math.round((completedTasksCount / teamTasks.length) * 100) : 0}
            ringColor="#10b981"
          />
        </div>

        {/* TL Team Real-Time Interview & Outcome KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NeumorphicMetricCard
            testid="kpi-tl-interviews"
            label="Team Interviews"
            value={teamInterviews.length}
            subValue="Pipeline Total"
            percentage={100}
            ringColor="#8b5cf6"
          />
          <NeumorphicMetricCard
            testid="kpi-tl-fb-received"
            label="Feedback Received"
            value={teamFeedbackReceived}
            subValue="Evaluated"
            percentage={teamInterviews.length > 0 ? Math.round((teamFeedbackReceived / teamInterviews.length) * 100) : 0}
            ringColor="#10b981"
          />
          <NeumorphicMetricCard
            testid="kpi-tl-fb-pending"
            label="Feedback Pending"
            value={teamFeedbackPending}
            subValue="Action Pending"
            percentage={teamInterviews.length > 0 ? Math.round((teamFeedbackPending / teamInterviews.length) * 100) : 0}
            ringColor="#f59e0b"
          />
          <NeumorphicMetricCard
            testid="kpi-tl-selected"
            label="Candidates Selected"
            value={teamSelected}
            subValue="Cleared / Offers"
            percentage={teamInterviews.length > 0 ? Math.round((teamSelected / teamInterviews.length) * 100) : 0}
            ringColor="#3b82f6"
          />
        </div>

        {/* Step 3: Action Required: Assign Senior Recruiter */}
        <SectionCard
          title="⚡ Action Required: Assign Senior Recruiter (Marketing SR)"
          subtitle={`Tasks assigned by TSM to ${teamLabel} requiring a Senior Recruiter`}
        >
          {tasksAwaitingSr.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <div className="text-sm font-bold text-slate-800 dark:text-white">All caught up!</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No tasks are currently waiting for Senior Recruiter assignment in {teamLabel}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksAwaitingSr.map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#111A2E] border-2 border-rose-200 dark:border-rose-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mono text-xs font-bold text-blue-700 dark:text-blue-400">{t.id}</span>
                      <TaskTypeBadge type={t.taskType || 'Interview'} />
                      <StatusBadge value={t.status} />
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 text-[11px] font-bold">
                        Awaiting SR Assignment
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>Candidate: <strong className="text-slate-700 dark:text-slate-200">{t.candidateName || 'Candidate'}</strong></span>
                      {t.company && <span>· Client: <strong className="text-slate-700 dark:text-slate-200">{t.company}</strong></span>}
                      <span>· Assigned TSE: <strong className="text-indigo-600 dark:text-indigo-400">{t.assigneeName || t.techPerson || 'TSE'}</strong></span>
                    </div>
                  </div>

                  {/* SR Selection & Quick Assign */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      data-testid={`select-sr-${t.id}`}
                      value={srAssignments[t.id] || ''}
                      onChange={(e) => setSrAssignments(prev => ({ ...prev, [t.id]: e.target.value }))}
                      className="h-10 px-3 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Senior Recruiter...</option>
                      {eligibleSrs.map(sr => (
                        <option key={sr.id} value={sr.id}>
                          {sr.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      data-testid={`assign-sr-btn-${t.id}`}
                      onClick={() => handleAssignSr(t)}
                      className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck size={14} />
                      <span>Assign SR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Team Tasks Overview */}
        <SectionCard title="Active Team Tasks" subtitle={`All tasks routed to ${teamLabel}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                  <th className="py-2.5 font-bold">Task ID</th>
                  <th className="font-bold">Candidate / Title</th>
                  <th className="font-bold">Type</th>
                  <th className="font-bold">Assigned TSE</th>
                  <th className="font-bold">Senior Recruiter</th>
                  <th className="font-bold">Status</th>
                  <th className="font-bold">TSE Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {teamTasks.map(t => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 mono text-xs text-blue-700 dark:text-blue-400 font-bold">{t.id}</td>
                    <td>
                      <div className="font-medium text-slate-900 dark:text-white">{t.candidateName || t.title}</div>
                      <div className="text-[11px] text-slate-400">{t.company || t.title}</div>
                    </td>
                    <td><TaskTypeBadge type={t.taskType || 'Interview'} /></td>
                    <td className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{t.assigneeName || t.techPerson || 'TSE'}</td>
                    <td className="text-xs">
                      {t.assignedSrName ? (
                        <span className="font-bold text-slate-800 dark:text-slate-200">{t.assignedSrName}</span>
                      ) : (
                        <span className="text-rose-500 font-bold text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td><StatusBadge value={t.status} /></td>
                    <td className="text-xs text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                      {t.completionRemark || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    );
  }

  // ---------- MARKETING SR ----------
  if (currentRole === 'marketing_sr') {
    const srUserId = currentUser?.id;
    const srName = (currentUser?.name || '').toLowerCase();
    const srTeamId = currentUser?.teamId || currentUser?.team || (
      (currentUser?.teamName || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
      (currentUser?.teamName || '').toLowerCase().includes('shivam') ? 'team-shivam' : ''
    );
    const teamLabel = srTeamId === 'team-mukesh' ? 'Team Mukesh' : srTeamId === 'team-shivam' ? 'Team Shivam' : (currentUser?.teamName || 'Marketing Operations');

    const sourceTasks = (rawTasks && rawTasks.length > 0) ? rawTasks : (tasks || []);
    const mySrTasks = sourceTasks.filter(t => {
      const isDirectlyAssigned = Boolean(
        (t.assignedSrId && t.assignedSrId === srUserId) ||
        (t.pocId && t.pocId === srUserId) ||
        (t.createdById && t.createdById === srUserId) ||
        (srName && (
          (t.assignedSrName && t.assignedSrName.toLowerCase() === srName) ||
          (t.recruiterName && t.recruiterName.toLowerCase() === srName)
        ))
      );
      if (isDirectlyAssigned) return true;

      const tTeam = (t.teamId || t.team || t.marketingTeam || '').toLowerCase();
      const tTeamName = (t.teamName || '').toLowerCase();
      const belongsToMyTeam = srTeamId && (
        tTeam === srTeamId.toLowerCase() ||
        (srTeamId === 'team-mukesh' && (tTeamName.includes('mukesh') || t.teamLeadId === 'u-1791911058812')) ||
        (srTeamId === 'team-shivam' && (tTeamName.includes('shivam') || t.teamLeadId === 'u-1791911115518'))
      );

      const hasSpecificOtherSr = Boolean(
        (t.assignedSrId && t.assignedSrId !== srUserId) ||
        (t.assignedSrName && srName && t.assignedSrName.toLowerCase() !== srName && !t.assignedSrName.toLowerCase().startsWith('team '))
      );

      return belongsToMyTeam && !hasSpecificOtherSr;
    });

    const finalSrTasks = mySrTasks.length > 0 ? mySrTasks : (tasks || []);

    const feedbackReadyTasks = finalSrTasks.filter(t =>
      t.status === 'Done' || t.status === 'Completed' || t.status === 'Cleared' || t.status === 'Interview Completed' || t.status === 'Interview Completed - Feedback Pending' || t.status === 'Interview Completed - Feedback Received'
    );
    const inProgressTasks = finalSrTasks.filter(t =>
      t.status === 'In Progress' || t.status === 'Pending' || t.status === 'Assigned' || t.status === 'Scheduled' || (!['Done', 'Completed', 'Cleared'].includes(t.status))
    );

    const handleCopyFeedbackLink = (t) => {
      const origin = window.location.origin;
      const pathname = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
      const url = `${origin}${pathname}#/candidate-saga?id=fb-task-${t.id}&recruiter=${encodeURIComponent(t.assignedSrName || currentUser?.name || 'Senior Recruiter')}&tseId=${encodeURIComponent(t.assigneeId || '')}&tseName=${encodeURIComponent(t.assigneeName || 'TSE')}&candidate=${encodeURIComponent(t.candidateName || t.title || 'Candidate')}&company=${encodeURIComponent(t.company || t.companyName || 'Client')}&type=${encodeURIComponent(t.taskType || 'Interview')}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          toast.success('Candidate Feedback link generated and copied to clipboard!');
        }).catch(() => {
          window.prompt('Copy candidate feedback URL:', url);
        });
      } else {
        window.prompt('Copy candidate feedback URL:', url);
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader
          title={`${currentUser?.name || 'Senior Recruiter'} Dashboard`}
          subtitle={`${teamLabel} · Candidate Feedback & Coordination`}
        />

        {/* SR Workflow KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NeumorphicMetricCard
            testid="kpi-sr-total"
            label="My Assigned Tasks"
            value={finalSrTasks.length}
            subValue="In Scope"
            percentage={100}
            ringColor="#1416c1"
          />
          <NeumorphicMetricCard
            testid="kpi-sr-feedback-ready"
            label="Feedback Link Ready"
            value={feedbackReadyTasks.length}
            subValue="Action Required"
            percentage={finalSrTasks.length > 0 ? Math.round((feedbackReadyTasks.length / finalSrTasks.length) * 100) : 0}
            ringColor="#10b981"
          />
          <NeumorphicMetricCard
            testid="kpi-sr-in-progress"
            label="With TSE"
            value={inProgressTasks.length}
            subValue="In Progress"
            percentage={finalSrTasks.length > 0 ? Math.round((inProgressTasks.length / finalSrTasks.length) * 100) : 0}
            ringColor="#f59e0b"
          />
          <NeumorphicMetricCard
            testid="kpi-sr-completed"
            label="Finished Tasks"
            value={feedbackReadyTasks.length}
            subValue="Completed"
            percentage={finalSrTasks.length > 0 ? Math.round((feedbackReadyTasks.length / finalSrTasks.length) * 100) : 0}
            ringColor="#8b5cf6"
          />
        </div>

        {/* Step 5: Action Required: Candidate Feedback Link Generation */}
        <SectionCard
          title="🎉 Action Required: Generate Candidate Feedback Link"
          subtitle="Tasks marked Done by TSE - You can now generate and send the feedback form to candidates"
        >
          {feedbackReadyTasks.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <Sparkles size={32} className="mx-auto text-slate-400 mb-2" />
              <div className="text-sm font-bold text-slate-800 dark:text-white">No feedback forms pending</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Once a TSE marks an assigned interview task as Done and submits completion remarks, the Feedback Link action will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackReadyTasks.map(t => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-100/50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mono text-xs font-bold text-emerald-800 dark:text-emerald-300">{t.id}</span>
                      <TaskTypeBadge type={t.taskType || 'Interview'} />
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide">
                        TSE Done
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.candidateName || t.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                      <span>Client: <strong className="text-slate-800 dark:text-slate-200">{t.company || 'Client'}</strong></span>
                      <span>· Completed By TSE: <strong className="text-indigo-600 dark:text-indigo-400">{t.assigneeName || t.techPerson || 'TSE'}</strong></span>
                    </div>
                    {t.completionRemark && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200">
                        <strong className="text-emerald-800 dark:text-emerald-400">TSE Remarks: </strong>
                        {t.completionRemark}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      data-testid={`generate-feedback-link-${t.id}`}
                      onClick={() => handleCopyFeedbackLink(t)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles size={14} />
                      <span>Generate &amp; Copy Feedback Link</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Tasks in progress with TSE */}
        <SectionCard title="Active Tasks (Awaiting TSE Completion)" subtitle="Feedback link generation is locked until TSE finishes the task">
          {inProgressTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No tasks currently in-progress with TSE.
            </div>
          ) : (
            <div className="space-y-2.5">
              {inProgressTasks.map(t => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="mono font-bold text-blue-600 dark:text-blue-400">{t.id}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{t.candidateName || t.title}</span>
                      <TaskTypeBadge type={t.taskType || 'Interview'} />
                    </div>
                    <div className="text-slate-500">
                      Assigned TSE: <strong className="text-slate-700 dark:text-slate-300">{t.assigneeName || t.techPerson || 'TSE'}</strong> · Due {t.dueDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={t.status} />
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Lock size={10} /> Link Locked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    );
  }

  return <EmptyState title="No dashboard assigned" />;
}
