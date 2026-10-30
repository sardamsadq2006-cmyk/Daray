/**
 * Core Data Models for Personal Finance System
 */

export type TransactionType = 'expense' | 'income';
export type Currency = 'IQD' | 'USD';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  currency: Currency;
  category: string;
  date: string; // YYYY-MM-DD
  time?: string;
  accountId: string;
  notes?: string;
  receiptImage?: string; // Base64 or object URL
  qrCode?: string;
  items?: { name: string; price: number; qty?: number }[];
  createdAt: number;
}

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  category: string;
  intervalDays: number; // typically 30 days
  startDate: string;
  nextDueDate: string;
  accountId: string;
  notes?: string;
  autoLog: boolean;
  lastLoggedDate?: string;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  note?: string;
  accountId?: string;
}

export interface PersonDebtProfile {
  id: string;
  personName: string;
  phone?: string;
  avatarColor?: string;
  direction: 'they_owe_me' | 'i_owe_them'; // 'they_owe_me' (قەرزم لایەتی) or 'i_owe_them' (قەرزی لای منە)
  totalOriginalAmount: number;
  currency: Currency;
  startDate: string;
  dueDate?: string;
  notes?: string;
  status: 'active' | 'settled';
  payments: DebtPayment[];
  createdAt: number;
}

export interface BudgetPlan {
  id: string;
  month: string; // YYYY-MM
  totalMonthlyLimit: number;
  currency: Currency;
  categoryLimits: Record<string, number>; // Category name -> budget limit
}

export interface GoalDeposit {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  accountId?: string;
  note?: string;
}

export interface SavingsGoalProfile {
  id: string;
  title: string;
  targetAmount: number;
  currency: Currency;
  targetDate: string;
  categoryIcon?: string;
  notes?: string;
  deposits: GoalDeposit[];
  createdAt: number;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber?: string;
  type: 'cash' | 'bank' | 'wallet' | 'card';
  initialBalance: number;
  currency: Currency;
  color: string;
  iconName: string;
}

export interface AccountTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
  date: string;
  notes?: string;
}

export interface SavedQREntry {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  category: string;
  accountId: string;
  qrPayload: string;
  vendorName?: string;
  notes?: string;
}

export interface SecuritySettings {
  isBiometricEnabled: boolean;
  pinCode: string;
  isPinEnabled: boolean;
  autoLockMinutes: number; // 0 = disabled, 1 = 1min, 5 = 5min
  lastUnlockedTime?: number;
}

export interface BackupSettings {
  googleDriveConnected: boolean;
  googleDriveEmail?: string;
  autoBackupDaily: boolean;
  lastBackupDate?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface ReminderSettings {
  isEnabled: boolean;
  reminderTime: string; // e.g. "21:00"
  hasPermission: boolean;
  lastNotifiedDate?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
