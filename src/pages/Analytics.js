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
  const [filters, setFilters] = useState({ range: '7d', team: 'all', tse: 'all', status: 'all', priority: 'all' });

  const filtered = useMemo(() => tasks.filter(t =>
    (filters.tse === 'all' || t.assigneeId === filters.tse) &&
    (filters.status === 'all' || t.status === filters.status) &&
    (filters.priority === 'all' || t.priority === filters.priority)
  ), [tasks, filters]);

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Select value={filters.range} onValueChange={v => setFilters({...filters, range: v})}>
            <SelectTrigger data-testid="an-range" className="bg-white border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.tse} onValueChange={v => setFilters({...filters, tse: v})}>
            <SelectTrigger data-testid="an-tse" className="bg-white border-slate-300 text-slate-900"><SelectValue placeholder="TSE" /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All TSEs</SelectItem>
              {users.filter(u => u.role === 'tse').map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
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
