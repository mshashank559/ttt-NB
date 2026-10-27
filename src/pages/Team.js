import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, SectionCard, StatusBadge, Pagination } from '../components/common';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

const statusDot = (idx) => ['bg-emerald-400','bg-amber-400','bg-slate-500'][idx % 3];
const statusLabel = (idx) => ['Active','Away','Offline'][idx % 3];

export default function Team() {
  const { users, tasks } = useApp();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const list = useMemo(() => users.filter(u => u.role !== 'upper_management' && u.name.toLowerCase().includes(query.toLowerCase())), [users, query]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, currentPage, pageSize]);

  const stats = (u) => {
    const a = tasks.filter(t => t.assigneeId === u.id);
    const c = a.filter(t => t.status === 'Completed').length;
    return { total: a.length, completed: c, rate: a.length ? Math.round(c/a.length*100) : 0, pending: a.filter(t => t.status === 'Pending').length };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Team" subtitle="All members across Tech Support and Marketing." />
      <SectionCard title="Directory" actions={
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input data-testid="team-search" value={query} onChange={handleQueryChange} placeholder="Search team..." className="pl-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 w-64 h-9" />
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 font-semibold">Employee</th><th className="font-semibold">Role</th><th className="font-semibold">Department</th><th className="font-semibold">Active</th><th className="font-semibold">Completed</th><th className="font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400 italic">No team members match this search.</td>
                </tr>
              ) : paginatedList.map((u, i) => {
                const s = stats(u);
                return (
                  <tr key={u.id} data-testid={`team-member-${u.id}`} onClick={() => setActive(u)} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1416c1] to-[#3b82f6] text-white text-[11px] font-bold flex items-center justify-center">{u.name.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
                        <div><div className="font-semibold text-slate-900">{u.name}</div><div className="text-[11px] text-slate-500 font-medium">{u.empId}</div></div>
                      </div>
                    </td>
                    <td className="text-slate-700 text-xs uppercase tracking-wider font-semibold">{u.role.replace('_',' ')}</td>
                    <td className="text-slate-600 font-medium">{u.dept}</td>
                    <td className="tabular-nums font-semibold text-slate-800">{s.total}</td>
                    <td className="tabular-nums font-bold text-emerald-700">{s.completed}</td>
                    <td><span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium"><span className={`h-2 w-2 rounded-full ${statusDot((currentPage - 1) * pageSize + i)}`} />{statusLabel((currentPage - 1) * pageSize + i)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={list.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </SectionCard>

      <Sheet open={!!active} onOpenChange={o => !o && setActive(null)}>
        <SheetContent side="right" className="bg-white border-l border-slate-200 text-slate-900 w-full sm:max-w-lg shadow-2xl">
          <SheetHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1416c1] to-[#3b82f6] text-white font-bold text-lg flex items-center justify-center">{active?.name?.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
              <div>
                <SheetTitle className="text-slate-900 font-bold text-lg">{active?.name}</SheetTitle>
                <div className="text-sm text-slate-500 font-medium">{active?.dept} · {active?.empId}</div>
              </div>
            </div>
          </SheetHeader>
          {active && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div className="text-xs font-semibold text-slate-500">Role</div><div className="text-sm font-bold text-slate-900 mt-0.5">{active.role.replace('_',' ')}</div></div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div className="text-xs font-semibold text-slate-500">Email</div><div className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{active.email}</div></div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div className="text-xs font-semibold text-slate-500">Joined</div><div className="text-sm font-semibold text-slate-800 mt-0.5">{active.joined}</div></div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200"><div className="text-xs font-semibold text-slate-500">Completion rate</div><div className="text-sm font-bold text-emerald-700 mt-0.5">{stats(active).rate}%</div></div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Recent tasks</div>
                <ul className="space-y-2">
                  {tasks.filter(t => t.assigneeId === active.id).slice(0,5).map(t => (
                    <li key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div><div className="mono text-xs text-blue-600 font-semibold">{t.id}</div><div className="text-sm font-semibold text-slate-900 line-clamp-1">{t.title}</div></div>
                      <StatusBadge value={t.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
