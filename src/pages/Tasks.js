import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, UserRound, Calendar as CalIcon, Clock, Building2, Briefcase, FileText, StickyNote, MessageSquare, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, StatusBadge, TaskTypeBadge, SectionCard, EmptyState } from '../components/common';
import { TASK_TYPES, TASK_STATUSES, MARKETING_TEAMS, POC_USERS_BY_TEAM, getTseCodeName, getTsmCodeName, roleIsMarketing } from '../data/mockData';
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
  const defaultPocs = POC_USERS_BY_TEAM[defaultTeam.id] || [];

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
    pocId: defaultPocs[0]?.id || '',
    recruiterName: defaultPocs[0]?.name || '',
    remark: '',
    description: '',
    notes: '',
  });

  // Eligible POCs dynamically scoped to currently selected team
  const eligiblePocs = useMemo(() => {
    return POC_USERS_BY_TEAM[form.teamId] || [];
  }, [form.teamId]);

  const handleTeamChange = (teamId) => {
    const selectedTeam = MARKETING_TEAMS.find(t => t.id === teamId) || MARKETING_TEAMS[0];
    const pocs = POC_USERS_BY_TEAM[selectedTeam.id] || [];
    setForm(prev => ({
      ...prev,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      teamLeadId: selectedTeam.leadId,
      pocId: pocs[0]?.id || '',
      recruiterName: pocs[0]?.name || '',
    }));
  };

  const handlePocChange = (pocId) => {
    const selectedPoc = eligiblePocs.find(p => p.id === pocId);
    setForm(prev => ({
      ...prev,
      pocId,
      recruiterName: selectedPoc?.name || '',
    }));
  };

  const submit = () => {
    if (!form.candidateName.trim()) return;
    const selectedTse = tseUsers.find(u => u.id === form.assigneeId);
    addTask({
      ...form,
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
      pocId: defaultPocs[0]?.id || '',
      recruiterName: defaultPocs[0]?.name || '',
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

          {/* Step 2: Recruiter / POC (Filtered dynamically to selected team) */}
          <div className="md:col-span-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Recruiter / POC</span>
              <span className="text-rose-500">*</span>
            </label>
            <Select value={form.pocId} onValueChange={handlePocChange}>
              <SelectTrigger data-testid="task-form-recruiter" className="mt-1.5 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                <SelectValue placeholder="Select Assigned POC" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
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
                    {roleIsMarketing(currentRole) ? (u.codeName || getTseCodeName(u.name)) : `${u.name} (${u.codeName || getTseCodeName(u.name)})`}
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
  const { users, reassignTask, changeTaskStatus, currentRole, currentUser } = useApp();
  const assignee = users.find(u => u.id === task?.assigneeId);
  const creator = users.find(u => u.id === task?.createdById);
  const tseUsers = users.filter(u => u.role === 'tse');
  const canEdit = roleCanEditAny(currentRole) || task?.assigneeId === currentUser?.id;

  if (!task) return null;

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
                <UserRound size={12} className="text-blue-600" /> Tech Person (TSE)
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {roleIsMarketing(currentRole)
                  ? (task.codeName || assignee?.codeName || getTseCodeName(assignee?.name || task.techPerson))
                  : (assignee?.name || task.techPerson || 'Unassigned')}
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
                {roleIsMarketing(currentRole) ? (getTsmCodeName(creator?.name) || 'TSM Nova') : (creator?.name || 'TSM')}
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
                <Select value={task.status} onValueChange={v => changeTaskStatus(task.id, v)}>
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
                    {roleIsMarketing(currentRole) ? (u.codeName || getTseCodeName(u.name)) : u.name}
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
                  <th className="py-3 px-4 font-semibold">Tech Person</th>
                  <th className="py-3 px-3 font-semibold">Duration</th>
                  <th className="py-3 px-3 font-semibold">Task</th>
                  <th className="py-3 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">Company name</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const a = users.find(u => u.id === t.assigneeId);
                  const isMarketing = roleIsMarketing(currentRole);
                  const techName = isMarketing
                    ? (t.codeName || a?.codeName || getTseCodeName(a?.name || t.techPerson))
                    : (a?.name || t.techPerson || 'Unassigned');
                  return (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={t.id}
                      data-testid={`task-row-${t.id}`}
                      onClick={() => setActiveTask(t)}
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

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge value={t.status} />
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
