import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Search, Calendar as CalIcon, Building2, UserRound, Briefcase,
  CheckCircle2, Clock, MessageSquare, Filter, ChevronRight, X,
  ShieldCheck, AlertCircle, Sparkles, Award, ArrowUpRight, Check,
  Link2, Copy, ExternalLink, Share2, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatusBadge } from '../components/common';
import { calculateOverallRating, TECH_SUPPORT_TEAM, ROLES, roleIsMarketing } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';

// Color badges for session types
const typeBadgeStyles = {
  TQC: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  RUC: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  JDC: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  TAC: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Demo: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Others: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  Interview: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

// Premium Star Rating Renderer
export const StarDisplay = ({ score, state, max = 5, size = 15, showLabel = true }) => {
  if (state === 'NOT_RATED' || score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-white/5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
        Not Rated
      </span>
    );
  }

  const numeric = Number(score) || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillLevel = Math.max(0, Math.min(1, numeric - (starIndex - 1)));
          return (
            <div key={starIndex} className="relative inline-block">
              <Star size={size} className="text-slate-700" />
              {fillLevel > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden text-amber-400"
                  style={{ width: `${fillLevel * 100}%` }}
                >
                  <Star size={size} className="fill-amber-400 text-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-200 tabular-nums">
          {numeric.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Interactive Star Rating Input for Forms
const InteractiveStarPicker = ({ value, onChange, label }) => {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-medium">{label}</div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              size={22}
              className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-slate-400'}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-semibold text-slate-300 tabular-nums">{value} / 5</span>
      </div>
    </div>
  );
};

export default function FeedbackPage() {
  const { feedbacks, addMarketingReview, submitCandidateFeedback, currentRole, currentUser, createPendingFeedbackLink } = useApp();
  const canViewRealName = ['upper_management', 'management'].includes(currentRole);

  // Filters state
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drill-down states
  const [selectedTechSupport, setSelectedTechSupport] = useState(null); // { name, date }
  const [activeCandidateFeedback, setActiveCandidateFeedback] = useState(null); // record
  const [activeMarketingReviewModal, setActiveMarketingReviewModal] = useState(null); // record

  // Row-level Generated Link Modal State
  const [activeLinkModal, setActiveLinkModal] = useState(null); // { record, link }

  // Marketing review form state
  const [marketingForm, setMarketingForm] = useState({
    performance: 5,
    professionalism: 5,
    technicalKnowledge: 5,
    communication: 5,
    overallRating: 5,
    comments: '',
  });

  // Helper to build sharable candidate link
  const buildCandidateLink = (record) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const recruiter = record.recruiterName || 'Aditi Sharma';
    const tseId = record.techSupportId || 'TSE-NB-001';
    const tseName = record.techSupport || 'Abhishek';
    return `${origin}${pathname}#/candidate-saga?id=${record.id}&recruiter=${encodeURIComponent(recruiter)}&tseId=${encodeURIComponent(tseId)}&tseName=${encodeURIComponent(tseName)}&candidate=${encodeURIComponent(record.candidateName || '')}&company=${encodeURIComponent(record.company || '')}&type=${encodeURIComponent(record.techSupportType || 'TQC')}`;
  };

  const handleCopyLink = (url) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // 1-Click: Fetches DB details (recruiter name, TSE name & ID, candidate, company) directly from the row and generates link
  const handleGenerateAndCopyRowLink = (row) => {
    const selectedTse = TECH_SUPPORT_TEAM.find(t => 
      t.supportName.toLowerCase() === (row.techSupport || '').toLowerCase() ||
      t.id === row.techSupportId
    ) || TECH_SUPPORT_TEAM[0];

    const recruiter = row.recruiterName || 'Aditi Sharma';
    const team = row.teamName || 'Team Mukesh';
    const tseId = row.techSupportId || selectedTse.id;
    const tseName = row.techSupport || selectedTse.supportName;

    const link = buildCandidateLink({
      ...row,
      recruiterName: recruiter,
      techSupportId: tseId,
      techSupport: tseName,
    });

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link);
      }
    } catch (err) {}

    toast.success(`Feedback link generated & copied! Recruiter: ${recruiter} • TSE: ${tseName} (${tseId})`);
    setActiveLinkModal({
      record: {
        ...row,
        recruiterName: recruiter,
        teamName: team,
        techSupportId: tseId,
        techSupport: tseName,
      },
      link,
    });
  };

  // Filtered records for the main table
  const filteredFeedbacks = useMemo(() => {
    return (feedbacks || []).filter((item) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTech = item.techSupport?.toLowerCase().includes(q);
        const matchCand = item.candidateName?.toLowerCase().includes(q);
        const matchComp = item.company?.toLowerCase().includes(q);
        if (!matchTech && !matchCand && !matchComp) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && item.techSupportType !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'needs_marketing_review' && item.marketingReview?.reviewed) {
        return false;
      }
      if (statusFilter === 'candidate_submitted' && !item.candidateFeedback?.submitted) {
        return false;
      }
      if (statusFilter === 'marketing_reviewed' && !item.marketingReview?.reviewed) {
        return false;
      }
      if (statusFilter === 'not_rated') {
        const rating = calculateOverallRating(item.candidateFeedback, item.marketingReview);
        if (rating.state !== 'NOT_RATED') return false;
      }

      // Date range filter
      if (dateRange !== 'all') {
        const itemDate = new Date(item.date);
        const now = new Date();
        if (dateRange === 'today') {
          const todayStr = now.toISOString().slice(0, 10);
          if (item.date !== todayStr && item.date !== '2026-10-08') return false;
        } else if (dateRange === 'week') {
          const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 7 || diffDays < -7) return false;
        } else if (dateRange === 'month') {
          if (itemDate.getMonth() !== now.getMonth() && itemDate.getMonth() !== 9) return false;
        }
      }

      return true;
    });
  }, [feedbacks, search, dateRange, typeFilter, statusFilter]);

  // Candidates for the drill-down tech support view
  const drillDownRecords = useMemo(() => {
    if (!selectedTechSupport) return [];
    return (feedbacks || []).filter(
      (f) =>
        f.techSupport === selectedTechSupport.name &&
        (!selectedTechSupport.date || f.date === selectedTechSupport.date)
    );
  }, [feedbacks, selectedTechSupport]);

  // Drill-down average rating for selected Tech Support
  const drillDownAvgRating = useMemo(() => {
    if (drillDownRecords.length === 0) return null;
    let sum = 0;
    let count = 0;
    drillDownRecords.forEach((r) => {
      const res = calculateOverallRating(r.candidateFeedback, r.marketingReview);
      if (res.score !== null) {
        sum += res.score;
        count += 1;
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : null;
  }, [drillDownRecords]);

  // Counts for Marketing Evaluation
  const pendingTseReviews = useMemo(() => {
    return (feedbacks || []).filter(f => !f.marketingReview?.reviewed).length;
  }, [feedbacks]);

  const completedTseReviews = useMemo(() => {
    return (feedbacks || []).filter(f => f.marketingReview?.reviewed).length;
  }, [feedbacks]);

  // Open marketing review modal for a specific record
  const handleOpenMarketingReview = (record) => {
    if (record.marketingReview) {
      setMarketingForm({
        performance: record.marketingReview.performance || 5,
        professionalism: record.marketingReview.professionalism || 5,
        technicalKnowledge: record.marketingReview.technicalKnowledge || 5,
        communication: record.marketingReview.communication || 5,
        overallRating: record.marketingReview.overallRating || 5,
        comments: record.marketingReview.comments || '',
      });
    } else {
      setMarketingForm({
        performance: 5,
        professionalism: 5,
        technicalKnowledge: 5,
        communication: 5,
        overallRating: 5,
        comments: '',
      });
    }
    setActiveMarketingReviewModal(record);
  };

  // Submit marketing review
  const handleSaveMarketingReview = () => {
    if (!activeMarketingReviewModal) return;
    const reviewerRoleLabel = ROLES[currentRole]?.label || 'Marketing';
    const reviewerName = currentUser?.name || 'Marketing Evaluator';
    const reviewerIdentity = `${reviewerName} (${reviewerRoleLabel})`;
    addMarketingReview(activeMarketingReviewModal.id, {
      ...marketingForm,
      reviewedBy: reviewerIdentity,
      reviewerRole: currentRole,
    });
    setActiveMarketingReviewModal(null);
  };

  const isMarketingEvaluator = currentRole === 'marketing_tl' || currentRole === 'marketing_sr';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Management"
        subtitle="Candidate session feedback, TSE evaluations, and tech support performance ratings."
      />

      {/* Role Responsibility Banner for Marketing Evaluators (Marketing TL & Marketing SR) */}
      {isMarketingEvaluator && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50 border border-purple-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Marketing Evaluation Console</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  {currentUser?.name || 'Marketing Lead'} ({ROLES[currentRole]?.label || 'Marketing'})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Generate feedback links for each candidate session below, track live submissions, and log TSE reviews.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'needs_marketing_review' ? 'all' : 'needs_marketing_review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                statusFilter === 'needs_marketing_review'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                  : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50/70 shadow-xs'
              }`}
            >
              <Clock size={12} />
              <span>Pending TSE Reviews ({pendingTseReviews})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'marketing_reviewed' ? 'all' : 'marketing_reviewed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                statusFilter === 'marketing_reviewed'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50/70 shadow-xs'
              }`}
            >
              <CheckCircle2 size={12} />
              <span>Reviewed ({completedTseReviews})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Tech Support, candidate, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1416c1] focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  dateRange === tab.id
                    ? 'bg-[#1416c1] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1416c1] shadow-xs"
          >
            <option value="all">All Types</option>
            <option value="TQC">TQC</option>
            <option value="RUC">RUC</option>
            <option value="JDC">JDC</option>
            <option value="TAC">TAC</option>
            <option value="Demo">Demo</option>
          </select>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1416c1] shadow-xs"
          >
            <option value="all">All Feedback Status</option>
            <option value="needs_marketing_review">Pending TSE Review ⏳</option>
            <option value="marketing_reviewed">TSE Reviewed by Marketing ✓</option>
            <option value="candidate_submitted">Candidate Submitted ✓</option>
            <option value="not_rated">Not Rated</option>
          </select>
        </div>
      </div>

      {/* Main Feedback Table */}
      <SectionCard
        title="Session Feedback Records"
        actions={
          <div className="text-xs text-slate-400">
            Showing <span className="text-slate-200 font-semibold">{filteredFeedbacks.length}</span> records
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold bg-slate-50/70">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">{roleIsMarketing(currentRole) ? 'Tech ID' : 'Tech Support'}</th>
                <th className="py-3 px-4">Candidate & Recruiter</th>
                <th className="py-3 px-4">Status & Overall Stars</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No feedback records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((row) => {
                  const rating = calculateOverallRating(row.candidateFeedback, row.marketingReview);
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Column 1: Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {row.date}
                      </td>

                      {/* Column 2: Tech Support (Clickable to open Detail View) */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedTechSupport({ name: row.techSupport, date: row.date })}
                          className="flex items-center gap-2 text-left group/btn"
                        >
                          <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 text-[#1416c1] flex items-center justify-center font-bold text-xs shrink-0 group-hover/btn:border-[#1416c1]">
                            {roleIsMarketing(currentRole) ? '#' : (row.techSupport?.charAt(0) || 'T')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover/btn:text-[#1416c1] transition-colors flex items-center gap-1.5">
                              {roleIsMarketing(currentRole) ? (
                                <span className="font-mono text-[#1416c1] font-semibold">{row.techSupportId || 'TSE-ID'}</span>
                              ) : (
                                <>
                                  <span>{row.techSupport}</span>
                                  {row.techSupportId && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-[#1416c1]">
                                      {row.techSupportId}
                                    </span>
                                  )}
                                </>
                              )}
                              <ChevronRight size={13} className="opacity-0 group-hover/btn:opacity-100 -translate-x-1 group-hover/btn:translate-x-0 transition-all text-[#1416c1]" />
                            </div>
                            {!roleIsMarketing(currentRole) && (
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                {row.techSupportEmail || (TECH_SUPPORT_TEAM.find(t => t.supportName === row.techSupport)?.email) || 'nbtech@netbounceplacement.com'}
                              </div>
                            )}
                          </div>
                        </button>
                      </td>

                      {/* Column 3: Candidate & Recruiter */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {row.candidateName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 size={11} className="text-slate-400" />
                            {row.company}
                          </span>
                          <span>•</span>
                          <span className={`px-1.5 rounded text-[9px] font-mono border ${typeBadgeStyles[row.techSupportType] || 'border-slate-200 text-slate-600 bg-slate-50'}`}>
                            {row.techSupportType}
                          </span>
                        </div>
                        {/* Recruiter & Team Badges */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Recruiter: {row.recruiterName || 'Aditi Sharma'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {row.teamName || 'Team Mukesh'}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Candidate Status & Overall Stars */}
                      <td className="py-3.5 px-4">
                        {row.candidateFeedback?.submitted ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                                <CheckCircle2 size={11} className="text-emerald-600" />
                                Submitted ✓
                              </span>
                              <StarDisplay score={rating.score} state={rating.state} size={14} />
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                              {rating.state === 'COMBINED' && (
                                <span className="text-emerald-700 font-semibold">Combined (70% Cnd / 30% Mkt)</span>
                              )}
                              {rating.state === 'CANDIDATE_ONLY' && (
                                <span className="text-blue-700 font-semibold">Candidate Feedback Only</span>
                              )}
                              {rating.state === 'MARKETING_ONLY' && (
                                <span className="text-amber-700 font-semibold">Marketing Review (Cnd Pending)</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 w-fit shadow-xs">
                              <Clock size={11} className="text-amber-600 animate-pulse" />
                              <span>Pending Candidate Feedback</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Awaiting candidate submission
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 5: Actions (Generate Link + Log TSE Review) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Generate Link Button for SR / TL right next to TSE review */}
                          <button
                            type="button"
                            onClick={() => handleGenerateAndCopyRowLink(row)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-600/25 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            title="Fetch details from DB and copy candidate feedback link"
                          >
                            <Link2 size={12} />
                            <span>Generate Link</span>
                          </button>

                          {/* TSE Review Button */}
                          {row.marketingReview?.reviewed ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 hidden sm:inline-flex">
                                <Check size={10} className="text-purple-600" />
                                Reviewed
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenMarketingReview(row)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shadow-xs"
                              >
                                Edit Review
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenMarketingReview(row)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm shadow-purple-600/30 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <ShieldCheck size={12} />
                              <span>Log TSE Review</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* TECH SUPPORT DETAIL VIEW (Drawer / Modal) */}
      <Dialog open={!!selectedTechSupport} onOpenChange={(open) => !open && setSelectedTechSupport(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-4xl max-h-[88vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1416c1] uppercase tracking-wider">
                <UserRound size={14} />
                <span>Tech Support Detail View</span>
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-3">
                {roleIsMarketing(currentRole) ? (
                  <span className="font-mono text-[#1416c1]">{TECH_SUPPORT_TEAM.find(t => t.supportName === selectedTechSupport?.name)?.id || selectedTechSupport?.name || 'TSE-ID'}</span>
                ) : (
                  <>
                    <span>{selectedTechSupport?.name}</span>
                    {TECH_SUPPORT_TEAM.find(t => t.supportName === selectedTechSupport?.name) && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1416c1]">
                        {TECH_SUPPORT_TEAM.find(t => t.supportName === selectedTechSupport?.name)?.id}
                      </span>
                    )}
                  </>
                )}
                {drillDownAvgRating && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1 font-semibold">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {drillDownAvgRating} avg rating
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Date: <strong className="text-slate-700">{selectedTechSupport?.date || 'All Recorded Dates'}</strong></span>
                {!roleIsMarketing(currentRole) && TECH_SUPPORT_TEAM.find(t => t.supportName === selectedTechSupport?.name) && canViewRealName && (
                  <>
                    <span>•</span>
                    <span>Employee: <strong className="text-slate-700">{TECH_SUPPORT_TEAM.find(t => t.supportName === selectedTechSupport?.name)?.employeeName}</strong></span>
                    <span>•</span>
                    <span className="text-[#1416c1] font-mono">{TECH_SUPPORT_TEAM.find(t => t.supportName === selectedTechSupport?.name)?.email}</span>
                  </>
                )}
              </DialogDescription>
            </div>

            {/* Total Candidates Handled KPI Badge */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Candidates Handled</div>
              <div className="text-2xl font-extrabold text-[#1416c1] mt-0.5 tabular-nums">
                {drillDownRecords.length}
              </div>
            </div>
          </div>

          {/* Body: Candidate Breakdown Table */}
          <div className="p-5 overflow-y-auto flex-1">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Round</th>
                    <th className="py-3 px-4">Tech Support Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drillDownRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No candidate sessions found for this engineer on this date.
                      </td>
                    </tr>
                  ) : (
                    drillDownRecords.map((item) => {
                      const candFeedbackSubmitted = item.candidateFeedback?.submitted;
                      const marketingReviewed = item.marketingReview?.reviewed;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Candidate */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{item.candidateName}</div>
                            <div className="text-[10px] text-slate-500">{item.candidateEmail}</div>
                          </td>

                          {/* Company */}
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={13} className="text-[#1416c1]" />
                              <span>{item.company}</span>
                            </div>
                          </td>

                          {/* Round */}
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.round}
                          </td>

                          {/* Tech Support Type */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${typeBadgeStyles[item.techSupportType] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {item.techSupportType}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Candidate Feedback Button */}
                              <button
                                type="button"
                                onClick={() => setActiveCandidateFeedback(item)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                  candFeedbackSubmitted
                                    ? 'bg-blue-50 text-[#1416c1] border-blue-200 hover:bg-blue-100'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                                }`}
                              >
                                <span>View Candidate Feedback</span>
                                {candFeedbackSubmitted && <Check size={12} className="text-[#1416c1]" />}
                              </button>

                              {/* Marketing Review Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenMarketingReview(item)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                  marketingReviewed
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:from-purple-500 hover:to-indigo-500 shadow-xs'
                                }`}
                              >
                                <span>{marketingReviewed ? 'Edit Mkt Review' : 'Marketing Review'}</span>
                                {marketingReviewed && <Check size={12} className="text-purple-600" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {drillDownRecords.length} sessions for {selectedTechSupport?.name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedTechSupport(null)}
              className="h-9 px-5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CANDIDATE FEEDBACK DIALOG */}
      <Dialog open={!!activeCandidateFeedback} onOpenChange={(open) => !open && setActiveCandidateFeedback(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-xl max-h-[88vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-2xl">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1416c1] uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Candidate Submitted Feedback</span>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 mt-1">
              {activeCandidateFeedback?.candidateName}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Source: Candidate SAGA Feedback Form • {activeCandidateFeedback?.candidateFeedback?.timestamp || activeCandidateFeedback?.timestamp}
            </DialogDescription>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            {activeCandidateFeedback?.candidateFeedback?.submitted ? (
              <>
                {/* Session Meta Card */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Candidate Email</div>
                    <div className="text-slate-800 font-semibold truncate mt-0.5">{activeCandidateFeedback.candidateEmail}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Recruiter Name</div>
                    <div className="text-slate-800 font-semibold mt-0.5">{activeCandidateFeedback.recruiterName || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Job Role</div>
                    <div className="text-slate-800 font-semibold mt-0.5">{activeCandidateFeedback.jobRole || 'Engineer'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Company</div>
                    <div className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1">
                      <Building2 size={11} className="text-[#1416c1]" />
                      {activeCandidateFeedback.company}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Interview Date</div>
                    <div className="text-slate-800 font-semibold mt-0.5">{activeCandidateFeedback.date}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Interview / Session Type</div>
                    <div className="text-slate-800 font-semibold mt-0.5">{activeCandidateFeedback.techSupportType} ({activeCandidateFeedback.round})</div>
                  </div>
                  <div className="col-span-2 sm:col-span-3 pt-2 mt-1 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Assigned Tech Support Engineer</div>
                      <div className="text-slate-900 font-bold flex items-center gap-1.5 mt-0.5">
                        <span className="text-[#1416c1]">{activeCandidateFeedback.techSupport}</span>
                        {activeCandidateFeedback.techSupportId && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-[#1416c1] border border-blue-200">
                            {activeCandidateFeedback.techSupportId}
                          </span>
                        )}
                        {canViewRealName && activeCandidateFeedback.employeeName && (
                          <span className="text-slate-500 font-medium text-xs">({activeCandidateFeedback.employeeName})</span>
                        )}
                      </div>
                    </div>
                    {canViewRealName && activeCandidateFeedback.techSupportEmail && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-slate-500 font-bold">Support Email</div>
                        <div className="text-[#1416c1] font-mono text-[11px] mt-0.5">{activeCandidateFeedback.techSupportEmail}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ratings Breakdown */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800">Ratings Given by Candidate</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Tech Support Performance</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StarDisplay
                          score={activeCandidateFeedback.candidateFeedback.performanceRating}
                          state="CANDIDATE_ONLY"
                          size={16}
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">Overall Experience</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StarDisplay
                          score={activeCandidateFeedback.candidateFeedback.experienceRating}
                          state="CANDIDATE_ONLY"
                          size={16}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Comments */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#1416c1]" />
                    <span>Candidate Feedback & Comments</span>
                  </div>
                  <blockquote className="p-3 rounded-lg bg-white border-l-4 border-[#1416c1] border border-slate-200 text-slate-700 italic text-xs leading-relaxed">
                    "{activeCandidateFeedback.candidateFeedback.comments || 'No additional comments provided by candidate.'}"
                  </blockquote>
                </div>
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Feedback Pending</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    The candidate has not yet submitted feedback for this session through the Candidate SAGA landing page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    submitCandidateFeedback(activeCandidateFeedback.id, {
                      performanceRating: 5.0,
                      experienceRating: 5.0,
                      comments: 'Simulated feedback submission from Candidate SAGA landing page for testing.',
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1416c1] text-white font-semibold hover:bg-blue-700 text-xs shadow-md transition-colors"
                >
                  Simulate SAGA Feedback Submission
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setActiveCandidateFeedback(null)}
              className="h-9 px-5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MARKETING REVIEW DIALOG */}
      <Dialog open={!!activeMarketingReviewModal} onOpenChange={(open) => !open && setActiveMarketingReviewModal(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-lg max-h-[88vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-2xl">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>Log TSE Performance Review</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-100 text-purple-800 border border-purple-200 font-semibold">
                {ROLES[currentRole]?.label || 'Marketing'}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <span>Evaluating:</span>
              <span className="text-purple-700">{activeMarketingReviewModal?.techSupport}</span>
              {activeMarketingReviewModal?.techSupportId && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1416c1]">
                  {activeMarketingReviewModal?.techSupportId}
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 mt-1 flex flex-col gap-0.5">
              <div>
                Candidate: <strong className="text-slate-800">{activeMarketingReviewModal?.candidateName}</strong> • {activeMarketingReviewModal?.company} ({activeMarketingReviewModal?.techSupportType})
              </div>
              <div className="text-[11px] text-purple-800">
                Evaluator: <strong>{currentUser?.name || 'Marketing'}</strong> ({ROLES[currentRole]?.label || 'Marketing Team'})
              </div>
            </DialogDescription>
          </div>

          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-[11px] leading-relaxed">
              <strong>Evaluation Formula:</strong> When saved by Marketing TL / SR, the overall rating combines <strong>70% Candidate Feedback</strong> and <strong>30% Marketing TSE Review</strong>.
            </div>

            {/* Form Fields: 1 to 5 Stars */}
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <InteractiveStarPicker
                label="1. Technical Performance & Assistance"
                value={marketingForm.performance}
                onChange={(v) => setMarketingForm({ ...marketingForm, performance: v })}
              />
              <InteractiveStarPicker
                label="2. Professionalism & Punctuality"
                value={marketingForm.professionalism}
                onChange={(v) => setMarketingForm({ ...marketingForm, professionalism: v })}
              />
              <InteractiveStarPicker
                label="3. Technical Knowledge & Problem Solving"
                value={marketingForm.technicalKnowledge}
                onChange={(v) => setMarketingForm({ ...marketingForm, technicalKnowledge: v })}
              />
              <InteractiveStarPicker
                label="4. Communication & Candidate Handling"
                value={marketingForm.communication}
                onChange={(v) => setMarketingForm({ ...marketingForm, communication: v })}
              />
              <InteractiveStarPicker
                label="5. Overall TSE Evaluation Score"
                value={marketingForm.overallRating}
                onChange={(v) => setMarketingForm({ ...marketingForm, overallRating: v })}
              />
            </div>

            {/* Comments Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                6. Marketing Observations & Feedback for TSE (Optional)
              </label>
              <Textarea
                rows={3}
                placeholder="Enter observations on TSE's support quality, candidate rapport, technical proficiency, adherence to protocol..."
                value={marketingForm.comments}
                onChange={(e) => setMarketingForm({ ...marketingForm, comments: e.target.value })}
                className="bg-white border-slate-300 text-slate-900 placeholder-slate-400 text-xs rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-200"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-600">
              Logging as: <span className="text-slate-900 font-bold">{currentUser?.name || 'Marketing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMarketingReviewModal(null)}
                className="h-9 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMarketingReview}
                className="h-9 px-5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Save TSE Review</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 1-CLICK GENERATED CANDIDATE LINK MODAL (Row-driven) */}
      <Dialog open={!!activeLinkModal} onOpenChange={(open) => !open && setActiveLinkModal(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-lg overflow-hidden flex flex-col p-0 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 border border-blue-200 text-[#1416c1] flex items-center justify-center font-bold shadow-xs">
                <Link2 size={20} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Candidate Feedback Link Generated
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Direct link generated with assigned NetBounce recruiter & TSE.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body */}
          {activeLinkModal && (
            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* Success Notification */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-emerald-800">
                    Link Generated & Copied to Clipboard!
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    This link can now be shared with the candidate by Marketing SR or TL.
                  </div>
                </div>
              </div>

              {/* DB Record Details Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Session & DB Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-800">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Candidate</span>
                    <span className="font-bold text-slate-900">{activeLinkModal.record.candidateName}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{activeLinkModal.record.company || 'N/A'} • {activeLinkModal.record.techSupportType || 'TQC'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">NetBounce Recruiter</span>
                    <span className="font-bold text-purple-700">{activeLinkModal.record.recruiterName || 'Aditi Sharma'}</span>
                    <span className="text-[10px] text-slate-500 block">{activeLinkModal.record.teamName || 'Team Mukesh'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Assigned TSE</span>
                    <span className="font-bold text-[#1416c1]">{activeLinkModal.record.techSupport}</span>
                    <span className="text-[10px] font-mono text-blue-600 block">{activeLinkModal.record.techSupportId}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Submission Status</span>
                    {activeLinkModal.record.candidateFeedback?.submitted ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs mt-0.5">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Submitted ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 text-xs mt-0.5">
                        <Clock size={12} className="text-amber-600 animate-pulse" /> Pending ⏳
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Candidate Feedback URL Input with Copy */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Candidate Feedback URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeLinkModal.link}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(activeLinkModal.link)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1416c1] hover:bg-[#191bf0] text-white flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                  >
                    <Copy size={13} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp / Email message snippet */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Ready-to-Send Message</span>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Hi ${activeLinkModal.record.candidateName}, please share your valuable feedback for your technical session with ${activeLinkModal.record.techSupport} (${activeLinkModal.record.techSupportId}) from NetBounce:\n${activeLinkModal.link}`;
                      handleCopyLink(msg);
                    }}
                    className="text-xs font-semibold text-[#1416c1] hover:underline flex items-center gap-1"
                  >
                    <Copy size={11} /> Copy Message
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono text-[11px]">
                  Hi {activeLinkModal.record.candidateName}, please share your valuable feedback for your technical session with {activeLinkModal.record.techSupport} (NetBounce):<br />
                  <span className="text-[#1416c1] break-all">{activeLinkModal.link}</span>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={activeLinkModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#1416c1] hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  <span>Open & Test Candidate View</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveLinkModal(null)}
              className="h-9 px-5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
