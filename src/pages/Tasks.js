import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, UserRound, Calendar as CalIcon, Clock, Building2, Briefcase, FileText, StickyNote, MessageSquare, ShieldAlert, Link2, Copy, ExternalLink, Check, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { PageHeader, StatusBadge, TaskTypeBadge, SectionCard, EmptyState } from '../components/common';
import { TASK_TYPES, TASK_STATUSES, MARKETING_TEAMS, POC_USERS_BY_TEAM, getTseCodeName, getTsmCodeName, roleIsMarketing, formatTseNameForRole, getEligibleSrsForTeam, resolveSr } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';

const roleCanCreate = (r) => r === 'tsm' || r === 'management';
const roleCanEditAny = (r) => r === 'tsm' || r === 'management';

const CreateTaskModal = ({ open, onOpenChange }) => {
  const { users, addTask, currentRole } = useApp();
  const tseUsers = users.filter(u => u.role === 'tse');
  const todayStr = new Date().toISOString().slice(0, 10);

  const defaultTeam = MARKETING_TEAMS[0];

  const [form, setForm] = useState({
    date: todayStr,
    assigneeId: tseUsers[0]?.id || '',
    duration: '30 mins',
    taskType: 'Interview',
    candidateName: '',
    position: 'Software Engineer',
    companyName: 'Amazon',
    status: 'Pending',
    teamId: defaultTeam.id,
    teamName: defaultTeam.name,
    teamLeadId: defaultTeam.leadId,
    marketingTl: defaultTeam.leadName,
    teamLeadName: defaultTeam.leadName,
    pocId: 'unassigned',
    recruiterName: 'Unassigned',
    remark: '',
    description: '',
    notes: '',
  });

  // Eligible POCs dynamically scoped to currently selected team from dynamic user accounts
  const eligiblePocs = useMemo(() => {
    return getEligibleSrsForTeam(users, form.teamId);
  }, [users, form.teamId]);

  const handleTeamChange = (teamId) => {
    const selectedTeam = MARKETING_TEAMS.find(t => t.id === teamId) || MARKETING_TEAMS[0];
    setForm(prev => ({
      ...prev,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      teamLeadId: selectedTeam.leadId,
      marketingTl: selectedTeam.leadName,
      teamLeadName: selectedTeam.leadName,
      pocId: 'unassigned',
      recruiterName: 'Unassigned',
    }));
  };

  const handlePocChange = (pocId) => {
    if (pocId === 'unassigned') {
      setForm(prev => ({ ...prev, pocId: 'unassigned', recruiterName: 'Unassigned' }));
      return;
    }
    const selectedPoc = eligiblePocs.find(p => p.id === pocId) || resolveSr(pocId, users);
    setForm(prev => ({
      ...prev,
      pocId: selectedPoc?.id || pocId,
      recruiterName: selectedPoc?.name || 'Unassigned',
    }));
  };

  const submit = () => {
    if (!form.candidateName.trim()) return;
    const selectedTse = tseUsers.find(u => u.id === form.assigneeId);
    const finalPocId = form.pocId === 'unassigned' ? '' : form.pocId;
    const finalRecruiterName = form.pocId === 'unassigned' ? 'Unassigned' : form.recruiterName;

    addTask({
      ...form,
      pocId: finalPocId,
      recruiterName: finalRecruiterName,
      techPerson: selectedTse?.name || 'Unassigned',
      codeName: selectedTse?.codeName || getTseCodeName(selectedTse?.name),
      title: `${form.candidateName} — ${form.taskType} (${form.companyName})`,
      category: form.taskType,
      dueDate: form.date,
    });
    onOpenChange(false);
    setForm({
      date: todayStr,
      assigneeId: tseUsers[0]?.id || '',
      duration: '30 mins',
      taskType: 'Interview',
      candidateName: '',
      position: 'Software Engineer',
      companyName: 'Amazon',
      status: 'Pending',
      teamId: defaultTeam.id,
      teamName: defaultTeam.name,
      teamLeadId: defaultTeam.leadId,
      pocId: 'unassigned',
      recruiterName: 'Unassigned',
      remark: '',
      description: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" data-testid="create-task-modal">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg">Create New Task / Candidate Record</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Assign candidate assessment with explicit Marketing Team Lead &amp; Recruiter POC ownership.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Step 1: Marketing Team Lead */}
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Marketing Team Lead</span>
              <span className="text-rose-500">*</span>
            </label>
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
          </div>

          {/* Step 2: Marketing SR / Recruiter (Filtered dynamically to selected team) */}
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Marketing SR / Recruiter</span>
              <span className="text-slate-400 font-normal lowercase">(optional — TL will assign)</span>
            </label>
            <Select value={form.pocId} onValueChange={handlePocChange}>
              <SelectTrigger data-testid="task-form-recruiter" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                <SelectValue placeholder="Select Assigned SR" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="unassigned">-- Unassigned (Marketing TL will assign) --</SelectItem>
                {eligiblePocs.map(poc => (
                  <SelectItem key={poc.id} value={poc.id}>
                    {poc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</label>
            <Input
              type="date"
              data-testid="task-form-date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
            />
          </div>

          {/* Tech Person (TSE) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tech Person (TSE)</label>
            <Select value={form.assigneeId} onValueChange={v => setForm({ ...form, assigneeId: v })}>
              <SelectTrigger data-testid="task-form-assignee" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                <SelectValue placeholder="Select TSE" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {tseUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {formatTseNameForRole(u, currentRole)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Position */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</label>
            <Input
              data-testid="task-form-position"
              value={form.position}
              onChange={e => setForm({ ...form, position: e.target.value })}
              placeholder="e.g. Software Engineer, Data Scientist"
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
              placeholder="e.g. Amazon, Capital One, Merrick Bank"
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
  const { users, reassignTask, assignMarketingSr, changeTaskStatus, updateTask, currentRole, currentUser } = useApp();
  const canGenerateSagaLink = ['marketing_sr', 'recruiter', 'marketing_tl', 'management', 'upper_management'].includes(currentRole);
  const assignee = users.find(u => u.id === task?.assigneeId);
  const creator = users.find(u => u.id === task?.createdById);
  const tseUsers = users.filter(u => u.role === 'tse');
  const isTseOwner = currentRole === 'tse' && (
    task?.assigneeId === currentUser?.id ||
    task?.assigneeId === currentUser?.empId ||
    task?.assigneeId === currentUser?.tttNbId ||
    (currentUser?.name && task?.techPerson?.toLowerCase() === currentUser?.name?.toLowerCase()) ||
    (currentUser?.codeName && (task?.codeName?.toLowerCase() === currentUser?.codeName?.toLowerCase() || task?.techPerson?.toLowerCase() === currentUser?.codeName?.toLowerCase())) ||
    (task?.techPerson && currentUser?.name && currentUser?.name?.toLowerCase().includes(task?.techPerson?.toLowerCase()))
  );
  const isTeamLeadOwner = currentRole === 'marketing_tl' && (
    task?.teamId === currentUser?.teamId ||
    task?.teamLeadId === currentUser?.id ||
    (currentUser?.name && (task?.marketingTl?.toLowerCase()?.includes(currentUser?.name?.toLowerCase()) || task?.teamLeadName?.toLowerCase()?.includes(currentUser?.name?.toLowerCase())))
  );
  const canEdit = roleCanEditAny(currentRole) || currentRole === 'upper_management' || isTeamLeadOwner || isTseOwner;

  const eligibleSrs = useMemo(() => {
    return getEligibleSrsForTeam(users, task?.teamId);
  }, [users, task?.teamId]);

  const [selectedSr, setSelectedSr] = useState(task?.pocId || '');
  const [showSagaModal, setShowSagaModal] = useState(false);
  const [newRemark, setNewRemark] = useState('');
  const [currentStatus, setCurrentStatus] = useState(task?.status || 'Pending');

  useEffect(() => {
    if (task?.status) {
      setCurrentStatus(task.status);
    }
  }, [task?.status]);

  useEffect(() => {
    if (task) {
      const resolved = resolveSr(task.pocId || task.recruiterName, users);
      setSelectedSr(resolved?.id || task.pocId || '');
    }
  }, [task?.pocId, task?.recruiterName, users]);

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    changeTaskStatus(task.id, newStatus);
  };

  const candidateSagaUrl = useMemo(() => {
    if (!task) return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const recruiter = task.recruiterName || 'Unassigned';
    const tseId = task.assigneeId || 'TSE-ID';
    const tseName = roleIsMarketing(currentRole) ? (task.codeName || 'TSE') : (task.techPerson || 'TSE');
    return `${origin}${pathname}#/candidate-saga?id=${task.id}&recruiter=${encodeURIComponent(recruiter)}&tseId=${encodeURIComponent(tseId)}&tseName=${encodeURIComponent(tseName)}&candidate=${encodeURIComponent(task.candidateName || '')}&company=${encodeURIComponent(task.companyName || '')}&type=${encodeURIComponent(task.taskType || 'Interview')}`;
  }, [task, currentRole]);

  const handleCopyCandidateLink = () => {
    if (!canGenerateSagaLink) {
      toast.error('You are not authorized to generate or copy candidate feedback links.');
      return;
    }
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(candidateSagaUrl);
      }
      toast.success('Candidate SAGA feedback link copied to clipboard!');
    } catch (e) {
      toast.error('Failed to copy link');
    }
  };

  const handleAssignSr = () => {
    if (!selectedSr) return;
    assignMarketingSr(task.id, selectedSr);
  };

  const handleAddRemark = () => {
    if (!newRemark.trim()) return;
    updateTask(task.id, { remark: newRemark.trim() }, `Remark added: ${newRemark.trim()}`);
    setNewRemark('');
  };

  if (!task) return null;

  return (
    <>
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
                  <StatusBadge value={currentStatus} />
                  {task.companyName && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
                      <Building2 size={11} className="text-slate-500" />
                      {task.companyName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="p-5 space-y-5 overflow-y-auto h-[calc(100vh-140px)]">
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
                  <UserRound size={12} className="text-blue-600" /> {roleIsMarketing(currentRole) ? 'Tech Support' : 'Tech Person (TSE)'}
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatTseNameForRole(assignee || task, currentRole)}
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
                  <Building2 size={12} className="text-blue-600" /> Marketing Team
                </div>
                <div className="text-sm font-semibold text-slate-900">{task.teamName || 'Team Mukesh'}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                  <UserRound size={12} className="text-blue-600" /> Assigned SR
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {task.recruiterName && task.recruiterName !== 'Unassigned' ? (
                    <span className="text-purple-700 font-bold">{task.recruiterName}</span>
                  ) : (
                    <span className="text-amber-600 italic font-medium">Unassigned</span>
                  )}
                </div>
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

            {/* Candidate SAGA Integration: Available only for authorized roles (Marketing SR, TL, Management) */}
            {canGenerateSagaLink && (task.status === 'Done' || task.status === 'Completed') && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/90 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ExternalLink size={13} className="text-blue-600" />
                      <span>Candidate SAGA Feedback Form</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Assessment marked Done. Share this unique feedback form with the candidate or recruiter.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    Ready for Feedback
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSagaModal(true)}
                    className="flex-1 h-9 px-3.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Link2 size={13} />
                    <span>Generate Candidate SAGA Feedback Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCandidateLink}
                    className="h-9 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                    title="Copy direct candidate feedback link"
                  >
                    <Copy size={13} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}

            {/* Marketing SR Assignment (For Marketing TL and Management) */}
            {(currentRole === 'marketing_tl' || currentRole === 'management' || currentRole === 'upper_management') && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserRound size={13} className="text-purple-600" />
                    <span>Assign Marketing SR ({task.teamName || 'Team'})</span>
                  </label>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${task.pocId ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                    {task.pocId ? `Assigned: ${task.recruiterName}` : 'Awaiting SR Assignment'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Select value={selectedSr} onValueChange={setSelectedSr}>
                    <SelectTrigger className="bg-white border-purple-300 text-slate-900 text-xs h-9">
                      <SelectValue placeholder="Select verified SR from team" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      {eligibleSrs.map(sr => (
                        <SelectItem key={sr.id} value={sr.id}>{sr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={handleAssignSr}
                    disabled={!selectedSr || selectedSr === task.pocId}
                    className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                  >
                    Assign SR
                  </button>
                </div>
              </div>
            )}

            {/* Remark */}
            {task.remark && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                  <MessageSquare size={13} className="text-amber-600" /> Remark
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">{task.remark}</p>
              </div>
            )}

            {/* Add Remark Input */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <Input
                  value={newRemark}
                  onChange={e => setNewRemark(e.target.value)}
                  placeholder="Add a remark / candidate update..."
                  className="bg-white border-slate-300 text-slate-900 text-xs h-9"
                  onKeyDown={e => { if (e.key === 'Enter') handleAddRemark(); }}
                />
                <button
                  type="button"
                  onClick={handleAddRemark}
                  disabled={!newRemark.trim()}
                  className="h-9 px-3 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  Post
                </button>
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

            {/* Status & Assignee Controls */}
            {canEdit && (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-xs text-slate-600 font-semibold">Update Status</label>
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
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
                        {tseUsers.map(u => <SelectItem key={u.id} value={u.id}>{formatTseNameForRole(u, currentRole)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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

      {/* Candidate SAGA Link Modal */}
      <Dialog open={canGenerateSagaLink && showSagaModal} onOpenChange={setShowSagaModal}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-lg flex items-center gap-2">
              <ExternalLink size={18} className="text-blue-600" />
              <span>Candidate SAGA Feedback Link</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Pre-filled feedback URL linked to {task.candidateName} and {task.techPerson}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 mt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Candidate:</span> <span className="font-semibold text-slate-900">{task.candidateName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tech Evaluator:</span> <span className="font-semibold text-slate-900">{formatTseNameForRole(task, currentRole)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Marketing SR:</span> <span className="font-semibold text-slate-900">{task.recruiterName || 'Unassigned'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Team:</span> <span className="font-semibold text-slate-900">{task.teamName || 'Team Mukesh'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Task Type:</span> <span className="font-semibold text-slate-900">{task.taskType}</span></div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Direct Feedback URL</label>
              <div className="flex items-center gap-2 mt-1.5">
                <input
                  readOnly
                  value={candidateSagaUrl}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyCandidateLink}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSagaModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
              <a
                href={candidateSagaUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink size={13} />
                <span>Open Candidate Form</span>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function Tasks() {
  const { tasks, users, currentRole, currentUser } = useApp();
  const canGenerateSagaLink = ['marketing_sr', 'recruiter', 'marketing_tl', 'management', 'upper_management'].includes(currentRole);
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState({ status: 'all', taskType: 'all', assignee: 'all', q: '' });
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return tasks.find(t => t.id === activeTaskId || (t.id && t.id.toLowerCase() === activeTaskId.toLowerCase())) || null;
  }, [tasks, activeTaskId]);

  useEffect(() => {
    if (location.search.includes('create=1')) {
      setCreateOpen(true);
      navigate('/tasks', { replace: true });
    }
  }, [location, navigate]);

  const filtered = useMemo(() => {
    let base = tasks;
    if (currentRole === 'tse') {
      base = base.filter(t => 
        t.assigneeId === currentUser?.id || 
        t.assigneeId === currentUser?.empId ||
        (currentUser?.name && t.techPerson?.toLowerCase() === currentUser?.name?.toLowerCase()) ||
        (currentUser?.codeName && (t.codeName?.toLowerCase() === currentUser?.codeName?.toLowerCase() || t.techPerson?.toLowerCase() === currentUser?.codeName?.toLowerCase()))
      );
    }
    const selectedTseObj = filters.assignee !== 'all' ? users.find(u => u.id === filters.assignee) : null;

    return base.filter(t => {
      const matchStatus = filters.status === 'all' || t.status === filters.status;
      const matchType = filters.taskType === 'all' || t.taskType === filters.taskType;
      const matchAssignee = filters.assignee === 'all' || 
        t.assigneeId === filters.assignee || 
        (selectedTseObj && (
          t.techPerson === selectedTseObj.name || 
          t.codeName === selectedTseObj.codeName || 
          t.techPerson === selectedTseObj.codeName
        ));
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
      <SectionCard title="Filters" subtitle={`${filtered.length} of ${tasks.length} tasks`}>
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
                    {formatTseNameForRole(u, currentRole)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </SectionCard>

      {/* Task Queue Table */}
      <SectionCard title="Task queue">
        {filtered.length === 0 ? (
          <EmptyState title="No tasks match" description="Try clearing a filter or create a new task." />
        ) : (
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-left text-xs text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">{roleIsMarketing(currentRole) ? 'Tech Support' : 'Tech Person'}</th>
                  <th className="py-3 px-3 font-semibold">Duration</th>
                  <th className="py-3 px-3 font-semibold">Task</th>
                  <th className="py-3 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">Company name</th>
                  <th className="py-3 px-4 font-semibold">Marketing SR</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const a = users.find(u => u.id === t.assigneeId);
                  const techName = formatTseNameForRole(a || t, currentRole);
                  return (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={t.id}
                      data-testid={`task-row-${t.id}`}
                      onClick={() => setActiveTaskId(t.id)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 mono text-xs text-slate-600 whitespace-nowrap">
                        {t.date || t.dueDate}
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

                      {/* Marketing SR */}
                      <td className="py-3 px-4 text-xs whitespace-nowrap">
                        {t.recruiterName && t.recruiterName !== 'Unassigned' ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                            {t.recruiterName}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium text-[11px]">
                            Awaiting SR
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge value={t.status} />
                        {canGenerateSagaLink && (t.status === 'Done' || t.status === 'Completed') && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                            <Link2 size={10} />
                            <span>SAGA Link Ready</span>
                          </div>
                        )}
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
      <TaskDrawer task={activeTask} onClose={() => setActiveTaskId(null)} />
    </div>
  );
}
