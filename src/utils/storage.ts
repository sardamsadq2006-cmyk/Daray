import {
  Transaction,
  RecurringBill,
  PersonDebtProfile,
  SavingsGoalProfile,
  BankAccount,
  AccountTransfer,
  BudgetPlan,
  SavedQREntry,
  SecuritySettings,
  BackupSettings,
} from '../types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'zfk_transactions_v2',
  RECURRING_BILLS: 'zfk_recurring_bills_v2',
  DEBTS: 'zfk_debts_v2',
  GOALS: 'zfk_goals_v2',
  ACCOUNTS: 'zfk_accounts_v2',
  TRANSFERS: 'zfk_transfers_v2',
  BUDGET: 'zfk_budget_v2',
  QR_ENTRIES: 'zfk_qr_entries_v2',
  SECURITY: 'zfk_security_v2',
  BACKUP: 'zfk_backup_v2',
  USD_RATE: 'zfk_usd_rate_v2',
  THEME: 'zfk_theme_v2',
  REMINDER: 'zfk_reminder_v2',
  CHAT_MESSAGES: 'zfk_chat_messages_v2',
};

// Clean Initial Accounts with 0 balances
export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-cash',
    name: 'پارەی کاش (دەست)',
    type: 'cash',
    initialBalance: 0,
    currency: 'IQD',
    color: '#10b981',
    iconName: 'Banknote',
  },
  {
    id: 'acc-fib',
    name: 'بانکی یەکەمی عێراقی (FIB)',
    type: 'bank',
    accountNumber: '',
    initialBalance: 0,
    currency: 'IQD',
    color: '#3b82f6',
    iconName: 'CreditCard',
  },
  {
    id: 'acc-fastpay',
    name: 'فاستپەی (FastPay)',
    type: 'wallet',
    accountNumber: '',
    initialBalance: 0,
    currency: 'IQD',
    color: '#f97316',
    iconName: 'Smartphone',
  },
  {
    id: 'acc-usd-card',
    name: 'ماستەرکارت (دۆلار USD)',
    type: 'card',
    accountNumber: '',
    initialBalance: 0,
    currency: 'USD',
    color: '#8b5cf6',
    iconName: 'ShieldCheck',
  },
];

// Completely clean empty arrays - no fake/mock numbers
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_RECURRING: RecurringBill[] = [];

export const INITIAL_DEBTS: PersonDebtProfile[] = [];

export const INITIAL_GOALS: SavingsGoalProfile[] = [];

export const INITIAL_BUDGET: BudgetPlan = {
  id: 'budget-current',
  month: new Date().toISOString().slice(0, 7),
  totalMonthlyLimit: 0,
  currency: 'IQD',
  categoryLimits: {},
};

export const INITIAL_QR_ENTRIES: SavedQREntry[] = [];

export const INITIAL_SECURITY: SecuritySettings = {
  isBiometricEnabled: true,
  pinCode: '1234',
  isPinEnabled: true,
  autoLockMinutes: 5,
};

export const INITIAL_BACKUP: BackupSettings = {
  googleDriveConnected: false,
  googleDriveEmail: 'imsardam@gmail.com',
  autoBackupDaily: true,
  lastBackupDate: new Date().toISOString().split('T')[0],
};

export const INITIAL_REMINDER = {
  isEnabled: true,
  reminderTime: '21:00', // 9:00 PM evening reminder
  hasPermission: false,
  lastNotifiedDate: undefined,
};

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg-welcome',
    role: 'model' as const,
    text: 'سڵاو! من ڕاوێژکاری دارایی زیرەکی تۆم 🌟. ئامادەم بۆ یارمەتیدانت لە بەڕێوەبردنی خەرجییەکان، زیادکردنی داهات و پلانی پاشەکەوتکردن بەپێی داتاکانی خۆت.',
    timestamp: Date.now(),
  },
];

// Storage helper functions
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export { STORAGE_KEYS };
