import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, CheckCircle2, Clock3, AlertTriangle, UserRoundCheck, Users as UsersIcon, Target, PieChart as PieIcon, Plus, ArrowUpRight, UserPlus, ExternalLink, Link2, Copy, ShieldCheck, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useApp } from '../context/AppContext';
import { KpiCard, PageHeader, StatusBadge, TaskTypeBadge, SectionCard, EmptyState, ArcGaugeCard, NeumorphicMetricCard, CircularProgressRing } from '../components/common';
import { ROLES, USERS, roleIsMarketing, formatTseNameForRole } from '../data/mockData';

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
    completed: tasks.filter(t => (t.assigneeId === u.id || t.techPerson === u.name) && (t.status === 'Completed' || t.status === 'Done')).length,
    pending: tasks.filter(t => (t.assigneeId === u.id || t.techPerson === u.name) && t.status === 'Pending').length,
  }));
};

const priorityDistribution = (tasks) => {
  const counts = tasks.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
  return ['Urgent','High','Medium','Low'].map(p => ({ name: p, value: counts[p] || 0 }));
};

const InterviewFunnel = ({ interviews }) => {
  const stages = ['Scheduled', 'Interview Completed', 'Feedback Pending', 'Cleared'];
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
  const { currentRole, currentUser, tasks, visibleInterviews, interviews, users } = useApp();
  const navigate = useNavigate();

  const trend = useMemo(() => buildTrend(tasks), [tasks]);
  const dist = useMemo(() => statusDistribution(tasks), [tasks]);
  const perTse = useMemo(() => perTseBars(tasks, users), [tasks, users]);
  const prioDist = useMemo(() => priorityDistribution(tasks), [tasks]);

  const totals = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress' || t.status === 'Reschedule').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Done').length,
  };
  const completionRate = totals.total ? Math.round((totals.completed / totals.total) * 100) : 0;

  const allInterviews = (interviews && interviews.length) ? interviews : (visibleInterviews || []);
  const ivTotals = {
    total: allInterviews.length,
    scheduled: allInterviews.filter(i => i.status === 'Scheduled').length,
    completed: allInterviews.filter(i => i.status === 'Interview Completed').length,
    feedbackPending: allInterviews.filter(i => i.status === 'Feedback Pending').length,
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
                  const c = a.filter(t => t.status === 'Completed' || t.status === 'Done').length;
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
            <NeumorphicMetricCard testid="kpi-pending" label="Pending" value={totals.pending} subValue="In Queue" percentage={totals.total > 0 ? Math.round((totals.pending / totals.total) * 100) : 0} ringColor="#f59e0b" />
          </div>
        </div>

        <SectionCard title="Team Workload" subtitle="Capacity across your TSEs">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {myTeam.map(u => {
              const a = tasks.filter(t => 
                t.assigneeId === u.id || 
                t.assigneeId === u.empId || 
                t.techPerson === u.name || 
                (u.codeName && (t.codeName === u.codeName || t.techPerson === u.codeName)) ||
                (t.techPerson && t.techPerson.toLowerCase().includes(u.name.toLowerCase()))
              );
              const c = a.filter(t => t.status === 'Completed' || t.status === 'Done').length;
              const p = a.filter(t => t.status === 'In Progress' || t.status === 'Pending' || t.status === 'Reschedule').length;
              const rate = a.length ? Math.round((c / a.length) * 100) : 0;
              return (
                <div
                  key={u.id}
                  data-testid={`workload-${u.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{u.name} {u.codeName ? `(${u.codeName})` : ''}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{u.empId}</div>
                    </div>
                    <CircularProgressRing percentage={rate} color="#1416c1" size={38} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center py-2 px-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">{a.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Tasks</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{c}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Done</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-blue-600 dark:text-blue-400">{p}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Active</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

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
                  <th className="font-bold">Tech Person</th>
                  <th className="font-bold">Task</th>
                  <th className="font-bold">Candidate Name</th>
                  <th className="font-bold">Position</th>
                  <th className="font-bold">Company</th>
                  <th className="font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {tasks.slice(0, 8).map(t => {
                  const a = users.find(u => u.id === t.assigneeId);
                  const techName = formatTseNameForRole(a || t, currentRole);
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => navigate('/tasks')}
                    >
                      <td className="py-2.5 mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{t.date || t.dueDate}</td>
                      <td className="text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center">
                            {techName.split(' ').map(p => p[0]).slice(0, 2).join('')}
                          </span>
                          <span className="text-xs font-semibold">{techName}</span>
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

  // ---------- TSE ----------
  if (currentRole === 'tse') {
    const myTasks = tasks;
    const myStats = {
      assigned: myTasks.length,
      inProgress: myTasks.filter(t => t.status === 'In Progress' || t.status === 'Reschedule').length,
      pending: myTasks.filter(t => t.status === 'Pending').length,
      completed: myTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length,
    };
    const tseRate = myStats.assigned ? Math.round((myStats.completed / myStats.assigned) * 100) : 0;

    return (
      <div className="space-y-6">
        <PageHeader title="My Workspace" subtitle={`${currentUser?.name} · ${currentUser?.dept}`} />

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

  // ---------- MARKETING TEAM LEAD ----------
  if (currentRole === 'marketing_tl') {
    const candidateTasks = tasks;
    const pendingSrTasks = candidateTasks.filter(t => !t.pocId || t.recruiterName === 'Unassigned');
    const completedTasks = candidateTasks.filter(t => t.status === 'Done' || t.status === 'Completed');
    const inProgressTasks = candidateTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending' || t.status === 'Reschedule');
    const totalPool = candidateTasks.length;
    const evalRate = totalPool ? Math.round((completedTasks.length / totalPool) * 100) : 0;

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Marketing Operations Console — ${currentUser?.name || 'Team Lead'}`}
          subtitle={`Operational pipeline for ${currentUser?.dept || 'Marketing Team'} · Verified SR management & Candidate SAGA sync`}
          actions={
            <button
              onClick={() => navigate('/tasks')}
              className="btn-primary h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <ListChecks size={14} /> Open Task Management
            </button>
          }
        />

        {/* Hero Gauge & KPIs */}
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
            stat1Label="Evaluated"
            stat1Value={`${totalRoundsConducted} Conducted`}
            stat2Label="Cleared"
            stat2Value={`${ivTotals.cleared} Qualified`}
          />
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NeumorphicMetricCard testid="kpi-assigned" label="Team Pool" value={totalPool} subValue="Candidates" percentage={totalPool > 0 ? 100 : 0} ringColor="#1416c1" />
            <NeumorphicMetricCard testid="kpi-completed" label="Completed" value={completedTasks.length} subValue="Done by TSE" percentage={evalRate} ringColor="#10b981" />
            <NeumorphicMetricCard testid="kpi-pending-sr" label="Awaiting SR" value={pendingSrTasks.length} subValue="Action Required" percentage={totalPool > 0 ? Math.round((pendingSrTasks.length / totalPool) * 100) : 0} ringColor="#ef4444" />
            <NeumorphicMetricCard testid="kpi-feedback" label="SAGA Ready" value={completedTasks.length} subValue="Feedback Forms" percentage={evalRate} ringColor="#8b5cf6" />
          </div>
        </div>

        {/* Action Priority Queue: Pending SR Assignment */}
        {pendingSrTasks.length > 0 && (
          <SectionCard
            title="Pending SR Assignment Queue"
            subtitle={`${pendingSrTasks.length} assessment tasks awaiting verified Marketing SR allocation`}
          >
            <div className="overflow-x-auto -mx-5 md:-mx-6">
              <table className="w-full text-sm">
                <thead className="bg-amber-50/70 border-b border-amber-200 text-amber-900 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Task ID</th>
                    <th className="py-2.5 px-4 text-left">Candidate Name</th>
                    <th className="py-2.5 px-4 text-left">Position</th>
                    <th className="py-2.5 px-4 text-left">Company</th>
                    <th className="py-2.5 px-4 text-left">Tech Support</th>
                    <th className="py-2.5 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingSrTasks.map(t => (
                    <tr key={t.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 mono text-xs text-blue-600 font-semibold">{t.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{t.candidateName || t.title}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{t.position || '—'}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">{t.companyName || '—'}</td>
                      <td className="py-3 px-4 text-xs text-slate-700 font-medium">{formatTseNameForRole(t, currentRole)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate('/tasks')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserPlus size={12} />
                          <span>Assign SR →</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* Team Candidate Assessment Stream */}
        <SectionCard
          title="Team Candidate Pipeline & SAGA Feedback Status"
          subtitle="Real-time synchronized candidate records across your team"
          actions={
            <button onClick={() => navigate('/tasks')} className="text-xs text-blue-600 hover:underline font-bold">
              View all team tasks →
            </button>
          }
        >
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Candidate Name</th>
                  <th className="py-3 px-4 text-left">Position & Company</th>
                  <th className="py-3 px-4 text-left">Tech ID</th>
                  <th className="py-3 px-4 text-left">Assigned SR</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Feedback Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidateTasks.slice(0, 10).map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 mono text-xs text-slate-600 whitespace-nowrap">{t.date || t.dueDate}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{t.candidateName || t.title}</div>
                      <div className="mono text-[10px] text-blue-600 font-medium">{t.id}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div>{t.position || '—'}</div>
                      <div className="font-semibold text-slate-800">{t.companyName || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono font-semibold text-blue-700">
                      {t.codeName || t.techPersonId || 'TSE-ID'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {t.recruiterName && t.recruiterName !== 'Unassigned' ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                          {t.recruiterName}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge value={t.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {t.status === 'Done' || t.status === 'Completed' ? (
                        <button
                          onClick={() => navigate('/feedback')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs flex items-center gap-1.5 ml-auto hover:opacity-90 cursor-pointer"
                        >
                          <Link2 size={12} />
                          <span>Generate Link</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Assessment In Progress</span>
                      )}
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

  // ---------- MARKETING SR & RECRUITER (STRICT DATA ISOLATION) ----------
  if (currentRole === 'marketing_sr' || currentRole === 'recruiter') {
    const candidateTasks = tasks;
    const completedTasks = candidateTasks.filter(t => t.status === 'Done' || t.status === 'Completed');
    const inProgressTasks = candidateTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending' || t.status === 'Reschedule');
    const totalPool = candidateTasks.length;
    const evalRate = totalPool ? Math.round((completedTasks.length / totalPool) * 100) : 0;

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Marketing SR Workspace — ${currentUser?.name}`}
          subtitle="Your private candidate assessments, interview clearances, and Candidate SAGA links"
        />

        {/* Hero Gauge & Metric Cards */}
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
            stat1Label="Conducted"
            stat1Value={`${totalRoundsConducted} Sessions`}
            stat2Label="Cleared"
            stat2Value={`${ivTotals.cleared} Passed`}
          />
          <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NeumorphicMetricCard testid="kpi-assigned" label="My Candidates" value={totalPool} subValue="Allocated" percentage={totalPool > 0 ? 100 : 0} ringColor="#1416c1" />
            <NeumorphicMetricCard testid="kpi-completed" label="Completed" value={completedTasks.length} subValue="Assessed by TSE" percentage={evalRate} ringColor="#10b981" />
            <NeumorphicMetricCard testid="kpi-in-prog" label="Underway" value={inProgressTasks.length} subValue="In Pipeline" percentage={totalPool > 0 ? Math.round((inProgressTasks.length / totalPool) * 100) : 0} ringColor="#f59e0b" />
            <NeumorphicMetricCard testid="kpi-feedback-ready" label="SAGA Ready" value={completedTasks.length} subValue="Forms Ready" percentage={evalRate} ringColor="#8b5cf6" />
          </div>
        </div>

        {/* My Candidate Roster */}
        <SectionCard
          title="My Candidate Assessments"
          subtitle="Scoped exclusively to candidates assigned to your ownership"
        >
          {candidateTasks.length === 0 ? (
            <EmptyState title="No candidates assigned yet" description="Your Marketing Team Lead will allocate upcoming assessments to you." />
          ) : (
            <div className="overflow-x-auto -mx-5 md:-mx-6">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Candidate Name</th>
                    <th className="py-3 px-4 text-left">Position</th>
                    <th className="py-3 px-4 text-left">Company</th>
                    <th className="py-3 px-4 text-left">Tech ID</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Candidate SAGA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidateTasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 mono text-xs text-slate-600 whitespace-nowrap">{t.date || t.dueDate}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.candidateName || t.title}</div>
                        <div className="mono text-[10px] text-blue-600 font-medium">{t.id}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{t.position || '—'}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">{t.companyName || '—'}</td>
                      <td className="py-3 px-4 text-xs font-mono font-semibold text-blue-700">
                        {t.codeName || t.techPersonId || 'TSE-ID'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge value={t.status} />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {t.status === 'Done' || t.status === 'Completed' ? (
                          <button
                            onClick={() => navigate('/feedback')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs flex items-center gap-1.5 ml-auto hover:opacity-90 cursor-pointer"
                          >
                            <Link2 size={12} />
                            <span>Generate Link</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Assessment In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    );
  }

  return <EmptyState title="No dashboard assigned" />;
}
