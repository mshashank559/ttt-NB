import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserRound, Calendar, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, StatusBadge, SectionCard, EmptyState, KpiCard, Pagination } from '../components/common';
import { INTERVIEW_STATUSES, roleIsMarketing } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { formatTaskDate, formatTaskDuration } from './Tasks';

const STAGES = [
  'Scheduled',
  'Interview Rescheduled',
  'Interview Completed - Feedback Received',
  'Interview Completed - Feedback Pending',
  'Cleared',
  'Rejected',
  'Hold',
];

const stageTint = {
  Scheduled: 'border-sky-500/30',
  'Interview Rescheduled': 'border-amber-500/30',
  Rescheduled: 'border-amber-500/30',
  'Interview Completed - Feedback Received': 'border-emerald-500/30',
  'Interview Completed - Feedback Pending': 'border-amber-500/30',
  Cleared: 'border-emerald-500/30',
  Rejected: 'border-rose-500/30',
  Hold: 'border-purple-500/30',
};

const OUTCOMES = ['Selected', 'Rejected', 'On Hold', 'Next Round', 'No Show', 'Offer Released', 'Joined'];

const EvaluationModal = ({ interview, onClose }) => {
  const { submitInterviewFeedback, updateInterviewOutcome } = useApp();
  const [stage, setStage] = useState('Scheduled');
  const [outcome, setOutcome] = useState('Selected');

  React.useEffect(() => {
    if (interview) {
      setStage(interview.status || 'Scheduled');
      const currentOutcome = interview.interviewOutcome || interview.outcome || 'Selected';
      setOutcome(currentOutcome);
    }
  }, [interview]);

  if (!interview) return null;

  const isRejectedOrHold = stage === 'Rejected' || stage === 'Hold';

  const submit = () => {
    const finalOutcome = isRejectedOrHold ? null : outcome;
    if (finalOutcome !== interview.interviewOutcome) {
      updateInterviewOutcome(interview.id, finalOutcome);
    }
    submitInterviewFeedback(interview.id, { stage, decision: finalOutcome, outcome: finalOutcome });
    onClose();
  };

  const isCompletedStage = stage === 'Interview Completed - Feedback Received' ||
    stage === 'Interview Completed - Feedback Pending' ||
    stage === 'Interview Completed';

  return (
    <Dialog open={!!interview} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-md w-full shadow-2xl rounded-2xl p-6" data-testid="evaluation-modal">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-[#1416c1] flex items-center justify-center shrink-0">
              <UserRound size={18} />
            </div>
            <div>
              <DialogTitle className="text-slate-900 text-base font-bold">
                Interview {interview.id}{interview.candidateName ? ` — ${interview.candidateName}` : ''}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs mt-0.5">
                {interview.company ? `${interview.company} · ` : ''}{interview.position || interview.technology || 'Candidate'} · {interview.date} {interview.time || ''}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-3">
          {/* Stage / Status */}
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-700 font-bold block mb-1.5">
              Stage / Status
            </label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger data-testid="feedback-stage" className="bg-slate-50 border-slate-300 text-slate-900 h-10 rounded-xl focus:bg-white text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Interview Outcome: Only show when status is not Rejected or Hold */}
          {!isRejectedOrHold && (
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center justify-between mb-1.5">
                <span>Interview Outcome</span>
                {isCompletedStage && (
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                )}
              </label>
              <Select value={outcome} onValueChange={v => setOutcome(v)}>
                <SelectTrigger data-testid="feedback-outcome" className="bg-slate-50 border-slate-300 text-slate-900 h-10 rounded-xl focus:bg-white text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900">
                  {OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Audit trail of outcome changes (if available) */}
          {interview.outcomeAuditTrail && interview.outcomeAuditTrail.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Outcome History</div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {interview.outcomeAuditTrail.map((trail, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-center justify-between border-b border-slate-100 last:border-0 pb-1">
                    <div>
                      <span className="font-semibold text-slate-800">{trail.changedBy}</span>
                      <span className="text-slate-400"> ({trail.role || 'User'}): </span>
                      {trail.oldValue && trail.oldValue !== 'Unset' ? <span className="line-through text-slate-400 mr-1">{trail.oldValue}</span> : null}
                      <span className="font-semibold text-blue-700">{trail.newValue}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {trail.at ? new Date(trail.at).toLocaleDateString() : ''} {trail.at ? new Date(trail.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Shield size={12} className="text-slate-400" />
            <span>Identity Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="feedback-submit"
              onClick={submit}
              className="h-9 px-5 rounded-xl bg-[#1416c1] hover:bg-[#191bf0] text-white text-xs font-bold cursor-pointer transition-all shadow-sm shadow-blue-600/25 active:scale-[0.98]"
            >
              Update Status
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const getLocalDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function Interviews() {
  const { visibleInterviews, currentRole, currentUser, users, tasks } = useApp();
  const [active, setActive] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  // Default to today's date so users immediately see today's interviews
  const todayStr = useMemo(() => getLocalDateStr(new Date()), []);
  const thisWeekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return {
      from: getLocalDateStr(monday),
      to: getLocalDateStr(sunday),
    };
  }, []);

  const [fromDate, setFromDate] = useState(() => getLocalDateStr(new Date()));
  const [toDate, setToDate] = useState(() => getLocalDateStr(new Date()));
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const isMk = roleIsMarketing(currentRole);

  const isTodayActive = fromDate === todayStr && toDate === todayStr;
  const isThisWeekActive = fromDate === thisWeekRange.from && toDate === thisWeekRange.to;
  const isAllDatesActive = !fromDate && !toDate;

  const dynamicTeams = useMemo(() => {
    const list = [{ id: 'all', label: 'All Teams' }];
    const tls = (users || []).filter(u => u.role === 'marketing_tl');
    tls.forEach(tl => {
      const tId = tl.teamId || tl.team || (
        (tl.name || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
        (tl.name || '').toLowerCase().includes('shivam') ? 'team-shivam' : `team-${tl.id}`
      );
      const teamDisplayName = tl.teamName || (
        (tl.name || '').toLowerCase().includes('mukesh') ? 'Team Mukesh' :
        (tl.name || '').toLowerCase().includes('shivam') ? 'Team Shivam' : `Team ${tl.name.split(' ')[0]}`
      );
      if (!list.some(item => item.id === tId)) {
        list.push({
          id: tId,
          label: `${teamDisplayName} (${tl.name})`,
          shortLabel: teamDisplayName,
          tlId: tl.id,
          leadName: tl.name,
        });
      }
    });
    if (list.length === 1) {
      list.push(
        { id: 'team-mukesh', label: 'Team Mukesh (Mukesh Chaudhary)', shortLabel: 'Team Mukesh', leadName: 'Mukesh Chaudhary' },
        { id: 'team-shivam', label: 'Team Shivam (Shivam Barot)', shortLabel: 'Team Shivam', leadName: 'Shivam Barot' }
      );
    }
    return list;
  }, [users]);

  const selectedTeamMeta = useMemo(() => {
    return dynamicTeams.find(t => t.id === teamFilter) || dynamicTeams[0];
  }, [dynamicTeams, teamFilter]);

  const selectedTeamSrs = useMemo(() => {
    if (teamFilter === 'all') return (users || []).filter(u => u.role === 'marketing_sr');
    return (users || []).filter(u =>
      u.role === 'marketing_sr' && (
        u.teamId === teamFilter ||
        u.team === teamFilter ||
        (teamFilter === 'team-mukesh' && ((u.teamName || '').toLowerCase().includes('mukesh') || u.teamLeadId === 'u-1791911058812')) ||
        (teamFilter === 'team-shivam' && ((u.teamName || '').toLowerCase().includes('shivam') || u.teamLeadId === 'u-1791911115518'))
      )
    );
  }, [users, teamFilter]);

  const teamMemberIds = useMemo(() => {
    if (teamFilter === 'all') return null;
    const ids = new Set();
    if (selectedTeamMeta.tlId) ids.add(selectedTeamMeta.tlId);
    if (teamFilter === 'team-mukesh') ids.add('u-1791911058812');
    if (teamFilter === 'team-shivam') ids.add('u-1791911115518');
    selectedTeamSrs.forEach(sr => ids.add(sr.id));
    return ids;
  }, [teamFilter, selectedTeamMeta, selectedTeamSrs]);

  const teamMemberNames = useMemo(() => {
    if (teamFilter === 'all') return null;
    const names = new Set();
    if (selectedTeamMeta.leadName) names.add(selectedTeamMeta.leadName.toLowerCase());
    selectedTeamSrs.forEach(sr => { if (sr.name) names.add(sr.name.toLowerCase()); });
    return names;
  }, [teamFilter, selectedTeamMeta, selectedTeamSrs]);

  const getInterviewDateStr = (i) => {
    const raw = i.date || i.interviewDateTime || i.dueDate || i.createdAt;
    if (!raw) return '';
    if (typeof raw === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
      const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        return `${year}-${month}-${day}`;
      }
    }
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return getLocalDateStr(d);
    return '';
  };

  const isInterviewMatchingTeam = (iv) => {
    if (teamFilter === 'all') return true;

    // Strict candidate team mapping
    const cName = (iv.candidateName || '').toLowerCase();
    if (teamFilter === 'team-shivam') {
      if (cName.includes('samanvi') || cName.includes('mayuri')) return true;
    }
    if (teamFilter === 'team-mukesh') {
      if (cName.includes('samanvi') || cName.includes('mayuri')) return false;
    }

    const matchingTask = (tasks || []).find(t => t.id === iv.id || t.id === iv.taskId);
    if (matchingTask) {
      const tTeam = (matchingTask.teamId || matchingTask.team || matchingTask.marketingTeam || '').toLowerCase();
      const tName = (matchingTask.teamName || '').toLowerCase();
      const tLead = matchingTask.teamLeadId || '';

      if (teamFilter === 'team-mukesh') {
        if (tTeam === 'team-mukesh' || tName.includes('mukesh') || tLead === 'u-1791911058812') return true;
      } else if (teamFilter === 'team-shivam') {
        if (tTeam === 'team-shivam' || tName.includes('shivam') || tLead === 'u-1791911115518') return true;
      } else if (tTeam === teamFilter.toLowerCase() || tName.includes(teamFilter.toLowerCase())) {
        return true;
      }

      if (teamMemberIds) {
        if (matchingTask.createdById && teamMemberIds.has(matchingTask.createdById)) return true;
        if (matchingTask.creatorId && teamMemberIds.has(matchingTask.creatorId)) return true;
        if (matchingTask.assignedSrId && teamMemberIds.has(matchingTask.assignedSrId)) return true;
        if (matchingTask.recruiterId && teamMemberIds.has(matchingTask.recruiterId)) return true;
      }

      if (matchingTask.createdByName && teamMemberNames?.has(matchingTask.createdByName.toLowerCase())) return true;
      if (matchingTask.assignedSrName && teamMemberNames?.has(matchingTask.assignedSrName.toLowerCase())) return true;
      if (matchingTask.recruiterName && teamMemberNames?.has(matchingTask.recruiterName.toLowerCase())) return true;
    }

    const iTeam = (iv.teamId || iv.team || iv.marketingTeam || '').toLowerCase();
    const iName = (iv.teamName || '').toLowerCase();
    const iLead = iv.teamLeadId || '';

    if (teamFilter === 'team-mukesh') {
      if (iTeam === 'team-mukesh' || iName.includes('mukesh') || iLead === 'u-1791911058812') return true;
    } else if (teamFilter === 'team-shivam') {
      if (iTeam === 'team-shivam' || iName.includes('shivam') || iLead === 'u-1791911115518') return true;
    } else if (iTeam === teamFilter.toLowerCase() || iName.includes(teamFilter.toLowerCase())) {
      return true;
    }

    if (teamMemberIds) {
      if (iv.createdById && teamMemberIds.has(iv.createdById)) return true;
      if (iv.assignedSrId && teamMemberIds.has(iv.assignedSrId)) return true;
      if (iv.recruiterId && teamMemberIds.has(iv.recruiterId)) return true;
    }

    if (iv.assignedSrName && teamMemberNames?.has(iv.assignedSrName.toLowerCase())) return true;
    if (iv.recruiterName && teamMemberNames?.has(iv.recruiterName.toLowerCase())) return true;

    return false;
  };

  const filtered = useMemo(() => {
    return (visibleInterviews || []).filter(i => {
      const matchStatus = statusFilter === 'all' || i.status === statusFilter;
      if (!matchStatus) return false;

      const iDate = getInterviewDateStr(i);
      if (fromDate && (!iDate || iDate < fromDate)) return false;
      if (toDate && (!iDate || iDate > toDate)) return false;

      if (!isInterviewMatchingTeam(i)) return false;

      return true;
    });
  }, [visibleInterviews, statusFilter, fromDate, toDate, teamFilter, teamMemberIds, teamMemberNames, tasks]);

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setTablePage(1);
  };

  const handleClearDates = () => {
    setFromDate('');
    setToDate('');
    setTablePage(1);
  };

  const paginatedTableItems = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize;
    return filtered.slice(start, start + tablePageSize);
  }, [filtered, tablePage, tablePageSize]);

  const totals = {
    scheduled: filtered.filter(i => i.status === 'Scheduled').length,
    rescheduled: filtered.filter(i => i.status === 'Interview Rescheduled' || i.status === 'Rescheduled').length,
    completedReceived: filtered.filter(i => i.status === 'Interview Completed - Feedback Received').length,
    completedPending: filtered.filter(i => i.status === 'Interview Completed - Feedback Pending').length,
    selected: filtered.filter(i => i.interviewOutcome === 'Selected' || i.status === 'Cleared').length,
    rejected: filtered.filter(i => i.interviewOutcome === 'Rejected' || i.status === 'Rejected').length,
    hold: filtered.filter(i => i.interviewOutcome === 'On Hold' || i.status === 'Hold').length,
  };

  const isDateFiltered = Boolean(fromDate || toDate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Pipeline"
        subtitle={isMk ? 'All candidate identities are anonymized by policy.' : 'TSE hiring pipeline across stages.'}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard testid="iv-scheduled" label="Scheduled" value={totals.scheduled} />
        <KpiCard testid="iv-rescheduled" label="Rescheduled" value={totals.rescheduled} />
        <KpiCard testid="iv-completed-rec" label="FB Received" value={totals.completedReceived} />
        <KpiCard testid="iv-completed-pend" label="FB Pending" value={totals.completedPending} />
        <KpiCard testid="iv-cleared" label="Selected" value={totals.selected} />
        <KpiCard testid="iv-rejected" label="Rejected" value={totals.rejected} />
        <KpiCard testid="iv-hold" label="On Hold" value={totals.hold} />
      </div>
      <SectionCard
        title="Filter"
        subtitle={
          isTodayActive
            ? `Today's Interviews — Showing ${filtered.length} of ${(visibleInterviews || []).length} total recorded`
            : isThisWeekActive
            ? `This Week's Interviews — Showing ${filtered.length} of ${(visibleInterviews || []).length} total recorded`
            : isAllDatesActive
            ? `All Dates — Showing all ${(visibleInterviews || []).length} interviews`
            : (isDateFiltered || statusFilter !== 'all')
            ? `Showing ${filtered.length} of ${(visibleInterviews || []).length} interviews`
            : undefined
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* From Date Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 shadow-xs hover:border-[#1416c1] focus-within:border-[#1416c1] transition-colors">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">From:</span>
              <input
                type="date"
                data-testid="iv-filter-from-date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setTablePage(1);
                }}
                className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer"
              />
            </div>

            {/* To Date Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 shadow-xs hover:border-[#1416c1] focus-within:border-[#1416c1] transition-colors">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">To:</span>
              <input
                type="date"
                data-testid="iv-filter-to-date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setTablePage(1);
                }}
                className="text-xs bg-transparent text-slate-800 outline-none font-medium cursor-pointer"
              />
            </div>

            {/* Quick Presets: Today / This Week / All Dates */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setFromDate(todayStr);
                  setToDate(todayStr);
                  setTablePage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isTodayActive
                    ? 'bg-[#1416c1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setFromDate(thisWeekRange.from);
                  setToDate(thisWeekRange.to);
                  setTablePage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isThisWeekActive
                    ? 'bg-[#1416c1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={handleClearDates}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isAllDatesActive
                    ? 'bg-[#1416c1] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                All Dates
              </button>
            </div>

            {/* Reset Dates Button */}
            {isDateFiltered && (
              <button
                type="button"
                data-testid="iv-clear-dates-btn"
                onClick={handleClearDates}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X size={12} />
                <span>Reset Dates</span>
              </button>
            )}

            {/* Team Filter Dropdown */}
            <Select value={teamFilter} onValueChange={(val) => { setTeamFilter(val); setTablePage(1); }}>
              <SelectTrigger data-testid="iv-filter-team" className="w-56 bg-white border-slate-300 text-slate-900 h-9 font-semibold text-xs">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {dynamicTeams.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs font-medium">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Dropdown */}
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger data-testid="iv-filter-status" className="w-40 bg-white border-slate-300 text-slate-900 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="all">All statuses</SelectItem>
                {INTERVIEW_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="interview-kanban">
          {STAGES.map(stage => {
            const items = filtered.filter(i => {
              if (stage === 'Cleared') return i.status === 'Cleared' || (!['Rejected', 'Hold'].includes(i.status) && i.interviewOutcome === 'Selected');
              if (stage === 'Rejected') return i.status === 'Rejected' || i.interviewOutcome === 'Rejected';
              if (stage === 'Hold') return i.status === 'Hold' || i.interviewOutcome === 'On Hold';
              if (stage === 'Interview Rescheduled') return i.status === 'Interview Rescheduled' || i.status === 'Rescheduled';
              return i.status === stage && !['Selected', 'Rejected', 'On Hold'].includes(i.interviewOutcome);
            });
            return (
              <div key={stage} data-testid={`kanban-col-${stage.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className={`kanban-col rounded-xl bg-slate-50/70 border border-slate-200 ${stageTint[stage]} border-l-4 p-3 flex flex-col h-[580px] max-h-[580px]`}>
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="text-xs font-bold text-slate-900 truncate mr-1" title={stage}>{stage}</div>
                  <span className="text-xs tabular-nums text-slate-700 px-2 py-0.5 rounded-full bg-slate-200/70 font-semibold shrink-0">{items.length}</span>
                </div>
                <div className="space-y-2.5 overflow-y-auto pr-1.5 custom-scrollbar flex-1 min-h-0">
                  {items.length === 0 ? (
                    <div className="text-xs text-slate-400 italic px-2 py-6 text-center">No interviews</div>
                  ) : items.map(i => {
                    const interviewer = users.find(u => u.id === i.interviewerId);
                    return (
                      <motion.button
                        key={i.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => setActive(i)}
                        data-testid={`iv-card-${i.id}`}
                        className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="mono text-xs text-blue-700 font-bold">{i.id}</span>
                          <StatusBadge value={i.status} />
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {isMk ? i.id : i.candidateName}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {i.company ? <span className="font-semibold text-slate-800">{i.company} · </span> : null}
                          {i.position} · {i.date} {i.time}
                        </div>
                        {i.interviewOutcome && !['Rejected', 'Hold'].includes(i.status) && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Outcome: {i.interviewOutcome}
                            </span>
                          </div>
                        )}
                        {i.teamName && !isMk && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">{i.teamName}</span>
                            {i.assignedSrName && <span>· SR: {i.assignedSrName}</span>}
                          </div>
                        )}
                        {interviewer && !isMk && (
                          <div className="mt-2 text-[11px] text-indigo-600 font-medium">Interviewer: {interviewer.name}</div>
                        )}
                        {isMk && i.assignedSrName && (
                          <div className="mt-2 text-[11px] text-slate-400">Assigned SR: {i.assignedSrName}</div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
      
      <SectionCard
        title="Interview Queue & Evaluations"
        subtitle={isMk ? "Candidate identities are anonymized per policy. Click any row to evaluate or change stage." : "In-scope interviews. Click any row to view details, evaluate, or update status."}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase tracking-wider border-b border-slate-200 font-semibold">
                <th className="py-2.5">Interview ID</th>
                <th>Candidate</th>
                <th>Company</th>
                <th>Position</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Outcome</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400 italic">No interviews found for this filter.</td>
                </tr>
              ) : paginatedTableItems.map(i => (
                <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setActive(i)}>
                  <td className="py-2.5 mono text-xs text-blue-700 font-semibold">{i.id}</td>
                  <td className="text-slate-900 font-medium text-xs">{i.candidateName || i.title?.split('—')?.[0]?.trim() || i.id}</td>
                  <td className="text-slate-700 font-medium text-xs">{i.company || '—'}</td>
                  <td className="text-slate-900 font-medium text-xs">{i.position}</td>
                  <td className="text-slate-700 text-xs whitespace-nowrap font-medium">{formatTaskDate(i)}</td>
                  <td className="text-slate-800 text-xs whitespace-nowrap font-semibold">{formatTaskDuration(i)}</td>
                  <td><StatusBadge value={i.status} /></td>
                  <td>
                    {i.interviewOutcome && !['Rejected', 'Hold'].includes(i.status) ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                        {i.interviewOutcome}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">—</span>
                    )}
                  </td>
                  <td><span data-testid={`iv-evaluate-${i.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Evaluate →</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={tablePage}
          totalPages={Math.max(1, Math.ceil(filtered.length / tablePageSize))}
          totalItems={filtered.length}
          pageSize={tablePageSize}
          onPageChange={setTablePage}
          onPageSizeChange={setTablePageSize}
        />
      </SectionCard>
      <EvaluationModal interview={active} onClose={() => setActive(null)} />
    </div>
  );
}
