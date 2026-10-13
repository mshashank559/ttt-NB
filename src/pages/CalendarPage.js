import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, Building2, 
  UserRound, Briefcase, CheckCircle2, AlertCircle, X, Sparkles, Filter, 
  ExternalLink, MessageSquare, Info, Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatusBadge } from '../components/common';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const typeColor = {
  task: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400',
  interview: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-400',
  meeting: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400',
  deadline: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400',
};

const sessionBadgeStyles = {
  Interview: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Technical Interview': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Technical Round': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TAC: 'bg-amber-50 text-amber-800 border-amber-200',
  TQC: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  TUC: 'bg-violet-50 text-violet-700 border-violet-200',
  RUC: 'bg-pink-50 text-pink-700 border-pink-200',
  JDC: 'bg-rose-50 text-rose-700 border-rose-200',
  Demo: 'bg-purple-50 text-purple-700 border-purple-200',
  'Ops Sync': 'bg-blue-50 text-blue-700 border-blue-200',
  Review: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Audit Deadline': 'bg-rose-50 text-rose-700 border-rose-200',
};

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateString(isoString) {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CalendarPage() {
  const { events, tasks, interviews } = useApp();
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(new Date());
  
  // Day enlargement modal state
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [modalFilter, setModalFilter] = useState('all'); // 'all' | 'interviews' | 'tasks'

  // Combine and unify all activities across events, tasks, and interviews
  const unifiedEvents = useMemo(() => {
    const map = new Map();

    // 1. Base events from context
    (events || []).forEach(e => {
      map.set(e.id, { ...e });
    });

    // 2. Add or enrich with all tasks
    (tasks || []).forEach(t => {
      const id = `ev-t-${t.id}`;
      map.set(id, {
        id,
        type: 'task',
        title: `${t.candidateName} • ${t.companyName} (${t.taskType})`,
        date: t.date,
        refId: t.id,
        candidateName: t.candidateName,
        companyName: t.companyName,
        sessionType: t.taskType,
        taskType: t.taskType,
        techPerson: t.techPerson,
        duration: t.duration,
        position: t.position,
        status: t.status,
        remark: t.remark,
      });
    });

    // 3. Add or enrich with all interviews
    (interviews || []).forEach(i => {
      const id = `ev-i-${i.id}`;
      map.set(id, {
        id,
        type: 'interview',
        title: `${i.candidateName} • ${i.companyName || 'NetBounce'} (${i.sessionType || 'Interview'})`,
        date: i.date,
        refId: i.id,
        candidateName: i.candidateName,
        companyName: i.companyName || 'Client Org',
        sessionType: i.sessionType || 'Interview',
        taskType: i.sessionType || 'Interview',
        techPerson: i.techPerson || 'Assigned TSE',
        time: i.time,
        duration: '45 mins',
        position: i.position,
        status: i.status,
        remark: i.feedbackSubmitted ? 'Feedback submitted' : 'Interview Scheduled',
      });
    });

    return Array.from(map.values());
  }, [events, tasks, interviews]);

  // Group events by date key (YYYY-MM-DD)
  const eventByDate = useMemo(() => {
    const m = new Map();
    unifiedEvents.forEach(e => {
      const k = e.date;
      if (!k) return;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(e);
    });
    return m;
  }, [unifiedEvents]);

  const grid = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const label = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });

  const shift = (dir) => {
    const d = new Date(cursor);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  };

  // Activities for currently enlarged date
  const selectedDayActivities = useMemo(() => {
    if (!selectedDateKey) return [];
    return eventByDate.get(selectedDateKey) || [];
  }, [selectedDateKey, eventByDate]);

  // Filtered activities inside modal
  const filteredModalActivities = useMemo(() => {
    if (modalFilter === 'interviews') {
      return selectedDayActivities.filter(a => a.type === 'interview' || a.taskType === 'Interview');
    }
    if (modalFilter === 'tasks') {
      return selectedDayActivities.filter(a => a.type === 'task');
    }
    return selectedDayActivities;
  }, [selectedDayActivities, modalFilter]);

  // Next/Previous day navigation inside enlarged modal
  const shiftModalDay = (days) => {
    if (!selectedDateKey) return;
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const newKey = dateObj.toISOString().slice(0, 10);
    setSelectedDateKey(newKey);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Calendar" 
        subtitle="Tasks, candidate interviews, sessions, and client assessments in one unified view." 
        actions={
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {['month', 'week', 'day'].map(v => (
              <button 
                key={v} 
                data-testid={`cal-view-${v}`} 
                onClick={() => setView(v)} 
                className={`px-3 py-1 text-xs rounded-md capitalize font-medium transition-colors cursor-pointer ${view === v ? 'bg-[#1416c1] text-white shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      <SectionCard
        title={label}
        actions={
          <div className="flex items-center gap-1">
            <button 
              data-testid="cal-prev" 
              onClick={() => shift(-1)} 
              className="h-8 w-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              data-testid="cal-today" 
              onClick={() => setCursor(new Date())} 
              className="h-8 px-3 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button 
              data-testid="cal-next" 
              onClick={() => shift(1)} 
              className="h-8 w-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        }
      >
        {view === 'month' && (
          <div>
            <div className="grid grid-cols-7 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2 text-center">
              {WEEKDAYS.map(w => <div key={w}>{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {grid.map((d, idx) => {
                const inMonth = d.getMonth() === cursor.getMonth();
                const isToday = d.toDateString() === new Date().toDateString();
                const key = d.toISOString().slice(0, 10);
                const evs = eventByDate.get(key) || [];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDateKey(key);
                      setModalFilter('all');
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedDateKey(key);
                        setModalFilter('all');
                      }
                    }}
                    className={`min-h-[110px] p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group outline-none
                      ${inMonth 
                        ? 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 hover:shadow-sm' 
                        : 'bg-slate-50/60 border-slate-100 opacity-50'
                      } ${isToday ? 'ring-2 ring-blue-600 bg-blue-50/30' : ''}`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded transition-colors ${
                          isToday 
                            ? 'bg-[#1416c1] text-white shadow-sm' 
                            : inMonth 
                              ? 'text-slate-800 group-hover:text-blue-700' 
                              : 'text-slate-400'
                        }`}>
                          {d.getDate()}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold text-blue-700 hidden xl:inline">Today</span>
                        )}
                      </div>

                      {evs.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 group-hover:border-blue-300 group-hover:text-blue-700 transition-colors">
                          {evs.length}
                        </span>
                      )}
                    </div>

                    {/* Previews inside the box */}
                    <div className="mt-1.5 space-y-1 flex-1">
                      {evs.slice(0, 3).map(e => (
                        <div
                          key={e.id}
                          className={`w-full text-left rounded-md px-1.5 py-0.5 border text-[10px] leading-tight transition-colors ${typeColor[e.type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                        >
                          {e.candidateName ? (
                            <div>
                              <div className="font-semibold truncate flex items-center justify-between gap-1">
                                <span className="truncate">{e.candidateName}</span>
                                {e.sessionType && (
                                  <span className="text-[9px] font-mono px-1 rounded bg-slate-200/80 border border-slate-300 shrink-0 font-medium text-slate-700">
                                    {e.sessionType}
                                  </span>
                                )}
                              </div>
                              {e.companyName && (
                                <div className="text-[9px] opacity-75 truncate flex items-center gap-1 mt-0.5">
                                  <Building2 size={9} className="shrink-0" />
                                  <span className="truncate">{e.companyName}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="font-medium truncate text-slate-800">{e.title}</div>
                          )}
                        </div>
                      ))}

                      {evs.length > 3 && (
                        <div className="text-[10px] font-semibold text-blue-700 group-hover:underline flex items-center gap-1 pt-0.5">
                          <span>+{evs.length - 3} more</span>
                          <span className="text-[9px]">›</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view !== 'month' && (
          <div className="space-y-2">
            {unifiedEvents.filter(e => {
              if (view === 'day') return e.date === cursor.toISOString().slice(0, 10);
              const d = new Date(e.date);
              const diff = (d - cursor) / 86400000;
              return diff >= -3 && diff <= 3;
            }).map(e => (
              <div
                key={e.id}
                onClick={() => {
                  setSelectedDateKey(e.date);
                  setModalFilter('all');
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white transition-all cursor-pointer text-left shadow-sm"
              >
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${typeColor[e.type]}`}>
                  {e.sessionType || e.type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {e.candidateName ? `${e.candidateName} — ${e.companyName || 'NetBounce'}` : e.title}
                  </div>
                  {e.position && (
                    <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      Role: {e.position} {e.techPerson ? `• Assigned: ${e.techPerson}` : ''}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500 font-medium">{e.date}</div>
                  {e.status && <div className="mt-1"><StatusBadge value={e.status} /></div>}
                </div>
              </div>
            ))}
            {unifiedEvents.length === 0 && (
              <div className="text-sm text-slate-500 py-10 text-center">No events found</div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Enlarged Day Activities Modal */}
      <Dialog open={!!selectedDateKey} onOpenChange={open => !open && setSelectedDateKey(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-2xl">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <CalIcon size={14} />
                <span>Day Activities Breakdown</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => shiftModalDay(-1)}
                  title="Previous Day"
                  className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => shiftModalDay(1)}
                  title="Next Day"
                  className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {formatDateString(selectedDateKey)}
            </DialogTitle>

            <DialogDescription className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>{selectedDayActivities.length} total scheduled {selectedDayActivities.length === 1 ? 'activity' : 'activities'} on this date.</span>
            </DialogDescription>

            {/* Filter Tabs */}
            {selectedDayActivities.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalFilter('all')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    modalFilter === 'all'
                      ? 'bg-[#1416c1] text-white shadow-sm font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  All ({selectedDayActivities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setModalFilter('interviews')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    modalFilter === 'interviews'
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Interviews ({selectedDayActivities.filter(a => a.type === 'interview' || a.taskType === 'Interview').length})
                </button>
                <button
                  type="button"
                  onClick={() => setModalFilter('tasks')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    modalFilter === 'tasks'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Assessments & Tasks ({selectedDayActivities.filter(a => a.type === 'task').length})
                </button>
              </div>
            )}
          </div>

          {/* Modal Body - Activities List */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            {filteredModalActivities.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                  <CalIcon size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">No activities scheduled</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    There are no sessions, tasks, or interviews scheduled for {formatDateString(selectedDateKey)}.
                  </p>
                </div>
              </div>
            ) : (
              filteredModalActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-blue-400 transition-all space-y-3 shadow-sm"
                >
                  {/* Top Row: Candidate Name, Round Type, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        act.type === 'interview'
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : act.type === 'task'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        <UserRound size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-slate-900 truncate">
                          {act.candidateName || act.title}
                        </div>
                        {act.position && (
                          <div className="text-xs text-slate-600 truncate flex items-center gap-1.5 mt-0.5">
                            <Briefcase size={12} className="shrink-0 text-slate-400" />
                            <span>{act.position}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {act.sessionType && (
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${sessionBadgeStyles[act.sessionType] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {act.sessionType}
                        </span>
                      )}
                      <StatusBadge value={act.status || (act.type === 'interview' ? 'Scheduled' : 'Pending')} />
                    </div>
                  </div>

                  {/* Core Details Grid: Company, TSE, Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* Company Box */}
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="h-7 w-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                        <Building2 size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Company</div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {act.companyName || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    {/* Assigned TSE */}
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="h-7 w-7 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                        <UserRound size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Assigned TSE</div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {act.techPerson || 'Unassigned'}
                        </div>
                      </div>
                    </div>

                    {/* Timing & Duration */}
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="h-7 w-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                        <Clock size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Duration / Time</div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {act.time ? `${act.time} (${act.duration || '45m'})` : (act.duration || '30 mins')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remark Banner if present */}
                  {act.remark && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <MessageSquare size={14} className="shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <span className="font-semibold text-amber-900">Remark / Notes: </span>
                        <span>{act.remark}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Showing {filteredModalActivities.length} {filteredModalActivities.length === 1 ? 'item' : 'items'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDateKey(null)}
              className="h-9 px-5 rounded-lg bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
