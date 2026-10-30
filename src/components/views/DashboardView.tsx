import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  QrCode,
  Calendar,
  CreditCard,
  Target,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  Transaction,
  BankAccount,
  RecurringBill,
  PersonDebtProfile,
  SavingsGoalProfile,
  BudgetPlan,
} from '../../types/finance';
import {
  calculateCategoryBreakdown,
  calculateAccountBalance,
  calculatePersonDebt,
  formatMoney,
} from '../../utils/financeCalculations';
import { formatShortKurdishDate, calculateDaysRemaining } from '../../utils/dateUtils';

interface DashboardViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  recurringBills: RecurringBill[];
  debts: PersonDebtProfile[];
  goals: SavingsGoalProfile[];
  budget: BudgetPlan;
  onOpenAddTransaction: () => void;
  onOpenReceiptScanner: () => void;
  onOpenQRSystem: () => void;
  onOpenPersonProfile: (person: PersonDebtProfile) => void;
  onOpenGoalProfile: (goal: SavingsGoalProfile) => void;
  onNavigateTab: (tab: string) => void;
  onPayRecurringBill: (bill: RecurringBill) => void;
  usdRate?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  accounts,
  recurringBills,
  debts,
  goals,
  budget,
  onOpenAddTransaction,
  onOpenReceiptScanner,
  onOpenQRSystem,
  onOpenPersonProfile,
  onOpenGoalProfile,
  onNavigateTab,
  onPayRecurringBill,
  usdRate = 1500,
}) => {
  // Calculate this month's transactions
  const now = new Date();
  const currentMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const monthlyIncomeIQD = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce(
      (sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount),
      0
    );

  const monthlyExpenseIQD = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce(
      (sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount),
      0
    );

  // Total balance across all accounts converted to IQD
  const totalBalanceIQD = accounts.reduce((sum, acc) => {
    const bal = calculateAccountBalance(acc, transactions, [], goals, usdRate);
    return sum + (acc.currency === 'USD' ? bal * usdRate : bal);
  }, 0);

  // Active debts calculation
  const theyOweMeIQD = debts
    .filter((d) => d.status === 'active' && d.direction === 'they_owe_me')
    .reduce((sum, d) => {
      const summary = calculatePersonDebt(d);
      return (
        sum + (d.currency === 'USD' ? summary.remainingBalance * usdRate : summary.remainingBalance)
      );
    }, 0);

  const iOweThemIQD = debts
    .filter((d) => d.status === 'active' && d.direction === 'i_owe_them')
    .reduce((sum, d) => {
      const summary = calculatePersonDebt(d);
      return (
        sum + (d.currency === 'USD' ? summary.remainingBalance * usdRate : summary.remainingBalance)
      );
    }, 0);

  // 100% Breakdown
  const expenseBreakdown = calculateCategoryBreakdown(
    currentMonthTransactions,
    'expense',
    usdRate
  );

  // Upcoming 30-day bills
  const upcomingBills = recurringBills
    .map((b) => ({ ...b, daysLeft: calculateDaysRemaining(b.nextDueDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Budget status
  const budgetSpentPercent =
    budget.totalMonthlyLimit > 0
      ? Math.min(100, Math.round((monthlyExpenseIQD / budget.totalMonthlyLimit) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">
            کورتەی دۆخی دارایی
          </h2>
          <p className="text-xs text-slate-400">
            سەرجەم سەرمایە و مامەڵە داراییەکانت لە یەک شوێن
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenReceiptScanner}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>سکانی پسولە بە AI</span>
          </button>

          <button
            onClick={onOpenQRSystem}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4 text-teal-400" />
            <span>کڕینی خێرا بە QR</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            <span>زیادکردنی خەرجی / داهات</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wealth */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">کۆی گشتی سەرمایە</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mb-1">
            {formatMoney(totalBalanceIQD, 'IQD')}
          </div>
          <div className="text-[11px] text-slate-400">
            لەسەر {accounts.length} هەژماری بانکی و کاش
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">داهاتی ئەم مانگە</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mb-1">
            {formatMoney(monthlyIncomeIQD, 'IQD')}
          </div>
          <div className="text-[11px] text-emerald-500/90 font-medium">
            داهاتی تۆمارکراوی ئەم مانگە
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">خەرجییەکانی ئەم مانگە</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mb-1">
            {formatMoney(monthlyExpenseIQD, 'IQD')}
          </div>
          <div className="text-[11px] text-slate-400">
            بودجەی مانگ: {formatMoney(budget.totalMonthlyLimit, 'IQD')} ({budgetSpentPercent}%)
          </div>
        </div>

        {/* Debts Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">قەرزەکان (باڵانس)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-emerald-400 font-bold">
              لای خەڵکە: {formatMoney(theyOweMeIQD, 'IQD')}
            </span>
          </div>
          <div className="text-xs text-rose-400 font-bold">
            لای منە: {formatMoney(iOweThemIQD, 'IQD')}
          </div>
        </div>
      </div>

      {/* Accounts Slider / Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>هەژمارە بانکییەکان و جزدانەکان</span>
          </h3>
          <button
            onClick={() => onNavigateTab('accounts')}
            className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            بەڕێوەبردنی هەژمارەکان ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {accounts.map((acc) => {
            const bal = calculateAccountBalance(acc, transactions, [], goals, usdRate);
            return (
              <div
                key={acc.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">{acc.name}</span>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: acc.color }}
                  />
                </div>
                {acc.accountNumber && (
                  <p className="text-[11px] text-slate-400 font-mono mb-2" dir="ltr">
                    {acc.accountNumber}
                  </p>
                )}
                <div className="text-lg font-black text-white">
                  {formatMoney(bal, acc.currency)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Grid: 100% Breakdown Chart & 30-Day Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirement 8: 100% Spending Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>هێڵکاری ١٠٠٪ پارەی سەرفکراو لە چی بووە</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                دابەشبوونی ١٠٠٪ی خەرجییەکان بەپێی بەش و بابەت
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              شیکاری تەواو
            </button>
          </div>

          {expenseBreakdown.breakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              تا ئێستا هیچ خەرجییەک لەم مانگەدا تۆمار نەکراوە.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Stacked 100% Progress Bar */}
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
                {expenseBreakdown.breakdown.map((item) => (
                  <div
                    key={item.category}
                    title={`${item.category}: ${item.percentage}%`}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full transition-all duration-500 hover:opacity-80"
                  />
                ))}
              </div>

              {/* Category Breakdown Chips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {expenseBreakdown.breakdown.map((item) => (
                  <div
                    key={item.category}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-300 font-medium">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono">
                        {formatMoney(item.amount, 'IQD')}
                      </span>
                      <span className="font-bold text-emerald-400 w-11 text-left font-mono">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Requirement 2: 30-Day Recurring Bills Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>خەرجی مانگانە (٣٠ ڕۆژەکان)</span>
              </h3>
              <button
                onClick={() => onNavigateTab('recurring')}
                className="text-xs text-teal-400 hover:underline cursor-pointer"
              >
                هەمووی ({recurringBills.length})
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              خەتی ئینتەرنێت، موەلیدە، کرێ و شتە دووبارەبووەوەکان
            </p>

            <div className="space-y-2.5">
              {upcomingBills.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  هیچ خەرجییەکی مانگانەی ٣٠ ڕۆژە (ئینتەرنێت، موەلیدە...) تۆمار نەکراوە.
                </p>
              ) : (
                upcomingBills.slice(0, 3).map((bill) => (
                  <div
                    key={bill.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{bill.title}</h4>
                      <span className="text-emerald-400 font-bold block mt-0.5">
                        {formatMoney(bill.amount, bill.currency)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          bill.daysLeft <= 3
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}
                      >
                        {bill.daysLeft <= 0
                          ? 'کاتی هاتووە!'
                          : `مابووە: ${bill.daysLeft} ڕۆژ`}
                      </span>

                      <button
                        onClick={() => onPayRecurringBill(bill)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        تۆمارکردن
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('recurring')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer text-center"
          >
            زیادکردنی خەرجی مانگانەی تر
          </button>
        </div>
      </div>

      {/* Savings Goals & Debts Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Savings Goals preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>ئامانجەکانی پاشەکەوت</span>
            </h3>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              هەمووی ({goals.length})
            </button>
          </div>

          <div className="space-y-3">
            {goals.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                هیچ ئامانجێکی پاشەکەوت (سەیارە، فریاگوزاری...) تۆمار نەکراوە.
              </p>
            ) : (
              goals.slice(0, 2).map((goal) => {
                const totalSaved = goal.deposits.reduce((s, d) => s + d.amount, 0);
                const pct = Math.min(100, Math.round((totalSaved / goal.targetAmount) * 100));
                return (
                  <div
                    key={goal.id}
                    onClick={() => onOpenGoalProfile(goal)}
                    className="bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-3.5 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-white">{goal.title}</span>
                      <span className="text-emerald-400 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>پاشەکەوتکراو: {formatMoney(totalSaved, goal.currency)}</span>
                      <span>ئامانج: {formatMoney(goal.targetAmount, goal.currency)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Debts preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>بەشی قەرزەکان و کەسەکان</span>
            </h3>
            <button
              onClick={() => onNavigateTab('debts')}
              className="text-xs text-blue-400 hover:underline cursor-pointer"
            >
              هەمووی ({debts.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {debts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                هیچ قەرزێک تۆمار نەکراوە.
              </p>
            ) : (
              debts.slice(0, 2).map((person) => {
                const summary = calculatePersonDebt(person);
                return (
                  <div
                    key={person.id}
                    onClick={() => onOpenPersonProfile(person)}
                    className="bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: person.avatarColor || '#3b82f6' }}
                      >
                        {person.personName.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{person.personName}</h4>
                        <span className="text-[11px] text-slate-400">
                          {person.direction === 'they_owe_me'
                            ? 'قەرزم لایەتی'
                            : 'قەرزی لای منە'}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="font-bold text-white block">
                        {formatMoney(summary.remainingBalance, person.currency)}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        {summary.progressPercentage}% دراوەتەوە
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">دواین خەرجی و داهاتەکان</h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            بینینی سەرجەم مامەڵەکان ({transactions.length})
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              هیچ مامەڵەیەکی خەرجی یان داهات تۆمار نەکراوە.
            </p>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{tx.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatShortKurdishDate(tx.date)}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span
                    className={`text-sm font-black ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatMoney(tx.amount, tx.currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
