import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCategoryBreakdown,
  calculatePersonDebt,
  calculateGoalProgress,
  calculateAccountBalance,
  formatMoney,
} from './financeCalculations';
import {
  Transaction,
  PersonDebtProfile,
  SavingsGoalProfile,
  BankAccount,
  AccountTransfer,
} from '../types/finance';

test('calculateCategoryBreakdown handles 100% calculation correctly', () => {
  const transactions: Transaction[] = [
    {
      id: 't1',
      type: 'expense',
      title: 'بەنزین',
      amount: 40000,
      currency: 'IQD',
      category: 'هاتوچۆ',
      date: '2026-10-29',
      accountId: 'acc1',
      createdAt: Date.now(),
    },
    {
      id: 't2',
      type: 'expense',
      title: 'مارکێت',
      amount: 60000,
      currency: 'IQD',
      category: 'خۆراک',
      date: '2026-10-29',
      accountId: 'acc1',
      createdAt: Date.now(),
    },
  ];

  const result = calculateCategoryBreakdown(transactions, 'expense', 1500);
  assert.equal(result.totalAmountIQD, 100000);
  assert.equal(result.breakdown.length, 2);

  const food = result.breakdown.find((b) => b.category === 'خۆراک');
  const transport = result.breakdown.find((b) => b.category === 'هاتوچۆ');

  assert.equal(food?.percentage, 60);
  assert.equal(transport?.percentage, 40);
  assert.equal((food?.percentage ?? 0) + (transport?.percentage ?? 0), 100);
});

test('calculatePersonDebt calculates remaining balance and settlement', () => {
  const person: PersonDebtProfile = {
    id: 'p1',
    personName: 'ئەحمەد عەلی',
    direction: 'they_owe_me',
    totalOriginalAmount: 250000,
    currency: 'IQD',
    startDate: '2026-10-01',
    status: 'active',
    payments: [
      { id: 'pay1', date: '2026-10-10', amount: 100000, currency: 'IQD' },
      { id: 'pay2', date: '2026-10-20', amount: 50000, currency: 'IQD' },
    ],
    createdAt: Date.now(),
  };

  const debt = calculatePersonDebt(person);
  assert.equal(debt.totalPaid, 150000);
  assert.equal(debt.remainingBalance, 100000);
  assert.equal(debt.isFullyPaid, false);
  assert.equal(debt.progressPercentage, 60);
});

test('calculateGoalProgress tracks deposits and completion', () => {
  const goal: SavingsGoalProfile = {
    id: 'g1',
    title: 'کڕینی لاپتۆپ',
    targetAmount: 1000,
    currency: 'USD',
    targetDate: '2026-12-31',
    deposits: [
      { id: 'd1', date: '2026-10-01', amount: 250, currency: 'USD' },
      { id: 'd2', date: '2026-10-15', amount: 250, currency: 'USD' },
    ],
    createdAt: Date.now(),
  };

  const progress = calculateGoalProgress(goal);
  assert.equal(progress.totalSaved, 500);
  assert.equal(progress.remainingAmount, 500);
  assert.equal(progress.progressPercentage, 50);
  assert.equal(progress.isCompleted, false);
});

test('calculateAccountBalance tracks income, expense, and transfers without altering outside expenses', () => {
  const account: BankAccount = {
    id: 'acc1',
    name: 'FIB Bank',
    type: 'bank',
    initialBalance: 500000,
    currency: 'IQD',
    color: '#3b82f6',
    iconName: 'CreditCard',
  };

  const transactions: Transaction[] = [
    {
      id: 't1',
      type: 'income',
      title: 'مووچە',
      amount: 1000000,
      currency: 'IQD',
      category: 'مووچە',
      date: '2026-10-25',
      accountId: 'acc1',
      createdAt: Date.now(),
    },
    {
      id: 't2',
      type: 'expense',
      title: 'خواردن',
      amount: 200000,
      currency: 'IQD',
      category: 'خۆراک',
      date: '2026-10-26',
      accountId: 'acc1',
      createdAt: Date.now(),
    },
  ];

  const transfers: AccountTransfer[] = [
    {
      id: 'tr1',
      fromAccountId: 'acc1',
      toAccountId: 'acc2',
      amount: 100000,
      currency: 'IQD',
      date: '2026-10-27',
    },
  ];

  const balance = calculateAccountBalance(account, transactions, transfers, []);
  // 500000 + 1000000 - 200000 - 100000 = 1200000
  assert.equal(balance, 1200000);
});

test('formatMoney formats correctly', () => {
  assert.equal(formatMoney(250000, 'IQD'), '250,000 د.ع');
  assert.equal(formatMoney(150, 'USD'), '$150');
});
