import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Award, AlertTriangle, Briefcase, Building2, UserRound,
  Download, FileSpreadsheet, FileText, Search, Filter, X, ChevronRight,
  Star, CheckCircle2, Clock, ShieldCheck, ArrowUpDown, ChevronDown,
  Layers, Sparkles, RefreshCw, Eye, ChevronUp
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatusBadge } from '../components/common';
import { calculateOverallRating, TECH_SUPPORT_TEAM, roleIsMarketing, formatTseNameForRole } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

// Performance Classification Utility (Configurable thresholds)
export const getPerformanceCategory = (overallRating, reviewCount = 1) => {
  if (overallRating === null || overallRating === undefined || reviewCount === 0) {
    return {
      label: 'Insufficient Feedback',
      color: 'slate',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      badgeDot: 'bg-slate-400',
    };
  }
  const score = Number(overallRating);
  if (score >= 4.5) {
    return {
      label: 'Excellent',
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeDot: 'bg-emerald-500',
    };
  }
  if (score >= 4.0) {
    return {
      label: 'Very Good',
      color: 'cyan',
      badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      badgeDot: 'bg-cyan-500',
    };
  }
  if (score >= 3.5) {
    return {
      label: 'Good',
      color: 'blue',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeDot: 'bg-blue-500',
    };
  }
  if (score >= 3.0) {
    return {
      label: 'Average',
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      badgeDot: 'bg-amber-500',
    };
  }
  return {
    label: 'Needs Improvement',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeDot: 'bg-rose-500',
  };
};

// Convert numeric rating to Unicode Stars string (for Excel export)
export const toUnicodeStars = (rating) => {
  if (rating === null || rating === undefined) return 'Not Rated';
  const num = Math.round(Number(rating));
  const fullStars = Math.max(0, Math.min(5, num));
  const emptyStars = 5 - fullStars;
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars) + ` ${Number(rating).toFixed(2)}`;
};

// Draw crisp Vector Stars in jsPDF (prevents '& & & & &' bug in standard fonts)
const drawPdfStars = (doc, x, y, score, max = 5, size = 1.1) => {
  if (score === null || score === undefined || score === '—' || score === 'Not Rated' || score === 'Pending') return;
  const num = Number(score) || 0;
  for (let i = 0; i < max; i++) {
    const starX = x + i * (size * 2.7);
    const starY = y;
    const isFilled = i < Math.floor(num + 0.15);

    if (isFilled) {
      doc.setFillColor(245, 158, 11); // Vibrant Amber Gold #F59E0B
      doc.setDrawColor(217, 119, 6);
    } else {
      doc.setFillColor(226, 232, 240); // Soft grey outline
      doc.setDrawColor(203, 213, 225);
    }

    const outerR = size;
    const innerR = size * 0.42;
    const points = [];
    for (let p = 0; p < 10; p++) {
      const angle = (p * 36 - 90) * (Math.PI / 180);
      const r = p % 2 === 0 ? outerR : innerR;
      points.push([starX + r * Math.cos(angle), starY + r * Math.sin(angle)]);
    }

    for (let t = 0; t < 10; t++) {
      const p1 = points[t];
      const p2 = points[(t + 1) % 10];
      doc.triangle(starX, starY, p1[0], p1[1], p2[0], p2[1], 'FD');
    }
  }
};

// Star Rating Display Component (Web UI)
export const StarRating = ({ rating, size = 15, showLabel = true }) => {
  if (rating === null || rating === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Not Rated
      </span>
    );
  }

  const numeric = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillLevel = Math.max(0, Math.min(1, numeric - (starIndex - 1)));
          return (
            <div key={starIndex} className="relative inline-block">
              <Star size={size} className="text-slate-300" />
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
        <span className="text-xs font-semibold text-slate-800 tabular-nums ml-0.5">
          {numeric.toFixed(2)}
        </span>
      )}
    </div>
  );
};

// Session Type Badge styles
const sessionTypeBadge = {
  TQC: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  RUC: 'bg-pink-50 text-pink-700 border-pink-200',
  JDC: 'bg-rose-50 text-rose-700 border-rose-200',
  TAC: 'bg-amber-50 text-amber-800 border-amber-200',
  Demo: 'bg-purple-50 text-purple-700 border-purple-200',
  Others: 'bg-slate-100 text-slate-700 border-slate-200',
  Interview: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function ReportsPage() {
  const { feedbacks, currentRole } = useApp();
  const canViewRealName = ['upper_management', 'management', 'tsm'].includes(currentRole);

  // Search & Filters State
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'last_month'
  const [selectedTseFilter, setSelectedTseFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [perfFilter, setPerfFilter] = useState('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all');
  const [marketingFilter, setMarketingFilter] = useState('all');

  // Sorting State (Default: Overall Rating Descending)
  const [sortBy, setSortBy] = useState('overallRating');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Technology Expand State ("View All" toggles full list of roles)
  const [showAllTechs, setShowAllTechs] = useState(false);

  // Drill-down State
  const [drillDownTse, setDrillDownTse] = useState(null);

  // Export Loading States
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [excelExporting, setExcelExporting] = useState(false);

  // Available Filter Options derived dynamically from actual data
  const filterOptions = useMemo(() => {
    const roles = new Set();
    const companies = new Set();
    const rounds = new Set();
    const types = new Set();

    (feedbacks || []).forEach(f => {
      if (f.jobRole) roles.add(f.jobRole);
      if (f.company) companies.add(f.company);
      if (f.round) rounds.add(f.round);
      if (f.techSupportType) types.add(f.techSupportType);
    });

    return {
      roles: Array.from(roles).sort(),
      companies: Array.from(companies).sort(),
      rounds: Array.from(rounds).sort(),
      types: Array.from(types).sort(),
    };
  }, [feedbacks]);

  // Master Filtered Candidate Sessions
  const filteredSessions = useMemo(() => {
    return (feedbacks || []).filter((item) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTseName = item.techSupport?.toLowerCase().includes(q);
        const matchTseId = item.techSupportId?.toLowerCase().includes(q);
        const matchEmail = (item.techSupportEmail || '').toLowerCase().includes(q);
        const matchCandidate = item.candidateName?.toLowerCase().includes(q);
        const matchCompany = item.company?.toLowerCase().includes(q);
        const matchJobRole = (item.jobRole || '').toLowerCase().includes(q);
        if (!matchTseName && !matchTseId && !matchEmail && !matchCandidate && !matchCompany && !matchJobRole) {
          return false;
        }
      }

      // 2. Date Range
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
        } else if (dateRange === 'last_month') {
          const prevMonth = (now.getMonth() + 11) % 12;
          if (itemDate.getMonth() !== prevMonth) return false;
        }
      }

      // 3. TSE Filter
      if (selectedTseFilter !== 'all' && item.techSupport !== selectedTseFilter) {
        return false;
      }

      // 4. Technology / Job Role Filter
      if (techFilter !== 'all' && item.jobRole !== techFilter) {
        return false;
      }

      // 5. Company Filter
      if (companyFilter !== 'all' && item.company !== companyFilter) {
        return false;
      }

      // 6. Round Filter
      if (roundFilter !== 'all' && item.round !== roundFilter) {
        return false;
      }

      // 7. Tech Support Type Filter
      if (typeFilter !== 'all' && item.techSupportType !== typeFilter) {
        return false;
      }

      // 8. Feedback Status Filter
      if (feedbackStatusFilter === 'submitted' && !item.candidateFeedback?.submitted) {
        return false;
      }
      if (feedbackStatusFilter === 'pending' && item.candidateFeedback?.submitted) {
        return false;
      }

      // 9. Marketing Review Filter
      if (marketingFilter === 'reviewed' && !item.marketingReview?.reviewed) {
        return false;
      }
      if (marketingFilter === 'not_reviewed' && item.marketingReview?.reviewed) {
        return false;
      }

      return true;
    });
  }, [
    feedbacks, search, dateRange, selectedTseFilter, techFilter,
    companyFilter, roundFilter, typeFilter, feedbackStatusFilter, marketingFilter
  ]);

  // TSE-Level Aggregation (Computed dynamically from Real Sessions)
  const tseAnalytics = useMemo(() => {
    const tseMap = new Map();

    TECH_SUPPORT_TEAM.forEach(t => {
      tseMap.set(t.supportName, {
        id: t.id,
        name: t.supportName,
        employeeName: t.employeeName,
        email: t.email,
        candidatesHandled: 0,
        sessions: [],
        candidateRatings: [],
        marketingRatings: [],
        combinedScores: [],
      });
    });

    // Populate with filtered sessions
    filteredSessions.forEach(session => {
      const name = session.techSupport;
      if (!name) return;

      if (!tseMap.has(name)) {
        tseMap.set(name, {
          id: session.techSupportId || 'TSE-NB-999',
          name,
          employeeName: session.employeeName || name,
          email: session.techSupportEmail || `${name.toLowerCase()}@netbounceplacement.com`,
          candidatesHandled: 0,
          sessions: [],
          candidateRatings: [],
          marketingRatings: [],
          combinedScores: [],
        });
      }

      const tse = tseMap.get(name);
      tse.candidatesHandled += 1;
      tse.sessions.push(session);

      // Candidate rating
      if (session.candidateFeedback?.submitted) {
        const cScore = Number(session.candidateFeedback.performanceRating || session.candidateFeedback.experienceRating || 0);
        if (cScore > 0) tse.candidateRatings.push(cScore);
      }

      // Marketing rating
      if (session.marketingReview?.reviewed) {
        const mScore = Number(session.marketingReview.overallRating || session.marketingReview.performance || 0);
        if (mScore > 0) tse.marketingRatings.push(mScore);
      }

      // Combined session rating
      const rating = calculateOverallRating(session.candidateFeedback, session.marketingReview);
      if (rating.score !== null) {
        tse.combinedScores.push(rating.score);
      }
    });

    // Compute final aggregated metrics per TSE
    const result = Array.from(tseMap.values()).map(tse => {
      const candidateAvg = tse.candidateRatings.length > 0
        ? tse.candidateRatings.reduce((a, b) => a + b, 0) / tse.candidateRatings.length
        : null;

      const marketingAvg = tse.marketingRatings.length > 0
        ? tse.marketingRatings.reduce((a, b) => a + b, 0) / tse.marketingRatings.length
        : null;

      const overallRating = tse.combinedScores.length > 0
        ? tse.combinedScores.reduce((a, b) => a + b, 0) / tse.combinedScores.length
        : null;

      const perfCategory = getPerformanceCategory(overallRating, tse.combinedScores.length);

      return {
        ...tse,
        candidateAvg,
        candidateCount: tse.candidateRatings.length,
        marketingAvg,
        marketingCount: tse.marketingRatings.length,
        overallRating,
        overallRatingFormatted: overallRating !== null ? overallRating.toFixed(2) : null,
        starsFormatted: toUnicodeStars(overallRating),
        performance: perfCategory,
      };
    });

    // Filter by performance tier if selected
    if (perfFilter !== 'all') {
      return result.filter(t => t.performance.label === perfFilter);
    }

    return result;
  }, [filteredSessions, perfFilter]);

  // Sorted TSE Table Data
  const sortedTseList = useMemo(() => {
    return [...tseAnalytics].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'overallRating') {
        const aScore = a.overallRating ?? -1;
        const bScore = b.overallRating ?? -1;
        comparison = aScore - bScore;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'candidatesHandled') {
        comparison = a.candidatesHandled - b.candidatesHandled;
      } else if (sortBy === 'performance') {
        comparison = a.performance.label.localeCompare(b.performance.label);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [tseAnalytics, sortBy, sortOrder]);

  // Card 1: Top 3 Performing TSEs (Dynamically Ranked)
  const topPerformers = useMemo(() => {
    return [...tseAnalytics]
      .filter(t => t.overallRating !== null && t.combinedScores.length > 0)
      .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))
      .slice(0, 3);
  }, [tseAnalytics]);

  // Card 2: Interview Technologies / Job Roles Distribution
  const technologyStats = useMemo(() => {
    const counts = {};
    filteredSessions.forEach(s => {
      const role = s.jobRole || 'Unspecified Role';
      counts[role] = (counts[role] || 0) + 1;
    });

    const total = filteredSessions.length || 1;
    return Object.entries(counts)
      .map(([tech, count]) => ({
        tech,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredSessions]);

  // Card 3: Low Performing TSEs (Rating < 3.5 or lowest relative, excluding unrated)
  const lowPerformers = useMemo(() => {
    return [...tseAnalytics]
      .filter(t => t.overallRating !== null && t.overallRating < 3.5 && t.combinedScores.length > 0)
      .sort((a, b) => (a.overallRating || 0) - (b.overallRating || 0));
  }, [tseAnalytics]);

  const unratedCount = useMemo(() => {
    return tseAnalytics.filter(t => t.overallRating === null).length;
  }, [tseAnalytics]);

  // Sorting Handler
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setSearch('');
    setDateRange('all');
    setSelectedTseFilter('all');
    setTechFilter('all');
    setCompanyFilter('all');
    setRoundFilter('all');
    setTypeFilter('all');
    setPerfFilter('all');
    setFeedbackStatusFilter('all');
    setMarketingFilter('all');
  };

  const hasActiveFilters = search || dateRange !== 'all' || selectedTseFilter !== 'all' ||
    techFilter !== 'all' || companyFilter !== 'all' || roundFilter !== 'all' ||
    typeFilter !== 'all' || perfFilter !== 'all' || feedbackStatusFilter !== 'all' || marketingFilter !== 'all';

  // =========================================================================
  // PDF EXPORT HANDLER (NetBounce Royal Blue, White KPI cards with Black border, Vector Stars)
  // =========================================================================
  const handleDownloadPdf = async () => {
    try {
      setPdfGenerating(true);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const nowStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      // PAGE 1: NETBOUNCE ROYAL BLUE BANNER (Matches official NB logo: #1423c3)
      doc.setFillColor(20, 35, 195);
      doc.rect(0, 0, pageWidth, 42, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('NETBOUNCE OPERATIONS', 14, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(224, 231, 255);
      doc.text('TSE PERFORMANCE & FEEDBACK INTELLIGENCE REPORT', 14, 25);

      doc.setFontSize(8);
      doc.setTextColor(199, 210, 254);
      doc.text(`Generated: ${nowStr}  |  Scope: Filtered Executive Intelligence`, 14, 32);

      // KPI Metric Summary Boxes
      let yPos = 52;
      const totalCandidates = filteredSessions.length;
      const evaluatedTses = tseAnalytics.filter(t => t.overallRating !== null);
      const overallAvg = evaluatedTses.length > 0
        ? (evaluatedTses.reduce((acc, t) => acc + t.overallRating, 0) / evaluatedTses.length).toFixed(2)
        : 'N/A';

      // 4 Metric cards on Page 1 (WHITE BACKGROUND, BLACK BORDER, BLACK TEXT)
      const cards = [
        { label: 'TOTAL ACTIVE TSES', val: `${tseAnalytics.length}` },
        { label: 'CANDIDATES HANDLED', val: `${totalCandidates}` },
        { label: 'TEAM AVG RATING', val: overallAvg !== 'N/A' ? `${overallAvg} / 5.0` : 'N/A' },
        { label: 'TOP PERFORMER', val: topPerformers[0]?.name || 'N/A' },
      ];

      const cardWidth = (pageWidth - 28 - 9) / 4;
      cards.forEach((c, idx) => {
        const x = 14 + idx * (cardWidth + 3);

        // Explicit WHITE fill & BLACK border
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, yPos, cardWidth, 20, 2, 2, 'FD');

        // Label: Dark Grey / Black
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        doc.text(c.label, x + 3.5, yPos + 6.5);

        // Value: Pure Black, Bold
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(c.val, x + 3.5, yPos + 15);
      });

      yPos += 30;

      // Section: Top 3 TSEs
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Top Performing TSEs (Rank 1 - 3)', 14, yPos);

      // Top 3 Table (Pass _rating object to draw vector stars without overlapping text behind)
      const topTseRows = topPerformers.map((t, idx) => [
        `#${idx + 1}`,
        `${t.name} (${t.id})`,
        `${t.candidatesHandled}`,
        t.candidateAvg !== null ? `${t.candidateAvg.toFixed(2)}` : 'N/A',
        t.marketingAvg !== null ? `${t.marketingAvg.toFixed(2)}` : 'N/A',
        { content: t.overallRating !== null ? '' : 'Not Rated', _rating: t.overallRating },
        t.performance.label,
      ]);

      autoTable(doc, {
        startY: yPos + 4,
        head: [['Rank', 'TSE Name & ID', 'Candidates', 'Cand Avg', 'Mkt Avg', 'Overall Rating', 'Tier']],
        body: topTseRows.length > 0 ? topTseRows : [['-', 'No evaluated TSEs in current filter', '-', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [20, 35, 195], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        styles: { cellPadding: 2.2 },
        didDrawCell: function (data) {
          if (data.column.index === 5 && data.cell.section === 'body') {
            const raw = data.cell.raw;
            const r = raw && typeof raw === 'object' ? raw._rating : null;
            if (r !== null && r !== undefined) {
              const midY = data.cell.y + data.cell.height / 2;
              drawPdfStars(doc, data.cell.x + 2, midY, r, 5, 1.1);
            }
          }
        },
      });

      yPos = doc.lastAutoTable.finalY + 12;

      // Section: Technologies / Job Roles Breakdown
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Interview Technologies & Job Roles Distribution', 14, yPos);

      const techRows = technologyStats.slice(0, 8).map(item => [
        item.tech,
        `${item.count} sessions`,
        `${item.percentage}%`,
      ]);

      autoTable(doc, {
        startY: yPos + 4,
        head: [['Technology / Job Role', 'Interviews Supported', 'Share of Total']],
        body: techRows.length > 0 ? techRows : [['No sessions recorded', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        styles: { cellPadding: 2 },
      });

      // PAGE 2: FULL TSE PERFORMANCE TABLE
      doc.addPage();

      // NetBounce Royal Blue Page Header
      doc.setFillColor(20, 35, 195);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('TSE PERFORMANCE OVERVIEW — COMPLETE ROSTER', 14, 13);

      const fullTseTableRows = sortedTseList.map(t => [
        t.id,
        roleIsMarketing(currentRole) ? (t.supportName || t.name) : (canViewRealName && t.employeeName ? `${t.employeeName} (${t.supportName || t.name})` : t.name),
        t.email,
        `${t.candidatesHandled}`,
        t.candidateAvg !== null ? `${t.candidateAvg.toFixed(2)}` : '—',
        t.marketingAvg !== null ? `${t.marketingAvg.toFixed(2)}` : '—',
        { content: t.overallRating !== null ? '' : 'Not Rated', _rating: t.overallRating },
        t.performance.label,
      ]);

      autoTable(doc, {
        startY: 28,
        head: [['TSE ID', 'TSE Name', 'Email', 'Candidates', 'Cand Avg', 'Mkt Avg', 'Overall Rating', 'Performance']],
        body: fullTseTableRows,
        theme: 'grid',
        headStyles: { fillColor: [20, 35, 195], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 2.5 },
        didDrawCell: function (data) {
          if (data.column.index === 6 && data.cell.section === 'body') {
            const raw = data.cell.raw;
            const r = raw && typeof raw === 'object' ? raw._rating : null;
            if (r !== null && r !== undefined) {
              const midY = data.cell.y + data.cell.height / 2;
              drawPdfStars(doc, data.cell.x + 2, midY, r, 5, 1.1);
            }
          }
        },
      });

      // PAGE 3+: CANDIDATE SESSIONS DRILL-DOWN (FOR EACH TSE)
      doc.addPage();
      doc.setFillColor(20, 35, 195);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('CANDIDATE SESSION LOGS — DEEP DRILL-DOWN', 14, 13);

      let drillY = 28;
      const tsesWithCandidates = sortedTseList.filter(t => t.sessions.length > 0);

      tsesWithCandidates.forEach((tse) => {
        if (drillY > pageHeight - 50) {
          doc.addPage();
          drillY = 20;
        }

        // TSE Section Header
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(14, drillY, pageWidth - 28, 9, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`${tse.name} (${tse.id}) — ${tse.candidatesHandled} Candidates Handled  |  Overall: ${tse.overallRatingFormatted ? tse.overallRatingFormatted + ' / 5.0' : 'Not Rated'}`, 17, drillY + 6);

        const candidateRows = tse.sessions.map(s => {
          const ratingObj = calculateOverallRating(s.candidateFeedback, s.marketingReview);
          const cRating = s.candidateFeedback?.submitted ? `${s.candidateFeedback.performanceRating || s.candidateFeedback.experienceRating || 0}` : 'Pending';
          const mRating = s.marketingReview?.reviewed ? `${s.marketingReview.overallRating || s.marketingReview.performance || 0}` : '—';

          return [
            s.date,
            s.candidateName,
            s.jobRole || 'Engineer',
            s.company,
            s.round || 'Tech',
            s.techSupportType,
            cRating,
            mRating,
            { content: ratingObj.score !== null ? '' : 'Not Rated', _rating: ratingObj.score },
          ];
        });

        autoTable(doc, {
          startY: drillY + 11,
          head: [['Date', 'Candidate', 'Job Role', 'Company', 'Round', 'Type', 'Cand ★', 'Mkt ★', 'Overall Rating']],
          body: candidateRows,
          theme: 'striped',
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
          bodyStyles: { fontSize: 6.5, textColor: [30, 41, 59] },
          styles: { cellPadding: 1.5 },
          didDrawCell: function (data) {
            if (data.column.index === 8 && data.cell.section === 'body') {
              const raw = data.cell.raw;
              const r = raw && typeof raw === 'object' ? raw._rating : null;
              if (r !== null && r !== undefined) {
                const midY = data.cell.y + data.cell.height / 2;
                drawPdfStars(doc, data.cell.x + 1.5, midY, r, 5, 0.95);
              }
            }
          },
        });

        drillY = doc.lastAutoTable.finalY + 10;
      });

      // Page numbering footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`NetBounce Tech Team Tracker — Page ${p} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
        doc.text('Confidential — For Upper Management & Management Review Only', 14, pageHeight - 8);
      }

      // Download PDF
      doc.save(`NetBounce_TSE_Performance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  // =========================================================================
  // EXCEL EXPORT HANDLER (3 Dedicated Multi-Sheets with Full Data & Stars)
  // =========================================================================
  const handleDownloadExcel = async () => {
    try {
      setExcelExporting(true);

      const workbook = XLSX.utils.book_new();
      const nowStr = new Date().toLocaleString('en-GB');

      // SHEET 1: EXECUTIVE SUMMARY
      const sheet1Data = [
        ['NETBOUNCE — TECH TEAM TRACKER'],
        ['TSE PERFORMANCE & FEEDBACK INTELLIGENCE REPORT'],
        ['Generated Date:', nowStr],
        ['Applied Filter Scope:', hasActiveFilters ? 'Custom Active Filters Applied' : 'All Recorded Data'],
        [],
        ['EXECUTIVE KPI METRICS'],
        ['Metric', 'Value'],
        ['Total TSEs Monitored', tseAnalytics.length],
        ['Total Candidates Handled', filteredSessions.length],
        ['Top Ranked TSE', topPerformers[0]?.name ? `${topPerformers[0].name} (${topPerformers[0].starsFormatted})` : 'N/A'],
        ['Primary Technology Demanded', technologyStats[0]?.tech ? `${technologyStats[0].tech} (${technologyStats[0].count} sessions)` : 'N/A'],
        ['TSEs Requiring Attention (< 3.5 Rating)', lowPerformers.length],
        ['TSEs with Insufficient Feedback', unratedCount],
        [],
        ['TOP 3 PERFORMING TSES'],
        ['Rank', 'TSE Name', 'TSE ID', 'Candidates Handled', 'Overall Rating', 'Overall Rating Stars', 'Performance Tier'],
        ...topPerformers.map((t, idx) => [
          idx + 1,
          t.name,
          t.id,
          t.candidatesHandled,
          t.overallRating !== null ? Number(t.overallRating.toFixed(2)) : 'N/A',
          t.starsFormatted,
          t.performance.label,
        ]),
        [],
        ['TECHNOLOGY / JOB ROLE DISTRIBUTION'],
        ['Technology / Job Role', 'Interviews Handled', 'Percentage Share'],
        ...technologyStats.map(item => [
          item.tech,
          item.count,
          `${item.percentage}%`,
        ]),
      ];
      const sheet1 = XLSX.utils.aoa_to_sheet(sheet1Data);
      sheet1['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, sheet1, 'Executive Summary');

      // SHEET 2: TSE PERFORMANCE (Full Roster)
      const sheet2Headers = [
        'TSE ID',
        'TSE Name',
        'Official Employee Name',
        'Company Email',
        'Candidates Handled',
        'Candidate Feedback Avg',
        'Marketing Feedback Avg',
        'Overall Rating (Numeric)',
        'Overall Rating Stars',
        'Performance Tier',
      ];

      const sheet2Rows = sortedTseList.map(t => [
        t.id,
        t.name,
        canViewRealName ? t.employeeName : '—',
        canViewRealName ? t.email : '—',
        t.candidatesHandled,
        t.candidateAvg !== null ? Number(t.candidateAvg.toFixed(2)) : '—',
        t.marketingAvg !== null ? Number(t.marketingAvg.toFixed(2)) : '—',
        t.overallRating !== null ? Number(t.overallRating.toFixed(2)) : '—',
        t.starsFormatted,
        t.performance.label,
      ]);

      const sheet2 = XLSX.utils.aoa_to_sheet([sheet2Headers, ...sheet2Rows]);
      sheet2['!cols'] = [
        { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 32 },
        { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 24 },
        { wch: 24 }, { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(workbook, sheet2, 'TSE Performance');

      // SHEET 3: CANDIDATE DETAILS (Line-item session audit)
      const sheet3Headers = [
        'Date',
        'TSE ID',
        'TSE Name',
        'TSE Email',
        'Candidate Name',
        'Candidate Email',
        'Recruiter Name',
        'Job Role / Technology',
        'Company',
        'Interview Round',
        'Tech Support Type',
        'Candidate Rating',
        'Marketing Rating',
        'Overall Combined Rating',
        'Overall Rating Stars',
        'Feedback Status',
        'Marketing Review Status',
        'Candidate Comments',
        'Marketing Evaluator Comments',
      ];

      const sheet3Rows = filteredSessions.map(s => {
        const ratingObj = calculateOverallRating(s.candidateFeedback, s.marketingReview);
        const cRating = s.candidateFeedback?.submitted ? (s.candidateFeedback.performanceRating || s.candidateFeedback.experienceRating || 0) : 'Pending';
        const mRating = s.marketingReview?.reviewed ? (s.marketingReview.overallRating || s.marketingReview.performance || 0) : 'Not Reviewed';
        const finalScore = ratingObj.score !== null ? Number(ratingObj.score.toFixed(2)) : 'Not Rated';
        const finalStars = ratingObj.score !== null ? toUnicodeStars(ratingObj.score) : 'Not Rated';

        return [
          s.date,
          s.techSupportId || '—',
          formatTseNameForRole(s, currentRole),
          canViewRealName ? (s.techSupportEmail || '—') : '—',
          s.candidateName,
          s.candidateEmail || '—',
          s.recruiterName || '—',
          s.jobRole || '—',
          s.company,
          s.round || '—',
          s.techSupportType,
          cRating,
          mRating,
          finalScore,
          finalStars,
          s.candidateFeedback?.submitted ? 'Submitted' : 'Pending',
          s.marketingReview?.reviewed ? 'Reviewed' : 'Not Reviewed',
          s.candidateFeedback?.comments || '',
          s.marketingReview?.comments || '',
        ];
      });

      const sheet3 = XLSX.utils.aoa_to_sheet([sheet3Headers, ...sheet3Rows]);
      sheet3['!cols'] = [
        { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 30 },
        { wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 24 },
        { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
        { wch: 16 }, { wch: 22 }, { wch: 24 }, { wch: 16 },
        { wch: 22 }, { wch: 45 }, { wch: 45 }
      ];
      XLSX.utils.book_append_sheet(workbook, sheet3, 'Candidate Details');

      // Save file
      XLSX.writeFile(workbook, `NetBounce_TSE_Intelligence_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Excel Export Error:', err);
    } finally {
      setExcelExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Export Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <PageHeader
          title="TSE Performance & Feedback Intelligence Report"
          subtitle="Enterprise analytics on technical support quality, candidate ratings, technology distribution, and drill-downs."
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfGenerating}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#1416c1] to-[#2546f0] hover:from-[#1a1df5] hover:to-[#385aff] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-900/40 active:scale-95 disabled:opacity-60"
          >
            {pdfGenerating ? (
              <>
                <RefreshCw size={14} className="animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={14} className="text-white" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={excelExporting}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-900/30 active:scale-95 disabled:opacity-60"
          >
            {excelExporting ? (
              <>
                <RefreshCw size={14} className="animate-spin text-white" />
                <span>Exporting Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={14} className="text-emerald-100" />
                <span>Download Excel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP SECTION — THREE BALANCED INSIGHT BOXES (NetBounce Royal Blue Design) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: TOP PERFORMING TSES */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-[#1416c1] flex items-center justify-center shadow-sm">
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Performing TSEs</h3>
                  <p className="text-[10px] text-slate-500">Dynamically ranked by feedback</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Top 3
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {topPerformers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No evaluated TSEs in current filter.
                </div>
              ) : (
                topPerformers.map((tse, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={tse.name}
                      onClick={() => setDrillDownTse(tse)}
                      className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm shrink-0">{medals[idx]}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                            {tse.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {tse.id} • {tse.candidatesHandled} candidates
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold tabular-nums">
                          <Star size={12} className="fill-amber-400" />
                          <span>{tse.overallRatingFormatted || 'N/A'}</span>
                        </div>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${tse.performance.badgeClass}`}>
                          {tse.performance.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Ranking formula: 70% Cand + 30% Mkt</span>
            <ChevronRight size={12} className="text-blue-600" />
          </div>
        </div>

        {/* CARD 2: INTERVIEW TECHNOLOGIES & JOB ROLES (WITH EXPANDABLE VIEW ALL) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-[#1416c1] flex items-center justify-center shadow-sm">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Interview Technologies</h3>
                  <p className="text-[10px] text-slate-500">Demand by job role & tech domain</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                {technologyStats.length} Domains
              </span>
            </div>

            {/* List of Technologies: Top 4 by default, ALL when showAllTechs is true */}
            <div className={`space-y-2 mt-2 transition-all ${showAllTechs ? 'max-h-60 overflow-y-auto pr-1' : ''}`}>
              {technologyStats.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No sessions found for current filters.
                </div>
              ) : (
                (showAllTechs ? technologyStats : technologyStats.slice(0, 4)).map((item) => {
                  const isSelected = techFilter === item.tech;
                  return (
                    <div
                      key={item.tech}
                      onClick={() => setTechFilter(isSelected ? 'all' : item.tech)}
                      title={`Click to filter by ${item.tech}`}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 truncate max-w-[190px]">{item.tech}</span>
                        <span className="text-blue-700 font-mono text-[11px] tabular-nums font-semibold">{item.count} sessions ({item.percentage}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1416c1] rounded-full"
                          style={{ width: `${Math.max(8, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 2 Footer: Interactive View All Toggle */}
          <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Total Sessions: <strong className="text-slate-900">{filteredSessions.length}</strong></span>
            <button
              type="button"
              onClick={() => setShowAllTechs(!showAllTechs)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showAllTechs ? 'Show Top 4 ↑' : `View All (${technologyStats.length} Roles) →`}</span>
            </button>
          </div>
        </div>

        {/* CARD 3: LOW PERFORMING TSES / ATTENTION NEEDED */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Low Performing TSEs</h3>
                  <p className="text-[10px] text-slate-500">Threshold: Rating &lt; 3.5 Stars</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                {lowPerformers.length} Flagged
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {lowPerformers.length === 0 ? (
                <div className="py-5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <CheckCircle2 size={20} className="text-emerald-600 mx-auto" />
                  <div className="text-xs font-bold text-emerald-800">All TSEs Meeting Standards</div>
                  <p className="text-[10px] text-emerald-600">
                    No active TSE has overall rating below 3.5 stars in the selected scope.
                  </p>
                </div>
              ) : (
                lowPerformers.slice(0, 3).map((tse) => (
                  <div
                    key={tse.name}
                    onClick={() => setDrillDownTse(tse)}
                    className="p-2.5 rounded-xl bg-slate-50/80 border border-rose-200 hover:border-rose-400 hover:bg-rose-50/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                        !
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors truncate">
                          {tse.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tse.id} • {tse.candidatesHandled} candidates
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-rose-600 text-xs font-bold tabular-nums">
                        <Star size={12} className="fill-rose-500 text-rose-500" />
                        <span>{tse.overallRatingFormatted}</span>
                      </div>
                      <span className="text-[9px] font-semibold text-rose-700">
                        {tse.performance.label}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Insufficient Feedback: <strong className="text-slate-800">{unratedCount} TSEs</strong></span>
            <span className="text-slate-400">(Not counted as low)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER AND SEARCH TOOLBAR */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-lg">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search TSE name, ID, email, candidate, company, or job role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
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

          {/* Date Range Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start lg:self-auto flex-wrap">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
                  dateRange === tab.id
                    ? 'bg-[#1416c1] text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Granular Filters Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100">
          {/* TSE Filter */}
          <select
            value={selectedTseFilter}
            onChange={(e) => setSelectedTseFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All TSEs</option>
            {TECH_SUPPORT_TEAM.map(t => (
              <option key={t.id} value={t.supportName}>{t.supportName} ({t.id})</option>
            ))}
          </select>

          {/* Technology / Job Role */}
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Roles / Tech</option>
            {filterOptions.roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Company */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Companies</option>
            {filterOptions.companies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Support Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Types</option>
            <option value="TQC">TQC</option>
            <option value="RUC">RUC</option>
            <option value="JDC">JDC</option>
            <option value="TAC">TAC</option>
            <option value="Demo">Demo</option>
          </select>

          {/* Performance Tier */}
          <select
            value={perfFilter}
            onChange={(e) => setPerfFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Performance</option>
            <option value="Excellent">Excellent (4.5 - 5.0)</option>
            <option value="Very Good">Very Good (4.0 - 4.49)</option>
            <option value="Good">Good (3.5 - 3.99)</option>
            <option value="Average">Average (3.0 - 3.49)</option>
            <option value="Needs Improvement">Needs Improvement (&lt; 3.0)</option>
            <option value="Insufficient Feedback">Insufficient Feedback</option>
          </select>

          {/* Feedback Status */}
          <select
            value={feedbackStatusFilter}
            onChange={(e) => setFeedbackStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">Candidate Feedback</option>
            <option value="submitted">Candidate Submitted ✓</option>
            <option value="pending">Candidate Pending ⏳</option>
          </select>

          {/* Marketing Review Status */}
          <select
            value={marketingFilter}
            onChange={(e) => setMarketingFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">Marketing Review</option>
            <option value="reviewed">Reviewed by Mkt ✓</option>
            <option value="not_reviewed">Not Reviewed</option>
          </select>
        </div>

        {/* Filter Summary and Clear Trigger */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-600 border-t border-slate-100">
            <span>
              Filters active • Showing <strong className="text-blue-700">{filteredSessions.length}</strong> matching candidate sessions across <strong className="text-slate-900">{sortedTseList.length}</strong> TSEs
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline flex items-center gap-1 cursor-pointer"
            >
              <X size={12} />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MAIN REPORT SECTION — TSE PERFORMANCE OVERVIEW TABLE */}
      {/* ========================================================================= */}
      <SectionCard
        title="TSE Performance Overview"
        subtitle="Ranked technical support performance matrix based on candidate submissions and marketing quality evaluations."
        actions={
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Sorted by: <strong className="text-slate-800 capitalize">{sortBy}</strong> ({sortOrder})</span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">TSE ID</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>TSE Name</span>
                    <ArrowUpDown size={12} className={sortBy === 'name' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="py-3 px-4">Email</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-center"
                  onClick={() => toggleSort('candidatesHandled')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Candidates Handled</span>
                    <ArrowUpDown size={12} className={sortBy === 'candidatesHandled' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => toggleSort('overallRating')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Overall Rating</span>
                    <ArrowUpDown size={12} className={sortBy === 'overallRating' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                  onClick={() => toggleSort('performance')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Performance Tier</span>
                    <ArrowUpDown size={12} className={sortBy === 'performance' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTseList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No Technical Support Engineers match the applied criteria.
                  </td>
                </tr>
              ) : (
                sortedTseList.map((tse) => (
                  <tr
                    key={tse.name}
                    onClick={() => setDrillDownTse(tse)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* Column 1: TSE ID */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold">
                        {tse.id}
                      </span>
                    </td>

                    {/* Column 2: TSE Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:border-blue-400 group-hover:bg-blue-100 transition-colors">
                          {tse.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {roleIsMarketing(currentRole) ? (tse.supportName || tse.name) : (canViewRealName && tse.employeeName ? `${tse.employeeName} (${tse.supportName || tse.name})` : tse.name)}
                          </div>
                          {!roleIsMarketing(currentRole) && canViewRealName && tse.employeeName && (
                            <div className="text-[10px] text-slate-500 truncate">
                              {tse.employeeName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Email */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {roleIsMarketing(currentRole) ? '—' : tse.email}
                    </td>

                    {/* Column 4: Candidates Handled */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold tabular-nums text-slate-800 bg-slate-100 border border-slate-200 text-xs">
                        {tse.candidatesHandled}
                      </span>
                    </td>

                    {/* Column 5: Overall Rating (Stars Display) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StarRating rating={tse.overallRating} size={15} showLabel={true} />
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {tse.candidateCount > 0 ? `${tse.candidateCount} Cand` : '0 Cand'} • {tse.marketingCount > 0 ? `${tse.marketingCount} Mkt` : '0 Mkt'}
                      </div>
                    </td>

                    {/* Column 6: Performance */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${tse.performance.badgeClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${tse.performance.badgeDot}`} />
                        {tse.performance.label}
                      </span>
                    </td>

                    {/* Column 7: Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrillDownTse(tse);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 group-hover:bg-[#1416c1] group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-[#1416c1] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Drill-down</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ========================================================================= */}
      {/* TSE ROW CLICK / DRILL-DOWN MODAL */}
      {/* ========================================================================= */}
      <Dialog open={!!drillDownTse} onOpenChange={(open) => !open && setDrillDownTse(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-900 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-2xl rounded-2xl">
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <UserRound size={14} />
                <span>TSE Performance & Feedback Intelligence</span>
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2.5 flex-wrap">
                <span>{roleIsMarketing(currentRole) ? (drillDownTse?.id || 'TSE-ID') : drillDownTse?.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                  {drillDownTse?.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${drillDownTse?.performance?.badgeClass}`}>
                  {drillDownTse?.performance?.label}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                {canViewRealName && (
                  <>
                    {drillDownTse?.employeeName && (
                      <>
                        <span>Employee: <strong className="text-slate-900">{drillDownTse?.employeeName}</strong></span>
                        <span>•</span>
                      </>
                    )}
                    {drillDownTse?.email && (
                      <>
                        <span className="font-mono text-blue-700">{drillDownTse?.email}</span>
                        <span>•</span>
                      </>
                    )}
                  </>
                )}
                <span>Role: <strong className="text-slate-800">Technical Support Engineer</strong></span>
              </DialogDescription>
            </div>

            {/* Total Handled Badge */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-right shrink-0 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Candidates Handled</div>
              <div className="text-2xl font-extrabold text-[#1416c1] mt-0.5 tabular-nums">
                {drillDownTse?.candidatesHandled}
              </div>
            </div>
          </div>

          {/* Modal Body: Feedback Breakdown Summary & Candidate Line Items */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Feedback Breakdown Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Candidate Rating Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Candidate Feedback</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={16} className="text-amber-500 fill-amber-400" />
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {drillDownTse?.candidateAvg !== null ? drillDownTse?.candidateAvg.toFixed(2) : 'N/A'}
                  </span>
                  <span className="text-slate-500 text-xs">/ 5</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {drillDownTse?.candidateCount} verified candidate submissions
                </div>
              </div>

              {/* Marketing Review Box */}
              <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700">Marketing Review</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={16} className="text-purple-600 fill-purple-500" />
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {drillDownTse?.marketingAvg !== null ? drillDownTse?.marketingAvg.toFixed(2) : 'N/A'}
                  </span>
                  <span className="text-slate-500 text-xs">/ 5</span>
                </div>
                <div className="text-[10px] text-purple-700">
                  {drillDownTse?.marketingCount} internal quality evaluations
                </div>
              </div>

              {/* Combined Overall Score */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-blue-800">Final Overall Rating</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={18} className="text-amber-500 fill-amber-400" />
                  <span className="text-xl font-extrabold text-[#1416c1] tabular-nums">
                    {drillDownTse?.overallRatingFormatted || 'Not Rated'}
                  </span>
                </div>
                <div className="text-[10px] text-blue-700 font-medium">
                  Formula: 70% Cand + 30% Mkt
                </div>
              </div>
            </div>

            {/* Candidate Details Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-700" />
                  <span>Candidate Session Details ({drillDownTse?.sessions?.length || 0})</span>
                </h4>
                <span className="text-[10px] text-slate-500">
                  Complete candidate history for this TSE
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Job Role</th>
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Round</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Cand Rating</th>
                      <th className="py-2.5 px-3">Mkt Rating</th>
                      <th className="py-2.5 px-3 text-right">Final Overall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!drillDownTse?.sessions || drillDownTse.sessions.length === 0) ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500">
                          No candidate sessions recorded for this TSE under current filter conditions.
                        </td>
                      </tr>
                    ) : (
                      drillDownTse.sessions.map((s) => {
                        const ratingObj = calculateOverallRating(s.candidateFeedback, s.marketingReview);
                        const cScore = s.candidateFeedback?.submitted ? (s.candidateFeedback.performanceRating || s.candidateFeedback.experienceRating) : null;
                        const mScore = s.marketingReview?.reviewed ? (s.marketingReview.overallRating || s.marketingReview.performance) : null;

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{s.date}</td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-900">{s.candidateName}</div>
                              <div className="text-[10px] text-slate-500 truncate">{s.candidateEmail || 'Candidate'}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-800 font-medium">{s.jobRole || 'Engineer'}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1 font-medium text-slate-700">
                                <Building2 size={11} className="text-slate-400" />
                                <span>{s.company}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-600">{s.round || 'Technical'}</td>
                            <td className="py-3 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${sessionTypeBadge[s.techSupportType] || 'border-slate-200 text-slate-600'}`}>
                                {s.techSupportType}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              {cScore !== null ? (
                                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                                  <Star size={11} className="fill-amber-400" />
                                  <span>{cScore.toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Pending</span>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              {mScore !== null ? (
                                <div className="flex items-center gap-1 text-purple-600 font-semibold">
                                  <Star size={11} className="fill-purple-500" />
                                  <span>{mScore.toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Not Reviewed</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <StarRating rating={ratingObj.score} size={12} showLabel={true} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Showing complete intelligence record for <strong className="text-slate-900">{drillDownTse?.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setDrillDownTse(null)}
              className="h-9 px-5 rounded-lg bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
