import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, UserRound, Calendar as CalIcon, Clock, Building2, Briefcase, FileText, StickyNote, MessageSquare, ShieldAlert, CheckCircle2, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { PageHeader, StatusBadge, TaskTypeBadge, SectionCard, EmptyState } from '../components/common';
import { TASK_TYPES, TASK_STATUSES, MARKETING_TEAMS, getTseCodeName, getTsmCodeName, roleIsMarketing, getInterviewTimingMeta, sortTasksByInterviewPriority, getSmartTseRecommendations, INTERVIEW_OUTCOMES } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';

const roleCanCreate = (r) => r === 'tsm' || r === 'management' || r === 'marketing_tl' || r === 'marketing_sr' || r === 'recruiter';
const roleCanEditAny = (r) => r === 'tsm' || r === 'management';

const CreateTaskModal = ({ open, onOpenChange }) => {
  const { users, addTask, tasks, feedbacks, currentRole, currentUser } = useApp();
  const tseUsers = users.filter(u => u.role === 'tse');
  const todayStr = new Date().toISOString().slice(0, 10);

  const isMarketingUser = roleIsMarketing(currentRole) || currentRole === 'marketing_tl' || currentRole === 'marketing_sr';

  const userTeamId = currentUser?.teamId ||
    (currentUser?.team === 'team-mukesh' || currentUser?.id === 'u-1791911058812' || (currentUser?.name || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
     currentUser?.team === 'team-shivam' || currentUser?.id === 'u-1791911115518' || (currentUser?.name || '').toLowerCase().includes('shivam') ? 'team-shivam' : '');
  const initialTeam = (userTeamId && MARKETING_TEAMS.find(t => t.id === userTeamId)) || MARKETING_TEAMS[0];

  const [form, setForm] = useState({
    date: todayStr,
    assigneeId: isMarketingUser ? '' : (tseUsers[0]?.id || ''),
    duration: '30 mins',
    taskType: 'Interview',
    interviewDateTime: '',
    candidateName: '',
    position: '',
    companyName: '',
    status: 'Pending',
    teamId: initialTeam.id,
    teamName: initialTeam.name,
    teamLeadId: initialTeam.leadId,
    assignedSrId: '',
    assignedSrName: '',
    assignedSrEmail: '',
    remark: '',
    description: '',
    notes: '',
  });

  // Dynamic Senior Recruiters mapped from MongoDB Atlas / DB users
  const availableSrs = useMemo(() => {
    const targetTeamId = form.teamId || initialTeam.id;
    return (users || []).filter(u =>
      u.role === 'marketing_sr' &&
      (u.teamId === targetTeamId || u.team === targetTeamId ||
       (targetTeamId === 'team-mukesh'
          ? (u.teamName?.includes('Mukesh') || u.teamLeadId === 'u-1791911058812' || (u.name && ['Snehal', 'Ritik', 'Ausafkhan', 'Himanshu', 'Deepkumar', 'Rohan', 'Mukesh'].some(part => u.name.includes(part))))
          : (u.teamName?.includes('Shivam') || u.teamLeadId === 'u-1791911115518' || (u.name && ['Vishal', 'Riyen', 'Smit', 'Rehan', 'Yug', 'Jinesh'].some(part => u.name.includes(part))))
       )
      )
    );
  }, [users, form.teamId, initialTeam.id]);

  // Sync team & clear inputs whenever modal opens
  useEffect(() => {
    if (open) {
      setForm(prev => ({
        ...prev,
        position: '',
        companyName: '',
        candidateName: '',
        teamId: isMarketingUser ? initialTeam.id : prev.teamId || initialTeam.id,
        teamName: isMarketingUser ? initialTeam.name : prev.teamName || initialTeam.name,
        teamLeadId: isMarketingUser ? initialTeam.leadId : prev.teamLeadId || initialTeam.leadId,
        assignedSrId: '',
        assignedSrName: '',
        assignedSrEmail: '',
        assigneeId: isMarketingUser ? '' : (prev.assigneeId || tseUsers[0]?.id || ''),
      }));
    }
  }, [open, isMarketingUser, initialTeam]);

  // Candidate Prior History
  const priorHistory = useMemo(() => {
    if (!form.candidateName.trim()) return [];
    const q = form.candidateName.trim().toLowerCase();
    const pastTasks = (tasks || []).filter(t => (t.candidateName || '').toLowerCase() === q);
    const pastFeedbacks = (feedbacks || []).filter(f => (f.candidateName || '').toLowerCase() === q);
    return pastTasks.map(t => {
      const fb = pastFeedbacks.find(f => f.taskId === t.id || f.candidateName?.toLowerCase() === q);
      const rating = fb?.candidateFeedback?.performanceRating || fb?.candidateFeedback?.experienceRating;
      return {
        date: t.date || t.dueDate,
        techPerson: roleIsMarketing(currentRole) ? (t.techPersonId || 'TSE-ID') : t.techPerson,
        companyName: t.companyName,
        status: t.status,
        rating,
      };
    });
  }, [form.candidateName, tasks, feedbacks, currentRole]);

  // Smart Recommendations for TSM
  const recommendations = useMemo(() => {
    if (isMarketingUser) return [];
    return getSmartTseRecommendations(form.candidateName, tasks, feedbacks, tseUsers);
  }, [form.candidateName, tasks, feedbacks, tseUsers, isMarketingUser]);

  const handleTeamChange = (teamId) => {
    const selectedTeam = MARKETING_TEAMS.find(t => t.id === teamId) || MARKETING_TEAMS[0];
    setForm(prev => ({
      ...prev,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      teamLeadId: selectedTeam.leadId,
      assignedSrId: '',
      assignedSrName: '',
      assignedSrEmail: '',
    }));
  };

  const resetForm = () => {
    setForm({
      date: todayStr,
      assigneeId: isMarketingUser ? '' : (tseUsers[0]?.id || ''),
      duration: '30 mins',
      taskType: 'Interview',
      interviewDateTime: '',
      candidateName: '',
      position: '',
      companyName: '',
      status: 'Pending',
      teamId: initialTeam.id,
      teamName: initialTeam.name,
      teamLeadId: initialTeam.leadId,
      assignedSrId: '',
      assignedSrName: '',
      assignedSrEmail: '',
      remark: '',
      description: '',
      notes: '',
    });
  };

  const submit = () => {
    if (!form.candidateName.trim()) {
      toast.error('Please enter the candidate name');
      return;
    }
    const selectedTse = tseUsers.find(u => u.id === form.assigneeId);
    const taskDate = form.taskType === 'Interview' && form.interviewDateTime
      ? form.interviewDateTime.slice(0, 10)
      : form.date;

    addTask({
      ...form,
      date: taskDate,
      dueDate: taskDate,
      assigneeId: isMarketingUser ? '' : (selectedTse?.id || ''),
      techPerson: isMarketingUser ? 'Unassigned' : (selectedTse?.name || 'Unassigned'),
      codeName: isMarketingUser ? 'Unassigned' : (selectedTse?.codeName || (selectedTse?.name ? getTseCodeName(selectedTse?.name) : 'Unassigned')),
      assignedSrId: form.assignedSrId || '',
      assignedSrName: form.assignedSrName || '',
      assignedSrEmail: form.assignedSrEmail || '',
      recruiterName: form.assignedSrName || '',
      title: `${form.candidateName.trim()} — ${form.taskType}${form.companyName ? ` (${form.companyName.trim()})` : ''}`,
      category: form.taskType,
      interviewDateTime: form.taskType === 'Interview' ? form.interviewDateTime : '',
    });
    toast.success('Task created successfully!');
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" data-testid="create-task-modal">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg">Create New Task / Candidate Record</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            {isMarketingUser
              ? `Create task under ${initialTeam.name} (${initialTeam.leadName}). All Senior Recruiters mapped dynamically from DB.`
              : 'Assign candidate task with Marketing Team Lead ownership & designated Tech Support Engineer.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Step 1: Marketing Team Lead */}
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Marketing Team Lead</span>
              <span className="text-rose-500">*</span>
            </label>
            {isMarketingUser ? (
              <div className="mt-1.5 h-10 px-3.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold flex items-center justify-between">
                <span>{initialTeam.name} ({initialTeam.leadName})</span>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Your Team
                </span>
              </div>
            ) : (
              <Select value={form.teamId} onValueChange={handleTeamChange}>
                <SelectTrigger data-testid="task-form-team" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                  <SelectValue placeholder="Select Marketing Team" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900">
                  {MARKETING_TEAMS.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.leadName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Step 2: Senior Recruiter (Marketing SR) mapped dynamically from DB */}
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Senior Recruiter (Marketing SR)</span>
              <span className="text-rose-500">*</span>
            </label>
            <Select
              value={form.assignedSrId}
              onValueChange={(srId) => {
                const srUser = availableSrs.find(u => u.id === srId);
                setForm(prev => ({
                  ...prev,
                  assignedSrId: srId,
                  assignedSrName: srUser?.name || '',
                  assignedSrEmail: srUser?.email || '',
                  recruiterName: srUser?.name || '',
                }));
              }}
            >
              <SelectTrigger data-testid="task-form-sr" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white text-xs">
                <SelectValue placeholder="Select Senior Recruiter" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900 max-h-56">
                {availableSrs.map(sr => (
                  <SelectItem key={sr.id} value={sr.id}>
                    {sr.name} ({sr.empId || sr.tttNbId || 'SR'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              {availableSrs.length > 0
                ? `Mapped from DB (${availableSrs.length} SRs in ${form.teamName || initialTeam.name})`
                : 'No SRs registered in this team yet'}
            </p>
          </div>

          {/* Task Type */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Task (Type)</label>
            <Select value={form.taskType} onValueChange={v => setForm({ ...form, taskType: v })}>
              <SelectTrigger data-testid="task-form-type" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {TASK_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Single Date Field (ONLY 1 DATE FIELD) */}
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={12} className="text-blue-600" />
              <span>{form.taskType === 'Interview' ? 'Interview Date & Time (EST)' : 'Date'}</span>
              <span className="text-rose-500">*</span>
            </label>
            <Input
              type={form.taskType === 'Interview' ? 'datetime-local' : 'date'}
              data-testid="task-form-single-date"
              value={form.taskType === 'Interview' ? form.interviewDateTime : form.date}
              onChange={e => {
                const val = e.target.value;
                if (form.taskType === 'Interview') {
                  setForm(prev => ({
                    ...prev,
                    interviewDateTime: val,
                    date: val ? val.slice(0, 10) : prev.date
                  }));
                } else {
                  setForm(prev => ({ ...prev, date: val }));
                }
              }}
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white text-xs"
            />
            {form.taskType === 'Interview' && (
              <p className="text-[10px] text-blue-700 mt-1 font-medium">
                EST standard timing · Auto-reminds 30 min before call.
              </p>
            )}
          </div>

          {/* Tech Person (TSE) - Only visible when NOT Marketing TL / SR */}
          {!isMarketingUser && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tech Person (TSE)</label>
              <Select value={form.assigneeId} onValueChange={v => setForm({ ...form, assigneeId: v })}>
                <SelectTrigger data-testid="task-form-assignee" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                  <SelectValue placeholder="Select TSE" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900">
                  {tseUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.codeName || getTseCodeName(u.name)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration</label>
            <Input
              data-testid="task-form-duration"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. 30 mins, 15 mins, 2 hr, 70 mins"
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
            />
          </div>

          {/* Candidate Name */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Candidate Name</label>
            <Input
              data-testid="task-form-candidate"
              value={form.candidateName}
              onChange={e => setForm({ ...form, candidateName: e.target.value })}
              placeholder="e.g. Shubhangi Mishra"
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
            />
          </div>

          {/* Candidate Prior History Preview (Milestone 4 & 7) */}
          {priorHistory.length > 0 && (
            <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Briefcase size={13} className="text-blue-600" />
                  Past Candidate Engagements ({priorHistory.length})
                </span>
                <span className="text-[11px] text-slate-500">Historical Tracking</span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {priorHistory.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div>
                      <span className="font-semibold text-slate-900">{h.companyName}</span>
                      <span className="text-slate-500"> · {h.date} · TSE: </span>
                      <span className="font-medium text-blue-700">{h.techPerson}</span>
                    </div>
                    <div>
                      {h.rating ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                          ⭐ {h.rating}/5
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {h.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart TSE Advisory Recommendations (Milestone 7) */}
          {recommendations.length > 0 && !roleIsMarketing(currentRole) && (
            <div className="md:col-span-2 p-2.5 bg-gradient-to-r from-amber-50/80 to-blue-50/80 border border-amber-200/80 rounded-xl space-y-1.5">
              <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                <span>💡 Smart TSE Advisory Recommendation:</span>
              </div>
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                    rec.type === 'recommend'
                      ? 'bg-emerald-50/90 text-emerald-950 border-emerald-300'
                      : 'bg-rose-50/90 text-rose-950 border-rose-300'
                  }`}
                >
                  <span className="font-medium">{rec.message}</span>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, assigneeId: rec.tseId }))}
                    className="px-2.5 py-1 text-[11px] font-bold rounded bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    Select {rec.tseName}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Position */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</label>
            <Input
              data-testid="task-form-position"
              value={form.position}
              onChange={e => setForm({ ...form, position: e.target.value })}
              placeholder="e.g. Data Scientist, SWE, Data Analyst"
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Company Name</label>
            <Input
              data-testid="task-form-company"
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g. Google, Apple, Amazon"
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger data-testid="task-form-status" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {TASK_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remark */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Remark</label>
            <Input
              data-testid="task-form-remark"
              value={form.remark}
              onChange={e => setForm({ ...form, remark: e.target.value })}
              placeholder="e.g. Candidate has started by himself, Available after 4 pm"
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
            <Textarea
              data-testid="task-form-desc"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white resize-none"
              placeholder="Add candidate assessment details, questions or runbook steps..."
            />
          </div>

          {/* Additional Note */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Additional Note</label>
            <Textarea
              data-testid="task-form-notes"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white resize-none"
              placeholder="Add internal handover notes, additional instructions..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-sm hover:bg-slate-200 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            data-testid="task-form-submit"
            onClick={submit}
            className="btn-primary h-9 px-5 rounded-lg text-sm font-medium cursor-pointer"
          >
            Create Task
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskDrawer = ({ task, onClose }) => {
  const { users, reassignTask, changeTaskStatus, assignMarketingSr, currentRole, currentUser, updateInterviewOutcome } = useApp();
  const assignee = users.find(u => u.id === task?.assigneeId);
  const creator = users.find(u => u.id === task?.createdById);
  const tseUsers = users.filter(u => u.role === 'tse');
  const canEdit = roleCanEditAny(currentRole) || task?.assigneeId === currentUser?.id;
  const [completionRemark, setCompletionRemark] = useState(task?.completionRemark || task?.remark || '');

  const eligibleSrs = useMemo(() => {
    const allSrs = (users || []).filter(u => u.role === 'marketing_sr');
    const teamSrs = allSrs.filter(u => 
      u.teamId === task?.teamId || 
      (task?.teamId === 'team-mukesh' ? (u.teamName?.includes('Mukesh') || u.teamLeadId === 'u-1791911058812') : (u.teamName?.includes('Shivam') || u.teamLeadId === 'u-1791911115518'))
    );
    return teamSrs.length > 0 ? teamSrs : allSrs;
  }, [users, task?.teamId]);

  const handleCopyFeedbackLink = (t) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const recruiter = t.assignedSrName || t.recruiterName || 'Marketing SR';
    const tseId = t.assigneeId || 'TSE-NB-001';
    const tseName = t.techPerson || 'Technical Support';
    const link = `${origin}${pathname}#/candidate-saga?id=fb-task-${t.id}&recruiter=${encodeURIComponent(recruiter)}&tseId=${encodeURIComponent(tseId)}&tseName=${encodeURIComponent(tseName)}&candidate=${encodeURIComponent(t.candidateName || '')}&company=${encodeURIComponent(t.companyName || '')}&type=${encodeURIComponent(t.taskType || 'Interview')}`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link);
      }
    } catch (e) {}

    toast.success(`Feedback Link generated & copied for candidate: ${t.candidateName}!`);
  };

  if (!task) return null;

  const timingMeta = task.interviewDateTime ? getInterviewTimingMeta(task.interviewDateTime) : null;

  return (
    <Sheet open={!!task} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="bg-white border-l border-slate-200 text-slate-900 w-full sm:max-w-xl p-0 shadow-2xl" data-testid="task-drawer">
        <SheetHeader className="p-5 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mono text-xs text-blue-600 font-semibold">{task.id}</div>
              <SheetTitle className="text-slate-900 mt-1 text-lg font-bold leading-tight">
                {task.candidateName || task.title}
              </SheetTitle>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <TaskTypeBadge value={task.taskType || task.category} />
                <StatusBadge value={task.status} />
                {task.companyName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
                    <Building2 size={11} className="text-slate-500" />
                    {task.companyName}
                  </span>
                )}
                {task.interviewOutcome && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-800 font-bold flex items-center gap-1">
                    🎯 {task.interviewOutcome}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="p-5 space-y-5 overflow-y-auto h-[calc(100vh-140px)]">
          {/* Milestone 2: EST Interview Timing & Urgent Priority Alert Banner */}
          {timingMeta && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              timingMeta.isUrgent
                ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-xs'
                : timingMeta.isElevated
                ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold shadow-xs'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <div className="flex items-center gap-2">
                <Clock size={16} className={timingMeta.isUrgent ? 'text-rose-600 animate-pulse' : 'text-blue-600'} />
                <div>
                  <div className="font-bold">Interview Schedule (EST)</div>
                  <div className="text-[11px] opacity-90">{timingMeta.estFormatted}</div>
                </div>
              </div>
              <div className="text-right">
                {timingMeta.isUrgent && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                    🚨 URGENT (&lt;30m)
                  </span>
                )}
                {timingMeta.isElevated && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    ⚡ PRIORITY (&lt;60m)
                  </span>
                )}
                {!timingMeta.isUrgent && !timingMeta.isElevated && (
                  <span className="text-slate-600 text-[11px]">Scheduled</span>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Senior Recruiter (Marketing SR) Assignment */}
          {(() => {
            const isAssigned = Boolean(task.assignedSrId || task.assignedSrName);
            const isTechRole = currentRole === 'tsm' || currentRole === 'tse';
            const canChangeSr = currentRole === 'marketing_tl' || currentRole === 'management' || currentRole === 'upper_management';

            // If user is TSM or TSE and SR is assigned -> Show LOCKED view!
            if (isTechRole && isAssigned) {
              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                      <UserRound size={13} className="text-blue-600" />
                      <span>Senior Recruiter (Marketing SR)</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold border border-slate-300 flex items-center gap-1">
                      <Lock size={10} />
                      Locked (Assigned)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {(task.assignedSrName || 'SR').charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{task.assignedSrName}</div>
                        <div className="text-[11px] text-slate-500">{task.teamName || 'Marketing Team'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 flex items-center gap-1">
                      <Lock size={10} /> Read-only for {currentRole === 'tsm' ? 'TSM' : 'TSE'}
                    </span>
                  </div>
                </div>
              );
            }

            // If user is TSM or TSE and NOT assigned
            if (isTechRole && !isAssigned) {
              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                      <UserRound size={13} className="text-blue-600" />
                      <span>Senior Recruiter (Marketing SR)</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                      Awaiting Assignment
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-dashed border-slate-300 text-xs text-slate-500 italic flex items-center justify-between">
                    <span>No SR assigned yet</span>
                    <span className="text-[11px] text-amber-600 font-medium">To be assigned by Marketing TL</span>
                  </div>
                </div>
              );
            }

            // If user can change SR (Marketing TL or Management)
            if (canChangeSr) {
              return (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-blue-950 font-bold flex items-center gap-1.5">
                      <UserRound size={13} className="text-blue-600" />
                      <span>Assign Senior Recruiter (Marketing SR)</span>
                    </label>
                    {task.assignedSrName ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-300">
                        Assigned: {task.assignedSrName}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 animate-pulse">
                        SR Unassigned
                      </span>
                    )}
                  </div>
                  <Select
                    value={task.assignedSrId || ''}
                    onValueChange={srId => {
                      const srUser = eligibleSrs.find(u => u.id === srId);
                      if (srUser && assignMarketingSr) {
                        assignMarketingSr(task.id, srUser);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="task-assign-sr" className="bg-white border-blue-300 text-slate-900 h-9">
                      <SelectValue placeholder={task.assignedSrName ? `Current: ${task.assignedSrName}` : "Select Senior Recruiter (SR)..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      {eligibleSrs.map(sr => (
                        <SelectItem key={sr.id} value={sr.id}>
                          {sr.name} {sr.teamName ? `(${sr.teamName})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            return null;
          })()}

          {/* Quick info grid */}
          <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <CalIcon size={12} className="text-blue-600" /> Date
              </div>
              <div className="text-sm font-semibold text-slate-900 mono">{task.date || task.dueDate}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Clock size={12} className="text-blue-600" /> Duration
              </div>
              <div className="text-sm font-semibold text-slate-900">{task.duration || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <UserRound size={12} className="text-blue-600" /> {roleIsMarketing(currentRole) ? 'Tech ID' : 'Tech Person (TSE)'}
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {roleIsMarketing(currentRole)
                  ? (assignee?.empId || assignee?.tttNbId || task.techPersonId || task.assigneeId || 'TSE-ID')
                  : (assignee?.name || task.techPerson || 'Unassigned')}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 size={12} className="text-blue-600" /> Marketing Team
              </div>
              <div className="text-sm font-semibold text-slate-900">{task.teamName || 'Team Mukesh'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <UserRound size={12} className="text-blue-600" /> Senior Recruiter (SR)
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {task.assignedSrName ? (
                  <span className="text-blue-700 font-bold">{task.assignedSrName}</span>
                ) : (
                  <span className="text-amber-700 font-medium italic">Pending Assignment</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Briefcase size={12} className="text-blue-600" /> Position
              </div>
              <div className="text-sm font-semibold text-slate-900">{task.position || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 size={12} className="text-blue-600" /> Company
              </div>
              <div className="text-sm font-semibold text-slate-900">{task.companyName || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                <UserRound size={12} className="text-blue-600" /> Created By
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {roleIsMarketing(currentRole) ? (creator?.empId || creator?.tttNbId || 'TSM-ID') : (creator?.name || 'TSM')}
              </div>
            </div>
          </div>

          {/* Remark */}
          {task.remark && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                <MessageSquare size={13} className="text-amber-600" /> Remark
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">{task.remark}</p>
            </div>
          )}

          {/* Step 4: TSE Completion Remarks (Visible to all) */}
          {task.completionRemark && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={13} className="text-emerald-600" /> TSE Completion Remarks (Visible to all)
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">{task.completionRemark}</p>
            </div>
          )}

          {/* Step 5: Automatically Enable Feedback Form Generation */}
          {task.status === 'Done' ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-300 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>Candidate Feedback Form Generation</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                  Ready
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Task is marked Done. {task.assignedSrName ? `Assigned SR (${task.assignedSrName})` : 'Assigned Senior Recruiter'} can now generate and share the candidate feedback link.
              </p>
              <button
                type="button"
                data-testid="generate-feedback-link-btn"
                onClick={() => handleCopyFeedbackLink(task)}
                className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Sparkles size={13} /> Generate &amp; Copy Candidate Feedback Link
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span>Candidate Feedback Link</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">
                Locked (Unlocks when TSE marks Done)
              </span>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-500" /> Description
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
              <StickyNote size={13} className="text-slate-500" /> Additional Note
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {task.notes || 'No additional notes recorded.'}
            </div>
          </div>

          {/* Status & Assignee Controls with Mandatory Remarks on Done */}
          {canEdit && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-semibold">Update Status</label>
                  <Select
                    value={task.status}
                    onValueChange={v => {
                      if (v === 'Done') {
                        if (!completionRemark.trim()) {
                          toast.error('Please enter completion remarks below before marking Done.');
                        } else {
                          changeTaskStatus(task.id, 'Done', completionRemark.trim());
                        }
                      } else {
                        changeTaskStatus(task.id, v);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="task-change-status" className="mt-1 bg-white border-slate-300 text-slate-900 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {roleCanEditAny(currentRole) && (
                  <div>
                    <label className="text-xs text-slate-600 font-semibold">Reassign TSE</label>
                    <Select value={task.assigneeId} onValueChange={v => reassignTask(task.id, v)}>
                      <SelectTrigger data-testid="task-reassign" className="mt-1 bg-white border-slate-300 text-slate-900 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900">
                        {tseUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Completion remarks input */}
              <div className="pt-2 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>TSE Completion Remarks</span>
                  <span className="text-[10px] text-slate-500">Visible to all</span>
                </label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    data-testid="completion-remark-input"
                    value={completionRemark}
                    onChange={e => setCompletionRemark(e.target.value)}
                    placeholder="Enter candidate evaluation remarks &amp; details..."
                    className="bg-white border-slate-300 text-xs h-9"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!completionRemark.trim()) {
                        toast.error('Please enter completion remarks before saving as Done.');
                        return;
                      }
                      changeTaskStatus(task.id, 'Done', completionRemark.trim());
                      toast.success('Task marked as Done with completion remarks!');
                    }}
                    className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Milestone 6: Marketing TL & TSM Interview Outcome Selection */}
          {(currentRole === 'marketing_tl' || currentRole === 'tsm' || currentRole === 'management' || currentRole === 'upper_management') && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
              <label className="text-xs text-purple-900 font-bold block mb-1.5 flex items-center justify-between">
                <span>🎯 Interview Outcome Decision</span>
                <span className="text-[10px] text-purple-600 font-normal">Marketing TL &amp; TSM</span>
              </label>
              <Select
                value={task.interviewOutcome || ''}
                onValueChange={v => updateInterviewOutcome && updateInterviewOutcome(task.id, v)}
              >
                <SelectTrigger data-testid="task-interview-outcome" className="bg-white border-purple-300 text-slate-900 h-9">
                  <SelectValue placeholder="Mark Outcome (Passed, Failed, Next Round, Offer)" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900">
                  {INTERVIEW_OUTCOMES.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Activity timeline</div>
            <ol className="space-y-3 relative pl-4 border-l border-slate-200">
              {task.timeline?.map((ev, idx) => (
                <li key={idx} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-white" />
                  <div className="text-sm font-medium text-slate-800">{ev.event}</div>
                  <div className="text-xs text-slate-500">{ev.by} · {ev.at}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default function Tasks() {
  const { tasks, users, currentRole, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState({ status: 'all', taskType: 'all', assignee: 'all', q: '' });
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    if (location.search.includes('create=1')) {
      setCreateOpen(true);
      navigate('/tasks', { replace: true });
    }
  }, [location, navigate]);

  const filtered = useMemo(() => {
    let base = tasks;
    if (currentRole === 'tse') {
      base = base.filter(t => t.assigneeId === currentUser?.id || (currentUser?.name && t.techPerson?.toLowerCase() === currentUser?.name?.toLowerCase()));
    }
    return base.filter(t => {
      const matchStatus = filters.status === 'all' || t.status === filters.status;
      const matchType = filters.taskType === 'all' || t.taskType === filters.taskType;
      const matchAssignee = filters.assignee === 'all' || t.assigneeId === filters.assignee;
      const query = filters.q.toLowerCase().trim();
      const matchQ = !query ||
        (t.candidateName && t.candidateName.toLowerCase().includes(query)) ||
        (t.companyName && t.companyName.toLowerCase().includes(query)) ||
        (t.position && t.position.toLowerCase().includes(query)) ||
        (t.techPerson && t.techPerson.toLowerCase().includes(query)) ||
        (t.codeName && t.codeName.toLowerCase().includes(query)) ||
        (t.remark && t.remark.toLowerCase().includes(query)) ||
        (t.taskType && t.taskType.toLowerCase().includes(query)) ||
        (t.id && t.id.toLowerCase().includes(query));
      return matchStatus && matchType && matchAssignee && matchQ;
    });
  }, [tasks, filters, currentRole, currentUser]);

  // Milestone 2: Automated Priority Sorting (Urgent & Elevated at the top)
  const sortedTasks = useMemo(() => {
    return sortTasksByInterviewPriority(filtered);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentRole === 'tse' ? 'My Tasks' : 'Tasks'}
        subtitle={currentRole === 'tse' ? 'Your personal task queue — update status to keep your TSM informed.' : 'All active work across your team from Task Sheet.'}
        actions={roleCanCreate(currentRole) ? (
          <button
            data-testid="create-task-btn"
            onClick={() => setCreateOpen(true)}
            className="btn-primary h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus size={14} /> Create Task
          </button>
        ) : null}
      />

      {/* Filters */}
      <SectionCard title="Filters" subtitle={`${sortedTasks.length} of ${tasks.length} tasks`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              data-testid="task-filter-search"
              value={filters.q}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              placeholder="Search candidate, company, position, tech person, remark..."
              className="pl-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <Select value={filters.status} onValueChange={v => setFilters({ ...filters, status: v })}>
            <SelectTrigger data-testid="task-filter-status" className="bg-white border-slate-300 text-slate-900">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All statuses</SelectItem>
              {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.taskType} onValueChange={v => setFilters({ ...filters, taskType: v })}>
            <SelectTrigger data-testid="task-filter-type" className="bg-white border-slate-300 text-slate-900">
              <SelectValue placeholder="All task types" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All task types</SelectItem>
              {TASK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          {currentRole !== 'tse' && (
            <Select value={filters.assignee} onValueChange={v => setFilters({ ...filters, assignee: v })}>
              <SelectTrigger data-testid="task-filter-assignee" className="bg-white border-slate-300 text-slate-900">
                <SelectValue placeholder="All Tech Persons" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="all">All Tech Persons</SelectItem>
                {users.filter(u => u.role === 'tse').map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {roleIsMarketing(currentRole) ? (u.empId || u.tttNbId || u.id) : u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </SectionCard>

      {/* Task Queue Table */}
      <SectionCard title="Task queue">
        {sortedTasks.length === 0 ? (
          <EmptyState title="No tasks match" description="Try clearing a filter or create a new task." />
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-left text-xs text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Date / EST Timing</th>
                  <th className="py-3 px-4 font-semibold">{roleIsMarketing(currentRole) ? 'Tech ID' : 'Tech Person'}</th>
                  <th className="py-3 px-3 font-semibold">Duration</th>
                  <th className="py-3 px-3 font-semibold">Task</th>
                  <th className="py-3 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">Company name</th>
                  <th className="py-3 px-4 font-semibold">Status / Outcome</th>
                  <th className="py-3 px-4 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map(t => {
                  const a = users.find(u => u.id === t.assigneeId);
                  const isMarketing = roleIsMarketing(currentRole);
                  const techName = isMarketing
                    ? (a?.empId || a?.tttNbId || t.techPersonId || t.assigneeId || 'TSE-ID')
                    : (a?.name || t.techPerson || 'Unassigned');
                  const timing = t.interviewDateTime ? getInterviewTimingMeta(t.interviewDateTime) : null;

                  return (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={t.id}
                      data-testid={`task-row-${t.id}`}
                      onClick={() => setActiveTask(t)}
                      className={`border-b transition-colors cursor-pointer ${
                        timing?.isUrgent
                          ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70'
                          : timing?.isElevated
                          ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {/* Date & EST Timing */}
                      <td className="py-3 px-4 mono text-xs text-slate-600 whitespace-nowrap">
                        <div>{t.date || t.dueDate}</div>
                        {timing && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock size={11} className={timing.isUrgent ? 'text-rose-600 animate-pulse' : 'text-blue-600'} />
                            <span className={`text-[10px] font-bold ${timing.isUrgent ? 'text-rose-700' : 'text-blue-700'}`}>
                              {timing.estFormatted}
                            </span>
                            {timing.isUrgent && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black animate-pulse">
                                URGENT
                              </span>
                            )}
                            {timing.isElevated && (
                              <span className="px-1 py-0.2 rounded bg-amber-500 text-white text-[9px] font-bold">
                                ELEVATED
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Tech Person */}
                      <td className="py-3 px-4 text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {techName.split(' ').map(p => p[0]).slice(0, 2).join('')}
                          </span>
                          <span className="font-semibold whitespace-nowrap">{techName}</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 text-xs text-slate-600 whitespace-nowrap">
                        {t.duration || '—'}
                      </td>

                      {/* Task Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <TaskTypeBadge value={t.taskType || t.category} />
                      </td>

                      {/* Candidate Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.candidateName || t.title}</div>
                        <div className="mono text-[10px] text-blue-600 font-medium">{t.id}</div>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-[180px] truncate" title={t.position}>
                        {t.position || '—'}
                      </td>

                      {/* Company Name */}
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {t.companyName || '—'}
                      </td>

                      {/* Status / Outcome */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <StatusBadge value={t.status} />
                          {t.interviewOutcome && (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                🎯 {t.interviewOutcome}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Remark */}
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-[200px] truncate" title={t.remark}>
                        {t.remark ? (
                          <span className="text-amber-800 font-medium">{t.remark}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} />
      <TaskDrawer task={activeTask} onClose={() => setActiveTask(null)} />
    </div>
  );
}
