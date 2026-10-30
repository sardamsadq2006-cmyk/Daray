import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  X,
  Sparkles,
} from 'lucide-react';
import { SavingsGoalProfile, BankAccount, Currency } from '../../types/finance';
import {
  calculateGoalProgress,
  formatMoney,
} from '../../utils/financeCalculations';
import { formatShortKurdishDate } from '../../utils/dateUtils';

interface SavingsGoalsViewProps {
  goals: SavingsGoalProfile[];
  accounts: BankAccount[];
  onOpenGoalProfile: (goal: SavingsGoalProfile) => void;
  onAddGoal: (newGoal: SavingsGoalProfile) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  accounts,
  onOpenGoalProfile,
  onAddGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [targetDate, setTargetDate] = useState('2027-01-01');
  const [notes, setNotes] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(targetAmount);
    if (!amt || amt <= 0 || !title.trim()) return;

    const newGoal: SavingsGoalProfile = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      targetAmount: amt,
      currency,
      targetDate,
      notes: notes.trim() || undefined,
      deposits: [],
      createdAt: Date.now(),
    };

    onAddGoal(newGoal);
    setTitle('');
    setTargetAmount('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-0.5 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span>ئامانجەکانی پاشەکەوتکردن</span>
          </h2>
          <p className="text-xs text-slate-400">
            هەر ئامانجێک پرۆفایلی تایبەتی خۆی هەیە و مێژووی هەموو پارە دانانەکان بە ڕۆژ پیشان دەدات
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>دروستکردنی ئامانجی نوێ</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal);

          return (
            <div
              key={goal.id}
              onClick={() => onOpenGoalProfile(goal)}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Target className="w-5 h-5" />
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      progress.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {progress.progressPercentage}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                  {goal.title}
                </h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {formatMoney(progress.totalSaved, goal.currency)}
                  </span>
                  <span className="text-xs text-slate-400">
                    لە {formatMoney(goal.targetAmount, goal.currency)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden mb-3 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>

                <div className="space-y-1 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-2">
                  <div className="flex justify-between">
                    <span>کاتی بەدەستهێنان:</span>
                    <span className="font-bold text-slate-200">
                      {formatShortKurdishDate(goal.targetDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ژمارەی پارەدانانەکان:</span>
                    <span className="text-emerald-400 font-bold">
                      {goal.deposits.length} جار
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
                <span>بڕی ماوە: {formatMoney(progress.remainingAmount, goal.currency)}</span>
                <span className="text-emerald-400 font-bold group-hover:underline">
                  بینینی پرۆفایل ←
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="دروستکردنی ئامانجی نوێ"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>دروستکردنی ئامانجی پاشەکەوت</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ناوی ئامانجەکە
                </label>
                <input
                  type="text"
                  required
                  placeholder="وەکو: کڕینی ئۆتۆمبێل، گەشتکردن، سندووقی فریاگوزاری..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    بڕی ئامانج (Target Amount)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="بڕی پارە"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">دراو</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USD">دۆلار USD</option>
                    <option value="IQD">دینار IQD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  کاتی بەدەستهێنانی ئامانجەکە (ڕێکەوت)
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  تێبینی دەربارەی ئامانجەکە
                </label>
                <input
                  type="text"
                  placeholder="تێبینی..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md mt-4"
              >
                دروستکردنی پرۆفایلی ئامانج
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
