import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ALL_AVATARS, AVATAR_CATEGORIES } from '../data/avatars';
import { useApp } from '../context/AppContext';
import { Check, Sparkles, Shuffle } from 'lucide-react';

export default function AvatarPickerModal({ open, onOpenChange }) {
  const { userAvatar, updateUserAvatar } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAvatars = useMemo(() => {
    if (selectedCategory === 'all') return ALL_AVATARS;
    return ALL_AVATARS.filter(a => a.id.startsWith(selectedCategory));
  }, [selectedCategory]);

  const pickRandom = () => {
    const random = ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)];
    if (random) updateUserAvatar(random.url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#111A2E] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/20 text-[#1416c1] dark:text-blue-400 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Choose Your Avatar</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Select from 100+ curated employee avatars to customize your profile.
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={pickRandom}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 transition-colors shadow-xs"
            >
              <Shuffle size={13} /> Randomize
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#1416c1] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All (112)
            </button>
            {AVATAR_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#1416c1] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Avatars Grid */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3">
          {filteredAvatars.map(av => {
            const isSelected = userAvatar === av.url;
            return (
              <button
                key={av.id}
                onClick={() => updateUserAvatar(av.url)}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-500/20 border-[#1416c1] dark:border-blue-400 ring-2 ring-[#1416c1]/30 shadow-md scale-105'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/20 hover:scale-105 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="h-14 w-14 rounded-full overflow-hidden bg-white shadow-xs border border-slate-200 dark:border-white/10">
                  <img src={av.url} alt={av.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#1416c1] text-white flex items-center justify-center shadow-md">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 rounded-xl bg-[#1416c1] hover:bg-[#10199e] text-white text-xs font-bold shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
