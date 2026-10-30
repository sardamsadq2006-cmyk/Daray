import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Award,
} from 'lucide-react';
import { Transaction, BankAccount } from '../../types/finance';
import {
  calculateCategoryBreakdown,
  formatMoney,
} from '../../utils/financeCalculations';

interface AnalyticsViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  usdRate?: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  accounts,
  usdRate = 1500,
}) => {
  const [timeframe, setTimeframe] = useState<'month' | 'all'>('month');

  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    if (timeframe === 'all') return true;
    const d = new Date(t.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const totalExpenseIQD = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce(
      (sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount),
      0
    );

  const totalIncomeIQD = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce(
      (sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount),
      0
    );

  const expenseBreakdown = calculateCategoryBreakdown(
    currentMonthTransactions,
    'expense',
    usdRate
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-0.5 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <span>هێڵکاری و شیکاری دارایی (١٠٠٪ پارەکەم لە چیدایە)</span>
          </h2>
          <p className="text-xs text-slate-400">
            شیکاری وردی هەر دینار و سەنتێک کە لەم مانگەدا خەرجکراوە
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setTimeframe('month')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
              timeframe === 'month'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ئەم مانگە
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
              timeframe === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            سەرجەم کاتەکان
          </button>
        </div>
      </div>

      {/* 100% Breakdown Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Donut / Circular visualization */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-white mb-4">
            ڕێژەی ١٠٠٪ی خەرجییەکان بەپێی بەش
          </h3>

          <div className="relative w-48 h-48 my-2 flex items-center justify-center">
            {/* SVG Donut Chart */}
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#0f172a"
                strokeWidth="14"
              />
              {(() => {
                let accumulatedPercent = 0;
                return expenseBreakdown.breakdown.map((item) => {
                  const strokeDasharray = `${item.percentage * 2.512} ${251.2}`;
                  const strokeDashoffset = -accumulatedPercent * 2.512;
                  accumulatedPercent += item.percentage;

                  return (
                    <circle
                      key={item.category}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="14"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700"
                    />
                  );
                });
              })()}
            </svg>

            {/* Center total inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-slate-400">کۆی خەرجی</span>
              <span className="text-sm font-black text-white font-mono">
                {formatMoney(totalExpenseIQD, 'IQD')}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">١٠٠٪ شیکاری</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            هەر بەشێک بە ڕەنگی تایبەتی خۆی لە هێڵکارییەکە دیاریکراوە
          </p>
        </div>

        {/* 100% Breakdown List Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>لیستی وردی بەشەکان و لەسەدا (%)</span>
            <span className="text-xs text-slate-400 font-normal">
              {expenseBreakdown.breakdown.length} بەشی خەرجی
            </span>
          </h3>

          <div className="space-y-3">
            {expenseBreakdown.breakdown.map((item) => (
              <div
                key={item.category}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-white">{item.category}</span>
                    <span className="text-[11px] text-slate-500">
                      ({item.count} کڕین)
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-300 font-mono">
                      {formatMoney(item.amount, 'IQD')}
                    </span>
                    <span className="text-sm font-black text-emerald-400 font-mono w-12 text-left">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar per category */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
