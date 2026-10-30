import React, { useState } from 'react';
import {
  Compass,
  Save,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  DollarSign,
  Plus,
  Sliders,
} from 'lucide-react';
import { BudgetPlan, Transaction } from '../../types/finance';
import { formatMoney } from '../../utils/financeCalculations';
import { CATEGORIES } from '../AddTransactionModal';

interface BudgetViewProps {
  budget: BudgetPlan;
  transactions: Transaction[];
  onUpdateBudget: (updated: BudgetPlan) => void;
  usdRate?: number;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  transactions,
  onUpdateBudget,
  usdRate = 1500,
}) => {
  const [totalLimit, setTotalLimit] = useState<number>(budget.totalMonthlyLimit);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(
    budget.categoryLimits || {}
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Calculate current month's expenses
  const now = new Date();
  const currentMonthExpenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const totalSpentIQD = currentMonthExpenses.reduce((sum, t) => {
    return sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount);
  }, 0);

  const spentPercentage =
    totalLimit > 0 ? Math.min(100, Math.round((totalSpentIQD / totalLimit) * 100)) : 0;
  const remainingBudgetIQD = Math.max(0, totalLimit - totalSpentIQD);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudget({
      ...budget,
      totalMonthlyLimit: totalLimit,
      categoryLimits,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCategoryLimitChange = (cat: string, value: number) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [cat]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-0.5 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>پلانی خەرجییەکانی مانگ (بودجە)</span>
          </h2>
          <p className="text-xs text-slate-400">
            پلان دابنێ کە ئەم مانگە زیاتر لەم بڕە پارەیە خەرج نەکەیت بۆ کۆنتڕۆڵی تەواوی پارەکەت
          </p>
        </div>

        {isSaved && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            <span>پلانەکە بە سەرکەوتوویی پاشەکەوت کرا!</span>
          </span>
        )}
      </div>

      {/* Main Budget Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">
              دۆخی کۆی بودجەی ئەم مانگە
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {formatMoney(totalSpentIQD, 'IQD')}
              </span>
              <span className="text-sm text-slate-400">
                / {formatMoney(totalLimit, 'IQD')}
              </span>
            </div>
          </div>

          <div className="text-left">
            <span
              className={`text-2xl font-black ${
                spentPercentage >= 90
                  ? 'text-rose-400'
                  : spentPercentage >= 75
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {spentPercentage}%
            </span>
            <span className="text-xs text-slate-400 block">سەرفکراوە</span>
          </div>
        </div>

        {/* Big visual progress bar */}
        <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercentage >= 90
                ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
                : spentPercentage >= 75
                ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/50'
            }`}
            style={{ width: `${spentPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <span className="text-slate-400 block mb-0.5">بڕی خەرجکراو:</span>
            <span className="font-bold text-rose-400">
              {formatMoney(totalSpentIQD, 'IQD')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">بڕی ماوە بۆ سەرفکردن:</span>
            <span className="font-bold text-emerald-400">
              {formatMoney(remainingBudgetIQD, 'IQD')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">ئاگاداری دۆخ:</span>
            <span
              className={`font-bold flex items-center gap-1 ${
                spentPercentage >= 90
                  ? 'text-rose-400'
                  : spentPercentage >= 75
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {spentPercentage >= 90 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>خەرجی لە لێواری مەترسیدایە!</span>
                </>
              ) : spentPercentage >= 75 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ئاگاداربە لە خەرجییەکان</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>دۆخی بودجە نایابە</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Budget Form */}
      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
      >
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-base font-bold text-white mb-1">
            دەستکاریکردنی بڕی بودجەی ئەم مانگە
          </h3>
          <p className="text-xs text-slate-400">
            بڕی پارەی دیاریکراو بۆ کۆی گشتی و بەشە جیاوازەکان بنووسە
          </p>

          <div className="mt-4 max-w-sm">
            <label className="text-xs font-bold text-slate-300 block mb-1">
              کۆی گشتی بودجەی مانگانە (دینار IQD)
            </label>
            <input
              type="number"
              required
              value={totalLimit}
              onChange={(e) => setTotalLimit(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
              dir="ltr"
            />
          </div>
        </div>

        {/* Category Specific Budget Limits */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>دیاریکردنی بودجەی تایبەت بە هەر بەشێک:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.filter((c) => c !== 'مووچە').map((cat) => {
              const currentCategorySpent = currentMonthExpenses
                .filter((t) => t.category === cat)
                .reduce(
                  (sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount),
                  0
                );
              const limit = categoryLimits[cat] || 0;
              const catPercent =
                limit > 0 ? Math.min(100, Math.round((currentCategorySpent / limit) * 100)) : 0;

              return (
                <div
                  key={cat}
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{cat.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-400">
                      خەرجکراو: {formatMoney(currentCategorySpent, 'IQD')}
                    </span>
                  </div>

                  <input
                    type="number"
                    placeholder="بڕی دیاریکراو (دینار)"
                    value={limit || ''}
                    onChange={(e) =>
                      handleCategoryLimitChange(cat, parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono mb-2"
                    dir="ltr"
                  />

                  {limit > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>ڕێژە:</span>
                        <span className="font-bold text-emerald-400">{catPercent}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${catPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>پاشەکەوتکردنی گۆڕانکارییەکانی پلانی بودجە</span>
        </button>
      </form>
    </div>
  );
};
