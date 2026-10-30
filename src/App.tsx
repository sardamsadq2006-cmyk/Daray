/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  ReminderSettings,
  ChatMessage,
} from './types/finance';
import {
  STORAGE_KEYS,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_RECURRING,
  INITIAL_DEBTS,
  INITIAL_GOALS,
  INITIAL_BUDGET,
  INITIAL_QR_ENTRIES,
  INITIAL_SECURITY,
  INITIAL_BACKUP,
  INITIAL_REMINDER,
  INITIAL_CHAT_MESSAGES,
  loadFromStorage,
  saveToStorage,
} from './utils/storage';
import { addDays } from './utils/dateUtils';
import { calculateCategoryBreakdown, calculateAccountBalance } from './utils/financeCalculations';

// Components
import { Navbar } from './components/Navbar';
import { NavigationTabs, NavigationTab } from './components/NavigationTabs';
import { SplashScreen } from './components/SplashScreen';
import { BiometricLockModal } from './components/BiometricLockModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AIReceiptScannerModal } from './components/AIReceiptScannerModal';
import { PersonProfileModal } from './components/PersonProfileModal';
import { GoalProfileModal } from './components/GoalProfileModal';
import { QRSystemModal } from './components/QRSystemModal';
import { ReportsModal } from './components/ReportsModal';
import { GoogleDriveBackupModal } from './components/GoogleDriveBackupModal';
import { DailyReminderBanner } from './components/DailyReminderBanner';
import { MobileBottomNav } from './components/MobileBottomNav';

// Views
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { RecurringBillsView } from './components/views/RecurringBillsView';
import { DebtsView } from './components/views/DebtsView';
import { BudgetView } from './components/views/BudgetView';
import { SavingsGoalsView } from './components/views/SavingsGoalsView';
import { AccountsView } from './components/views/AccountsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { ChatView } from './components/views/ChatView';

export default function App() {
  // Splash & Security
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') !== '1';
    }
    return true;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Core Financial State (persisted to localStorage)
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  );

  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() =>
    loadFromStorage(STORAGE_KEYS.RECURRING_BILLS, INITIAL_RECURRING)
  );

  const [debts, setDebts] = useState<PersonDebtProfile[]>(() =>
    loadFromStorage(STORAGE_KEYS.DEBTS, INITIAL_DEBTS)
  );

  const [goals, setGoals] = useState<SavingsGoalProfile[]>(() =>
    loadFromStorage(STORAGE_KEYS.GOALS, INITIAL_GOALS)
  );

  const [accounts, setAccounts] = useState<BankAccount[]>(() =>
    loadFromStorage(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS)
  );

  const [transfers, setTransfers] = useState<AccountTransfer[]>(() =>
    loadFromStorage(STORAGE_KEYS.TRANSFERS, [])
  );

  const [budget, setBudget] = useState<BudgetPlan>(() =>
    loadFromStorage(STORAGE_KEYS.BUDGET, INITIAL_BUDGET)
  );

  const [savedQREntries, setSavedQREntries] = useState<SavedQREntry[]>(() =>
    loadFromStorage(STORAGE_KEYS.QR_ENTRIES, INITIAL_QR_ENTRIES)
  );

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() =>
    loadFromStorage(STORAGE_KEYS.SECURITY, INITIAL_SECURITY)
  );

  const [backupSettings, setBackupSettings] = useState<BackupSettings>(() =>
    loadFromStorage(STORAGE_KEYS.BACKUP, INITIAL_BACKUP)
  );

  const [usdRate, setUsdRate] = useState<number>(() =>
    loadFromStorage(STORAGE_KEYS.USD_RATE, 1500)
  );

  // Theme Mode (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    loadFromStorage(STORAGE_KEYS.THEME, 'dark')
  );

  // Daily Reminder Settings
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() =>
    loadFromStorage(STORAGE_KEYS.REMINDER, INITIAL_REMINDER)
  );
  const [showReminderBanner, setShowReminderBanner] = useState<boolean>(false);

  // AI Financial Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES)
  );
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Modals state
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isQRSystemOpen, setIsQRSystemOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);

  // Selected Profile Modals (Debts & Goals)
  const [selectedPerson, setSelectedPerson] = useState<PersonDebtProfile | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoalProfile | null>(null);

  // Apply Theme class
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.THEME, theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  // Sync Reminders and Chat
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REMINDER, reminderSettings);
  }, [reminderSettings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, chatMessages);
  }, [chatMessages]);

  // Daily Reminder Checker
  useEffect(() => {
    if (!reminderSettings.isEnabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      const todayDate = now.toISOString().split('T')[0];

      if (
        currentTime === reminderSettings.reminderTime &&
        reminderSettings.lastNotifiedDate !== todayDate
      ) {
        setShowReminderBanner(true);
        setReminderSettings((prev) => ({
          ...prev,
          lastNotifiedDate: todayDate,
        }));

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('سیستەمی دارایی کەسی', {
            body: 'کاتی تۆمارکردنی خەرجییەکانە! تکایە خەرجی و داهاتی ئەمڕۆت بنووسە.',
          });
        }
      }
    };

    const interval = setInterval(checkReminder, 20000);
    return () => clearInterval(interval);
  }, [reminderSettings]);

  // Sync to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECURRING_BILLS, recurringBills);
  }, [recurringBills]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DEBTS, debts);
  }, [debts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOALS, goals);
  }, [goals]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
  }, [accounts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRANSFERS, transfers);
  }, [transfers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BUDGET, budget);
  }, [budget]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.QR_ENTRIES, savedQREntries);
  }, [savedQREntries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SECURITY, securitySettings);
  }, [securitySettings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BACKUP, backupSettings);
  }, [backupSettings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USD_RATE, usdRate);
  }, [usdRate]);

  // Clean / Wipe old dummy data for real usage on first launch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCleaned = localStorage.getItem('zfk_cleaned_mock_v3');
      if (!hasCleaned) {
        setTransactions([]);
        setRecurringBills([]);
        setDebts([]);
        setGoals([]);
        setTransfers([]);
        setSavedQREntries([]);
        setBudget({
          id: 'budget-current',
          month: new Date().toISOString().slice(0, 7),
          totalMonthlyLimit: 0,
          currency: 'IQD',
          categoryLimits: {},
        });
        setAccounts((prev) =>
          prev.map((acc) => ({ ...acc, initialBalance: 0 }))
        );
        localStorage.setItem('zfk_cleaned_mock_v3', 'true');
      }
    }
  }, []);

  // Handlers for Transactions
  const handleAddTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>
  ) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllTransactions = () => {
    setTransactions([]);
  };

  // Handlers for Recurring 30-Day Bills
  const handleAddRecurringBill = (bill: RecurringBill) => {
    setRecurringBills((prev) => [bill, ...prev]);
  };

  const handleUpdateRecurringBill = (updatedBill: RecurringBill) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === updatedBill.id ? updatedBill : b))
    );
  };

  const handlePayRecurringBill = (bill: RecurringBill) => {
    // 1. Add to daily expenses
    handleAddTransaction({
      type: 'expense',
      title: `${bill.title} (ئابوونەی ٣٠ ڕۆژ)`,
      amount: bill.amount,
      currency: bill.currency,
      category: bill.category,
      date: new Date().toISOString().split('T')[0],
      accountId: bill.accountId,
      notes: `خەرجی مانگانەی ٣٠ ڕۆژە`,
    });

    // 2. Advance due date by 30 days
    const nextDate = addDays(bill.nextDueDate, 30);
    setRecurringBills((prev) =>
      prev.map((b) =>
        b.id === bill.id
          ? {
              ...b,
              nextDueDate: nextDate,
              lastLoggedDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );
  };

  const handleDeleteRecurringBill = (id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
  };

  // Handlers for Debts & Person Profiles
  const handleAddPersonDebt = (newPerson: PersonDebtProfile) => {
    setDebts((prev) => [newPerson, ...prev]);
  };

  const handleUpdatePerson = (updated: PersonDebtProfile) => {
    setDebts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setSelectedPerson(updated);
  };

  const handleDeletePerson = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    setSelectedPerson(null);
  };

  // Handlers for Savings Goals
  const handleAddGoal = (newGoal: SavingsGoalProfile) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleUpdateGoal = (updated: SavingsGoalProfile) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setSelectedGoal(updated);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setSelectedGoal(null);
  };

  // Handlers for Bank Accounts & Transfers
  const handleAddAccount = (acc: BankAccount) => {
    setAccounts((prev) => [...prev, acc]);
  };

  const handleUpdateAccount = (updatedAcc: BankAccount) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a))
    );
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTransfer = (tr: AccountTransfer) => {
    setTransfers((prev) => [tr, ...prev]);
  };

  // Handlers for QR System
  const handleSaveQREntry = (entry: SavedQREntry) => {
    setSavedQREntries((prev) => [entry, ...prev]);
  };

  const handleDeleteQREntry = (id: string) => {
    setSavedQREntries((prev) => prev.filter((q) => q.id !== id));
  };

  // Full Database Export & Import
  const handleExportAllData = () => {
    const fullBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      transactions,
      recurringBills,
      debts,
      goals,
      accounts,
      transfers,
      budget,
      savedQREntries,
      usdRate,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `zirak_finance_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportAllData = (jsonData: any) => {
    if (jsonData.transactions) setTransactions(jsonData.transactions);
    if (jsonData.recurringBills) setRecurringBills(jsonData.recurringBills);
    if (jsonData.debts) setDebts(jsonData.debts);
    if (jsonData.goals) setGoals(jsonData.goals);
    if (jsonData.accounts) setAccounts(jsonData.accounts);
    if (jsonData.transfers) setTransfers(jsonData.transfers);
    if (jsonData.budget) setBudget(jsonData.budget);
    if (jsonData.savedQREntries) setSavedQREntries(jsonData.savedQREntries);
    if (jsonData.usdRate) setUsdRate(jsonData.usdRate);
  };

  // Clear / Zero out all data completely
  const handleClearAllData = () => {
    setTransactions([]);
    setRecurringBills([]);
    setDebts([]);
    setGoals([]);
    setTransfers([]);
    setBudget({
      id: 'budget-current',
      month: new Date().toISOString().slice(0, 7),
      totalMonthlyLimit: 0,
      currency: 'IQD',
      categoryLimits: {},
    });
    setAccounts((prev) =>
      prev.map((acc) => ({ ...acc, initialBalance: 0 }))
    );
    setSavedQREntries([]);
    setChatMessages(INITIAL_CHAT_MESSAGES);
  };

  // Theme Toggle Handler
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Test Daily Reminder
  const handleTriggerReminderTest = () => {
    setShowReminderBanner(true);
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  // Clear Chat Handler
  const handleClearChat = () => {
    setChatMessages(INITIAL_CHAT_MESSAGES);
  };

  // AI Financial Chat Assistant Handler (Gemini 3.8 Flash)
  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      const now = new Date();
      const currentMonthExpenses = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const financialContext = {
        totalAccounts: accounts.map((a) => ({
          name: a.name,
          balance: calculateAccountBalance(a, transactions, transfers, goals, usdRate),
          currency: a.currency,
        })),
        monthlyIncomeIQD: currentMonthExpenses
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount), 0),
        monthlyExpenseIQD: currentMonthExpenses
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount * usdRate : t.amount), 0),
        categoryBreakdown: calculateCategoryBreakdown(currentMonthExpenses, 'expense', usdRate).breakdown,
        activeDebts: debts.filter((d) => d.status === 'active').map((d) => ({
          person: d.personName,
          direction: d.direction === 'they_owe_me' ? 'قەرزم لایەتی' : 'قەرزی لای منە',
          original: d.totalOriginalAmount,
          currency: d.currency,
          paid: d.payments.reduce((s, p) => s + p.amount, 0),
        })),
        savingsGoals: goals.map((g) => ({
          title: g.title,
          target: g.targetAmount,
          currency: g.currency,
          saved: g.deposits.reduce((s, d) => s + d.amount, 0),
        })),
        budgetLimitIQD: budget.totalMonthlyLimit,
        recurringBills: recurringBills.map((r) => ({
          title: r.title,
          amount: r.amount,
          currency: r.currency,
          dueDate: r.nextDueDate,
        })),
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          financialContext,
          chatHistory: updatedMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'هەڵەیەک ڕوویدا');
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: 'ببورە، کێشەیەک ڕوویدا لە وەڵامدانەوە. تکایە دووبارە تاقی بکەرەوە.',
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Requirement 14: Polished Splash / Welcome Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            setShowSplash(false);
          }}
        />
      )}

      {/* Requirement 11: Bank-Grade Biometric & PIN Security Modal */}
      <BiometricLockModal
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        correctPin={securitySettings.pinCode}
        isBiometricEnabled={securitySettings.isBiometricEnabled}
      />

      {/* Top Navbar with Kurdish Date Header (Requirement 13) */}
      <Navbar
        onLockApp={() => setIsLocked(true)}
        onOpenAddModal={() => setIsAddTransactionOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onOpenChat={() => setActiveTab('chat')}
        onTriggerReminderTest={handleTriggerReminderTest}
        backupSettings={backupSettings}
        reminderSettings={reminderSettings}
        usdRate={usdRate}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Daily Reminder Banner */}
      <DailyReminderBanner
        isVisible={showReminderBanner}
        onClose={() => setShowReminderBanner(false)}
        onOpenAddModal={() => setIsAddTransactionOpen(true)}
        reminderTime={reminderSettings.reminderTime}
      />

      {/* Horizontal Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        debtsCount={debts.filter((d) => d.status === 'active').length}
        recurringCount={recurringBills.length}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            accounts={accounts}
            recurringBills={recurringBills}
            debts={debts}
            goals={goals}
            budget={budget}
            onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            onOpenQRSystem={() => setIsQRSystemOpen(true)}
            onOpenPersonProfile={(person) => setSelectedPerson(person)}
            onOpenGoalProfile={(goal) => setSelectedGoal(goal)}
            onNavigateTab={(tab) => setActiveTab(tab as NavigationTab)}
            onPayRecurringBill={handlePayRecurringBill}
            usdRate={usdRate}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            accounts={accounts}
            onOpenAddModal={() => setIsAddTransactionOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onClearAllTransactions={handleClearAllTransactions}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringBillsView
            recurringBills={recurringBills}
            accounts={accounts}
            onAddRecurringBill={handleAddRecurringBill}
            onUpdateRecurringBill={handleUpdateRecurringBill}
            onPayRecurringBill={handlePayRecurringBill}
            onDeleteRecurringBill={handleDeleteRecurringBill}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsView
            debts={debts}
            accounts={accounts}
            onOpenPersonProfile={(person) => setSelectedPerson(person)}
            onAddPersonDebt={handleAddPersonDebt}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            budget={budget}
            transactions={transactions}
            onUpdateBudget={(updated) => setBudget(updated)}
            usdRate={usdRate}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsView
            goals={goals}
            accounts={accounts}
            onOpenGoalProfile={(goal) => setSelectedGoal(goal)}
            onAddGoal={handleAddGoal}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            accounts={accounts}
            transactions={transactions}
            transfers={transfers}
            goals={goals}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onTransfer={handleTransfer}
            usdRate={usdRate}
          />
        )}

        {activeTab === 'qr' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">بەڕێوەبردنی سیستەمی QR</h2>
              <button
                onClick={() => setIsQRSystemOpen(true)}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                کردنەوەی سکانەر و کڕینی خێرا
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              لە سیستەمی QR دەتوانی کڕینە دووبارەبووەوەکانی ڕۆژانە یان پسولەکان بە یەک کلیک لە ڕێگەی کۆدی QR باربکەیت بۆ ئەوەی پێویست بە دووبارە نووسین نەکات.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedQREntries.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{q.title}</h3>
                    <p className="text-xs text-emerald-400 font-bold mt-0.5">
                      {q.amount.toLocaleString()} {q.currency}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">{q.category}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleAddTransaction({
                        type: 'expense',
                        title: q.title,
                        amount: q.amount,
                        currency: q.currency,
                        category: q.category,
                        date: new Date().toISOString().split('T')[0],
                        accountId: q.accountId,
                        notes: `تۆمارکرا بە QR (${q.vendorName || q.title})`,
                      });
                      alert(`خەرجی "${q.title}" تۆمارکرا!`);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer border border-emerald-500/30"
                  >
                    تۆمارکردن
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            accounts={accounts}
            usdRate={usdRate}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            onClearChat={handleClearChat}
            isLoading={isChatLoading}
            transactions={transactions}
            accounts={accounts}
            debts={debts}
            goals={goals}
            budget={budget}
            recurringBills={recurringBills}
            usdRate={usdRate}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            securitySettings={securitySettings}
            onUpdateSecuritySettings={(updated) => setSecuritySettings(updated)}
            backupSettings={backupSettings}
            onUpdateBackupSettings={(updated) => setBackupSettings(updated)}
            reminderSettings={reminderSettings}
            onUpdateReminderSettings={(updated) => setReminderSettings(updated)}
            usdRate={usdRate}
            onUpdateUsdRate={(rate) => setUsdRate(rate)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onTriggerReminderTest={handleTriggerReminderTest}
            onOpenGoogleDriveModal={() => setIsGoogleDriveOpen(true)}
            onResetDemoData={handleClearAllData}
          />
        )}
      </main>

      {/* Modals */}
      {/* 1. Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onAddTransaction={handleAddTransaction}
        accounts={accounts}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onOpenQRSystem={() => setIsQRSystemOpen(true)}
      />

      {/* 2. AI Receipt Scanner Modal (Requirement 9) */}
      <AIReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onReceiptScanned={handleAddTransaction}
        accounts={accounts}
      />

      {/* 3. QR System Modal (Requirement 7) */}
      <QRSystemModal
        isOpen={isQRSystemOpen}
        onClose={() => setIsQRSystemOpen(false)}
        savedQREntries={savedQREntries}
        onSaveQREntry={handleSaveQREntry}
        onDeleteQREntry={handleDeleteQREntry}
        onQuickLogExpense={handleAddTransaction}
        accounts={accounts}
      />

      {/* 4. Financial Reports Modal (Requirement 12) */}
      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        transactions={transactions}
        accounts={accounts}
        debts={debts}
        goals={goals}
        usdRate={usdRate}
      />

      {/* 5. Google Drive Backup Modal (Requirement 10) */}
      <GoogleDriveBackupModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        backupSettings={backupSettings}
        onUpdateBackupSettings={(updated) => setBackupSettings(updated)}
        onExportAllData={handleExportAllData}
        onImportAllData={handleImportAllData}
      />

      {/* 6. Person Profile Modal (Requirement 3) */}
      <PersonProfileModal
        person={selectedPerson}
        isOpen={Boolean(selectedPerson)}
        onClose={() => setSelectedPerson(null)}
        onUpdatePerson={handleUpdatePerson}
        onDeletePerson={handleDeletePerson}
        accounts={accounts}
      />

      {/* 7. Goal Profile Modal (Requirement 5) */}
      <GoalProfileModal
        goal={selectedGoal}
        isOpen={Boolean(selectedGoal)}
        onClose={() => setSelectedGoal(null)}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        accounts={accounts}
      />

      {/* Native Mobile Bottom Navigation Dock */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={() => setIsAddTransactionOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onLockApp={() => setIsLocked(true)}
        recurringCount={recurringBills.length}
        debtsCount={debts.filter((d) => d.status === 'active').length}
      />
    </div>
  );
}
