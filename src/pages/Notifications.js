import React, { useState } from 'react';
import { Bell, ClipboardList, UserRoundCheck, CheckCircle2, AlarmClock, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, EmptyState } from '../components/common';

const iconMap = { task: ClipboardList, interview: UserRoundCheck, completion: CheckCircle2, deadline: AlarmClock, system: Sparkles };
const tabs = [
  { k: 'all', label: 'All' },
  { k: 'unread', label: 'Unread' },
  { k: 'task', label: 'Tasks' },
  { k: 'interview', label: 'Interviews' },
  { k: 'system', label: 'System' },
];

export default function Notifications() {
  const { notifications, markAllRead, markNotificationRead } = useApp();
  const [tab, setTab] = useState('all');
  const list = notifications.filter(n => tab === 'all' || (tab === 'unread' ? !n.read : n.type === tab));

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Everything happening across your workspace." actions={
        <button data-testid="mark-all-btn" onClick={markAllRead} className="h-9 px-3.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">Mark all as read</button>
      } />
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 inline-flex">
        {tabs.map(t => (
          <button key={t.k} data-testid={`notif-tab-${t.k}`} onClick={() => setTab(t.k)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === t.k ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{t.label}</button>
        ))}
      </div>
      <SectionCard title={`${list.length} notifications`}>
        {list.length === 0 ? <EmptyState title="You're all caught up" description="No notifications match this filter." icon={Bell} /> : (
          <ul className="space-y-2.5">
            {list.map(n => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <li key={n.id} data-testid={`notif-row-${n.id}`} onClick={() => markNotificationRead(n.id)} className={`cursor-pointer flex items-start gap-3.5 p-4 rounded-xl border transition-all ${!n.read ? 'bg-blue-50/50 border-blue-200 hover:border-blue-400' : 'bg-slate-50 border-slate-200 hover:bg-white'} hover:shadow-sm`}>
                  <div className="h-10 w-10 rounded-xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0"><Icon size={18} /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-900 font-bold">{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{n.message}</div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium shrink-0">{n.time}</div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
