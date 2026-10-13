import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

const statusMap = {
  Done: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'In Progress': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Pending: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
  Reschedule: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Rescheduled: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Cancel: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'Not Possible': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  Scheduled: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  'Interview Completed': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'Feedback Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Cleared: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Hold: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  Urgent: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Medium: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Low: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
};

const taskTypeStyleMap = {
  Interview: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TAC: 'bg-amber-50 text-amber-700 border-amber-200',
  TQC: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  JDC: 'bg-rose-50 text-rose-700 border-rose-200',
  Demo: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const TaskTypeBadge = ({ value, className = '' }) => {
  const style = taskTypeStyleMap[value] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style} ${className}`}>
      {value}
    </span>
  );
};

export const StatusBadge = ({ value, className = '' }) => {
  const c = statusMap[value] || statusMap['Not Possible'];
  return (
    <span data-testid={`status-badge-${(value || '').toLowerCase().replace(/\s+/g, '-')}`} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {value}
    </span>
  );
};

export const KpiCard = ({ label, value, delta, icon: Icon, testid, trend = 'up' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    data-testid={testid}
    className="bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md p-5 relative overflow-hidden group transition-all"
  >
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{label}</div>
        <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">{value}</div>
        {delta != null && (
          <div className={`mt-1.5 text-xs font-bold ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend === 'up' ? '▲' : '▼'} {delta}
          </div>
        )}
      </div>
      {Icon && (
        <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-[#1416c1] dark:text-blue-400 shadow-xs">
          <Icon size={19} />
        </div>
      )}
    </div>
  </motion.div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const EmptyState = ({ title = 'Nothing to show', description = 'No records match the current filters.', action, icon: Icon = Inbox }) => (
  <div data-testid="empty-state" className="flex flex-col items-center justify-center py-16 text-center">
    <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 mb-4">
      <Icon size={22} />
    </div>
    <div className="text-slate-800 dark:text-slate-100 font-bold">{title}</div>
    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm font-medium">{description}</div>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const SectionCard = ({ title, subtitle, actions, children, className = '' }) => (
  <div className={`bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md p-5 md:p-6 transition-all ${className}`}>
    <div className="flex items-start justify-between mb-4 gap-3">
      <div>
        {title && <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </div>
);

export const CircularProgressRing = ({ percentage = 75, size = 44, strokeWidth = 4, color = '#1416c1', label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100 dark:stroke-white/10"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-800 dark:text-white tabular-nums">
        {label || `${percentage}%`}
      </span>
    </div>
  );
};

export const ArcGaugeCard = ({
  title = "Interview Clear Rate",
  percentage = 40,
  subtitle = "Candidate qualification & clearance ratio",
  primaryMetric,
  meterLabel = "Clear Rate",
  secondaryLabel = "Target Benchmark",
  secondaryValue = "60%",
  stat1Label = "Interview Rounds",
  stat1Value = "5 Evaluated",
  stat2Label = "Candidates Cleared",
  stat2Value = "2 Qualified",
  className = "",
}) => {
  const safePercent = Math.min(Math.max(percentage, 0), 100);
  const arcTotal = 204.2;
  const strokeDashoffset = arcTotal - (safePercent / 100) * arcTotal;
  const displayPrimary = primaryMetric != null ? primaryMetric : `${safePercent}%`;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141dc7] via-[#10199e] to-[#0c147e] text-white p-5 md:p-6 shadow-xl border border-blue-400/30 flex flex-col justify-between ${className}`}>
      {/* Background ambient PS4 glow wave */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-blue-300/10 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-200 text-xs font-semibold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
            Live Speedometer Pulse
          </div>
          <span className="text-[11px] font-semibold text-blue-200/90 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
            {secondaryLabel}: <strong className="text-white">{secondaryValue}</strong>
          </span>
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">{title}</h3>
          <p className="text-xs text-blue-200/90 font-medium mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Centered Speedometer Arc Meter */}
      <div className="relative z-10 my-3 flex flex-col items-center justify-center w-full">
        <div className="relative w-48 h-28 max-w-full flex items-center justify-center">
          <svg viewBox="0 0 160 95" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="arcGradCommon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <path
              d="M 15 85 A 65 65 0 0 1 145 85"
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 15 85 A 65 65 0 0 1 145 85"
              fill="none"
              stroke="url(#arcGradCommon)"
              strokeWidth="12"
              strokeDasharray="204.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: 'drop-shadow(0px 0px 8px rgba(103, 232, 249, 0.6))' }}
            />
          </svg>
          <div className="absolute bottom-1 text-center">
            <span className="text-3xl font-black text-white tracking-tight drop-shadow-md">{displayPrimary}</span>
            <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-200 mt-0.5">{meterLabel}</div>
          </div>
        </div>
      </div>

      {/* Bottom Dual Metric Pills */}
      <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-white/10 w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/15 text-center">
          <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider truncate">{stat1Label}</div>
          <div className="text-base font-black text-white tabular-nums mt-0.5 truncate">{stat1Value}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/15 text-center">
          <div className="text-[10px] uppercase font-bold text-cyan-200 tracking-wider truncate">{stat2Label}</div>
          <div className="text-base font-black text-emerald-300 tabular-nums mt-0.5 truncate">{stat2Value}</div>
        </div>
      </div>
    </div>
  );
};

export const NeumorphicMetricCard = ({
  label,
  value,
  subValue,
  delta,
  percentage = 70,
  icon: Icon,
  ringColor = '#1416c1',
  trend = 'up',
  testid,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    data-testid={testid}
    className="bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md p-5 flex flex-col justify-between transition-all group"
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{label}</div>
        <div className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {value}
        </div>
      </div>
      <CircularProgressRing percentage={percentage} color={ringColor} />
    </div>
    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
      {subValue && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{subValue}</span>
      )}
      {delta != null && (
        <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trend === 'up' ? '▲' : '▼'} {delta}
        </span>
      )}
    </div>
  </motion.div>
);
