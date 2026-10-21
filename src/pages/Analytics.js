import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, AreaChart, Area, Legend
} from 'recharts';
import { LineChart as LineChartIcon, PieChart as PieChartIcon, BarChart3, UserRoundCheck, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard } from '../components/common';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PRIORITIES, TASK_STATUSES } from '../data/mockData';

const palette = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#64748B'];
const tipStyle = { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, color: '#0F172A', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

export default function Analytics() {
  const { tasks, visibleInterviews, users } = useApp();
  const [filters, setFilters] = useState({ range: '7d', team: 'all', tse: 'all', tsm: 'all', status: 'all', priority: 'all' });

  const tsms = useMemo(() => users.filter(u => u.role === 'tsm'), [users]);
  const tses = useMemo(() => users.filter(u => u.role === 'tse'), [users]);

  // Date cutoff
  const cutoffDate = useMemo(() => {
    if (filters.range === 'all') return null;
    const days = filters.range === '7d' ? 7 : filters.range === '30d' ? 30 : 90;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }, [filters.range]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (filters.tse !== 'all' && t.assigneeId !== filters.tse && t.techPersonId !== filters.tse) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (cutoffDate) {
      const taskDate = t.date || t.dueDate || (t.createdAt && t.createdAt.slice(0, 10));
      if (taskDate && taskDate < cutoffDate) return false;
    }
    return true;
  }), [tasks, filters, cutoffDate]);

  // Filtered interviews matching range, TSE, and TSM
  const filteredInterviews = useMemo(() => {
    return (visibleInterviews || []).filter(iv => {
      if (cutoffDate) {
        const ivDate = iv.date || (iv.createdAt && iv.createdAt.slice(0, 10));
        if (ivDate && ivDate < cutoffDate) return false;
      }
      if (filters.tse !== 'all') {
        const tseMatch = iv.interviewerId === filters.tse || iv.assigneeId === filters.tse || iv.techPersonId === filters.tse;
        if (!tseMatch) return false;
      }
      if (filters.tsm !== 'all') {
        const tsmUser = users.find(u => u.id === filters.tsm);
        const ivTse = users.find(u => u.id === (iv.interviewerId || iv.assigneeId || iv.techPersonId));
        if (tsmUser && ivTse && tsmUser.teamId && ivTse.teamId !== tsmUser.teamId) return false;
      }
      return true;
    });
  }, [visibleInterviews, cutoffDate, filters.tse, filters.tsm, users]);

  // Outcome distribution KPIs (counts & percentages)
  const outcomeStats = useMemo(() => {
    const rawOutcomes = filteredInterviews.map(i => {
      if (i.interviewOutcome) return i.interviewOutcome;
      if (i.status === 'Cleared') return 'Selected';
      if (i.status === 'Rejected') return 'Rejected';
      if (i.status === 'Hold') return 'On Hold';
      return null;
    }).filter(Boolean);

    const total = rawOutcomes.length;
    const standardOutcomes = ['Selected', 'Rejected', 'On Hold', 'Next Round', 'No Show', 'Offer Released', 'Joined'];
    
    const dist = standardOutcomes.map(name => {
      const count = rawOutcomes.filter(o => o === name).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { name, count, pct };
    });

    return { total, dist };
  }, [filteredInterviews]);

  // TSE-wise performance based on outcomes received
  const tsePerformance = useMemo(() => {
    return tses.map(tse => {
      const tseIvs = filteredInterviews.filter(iv =>
        iv.interviewerId === tse.id || iv.assigneeId === tse.id || iv.techPersonId === tse.id
      );
      const total = tseIvs.length;
      const pendingFb = tseIvs.filter(iv =>
        iv.status === 'Interview Completed - Feedback Pending' ||
        iv.status === 'Feedback Pending' ||
        iv.status === 'Scheduled'
      ).length;

      const outcomes = tseIvs.map(iv => {
        if (iv.interviewOutcome) return iv.interviewOutcome;
        if (iv.status === 'Cleared') return 'Selected';
        if (iv.status === 'Rejected') return 'Rejected';
        if (iv.status === 'Hold') return 'On Hold';
        return null;
      }).filter(Boolean);

      const outcomesCount = outcomes.length;
      const selectedCount = outcomes.filter(o => ['Selected', 'Offer Released', 'Joined'].includes(o)).length;
      const rejectedCount = outcomes.filter(o => o === 'Rejected').length;

      const selectionRate = outcomesCount > 0 ? Math.round((selectedCount / outcomesCount) * 100) : 0;
      const rejectionRate = outcomesCount > 0 ? Math.round((rejectedCount / outcomesCount) * 100) : 0;

      return {
        id: tse.id,
        name: tse.name,
        total,
        outcomesCount,
        selectedCount,
        rejectedCount,
        pendingFb,
        selectionRate,
        rejectionRate,
      };
    }).filter(p => filters.tse === 'all' || p.id === filters.tse);
  }, [tses, filteredInterviews, filters.tse]);

  const trend = useMemo(() => {
    const daysCount = filters.range === '7d' ? 7 : filters.range === '30d' ? 14 : 20;
    const days = Array.from({ length: daysCount }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (daysCount - 1 - i));
      return d.toISOString().slice(0, 10);
    });

    if (filtered.length === 0) return [];

    return days.map((d, i) => {
      const dayTasks = filtered.filter(t => (t.date === d || t.dueDate === d || (t.createdAt && t.createdAt.slice(0, 10) === d)));
      return {
        day: `D${i+1}`,
        date: d,
        completed: dayTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length,
        inProgress: dayTasks.filter(t => t.status === 'In Progress').length,
        pending: dayTasks.filter(t => t.status === 'Pending').length,
      };
    });
  }, [filtered, filters.range]);

  const perTse = useMemo(() => {
    const tses = users.filter(u => u.role === 'tse');
    return tses.map(u => ({
      name: u.name.split(' ')[0],
      completed: filtered.filter(t => t.assigneeId === u.id && (t.status === 'Completed' || t.status === 'Done')).length,
      inProgress: filtered.filter(t => t.assigneeId === u.id && t.status === 'In Progress').length,
      pending: filtered.filter(t => t.assigneeId === u.id && t.status === 'Pending').length,
    }));
  }, [filtered, users]);

  const hasTseProductivity = perTse.some(t => t.completed > 0 || t.inProgress > 0 || t.pending > 0);

  const statusDist = useMemo(() => {
    if (filtered.length === 0) return [];
    const counts = filtered.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const backlog = useMemo(() => {
    if (filtered.length === 0) return [];
    return Array.from({ length: 7 }).map((_, i) => ({
      day: `W${i+1}`,
      backlog: filtered.filter(t => t.status === 'Pending' || t.status === 'In Progress').length,
      closed: filtered.filter(t => t.status === 'Completed' || t.status === 'Done').length,
    }));
  }, [filtered]);

  const funnel = useMemo(() => {
    const stages = ['Scheduled', 'Interview Completed', 'Feedback Pending', 'Cleared', 'Rejected'];
    return stages.map(s => ({
      name: s,
      value: (visibleInterviews || []).filter(i => i.status === s).length,
    }));
  }, [visibleInterviews]);

  const interviewOutcomes = useMemo(() => [
    { name: 'Cleared', value: (visibleInterviews || []).filter(i => i.status === 'Cleared').length },
    { name: 'Rejected', value: (visibleInterviews || []).filter(i => i.status === 'Rejected').length },
    { name: 'Hold', value: (visibleInterviews || []).filter(i => i.status === 'Hold').length },
  ], [visibleInterviews]);

  const hasInterviewData = (visibleInterviews || []).length > 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Performance" subtitle="Interactive dashboards for cross-team operational insights." />
      <SectionCard title="Filters">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Select value={filters.range} onValueChange={v => setFilters({...filters, range: v})}>
            <SelectTrigger data-testid="an-range" className="bg-white border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.tse} onValueChange={v => setFilters({...filters, tse: v})}>
            <SelectTrigger data-testid="an-tse" className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="TSE" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All TSEs</SelectItem>
              {tses.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.tsm} onValueChange={v => setFilters({...filters, tsm: v})}>
            <SelectTrigger data-testid="an-tsm" className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="TSM" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All TSMs</SelectItem>
              {tsms.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={v => setFilters({...filters, status: v})}>
            <SelectTrigger data-testid="an-status" className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All statuses</SelectItem>
              {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.priority} onValueChange={v => setFilters({...filters, priority: v})}>
            <SelectTrigger data-testid="an-priority" className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.team} onValueChange={v => setFilters({...filters, team: v})}>
            <SelectTrigger className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="Team" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All teams</SelectItem><SelectItem value="ts">Tech Support</SelectItem><SelectItem value="mk">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {/* INTERVIEW OUTCOME DISTRIBUTION KPIS (COUNTS & PERCENTAGES) */}
      <SectionCard
        title="Interview Outcome Distribution & Rates"
        subtitle={`Outcome metrics from ${outcomeStats.total} finalized interview records across the selected period and team.`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          {outcomeStats.dist.map((o) => (
            <div key={o.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title={o.name}>
                {o.name}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">{o.count}</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {o.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={outcomeStats.dist.filter(d => d.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {outcomeStats.dist.filter(d => d.count > 0).map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={tipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Outcome Percentage Breakdown</div>
            {outcomeStats.dist.map((o, i) => (
              <div key={o.name}>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{o.name}</span>
                  <span className="tabular-nums font-bold text-slate-900">{o.count} ({o.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${o.pct}%`, backgroundColor: palette[i % palette.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* TSE-WISE PERFORMANCE BASED ON OUTCOMES RECEIVED */}
      <SectionCard
        title="TSE Performance (Outcomes, Selection & Feedback Backlog)"
        subtitle="Individual TSE outcome metrics: Selection rate, Rejection rate, and pending feedback count."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase tracking-wider border-b border-slate-200 font-semibold">
                <th className="py-2.5">TSE Name</th>
                <th>Total Assigned</th>
                <th>Outcomes Received</th>
                <th>Selected</th>
                <th>Rejected</th>
                <th>Selection Rate</th>
                <th>Rejection Rate</th>
                <th>Pending Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tsePerformance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400 italic">No TSE records matching the filter.</td>
                </tr>
              ) : tsePerformance.map(tse => (
                <tr key={tse.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-900">{tse.name}</td>
                  <td className="text-slate-700 font-medium">{tse.total}</td>
                  <td className="text-slate-900 font-bold">{tse.outcomesCount}</td>
                  <td className="text-emerald-700 font-bold">{tse.selectedCount}</td>
                  <td className="text-rose-700 font-medium">{tse.rejectedCount}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 tabular-nums">{tse.selectionRate}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${tse.selectionRate}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-rose-600 tabular-nums">{tse.rejectionRate}%</span>
                  </td>
                  <td>
                    {tse.pendingFb > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {tse.pendingFb} pending
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard className="lg:col-span-2" title="Task Completion Trend">
          {filtered.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <LineChartIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No task completion trend yet</p>
              <p className="text-xs text-slate-400 mt-0.5">Trend will populate automatically once tasks are logged</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={trend}>
                  <defs><linearGradient id="aC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10B981" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="day" stroke="#64748B" /><YAxis stroke="#64748B" /><RTooltip contentStyle={tipStyle} />
                  <Area type="monotone" dataKey="completed" stroke="#10B981" fill="url(#aC)" />
                  <Line type="monotone" dataKey="pending" stroke="#F59E0B" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Status Distribution">
          {statusDist.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <PieChartIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No status distribution</p>
              <p className="text-xs text-slate-400 mt-0.5">Status breakdown will display when tasks are created</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusDist} dataKey="value" nameKey="name" outerRadius={88} innerRadius={54} paddingAngle={2}>
                    {statusDist.map((_, i) => <Cell key={i} fill={palette[i]} />)}
                  </Pie>
                  <RTooltip contentStyle={tipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard className="lg:col-span-2" title="Productivity by TSE">
          {!hasTseProductivity ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No TSE productivity data yet</p>
              <p className="text-xs text-slate-400 mt-0.5">TSE output volume will show once tickets are assigned</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={perTse}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="name" stroke="#64748B" /><YAxis stroke="#64748B" /><RTooltip contentStyle={tipStyle} /><Legend wrapperStyle={{ fontSize: 11 }}/>
                  <Bar dataKey="completed" fill="#10B981" stackId="a" radius={[4,4,0,0]} />
                  <Bar dataKey="inProgress" fill="#3B82F6" stackId="a" />
                  <Bar dataKey="pending" fill="#F59E0B" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Pending Backlog">
          {backlog.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No pending backlog</p>
              <p className="text-xs text-slate-400 mt-0.5">Queue trend will appear when tasks remain open</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={backlog}>
                  <defs><linearGradient id="bK" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3}/><stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" /><XAxis dataKey="day" stroke="#64748B" /><YAxis stroke="#64748B" /><RTooltip contentStyle={tipStyle} />
                  <Area type="monotone" dataKey="backlog" stroke="#F59E0B" fill="url(#bK)" />
                  <Line type="monotone" dataKey="closed" stroke="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Interview Funnel">
          {!hasInterviewData ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <UserRoundCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No interviews scheduled yet</p>
              <p className="text-xs text-slate-400 mt-0.5">Funnel progression stages will appear once candidate interviews are logged</p>
            </div>
          ) : (
            <div className="space-y-3">
              {funnel.map((f, i) => {
                const max = Math.max(...funnel.map(x => x.value), 1);
                return (
                  <div key={f.name}>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1"><span>{f.name}</span><span className="text-slate-900 font-bold tabular-nums">{f.value}</span></div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full" style={{ width: `${(f.value/max)*100}%`, backgroundColor: palette[i] }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Interview Outcomes">
          {!hasInterviewData ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <PieChartIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No candidate outcomes yet</p>
              <p className="text-xs text-slate-400 mt-0.5">Cleared, Rejected, and Hold ratios will show once rounds are concluded</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={interviewOutcomes} dataKey="value" nameKey="name" outerRadius={88} innerRadius={54}>
                    <Cell fill="#10B981" /><Cell fill="#EF4444" /><Cell fill="#8B5CF6" />
                  </Pie>
                  <RTooltip contentStyle={tipStyle} /><Legend wrapperStyle={{ fontSize: 11 }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
