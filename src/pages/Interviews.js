import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Shield, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, StatusBadge, SectionCard, EmptyState, KpiCard } from '../components/common';
import { INTERVIEW_STATUSES, roleIsMarketing } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const STAGES = [
  'Scheduled',
  'Interview Completed - Feedback Received',
  'Interview Completed - Feedback Pending',
  'Interview Completed',
  'Feedback Pending',
  'Cleared',
  'Rejected',
  'Hold',
];

const stageTint = {
  Scheduled: 'border-sky-500/30',
  'Interview Completed - Feedback Received': 'border-emerald-500/30',
  'Interview Completed - Feedback Pending': 'border-amber-500/30',
  'Interview Completed': 'border-indigo-500/30',
  'Feedback Pending': 'border-amber-500/30',
  Cleared: 'border-emerald-500/30',
  Rejected: 'border-rose-500/30',
  Hold: 'border-purple-500/30',
};

const OUTCOMES = ['Selected', 'Rejected', 'On Hold', 'Next Round', 'No Show', 'Offer Released', 'Joined'];

const RatingStars = ({ value, onChange, label, testid }) => (
  <div data-testid={testid}>
    <div className="text-xs uppercase tracking-wider text-slate-400 mb-1.5">{label}</div>
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
          data-testid={`${testid}-${n}`}
        >
          <Star
            size={20}
            className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
          />
        </button>
      ))}
      <span className="ml-2 text-xs text-slate-500 tabular-nums">{value}/5</span>
    </div>
  </div>
);

const EvaluationModal = ({ interview, onClose }) => {
  const { submitInterviewFeedback, updateInterviewOutcome } = useApp();
  const [form, setForm] = useState({
    technical: 4, communication: 4, problem_solving: 4, ts_understanding: 4, overall: 4,
    strengths: '', concerns: '', remarks: '', decision: 'Selected',
  });
  const [stage, setStage] = useState('Scheduled');
  const [outcome, setOutcome] = useState('Selected');

  React.useEffect(() => {
    if (interview) {
      setStage(interview.status || 'Scheduled');
      const currentOutcome = interview.interviewOutcome || interview.outcome || 'Selected';
      setOutcome(currentOutcome);

      if (interview.feedback?.marketingReview) {
        const mr = interview.feedback.marketingReview;
        setForm(f => ({
          ...f,
          overall: mr.overallRating || 4,
          technical: mr.technical || 4,
          communication: mr.communication || 4,
          remarks: mr.feedbackRemarks || '',
          decision: mr.decision || currentOutcome,
        }));
      } else {
        setForm(f => ({ ...f, decision: currentOutcome }));
      }
    }
  }, [interview]);

  if (!interview) return null;

  const submit = () => {
    if (outcome && outcome !== interview.interviewOutcome) {
      updateInterviewOutcome(interview.id, outcome);
    }
    submitInterviewFeedback(interview.id, { ...form, stage, decision: outcome, outcome });
    onClose();
  };

  const isCompletedStage = stage === 'Interview Completed - Feedback Received' ||
    stage === 'Interview Completed - Feedback Pending' ||
    stage === 'Interview Completed';

  return (
    <Dialog open={!!interview} onOpenChange={o => !o && onClose()}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto" data-testid="evaluation-modal">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center"><UserRound size={16} /></div>
            <div>
              <DialogTitle className="text-slate-900">Interview {interview.id}</DialogTitle>
              <DialogDescription className="text-slate-500">
                {interview.company ? `${interview.company} · ` : ''}{interview.position} · {interview.date} {interview.time}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Stage / Status</label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger data-testid="feedback-stage" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 font-semibold flex items-center justify-between">
              <span>Interview Outcome</span>
              {isCompletedStage && (
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Active</span>
              )}
            </label>
            <Select value={outcome} onValueChange={v => { setOutcome(v); setForm(f => ({ ...f, decision: v })); }}>
              <SelectTrigger data-testid="feedback-outcome" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Audit trail of outcome changes */}
          {interview.outcomeAuditTrail && interview.outcomeAuditTrail.length > 0 && (
            <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Outcome Audit Trail</div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {interview.outcomeAuditTrail.map((trail, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-center justify-between border-b border-slate-100 pb-1">
                    <div>
                      <span className="font-semibold text-slate-800">{trail.changedBy}</span>
                      <span className="text-slate-400"> ({trail.role || 'User'}): </span>
                      {trail.oldValue && trail.oldValue !== 'Unset' ? <span className="line-through text-slate-400 mr-1">{trail.oldValue}</span> : null}
                      <span className="font-semibold text-blue-700">{trail.newValue}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {trail.at ? new Date(trail.at).toLocaleDateString() : ''} {trail.at ? new Date(trail.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <RatingStars testid="rate-technical" label="Technical Knowledge" value={form.technical} onChange={v => setForm({...form, technical: v})} />
          <RatingStars testid="rate-communication" label="Communication" value={form.communication} onChange={v => setForm({...form, communication: v})} />
          <RatingStars testid="rate-problem" label="Problem Solving" value={form.problem_solving} onChange={v => setForm({...form, problem_solving: v})} />
          <RatingStars testid="rate-ts" label="Technical Support Understanding" value={form.ts_understanding} onChange={v => setForm({...form, ts_understanding: v})} />
          <div className="md:col-span-2"><RatingStars testid="rate-overall" label="Overall Rating" value={form.overall} onChange={v => setForm({...form, overall: v})} /></div>
          
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Strengths</label>
            <Textarea data-testid="feedback-strengths" rows={3} value={form.strengths} onChange={e => setForm({...form, strengths: e.target.value})} className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white resize-none" placeholder="Highlight standout qualities..." />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Areas of Concern</label>
            <Textarea data-testid="feedback-concerns" rows={3} value={form.concerns} onChange={e => setForm({...form, concerns: e.target.value})} className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white resize-none" placeholder="Growth areas or risks..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-wider text-slate-600 font-semibold">Interview Remarks</label>
            <Textarea data-testid="feedback-remarks" rows={3} value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white resize-none" placeholder="Document overall evaluation feedback..." />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500"><Shield size={12} /> Candidate identity hidden for Marketing roles</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-9 px-4 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-sm hover:bg-slate-200 font-medium cursor-pointer">Cancel</button>
            <button data-testid="feedback-submit" onClick={submit} className="btn-primary h-9 px-4 rounded-lg text-sm font-medium cursor-pointer">Submit Feedback</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function Interviews() {
  const { visibleInterviews, currentRole, currentUser, users } = useApp();
  const [active, setActive] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const isMk = roleIsMarketing(currentRole);

  const filtered = useMemo(() => (visibleInterviews || []).filter(i => statusFilter === 'all' || i.status === statusFilter), [visibleInterviews, statusFilter]);

  const totals = {
    scheduled: filtered.filter(i => i.status === 'Scheduled').length,
    completedReceived: filtered.filter(i => i.status === 'Interview Completed - Feedback Received').length,
    completedPending: filtered.filter(i => i.status === 'Interview Completed - Feedback Pending').length,
    completed: filtered.filter(i => i.status === 'Interview Completed' || i.status === 'Interview Completed - Feedback Received' || i.status === 'Interview Completed - Feedback Pending').length,
    pending: filtered.filter(i => i.status === 'Feedback Pending' || i.status === 'Interview Completed - Feedback Pending').length,
    selected: filtered.filter(i => i.interviewOutcome === 'Selected' || i.status === 'Cleared').length,
    rejected: filtered.filter(i => i.interviewOutcome === 'Rejected' || i.status === 'Rejected').length,
    hold: filtered.filter(i => i.interviewOutcome === 'On Hold' || i.status === 'Hold').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Pipeline"
        subtitle={isMk ? 'All candidate identities are anonymized by policy.' : 'TSE hiring pipeline across stages.'}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard testid="iv-scheduled" label="Scheduled" value={totals.scheduled} />
        <KpiCard testid="iv-completed-rec" label="FB Received" value={totals.completedReceived} />
        <KpiCard testid="iv-completed-pend" label="FB Pending" value={totals.completedPending} />
        <KpiCard testid="iv-completed" label="Total Completed" value={totals.completed} />
        <KpiCard testid="iv-cleared" label="Selected" value={totals.selected} />
        <KpiCard testid="iv-rejected" label="Rejected" value={totals.rejected} />
        <KpiCard testid="iv-hold" label="On Hold" value={totals.hold} />
      </div>
      <SectionCard title="Filter" actions={
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="iv-filter-status" className="w-44 bg-white border-slate-300 text-slate-900 h-9"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white border-slate-200 text-slate-900">
            <SelectItem value="all">All statuses</SelectItem>
            {INTERVIEW_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" data-testid="interview-kanban">
          {STAGES.map(stage => {
            const items = filtered.filter(i => i.status === stage);
            return (
              <div key={stage} className={`kanban-col rounded-xl bg-slate-50/70 border border-slate-200 ${stageTint[stage]} border-l-4 p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-900 truncate mr-1" title={stage}>{stage}</div>
                  <span className="text-xs tabular-nums text-slate-700 px-2 py-0.5 rounded-full bg-slate-200/70 font-semibold shrink-0">{items.length}</span>
                </div>
                <div className="space-y-2.5">
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
                        {i.interviewOutcome && (
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
                <th>Date & Time</th>
                <th>Status</th>
                <th>Outcome</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400 italic">No interviews found for this filter.</td>
                </tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setActive(i)}>
                  <td className="py-2.5 mono text-xs text-blue-700 font-semibold">{i.id}</td>
                  <td className="text-slate-900 font-medium text-xs">{isMk ? i.id : i.candidateName}</td>
                  <td className="text-slate-700 font-medium text-xs">{i.company || '—'}</td>
                  <td className="text-slate-900 font-medium text-xs">{i.position}</td>
                  <td className="text-slate-600 text-xs">{i.date} {i.time}</td>
                  <td><StatusBadge value={i.status} /></td>
                  <td>
                    {i.interviewOutcome ? (
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
      </SectionCard>
      <EvaluationModal interview={active} onClose={() => setActive(null)} />
    </div>
  );
}
