import React, { useState } from 'react';
import {
  X,
  Target,
  Plus,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { SavingsGoalProfile, BankAccount, GoalDeposit } from '../types/finance';
import { formatMoney, calculateGoalProgress } from '../utils/financeCalculations';
import { formatShortKurdishDate } from '../utils/dateUtils';

interface GoalProfileModalProps {
  goal: SavingsGoalProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateGoal: (updated: SavingsGoalProfile) => void;
  onDeleteGoal: (id: string) => void;
  accounts: BankAccount[];
}

export const GoalProfileModal: React.FC<GoalProfileModalProps> = ({
  goal,
  isOpen,
  onClose,
  onUpdateGoal,
  onDeleteGoal,
  accounts,
}) => {
  const [showAddDeposit, setShowAddDeposit] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositDate, setDepositDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [depositNote, setDepositNote] = useState<string>('');
  const [depositAccountId, setDepositAccountId] = useState<string>(accounts[0]?.id || '');

  if (!isOpen || !goal) return null;

  const progress = calculateGoalProgress(goal);

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;

    const newDeposit: GoalDeposit = {
      id: `dep-${Date.now()}`,
      date: depositDate,
      amount: amt,
      currency: goal.currency,
      accountId: depositAccountId,
      note: depositNote.trim() || undefined,
    };

    onUpdateGoal({
      ...goal,
      deposits: [newDeposit, ...goal.deposits],
    });

    setDepositAmount('');
    setDepositNote('');
    setShowAddDeposit(false);
  };

  const handleDeleteDeposit = (depositId: string) => {
    onUpdateGoal({
      ...goal,
      deposits: goal.deposits.filter((d) => d.id !== depositId),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`پرۆفایلی ئامانجی ${goal.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{goal.title}</h2>
                {progress.isCompleted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تەواوبوو!</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>کاتی ئامانج: {formatShortKurdishDate(goal.targetDate)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="داخستن"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">کۆی ئامانج</span>
            <span className="text-sm sm:text-base font-bold text-white">
              {formatMoney(goal.targetAmount, goal.currency)}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">پاشەکەوتکراو</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">
              {formatMoney(progress.totalSaved, goal.currency)}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">بڕی ماوە</span>
            <span className="text-sm sm:text-base font-bold text-amber-400">
              {formatMoney(progress.remainingAmount, goal.currency)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>ڕێژەی بەدەستهاتوو:</span>
            <span className="font-bold text-emerald-400">{progress.progressPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progress.progressPercentage}%` }}
            />
          </div>
        </div>

        {goal.notes && (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 mb-4 text-xs text-slate-300 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="whitespace-pre-line">{goal.notes}</p>
          </div>
        )}

        {/* Action button */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddDeposit(!showAddDeposit)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>دانانی پارە لە ناو ئەم ئامانجە (Deposit)</span>
          </button>
        </div>

        {/* Add deposit form drawer */}
        {showAddDeposit && (
          <form
            onSubmit={handleAddDeposit}
            className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 mb-4 space-y-3 animate-fadeIn"
          >
            <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>تۆمارکردنی بڕی پارەی دانراو لە ئامانج</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  بڕی پارەی دانراو ({goal.currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="بڕی پارە"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  لە کام ڕۆژ پارەکەت دانا؟ (ڕێکەوت)
                </label>
                <input
                  type="date"
                  required
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  تێبینی
                </label>
                <input
                  type="text"
                  placeholder="وەکو: بەشی مووچە، فرۆشتنی کەلوپەل..."
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  لە هەژماری
                </label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              پاشەکەوتکردنی پارەی ئەم ڕۆژە
            </button>
          </form>
        )}

        {/* Deposit History - requirement: "بزانم لەو ڕوژە چەند پارەم لە ناو ناوە" */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>مێژووی ڕۆژ و بڕی پارەی دانراو ({goal.deposits.length})</span>
          </h3>

          {goal.deposits.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-950/40 p-4 rounded-xl text-center border border-slate-800">
              تا ئێستا هیچ بڕە پارەیەک بۆ ئەم ئامانجە دانەنراوە.
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {goal.deposits.map((dep) => (
                <div
                  key={dep.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-sm">
                        +{formatMoney(dep.amount, dep.currency)}
                      </span>
                      <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
                        لە ڕۆژی: {formatShortKurdishDate(dep.date)}
                      </span>
                    </div>
                    {dep.note && (
                      <p className="text-[11px] text-slate-400 mt-1">{dep.note}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteDeposit(dep.id)}
                    aria-label="سڕینەوەی ئەم پارەیە"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Delete Goal */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm(`دڵنیایت لە سڕینەوەی ئامانجی "${goal.title}"؟`)) {
                onDeleteGoal(goal.id);
                onClose();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>سڕینەوەی ئامانج</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
};
