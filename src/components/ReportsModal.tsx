import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Sparkles,
  Calendar,
  TrendingDown,
  TrendingUp,
  PieChart,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  Transaction,
  BankAccount,
  PersonDebtProfile,
  SavingsGoalProfile,
} from '../types/finance';
import {
  calculateCategoryBreakdown,
  formatMoney,
} from '../utils/financeCalculations';
import { formatKurdishDate } from '../utils/dateUtils';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: BankAccount[];
  debts: PersonDebtProfile[];
  goals: SavingsGoalProfile[];
  usdRate?: number;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  debts,
  goals,
  usdRate = 1500,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);

  if (!isOpen) return null;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Filter transactions based on selected period
  const filteredTransactions = transactions.filter((t) => {
    if (period === 'all') return true;
    const txDate = new Date(t.date);

    if (period === 'today') {
      return t.date === todayStr;
    }
    if (period === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= oneWeekAgo;
    }
    if (period === 'month') {
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === 'year') {
      return txDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const periodLabels = {
    today: 'ڕاپۆرتی ئەمڕۆ',
    week: 'ڕاپۆرتی ٧ ڕۆژی ڕابردوو',
    month: 'ڕاپۆرتی ئەم مانگە',
    year: 'ڕاپۆرتی ئەمساڵ',
    all: 'ڕاپۆرتی سەرجەم کاتەکان',
  };

  // Calculate totals in IQD
  const totalIncomeIQD = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount), 0);

  const totalExpenseIQD = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount), 0);

  const netBalanceIQD = totalIncomeIQD - totalExpenseIQD;
  const savingsRate =
    totalIncomeIQD > 0 ? Math.max(0, Math.round((netBalanceIQD / totalIncomeIQD) * 100)) : 0;

  const expenseBreakdown = calculateCategoryBreakdown(
    filteredTransactions,
    'expense',
    usdRate
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'ناسناو,جۆر,بڕی پارە,دراو,بەش,ڕێکەوت,تێبینی\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.title}","${t.type === 'income' ? 'داهات' : 'خەرجی'}",${t.amount},"${
            t.currency
          }","${t.category}","${t.date}","${t.notes || ''}"`
      )
      .join('\n');

    const blob = new Blob(['\ufeff' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${period}_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRequestAIAdvice = async () => {
    setIsLoadingAdvice(true);
    setAiAdvice(null);

    try {
      const summaryData = {
        period: periodLabels[period],
        totalIncomeIQD,
        totalExpenseIQD,
        netBalanceIQD,
        savingsRate: `${savingsRate}%`,
        topExpenseCategories: expenseBreakdown.breakdown.slice(0, 4).map((c) => ({
          category: c.category,
          amountIQD: c.amount,
          percentage: `${c.percentage}%`,
        })),
        activeDebtsCount: debts.filter((d) => d.status === 'active').length,
        activeGoalsCount: goals.length,
      };

      const res = await fetch('/api/gemini/financial-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryData,
          periodTitle: periodLabels[period],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'هەڵەیەک ڕوویدا لە کاتی وەرگرتنی ڕاوێژ');
      }

      setAiAdvice(data.advice);
    } catch (e: any) {
      setAiAdvice('نەتوانرا ڕاوێژی AI بەدەستبێت. تکایە دووبارە هەوڵبدەرەوە.');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ڕاپۆرتی دارایی"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none print:p-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">دروستکردنی ڕاپۆرتی دارایی</h2>
              <p className="text-xs text-slate-400">
                شیکاری تەواو، هەناردەکردن بۆ پرینت یان ئێکسڵ، و ڕاوێژی AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="پرینت یان پاشەکەوت وەک PDF"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCSV}
              title="هەناردەکردن بۆ ئێکسڵ (CSV)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="داخستن"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex p-1 bg-slate-950 rounded-2xl mb-4 border border-slate-800 text-xs no-print">
          {(['today', 'week', 'month', 'year', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setAiAdvice(null);
              }}
              className={`flex-1 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                period === p
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'today'
                ? 'ئەمڕۆ'
                : p === 'week'
                ? 'ئەم هەفتەیە'
                : p === 'month'
                ? 'ئەم مانگە'
                : p === 'year'
                ? 'ئەمساڵ'
                : 'گشتی'}
            </button>
          ))}
        </div>

        {/* Printable Document Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white print:text-black">
            {periodLabels[period]}
          </h1>
          <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
            ڕێکەوتی دەرچوواندن: {formatKurdishDate()}
          </p>
        </div>

        {/* Big Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl print:border-slate-300">
            <span className="text-[11px] text-slate-400 block mb-1">کۆی داهات</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 print:text-emerald-700">
              {formatMoney(totalIncomeIQD, 'IQD')}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl print:border-slate-300">
            <span className="text-[11px] text-slate-400 block mb-1">کۆی خەرجی</span>
            <span className="text-sm sm:text-base font-bold text-rose-400 print:text-rose-700">
              {formatMoney(totalExpenseIQD, 'IQD')}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl print:border-slate-300">
            <span className="text-[11px] text-slate-400 block mb-1">باڵانسی ماوە (صافی)</span>
            <span
              className={`text-sm sm:text-base font-bold ${
                netBalanceIQD >= 0
                  ? 'text-teal-400 print:text-teal-700'
                  : 'text-amber-400 print:text-amber-700'
              }`}
            >
              {formatMoney(netBalanceIQD, 'IQD')}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl print:border-slate-300">
            <span className="text-[11px] text-slate-400 block mb-1">ڕێژەی پاشەکەوت</span>
            <span className="text-sm sm:text-base font-bold text-white print:text-black">
              {savingsRate}%
            </span>
          </div>
        </div>

        {/* 100% Breakdown in Report */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5 print:text-black">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>شیکاری ١٠٠٪ خەرجییەکان بەپێی بەش</span>
          </h3>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800 print:bg-white print:border-slate-300 print:divide-slate-200">
            {expenseBreakdown.breakdown.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">
                هیچ خەرجییەک لەم ماوەیەدا نەدۆزرایەوە.
              </p>
            ) : (
              expenseBreakdown.breakdown.map((item) => (
                <div key={item.category} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-200 font-medium print:text-black">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({item.count} مامەڵە)
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-300 font-mono print:text-black">
                      {formatMoney(item.amount, 'IQD')}
                    </span>
                    <span className="font-bold text-emerald-400 w-12 text-left print:text-emerald-700">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Financial Advisor Section */}
        <div className="no-print mb-4">
          {!aiAdvice ? (
            <button
              onClick={handleRequestAIAdvice}
              disabled={isLoadingAdvice}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
            >
              {isLoadingAdvice ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ڕاوێژکاری زیرەکی Gemini خەریکی ئامادەکردنی شیکارییە...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>داواکردنی شیکاری و ڕاوێژی دارایی زیرەک بە AI</span>
                </>
              )}
            </button>
          ) : (
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>ڕاوێژی دارایی زیرەکی Gemini AI:</span>
                </span>
                <button
                  onClick={handleRequestAIAdvice}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 cursor-pointer"
                >
                  نوێکردنەوە
                </button>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {aiAdvice}
              </div>
            </div>
          )}
        </div>

        {/* Print / Close Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-between items-center no-print">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>چاپکردن / PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>هەناردەکردنی ئێکسڵ</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
};
