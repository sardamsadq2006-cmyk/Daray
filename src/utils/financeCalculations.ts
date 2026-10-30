import {
  Transaction,
  CategoryBreakdown,
  PersonDebtProfile,
  SavingsGoalProfile,
  BankAccount,
  AccountTransfer,
  Currency,
} from '../types/finance';

export const CATEGORY_COLORS: Record<string, string> = {
  خۆراک: '#10b981',       // Emerald
  هاتوچۆ: '#3b82f6',      // Blue
  ماڵ_و_خێزان: '#f59e0b', // Amber
  پۆشاک: '#ec4899',       // Pink
  تەندروستی: '#ef4444',   // Red
  پەروەردە: '#8b5cf6',    // Purple
  ئینتەرنێت_و_تەلەفۆن: '#06b6d4', // Cyan
  کابانی_ماڵ_و_مارکێت: '#14b8a6', // Teal
  خۆشی_و_گەشت: '#f97316', // Orange
  وەبەرهێنان: '#6366f1',  // Indigo
  مووچە: '#22c55e',       // Green
  دیاری: '#d946ef',       // Fuchsia
  قەرز: '#eab308',        // Yellow
  خەرجی_تر: '#64748b',    // Slate
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#64748b';
}

/**
 * Calculates 100% breakdown of expenses by category
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: 'expense' | 'income' = 'expense',
  usdRate: number = 1500
): { breakdown: CategoryBreakdown[]; totalAmountIQD: number } {
  const filtered = transactions.filter((t) => t.type === type);

  // Group amounts converted to IQD for consistent summing
  const categoryMap = new Map<string, { amountIQD: number; count: number }>();
  let totalAmountIQD = 0;

  for (const t of filtered) {
    const amountInIQD = t.currency === 'USD' ? t.amount * usdRate : t.amount;
    totalAmountIQD += amountInIQD;

    const existing = categoryMap.get(t.category) || { amountIQD: 0, count: 0 };
    existing.amountIQD += amountInIQD;
    existing.count += 1;
    categoryMap.set(t.category, existing);
  }

  const breakdown: CategoryBreakdown[] = [];

  for (const [category, data] of categoryMap.entries()) {
    const percentage = totalAmountIQD > 0 ? (data.amountIQD / totalAmountIQD) * 100 : 0;
    breakdown.push({
      category,
      amount: data.amountIQD,
      percentage: Number(percentage.toFixed(1)),
      color: getCategoryColor(category),
      count: data.count,
    });
  }

  // Sort descending by amount
  breakdown.sort((a, b) => b.amount - a.amount);

  return { breakdown, totalAmountIQD };
}

/**
 * Calculates person debt summary
 */
export function calculatePersonDebt(person: PersonDebtProfile): {
  totalPaid: number;
  remainingBalance: number;
  isFullyPaid: boolean;
  progressPercentage: number;
} {
  const totalPaid = person.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = Math.max(0, person.totalOriginalAmount - totalPaid);
  const isFullyPaid = remainingBalance <= 0;
  const progressPercentage =
    person.totalOriginalAmount > 0
      ? Math.min(100, Number(((totalPaid / person.totalOriginalAmount) * 100).toFixed(1)))
      : 100;

  return { totalPaid, remainingBalance, isFullyPaid, progressPercentage };
}

/**
 * Calculates savings goal summary
 */
export function calculateGoalProgress(goal: SavingsGoalProfile): {
  totalSaved: number;
  remainingAmount: number;
  progressPercentage: number;
  isCompleted: boolean;
} {
  const totalSaved = goal.deposits.reduce((sum, d) => sum + d.amount, 0);
  const remainingAmount = Math.max(0, goal.targetAmount - totalSaved);
  const progressPercentage =
    goal.targetAmount > 0
      ? Math.min(100, Number(((totalSaved / goal.targetAmount) * 100).toFixed(1)))
      : 100;
  const isCompleted = totalSaved >= goal.targetAmount;

  return { totalSaved, remainingAmount, progressPercentage, isCompleted };
}

/**
 * Calculates live balance for an account
 */
export function calculateAccountBalance(
  account: BankAccount,
  transactions: Transaction[],
  transfers: AccountTransfer[],
  goals: SavingsGoalProfile[],
  usdRate: number = 1500
): number {
  let balance = account.initialBalance;

  // Add income / subtract expense
  for (const t of transactions) {
    if (t.accountId === account.id) {
      const amount =
        t.currency === account.currency
          ? t.amount
          : t.currency === 'USD' && account.currency === 'IQD'
          ? t.amount * usdRate
          : t.currency === 'IQD' && account.currency === 'USD'
          ? t.amount / usdRate
          : t.amount;

      if (t.type === 'income') balance += amount;
      if (t.type === 'expense') balance -= amount;
    }
  }

  // Account transfers (internal transfers do NOT affect daily expense/income)
  for (const tr of transfers) {
    if (tr.fromAccountId === account.id) {
      const amt =
        tr.currency === account.currency
          ? tr.amount
          : tr.currency === 'USD' && account.currency === 'IQD'
          ? tr.amount * usdRate
          : tr.amount / usdRate;
      balance -= amt;
    }
    if (tr.toAccountId === account.id) {
      const amt =
        tr.currency === account.currency
          ? tr.amount
          : tr.currency === 'USD' && account.currency === 'IQD'
          ? tr.amount * usdRate
          : tr.amount / usdRate;
      balance += amt;
    }
  }

  // Subtract goal deposits from the account
  for (const g of goals) {
    for (const dep of g.deposits) {
      if (dep.accountId === account.id) {
        const amt =
          dep.currency === account.currency
            ? dep.amount
            : dep.currency === 'USD' && account.currency === 'IQD'
            ? dep.amount * usdRate
            : dep.amount / usdRate;
        balance -= amt;
      }
    }
  }

  return Math.round(balance * 100) / 100;
}

/**
 * Format currency with commas and currency symbol
 */
export function formatMoney(amount: number, currency: Currency = 'IQD'): string {
  const formatted = Math.round(amount).toLocaleString('en-US');
  if (currency === 'USD') return `$${formatted}`;
  return `${formatted} د.ع`;
}
