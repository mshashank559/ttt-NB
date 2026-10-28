import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, UserRound, Calendar as CalIcon, Clock, Building2, Briefcase, FileText, StickyNote, MessageSquare, ShieldAlert, CheckCircle2, Sparkles, Lock, Paperclip, UploadCloud, X, File, Download, Eye, Trash2, UserMinus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { PageHeader, StatusBadge, TaskTypeBadge, SectionCard, EmptyState, Pagination } from '../components/common';
import { TASK_TYPES, TASK_STATUSES, MARKETING_TEAMS, getTseCodeName, getTsmCodeName, roleIsMarketing, getInterviewTimingMeta, sortTasksByInterviewPriority, getSmartTseRecommendations, INTERVIEW_OUTCOMES, TSE_IDS, getTseId, getTseRealName, checkTseAvailability, parseDurationMinutes } from '../data/mockData';
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
  const canViewRealName = ['tsm', 'management', 'upper_management'].includes(currentRole);
  const todayStr = new Date().toISOString().slice(0, 10);

  const isMarketingUser = roleIsMarketing(currentRole) || currentRole === 'marketing_tl' || currentRole === 'marketing_sr';

  const userTeamId = currentUser?.teamId ||
    (currentUser?.team === 'team-mukesh' || currentUser?.id === 'u-1791911058812' || (currentUser?.name || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
     currentUser?.team === 'team-shivam' || currentUser?.id === 'u-1791911115518' || (currentUser?.name || '').toLowerCase().includes('shivam') ? 'team-shivam' : '');
  const initialTeam = (userTeamId && MARKETING_TEAMS.find(t => t.id === userTeamId)) || MARKETING_TEAMS[0];

  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allowTseOverride, setAllowTseOverride] = useState(false);

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

  // Real-Time TSE Availability Engine (Formula: existing_start < requested_end && existing_end > requested_start)
  const tseAvailabilityMap = useMemo(() => {
    if (form.taskType !== 'Interview' || !form.interviewDateTime) {
      const map = {};
      tseUsers.forEach(u => {
        map[u.id] = { available: true, conflicts: [] };
      });
      return map;
    }
    const map = {};
    tseUsers.forEach(u => {
      map[u.id] = checkTseAvailability(u.id, form.interviewDateTime, form.duration, tasks);
    });
    return map;
  }, [form.taskType, form.interviewDateTime, form.duration, tseUsers, tasks]);

  const selectedTseAvailability = useMemo(() => {
    if (!form.assigneeId || form.taskType !== 'Interview' || !form.interviewDateTime) {
      return { available: true, conflicts: [] };
    }
    return tseAvailabilityMap[form.assigneeId] || { available: true, conflicts: [] };
  }, [form.assigneeId, form.taskType, form.interviewDateTime, tseAvailabilityMap]);

  // Sync team & clear inputs whenever modal opens
  useEffect(() => {
    if (open) {
      setAttachments([]);
      setAllowTseOverride(false);
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

  // Multi-format File Upload Handler (Feature 2)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.webp', '.txt'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB per file

    const validFiles = [];
    for (const f of files) {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        toast.error(`"${f.name}" format is not supported. Supported: PDF, DOC/DOCX, XLS/XLSX, CSV, PNG, JPG, JPEG, WEBP, TXT.`);
        continue;
      }
      if (f.size > maxFileSize) {
        toast.error(`"${f.name}" exceeds the 10MB limit (${(f.size / (1024 * 1024)).toFixed(1)}MB).`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    const formData = new FormData();
    validFiles.forEach(f => formData.append('files', f));
    formData.append('uploadedBy', currentUser?.name || 'TSM');

    setIsUploading(true);
    try {
      const res = await fetch('/api/tasks/upload-attachments', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.attachments && data.attachments.length > 0) {
          setAttachments(prev => [...prev, ...data.attachments]);
          toast.success(`Attached ${data.attachments.length} file${data.attachments.length > 1 ? 's' : ''}`);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to upload attachments.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      toast.error('Network error during file upload.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (attId) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

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
    setAttachments([]);
    setAllowTseOverride(false);
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

    // Availability validation guard
    if (form.taskType === 'Interview' && !isMarketingUser && form.assigneeId && !selectedTseAvailability.available && !allowTseOverride) {
      toast.error('The selected TSE is occupied during this time window. Please select an available TSE or authorize emergency override.');
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
      attachments: attachments || [],
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tech Person (TSE)</label>
                {selectedTseAvailability && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                    selectedTseAvailability.available
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  }`}>
                    {selectedTseAvailability.available ? '🟢 Available' : '🔴 Occupied'}
                  </span>
                )}
              </div>
              <Select value={form.assigneeId} onValueChange={v => setForm({ ...form, assigneeId: v })}>
                <SelectTrigger data-testid="task-form-assignee" className="bg-slate-50 border-slate-300 text-slate-900 focus:bg-white">
                  <SelectValue placeholder="Select TSE" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 max-h-56">
                  {tseUsers.map(u => {
                    const codeName = u.codeName || u.name;
                    const realName = getTseRealName(u.name) || getTseRealName(u.id);
                    const avail = tseAvailabilityMap[u.id];
                    const isOccupied = avail && !avail.available;
                    const displayName = canViewRealName && realName && realName.toLowerCase() !== codeName.toLowerCase()
                      ? `${codeName} (${realName})`
                      : codeName;

                    return (
                      <SelectItem key={u.id} value={u.id} disabled={isOccupied && !allowTseOverride}>
                        <div className="flex items-center justify-between w-full gap-2 text-xs">
                          <span className="font-semibold">{displayName}</span>
                          {isOccupied ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              🔴 {avail.conflicts[0]?.timeWindowFormatted || 'Occupied'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              🟢 Available
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Conflict Alert Box with Emergency Override */}
              {!selectedTseAvailability.available && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-950 text-xs mt-1.5 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-800">
                    <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                    <span>Slot Conflict Detected</span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Already scheduled with <strong>{selectedTseAvailability.conflicts[0]?.candidateName}</strong> ({selectedTseAvailability.conflicts[0]?.timeWindowFormatted}).
                  </p>
                  <label className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-rose-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowTseOverride}
                      onChange={(e) => setAllowTseOverride(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Authorize Emergency Override / Concurrent Session</span>
                  </label>
                </div>
              )}
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

          {/* Attachments Upload Section (Feature 2) */}
          <div className="md:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={13} className="text-blue-600" />
                <span>Task Attachments</span>
                <span className="text-[10px] text-slate-500 font-normal lowercase">(PDF, Word, Excel, CSV, Images, Text · Max 10MB each)</span>
              </label>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {attachments.length} attached
              </span>
            </div>

            {/* Dropzone / Upload Trigger */}
            <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer group select-none">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <UploadCloud size={22} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 mt-1">
                {isUploading ? 'Uploading files to storage...' : 'Click or Drag files to attach (Resume, JD, Runbook)'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Supported formats: PDF, DOC/DOCX, XLS/XLSX, CSV, PNG, JPG, JPEG, WEBP, TXT
              </span>
            </label>

            {/* Uploaded File Cards */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-40 overflow-y-auto pr-1">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate max-w-[170px]" title={att.originalName}>
                          {att.originalName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {(att.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer shrink-0"
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
  const { users, reassignTask, changeTaskStatus, assignMarketingSr, currentRole, currentUser, updateInterviewOutcome, unassignTask, deleteTask } = useApp();
  const canViewRealName = ['tsm', 'management', 'upper_management'].includes(currentRole);
  const assignee = users.find(u => u.id === task?.assigneeId);
  const creator = users.find(u => u.id === task?.createdById);
  const tseUsers = (users || []).filter(u => u.role === 'tse');
  const canUpdateStatus = ['management', 'upper_management', 'marketing_tl', 'marketing_sr', 'tsm', 'tse', 'admin'].includes(currentRole) || roleCanEditAny(currentRole) || task?.assigneeId === currentUser?.id;
  const canReassignTseInDrawer = ['management', 'upper_management', 'tsm'].includes(currentRole);
  const [completionRemark, setCompletionRemark] = useState(task?.completionRemark || task?.remark || '');
  const [selectedStatus, setSelectedStatus] = useState(task?.status || 'Pending');

  useEffect(() => {
    if (task) {
      setCompletionRemark(task.completionRemark || task.remark || '');
      setSelectedStatus(task.status || 'Pending');
    }
  }, [task]);

  const eligibleSrs = useMemo(() => {
    const allSrs = (users || []).filter(u => u.role === 'marketing_sr');
    const teamSrs = allSrs.filter(u => 
      u.teamId === task?.teamId || 
      (task?.teamId === 'team-mukesh' ? (u.teamName?.includes('Mukesh') || u.teamLeadId === 'u-1791911058812') : (u.teamName?.includes('Shivam') || u.teamLeadId === 'u-1791911115518'))
    );
    return teamSrs.length > 0 ? teamSrs : allSrs;
  }, [users, task?.teamId]);

  const handleCopyFeedbackLink = (t) => {
    if (['tsm', 'tse'].includes(currentRole)) {
      toast.error('TSM is not authorized to generate Candidate SAGA feedback links.');
      return;
    }
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const recruiter = t.assignedSrName || t.recruiterName || 'Marketing SR';

    // Authoritative TSE lookup
    const assigneeUser = (users || []).find(u => u.id === t.assigneeId || u.empId === t.assigneeId || u.tttNbId === t.assigneeId) ||
                         (users || []).find(u => u.name?.toLowerCase() === (t.techPerson || '').toLowerCase());
    const tseCodeName = assigneeUser?.codeName || assigneeUser?.name || t.techPerson || 'Technical Support';
    const officialTseId = assigneeUser?.empId || assigneeUser?.tttNbId || TSE_IDS[tseCodeName] || t.assigneeId || 'TTT-NB-TSE';
    const jobRole = t.position || 'Software Engineer';

    const link = `${origin}${pathname}#/candidate-saga?id=fb-task-${t.id}&recruiter=${encodeURIComponent(recruiter)}&tseId=${encodeURIComponent(officialTseId)}&tseName=${encodeURIComponent(tseCodeName)}&candidate=${encodeURIComponent(t.candidateName || '')}&company=${encodeURIComponent(t.companyName || '')}&type=${encodeURIComponent(t.taskType || 'Interview')}&technology=${encodeURIComponent(jobRole)}&role=${encodeURIComponent(jobRole)}`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link);
      }
    } catch (e) {}

    toast.success(`Feedback Link generated & copied! Recruiter: ${recruiter} • TSE: ${tseCodeName} (${officialTseId}) • Role: ${jobRole}`);
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
                  : (() => {
                      const isUnassigned = (!task.assigneeId || task.assigneeId === 'Unassigned') &&
                        (!task.techPerson || task.techPerson === 'Unassigned' || task.techPerson === 'Code Name Unassigned') &&
                        (!task.codeName || task.codeName === 'Unassigned' || task.codeName === 'Code Name Unassigned') &&
                        !assignee;
                      if (isUnassigned) {
                        return <span className="text-slate-400 italic font-normal text-xs">Unassigned</span>;
                      }
                      const cName = (task.codeName && task.codeName !== 'Code Name Unassigned' && task.codeName !== 'Unassigned' ? task.codeName : '') ||
                        assignee?.codeName ||
                        (task.techPerson && task.techPerson !== 'Unassigned' && task.techPerson !== 'Code Name Unassigned' ? getTseCodeName(task.techPerson) : '') ||
                        (assignee?.name ? getTseCodeName(assignee.name) : '') ||
                        task.techPerson ||
                        'TSE';
                      const rName = getTseRealName(cName) ||
                        getTseRealName(task.techPerson) ||
                        getTseRealName(assignee?.name) ||
                        getTseRealName(task.assigneeId) ||
                        (assignee?.role === 'tse' ? assignee.name : '');
                      return (
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{cName}</div>
                          {canViewRealName && rName && rName.toLowerCase() !== cName.toLowerCase() && (
                            <div className="text-xs text-slate-500 font-normal mt-0.5">
                              ({rName})
                            </div>
                          )}
                        </div>
                      );
                    })()}
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

          {/* Step 5: Automatically Enable Feedback Form Generation (Marketing SR / TL only) */}
          {['tsm', 'tse'].includes(currentRole) ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" />
                <span className="font-semibold text-slate-800">Candidate Feedback Form</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                Managed by Marketing SR / TL
              </span>
            </div>
          ) : task.status === 'Done' ? (
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
          {canUpdateStatus && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className={`grid ${canReassignTseInDrawer ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                <div>
                  <label className="text-xs text-slate-600 font-semibold">Update Status</label>
                  <Select
                    value={selectedStatus}
                    onValueChange={v => {
                      setSelectedStatus(v);
                      if (v === 'Done') {
                        if (!completionRemark.trim()) {
                          toast.info('Status set to Done. Please enter TSE completion remarks below to finish.');
                        } else {
                          changeTaskStatus(task.id, 'Done', completionRemark.trim());
                        }
                      } else {
                        changeTaskStatus(task.id, v, completionRemark.trim());
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
                {canReassignTseInDrawer && (
                  <div>
                    <label className="text-xs text-slate-600 font-semibold">Reassign TSE</label>
                    <Select value={task.assigneeId} onValueChange={v => reassignTask(task.id, v)}>
                      <SelectTrigger data-testid="task-reassign" className="mt-1 bg-white border-slate-300 text-slate-900 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900">
                        {tseUsers.map(u => {
                          const codeName = u.codeName || u.name;
                          const realName = getTseRealName(u.name) || getTseRealName(u.id);
                          return (
                            <SelectItem key={u.id} value={u.id}>
                              {canViewRealName && realName && realName.toLowerCase() !== codeName.toLowerCase()
                                ? `${codeName} (${realName})`
                                : codeName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Completion remarks input - ONLY appears when status is changed from Pending to any other status */}
              {(selectedStatus !== 'Pending' || task.status !== 'Pending') && (
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
                      placeholder="Enter candidate evaluation remarks & details..."
                      className="bg-white border-slate-300 text-xs h-9"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const targetStatus = selectedStatus === 'Pending' ? 'Done' : selectedStatus;
                        if (!completionRemark.trim()) {
                          toast.error('Please enter completion remarks before saving.');
                          return;
                        }
                        changeTaskStatus(task.id, targetStatus, completionRemark.trim());
                        toast.success(`Task status updated to ${targetStatus} with remarks!`);
                      }}
                      className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                    >
                      {selectedStatus === 'Done' ? 'Mark Done' : 'Save Remarks'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Milestone 6: Marketing TL & TSM Interview Outcome Selection (ONLY visible when status is Done) */}
          {(task.status === 'Done' || selectedStatus === 'Done') && (currentRole === 'marketing_tl' || currentRole === 'tsm' || currentRole === 'management' || currentRole === 'upper_management') && (
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

          {/* Attachments Section in Drawer */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Paperclip size={13} className="text-blue-600" />
                  <span>Attachments ({task.attachments.length})</span>
                </span>
              </div>
              <div className="space-y-1.5">
                {task.attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate max-w-[200px]" title={att.originalName}>
                        {att.originalName}
                      </span>
                    </div>
                    <a
                      href={`${att.path}?download=1&name=${encodeURIComponent(att.originalName)}`}
                      download={att.originalName}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
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

          {/* TSM / Management Action Controls (Feature 4: Unassign & Delete) */}
          {roleCanEditAny(currentRole) && (
            <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
              {task.assigneeId && (
                <button
                  type="button"
                  data-testid="drawer-btn-unassign-tse"
                  onClick={() => {
                    unassignTask && unassignTask(task.id);
                    onClose();
                  }}
                  className="flex-1 h-9 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserMinus size={14} />
                  <span>Unassign TSE</span>
                </button>
              )}
              <button
                type="button"
                data-testid="drawer-btn-delete-task"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete task ${task.id}? Linked feedback and audit records will remain preserved.`)) {
                    deleteTask && deleteTask(task.id);
                    onClose();
                  }
                }}
                className="flex-1 h-9 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Task</span>
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ----------------- ATTACHMENT VIEWER MODAL (Feature 3) -----------------
const AttachmentViewerModal = ({ task, open, onOpenChange }) => {
  const [selectedPreview, setSelectedPreview] = useState(null);

  useEffect(() => {
    if (!open) setSelectedPreview(null);
  }, [open]);

  if (!task) return null;
  const attachments = task.attachments || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Paperclip size={18} className="text-blue-600" />
            <span>Task Attachments — {task.candidateName || task.title || task.id}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {attachments.length} attachment{attachments.length > 1 ? 's' : ''} available for candidate assessment
          </DialogDescription>
        </DialogHeader>

        {attachments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No attachments uploaded for this task.
          </div>
        ) : (
          <div className="space-y-2.5 mt-3">
            {attachments.map(att => {
              const fileName = att.originalName || att.name || 'document';
              const ext = fileName.split('.').pop().toLowerCase();
              const isPreviewable = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'].includes(ext);

              return (
                <div key={att.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 truncate" title={fileName}>
                        {fileName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {(att.size / 1024).toFixed(1)} KB · {att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString() : 'Attached'} · By {att.uploadedBy || 'TSM'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPreviewable && (
                      <button
                        type="button"
                        onClick={() => setSelectedPreview(att)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Preview</span>
                      </button>
                    )}
                    <a
                      href={`${att.path}?download=1&name=${encodeURIComponent(fileName)}`}
                      download={fileName}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0B1EE6] text-white hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Inline Preview Window */}
        {selectedPreview && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800 truncate max-w-[80%]">
                Preview: {selectedPreview.originalName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center min-h-[300px] max-h-[500px]">
              {['png', 'jpg', 'jpeg', 'webp'].includes((selectedPreview.originalName || '').split('.').pop().toLowerCase()) ? (
                <img
                  src={selectedPreview.path}
                  alt={selectedPreview.originalName}
                  className="max-h-[480px] max-w-full object-contain p-2"
                />
              ) : selectedPreview.originalName?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedPreview.path}
                  title="PDF Preview"
                  className="w-full h-[480px] border-none"
                />
              ) : (
                <iframe
                  src={selectedPreview.path}
                  title="Text Preview"
                  className="w-full h-[320px] bg-white border-none p-4 font-mono text-xs"
                />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ----------------- DELETE TASK MODAL (Feature 4) -----------------
const DeleteTaskModal = ({ task, open, onOpenChange, onConfirm }) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
            <Trash2 size={18} />
            <span>Delete Task Record</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 leading-relaxed pt-2">
            Are you sure you want to delete task <strong>{task.id}</strong> for candidate <strong>{task.candidateName || task.title}</strong>?
            <br />
            <span className="text-emerald-700 font-semibold block mt-1.5">
              ✓ Linked candidate feedback and audit trail records will be safely preserved.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-delete-task-btn"
            onClick={() => {
              onConfirm(task.id);
              onOpenChange(false);
            }}
            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Tasks() {
  const { tasks, users, feedbacks, currentRole, currentUser, reassignTask, deleteTask, unassignTask } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState({ status: 'all', taskType: 'all', assignee: 'all', sr: 'all', q: '' });
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // Modals for Attachments Viewer & Delete Confirmation
  const [selectedTaskForAttachments, setSelectedTaskForAttachments] = useState(null);
  const [attachmentViewerOpen, setAttachmentViewerOpen] = useState(false);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canManageTasks = currentRole === 'tsm' || currentRole === 'management' || currentRole === 'upper_management';

  const tseUsers = useMemo(() => (users || []).filter(u => u.role === 'tse'), [users]);
  const canAssignTse = ['tsm', 'management', 'upper_management'].includes(currentRole);
  const canViewRealName = ['tsm', 'management', 'upper_management'].includes(currentRole);

  const isMarketingTl = currentRole === 'marketing_tl';
  const tlTeam = currentUser?.team || (
    currentUser?.id === 'u-1791911058812' || (currentUser?.name || '').toLowerCase().includes('mukesh') ? 'team-mukesh' :
    currentUser?.id === 'u-1791911115518' || (currentUser?.name || '').toLowerCase().includes('shivam') ? 'team-shivam' : ''
  );
  const myTeamSrs = useMemo(() => {
    return (users || []).filter(u => u.role === 'marketing_sr' && (!tlTeam || u.team === tlTeam));
  }, [users, tlTeam]);

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
      const matchSr = !isMarketingTl || filters.sr === 'all' || t.assignedSrId === filters.sr;
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
      return matchStatus && matchType && matchAssignee && matchSr && matchQ;
    });
  }, [tasks, filters, currentRole, currentUser, isMarketingTl]);

  // Milestone 2: Automated Priority Sorting (Urgent & Elevated at the top)
  const sortedTasks = useMemo(() => {
    return sortTasksByInterviewPriority(filtered);
  }, [filtered]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / pageSize));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTasks.slice(start, start + pageSize);
  }, [sortedTasks, currentPage, pageSize]);

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
              placeholder="Search candidate, company, position, tech person, comment..."
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
          
          {/* Requirement 2: For Marketing TL, show Senior Recruiters filter instead of Tech Persons */}
          {isMarketingTl ? (
            <Select value={filters.sr} onValueChange={v => setFilters({ ...filters, sr: v })}>
              <SelectTrigger data-testid="task-filter-sr" className="bg-white border-slate-300 text-slate-900">
                <SelectValue placeholder="All Senior Recruiters" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="all">All Senior Recruiters</SelectItem>
                {myTeamSrs.map(sr => (
                  <SelectItem key={sr.id} value={sr.id}>
                    {sr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : currentRole !== 'tse' && (
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
                  <th className="py-3 px-4 font-semibold">
                    {isMarketingTl ? 'Pseudo Name' : (roleIsMarketing(currentRole) ? 'Tech ID' : 'Tech Person')}
                  </th>
                  <th className="py-3 px-3 font-semibold">Duration</th>
                  <th className="py-3 px-3 font-semibold">Task</th>
                  <th className="py-3 px-4 font-semibold">Candidate Name</th>
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">Company name</th>
                  <th className="py-3 px-4 font-semibold">Status / Outcome</th>
                  <th className="py-3 px-3 font-semibold">Attachments</th>
                  <th className="py-3 px-4 font-semibold">Comment</th>
                  <th className="py-3 px-4 font-semibold">Candidate Feedback</th>
                  <th className="py-3 px-4 font-semibold text-right">Assign TSE</th>
                  {canManageTasks && <th className="py-3 px-3 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedTasks.map(t => {
                  const a = users.find(u => u.id === t.assigneeId);
                  const isMarketing = roleIsMarketing(currentRole);

                  // Robust check for unassigned status
                  const isUnassigned = (!t.assigneeId || t.assigneeId === 'Unassigned') &&
                    (!t.techPerson || t.techPerson === 'Unassigned' || t.techPerson === 'Code Name Unassigned') &&
                    (!t.codeName || t.codeName === 'Unassigned' || t.codeName === 'Code Name Unassigned') &&
                    !a;

                  let codeName = '';
                  let realName = '';

                  if (!isUnassigned) {
                    codeName = (t.codeName && t.codeName !== 'Code Name Unassigned' && t.codeName !== 'Unassigned' ? t.codeName : '') ||
                      a?.codeName ||
                      (t.techPerson && t.techPerson !== 'Unassigned' && t.techPerson !== 'Code Name Unassigned' ? getTseCodeName(t.techPerson) : '') ||
                      (a?.name ? getTseCodeName(a.name) : '') ||
                      t.techPerson ||
                      'TSE';

                    realName = getTseRealName(codeName) ||
                      getTseRealName(t.techPerson) ||
                      getTseRealName(a?.name) ||
                      getTseRealName(t.assigneeId) ||
                      (a?.role === 'tse' ? a.name : '');
                  }

                  const techName = isUnassigned
                    ? 'Unassigned'
                    : (isMarketingTl
                      ? codeName
                      : (isMarketing
                        ? (a?.empId || a?.tttNbId || t.techPersonId || t.assigneeId || 'TSE-ID')
                        : codeName));
                  const timing = t.interviewDateTime ? getInterviewTimingMeta(t.interviewDateTime) : null;
                  const currentAssigneeId = t.assigneeId || tseUsers.find(u =>
                    (u.name && u.name.toLowerCase() === (t.techPerson || '').toLowerCase()) ||
                    (u.codeName && u.codeName.toLowerCase() === (t.techPerson || '').toLowerCase())
                  )?.id || '';

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

                      {/* Tech Person / Pseudo Name */}
                      <td className="py-3 px-4 text-slate-900">
                        {isUnassigned ? (
                          <div className="flex items-center gap-2">
                            <span className="h-7 w-7 rounded-full bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                              —
                            </span>
                            <div>
                              <div className="font-semibold whitespace-nowrap text-slate-500 text-xs italic">
                                Unassigned
                              </div>
                              {canManageTasks && (
                                <div className="text-[10px] text-blue-600 font-medium whitespace-nowrap">
                                  Assign via dropdown →
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                              {(techName || 'T').charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div className="font-semibold whitespace-nowrap text-slate-900 text-xs">
                                {techName}
                              </div>
                              {canViewRealName && realName && realName.toLowerCase() !== techName.toLowerCase() && (
                                <div className="text-[11px] text-slate-500 font-medium whitespace-nowrap mt-0.5">
                                  ({realName})
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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

                      {/* Attachments Column (Feature 3) */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs" onClick={(e) => e.stopPropagation()}>
                        {t.attachments && t.attachments.length > 0 ? (
                          <button
                            type="button"
                            data-testid={`task-attachments-btn-${t.id}`}
                            onClick={() => {
                              setSelectedTaskForAttachments(t);
                              setAttachmentViewerOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
                            title="Click to view/download attachments"
                          >
                            <Paperclip size={12} className="text-blue-600" />
                            <span>{t.attachments.length} file{t.attachments.length > 1 ? 's' : ''}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 pl-3">—</span>
                        )}
                      </td>

                      {/* Comment (formerly Remark) */}
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-[200px] truncate" title={t.remark}>
                        {t.remark ? (
                          <span className="text-amber-800 font-medium">{t.remark}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Candidate Feedback */}
                      {(() => {
                        const fb = (feedbacks || []).find(f => f.taskId === t.id || (t.candidateName && (f.candidateName || '').toLowerCase() === t.candidateName.toLowerCase()));
                        const closingComment = fb?.candidateFeedback?.closingComment || fb?.candidateClosingComment || fb?.candidateFeedback?.additionalFeedback;
                        return (
                          <td className="py-3 px-4 text-xs max-w-[220px]" title={closingComment || 'No feedback submitted yet'}>
                            {closingComment ? (
                              <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 line-clamp-2 block leading-relaxed">
                                💬 {closingComment}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Pending</span>
                            )}
                          </td>
                        );
                      })()}

                      {/* Assign TSE Dropdown with Unassign Option (Feature 4) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          {canAssignTse ? (
                            <Select
                              value={currentAssigneeId || undefined}
                              onValueChange={(val) => {
                                if (val === 'UNASSIGN_TASK') {
                                  unassignTask(t.id);
                                } else {
                                  reassignTask(t.id, val);
                                }
                              }}
                            >
                              <SelectTrigger
                                data-testid={`task-assign-select-${t.id}`}
                                className="h-8 text-xs bg-white border border-slate-300 rounded-lg w-40 font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-blue-500 hover:border-blue-400"
                              >
                                <SelectValue placeholder="Assign TSE" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-200 text-slate-900 max-h-60 z-50">
                                {canManageTasks && t.assigneeId && (
                                  <SelectItem value="UNASSIGN_TASK" className="text-amber-700 font-bold text-xs bg-amber-50/70 mb-1 border-b border-amber-200">
                                    ⚠️ Unassign TSE
                                  </SelectItem>
                                )}
                                {tseUsers.map(u => {
                                  const cName = u.codeName || u.name;
                                  const rName = getTseRealName(u.name) || getTseRealName(u.id);
                                  return (
                                    <SelectItem key={u.id} value={u.id} className="text-xs">
                                      <span className="font-bold">{cName}</span>
                                      {canViewRealName && rName && rName.toLowerCase() !== cName.toLowerCase() && (
                                        <span className="text-[11px] text-slate-500 ml-1.5 font-normal">({rName})</span>
                                      )}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">{techName}</span>
                          )}
                        </div>
                      </td>

                      {/* Actions Column (Feature 4: Unassign & Delete) */}
                      {canManageTasks && (
                        <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {t.assigneeId && (
                              <button
                                type="button"
                                title="Unassign TSE from this task"
                                data-testid={`btn-unassign-task-${t.id}`}
                                onClick={() => unassignTask(t.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              >
                                <UserMinus size={14} />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete task from queue"
                              data-testid={`btn-delete-task-${t.id}`}
                              onClick={() => {
                                setSelectedTaskForDelete(t);
                                setDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedTasks.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </SectionCard>

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} />
      <TaskDrawer task={activeTask} onClose={() => setActiveTask(null)} />
      <AttachmentViewerModal
        task={selectedTaskForAttachments}
        open={attachmentViewerOpen}
        onOpenChange={setAttachmentViewerOpen}
      />
      <DeleteTaskModal
        task={selectedTaskForDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={(id) => deleteTask(id)}
      />
    </div>
  );
}
