import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  ArrowRightLeft,
  Wallet,
  Smartphone,
  Banknote,
  ShieldCheck,
  Check,
  X,
  Trash2,
  Edit2,
  DollarSign,
} from 'lucide-react';
import {
  BankAccount,
  AccountTransfer,
  Transaction,
  SavingsGoalProfile,
  Currency,
} from '../../types/finance';
import {
  calculateAccountBalance,
  formatMoney,
} from '../../utils/financeCalculations';
import { formatShortKurdishDate } from '../../utils/dateUtils';

interface AccountsViewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  transfers: AccountTransfer[];
  goals: SavingsGoalProfile[];
  onAddAccount: (acc: BankAccount) => void;
  onUpdateAccount: (acc: BankAccount) => void;
  onDeleteAccount: (id: string) => void;
  onTransfer: (transfer: AccountTransfer) => void;
  usdRate?: number;
}

const ACCOUNT_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
  '#ef4444',
  '#ec4899',
];

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  transfers,
  goals,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onTransfer,
  usdRate = 1500,
}) => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // New account state
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'bank' | 'wallet' | 'cash' | 'card'>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');

  // Edit account state
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editType, setEditType] = useState<'bank' | 'wallet' | 'cash' | 'card'>('bank');
  const [editBalance, setEditBalance] = useState('');
  const [editCurrency, setEditCurrency] = useState<Currency>('IQD');
  const [editColor, setEditColor] = useState('#3b82f6');

  // Transfer state
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(initialBalance) || 0;
    if (!accountName.trim()) return;

    const randomColor =
      ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)];

    const newAcc: BankAccount = {
      id: `acc-${Date.now()}`,
      name: accountName.trim(),
      accountNumber: accountNumber.trim() || undefined,
      type: accountType,
      initialBalance: bal,
      currency,
      color: randomColor,
      iconName:
        accountType === 'wallet'
          ? 'Smartphone'
          : accountType === 'cash'
          ? 'Banknote'
          : 'CreditCard',
    };

    onAddAccount(newAcc);
    setAccountName('');
    setAccountNumber('');
    setInitialBalance('');
    setShowAddAccountModal(false);
  };

  const handleOpenEdit = (acc: BankAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditNumber(acc.accountNumber || '');
    setEditType(acc.type);
    setEditBalance(acc.initialBalance.toString());
    setEditCurrency(acc.currency);
    setEditColor(acc.color || '#3b82f6');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editName.trim()) return;

    const updated: BankAccount = {
      ...editingAccount,
      name: editName.trim(),
      accountNumber: editNumber.trim() || undefined,
      type: editType,
      initialBalance: parseFloat(editBalance) || 0,
      currency: editCurrency,
      color: editColor,
      iconName:
        editType === 'wallet'
          ? 'Smartphone'
          : editType === 'cash'
          ? 'Banknote'
          : 'CreditCard',
    };

    onUpdateAccount(updated);
    setEditingAccount(null);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || fromAccountId === toAccountId) return;

    const fromAcc = accounts.find((a) => a.id === fromAccountId);

    const newTransfer: AccountTransfer = {
      id: `tr-${Date.now()}`,
      fromAccountId,
      toAccountId,
      amount: amt,
      currency: fromAcc?.currency || 'IQD',
      date: new Date().toISOString().split('T')[0],
      notes: transferNotes.trim() || undefined,
    };

    onTransfer(newTransfer);
    setTransferAmount('');
    setTransferNotes('');
    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setShowTransferModal(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-0.5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span>هەژمارە بانکییەکان و جزدانەکان</span>
          </h2>
          <p className="text-xs text-slate-400">
            زیادکردن، کەمکردن و دەستکاریکردنی باڵانسی پارەی ناو هەژمارەکان
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {accounts.length > 1 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer border border-slate-700 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <span>گواستنەوە لەنێوانیاندا</span>
            </button>
          )}

          <button
            onClick={() => setShowAddAccountModal(true)}
            className="py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>زیادکردنی هەژماری نوێ</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            هیچ هەژمارێکی بانکی تۆمار نەکراوە
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            دەتوانی هەژماری بانکی (وەک FIB، کاش، فاستپەی، زین کاش، ماستەرکارت) بە بڕی پارەی سەرەتایی زیاد بکەیت.
          </p>
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="py-2.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>زیادکردنی یەکەمین هەژمار</span>
          </button>
        </div>
      ) : (
        /* Accounts Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => {
            const liveBalance = calculateAccountBalance(
              acc,
              transactions,
              transfers,
              goals,
              usdRate
            );

            return (
              <div
                key={acc.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden transition-all group"
              >
                <div
                  className="absolute top-0 right-0 left-0 h-1.5"
                  style={{ backgroundColor: acc.color }}
                />

                <div>
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                        style={{ backgroundColor: `${acc.color}25`, color: acc.color }}
                      >
                        {acc.type === 'wallet' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : acc.type === 'cash' ? (
                          <Banknote className="w-5 h-5" />
                        ) : (
                          <CreditCard className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{acc.name}</h3>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {acc.type === 'wallet'
                            ? 'جزدانی ئەلیکترۆنی'
                            : acc.type === 'cash'
                            ? 'پارەی کاش'
                            : 'هەژماری بانکی'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        title="دەستکاری پارە و زانیاری هەژمار"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `دڵنیایت لە سڕینەوە و کەمکردنی ئەم هەژمارە: "${acc.name}"؟`
                            )
                          ) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        title="سڕینەوەی ئەم هەژمارە"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {acc.accountNumber && (
                    <p className="text-xs text-slate-400 font-mono mb-3" dir="ltr">
                      {acc.accountNumber}
                    </p>
                  )}

                  <div className="mb-2">
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      باڵانسی ئێستا (Live Balance):
                    </span>
                    <div className="text-2xl font-black text-white font-mono">
                      {formatMoney(liveBalance, acc.currency)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>پارەی دەستپێک: {formatMoney(acc.initialBalance, acc.currency)}</span>
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="text-blue-400 hover:underline cursor-pointer font-medium"
                  >
                    دەستکاری پارە
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Internal Transfers History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          <span>مێژووی گواستنەوە ناوخۆییەکانی نێوان هەژمارەکان</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          ئەم گواستنەوانە باڵانسی هەژمارەکان ڕێکدەخەن بێ ئەوەی کاریگەری بکەنە سەر خەرجی ڕۆژانە
        </p>

        {transfers.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            هیچ گواستنەوەیەکی نێوان هەژمارەکان تۆمار نەکراوە.
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {transfers.map((tr) => {
              const fromAcc = accounts.find((a) => a.id === tr.fromAccountId);
              const toAcc = accounts.find((a) => a.id === tr.toAccountId);

              return (
                <div
                  key={tr.id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                      <ArrowRightLeft className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <span className="font-bold text-white">
                        لە {fromAcc?.name || 'هەژمار'} ➔ بۆ {toAcc?.name || 'هەژمار'}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatShortKurdishDate(tr.date)} {tr.notes ? `• ${tr.notes}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-white font-mono">
                    {formatMoney(tr.amount, tr.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="زیادکردنی هەژماری نوێ"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span>زیادکردنی هەژماری بانکی یان جزدان</span>
              </h2>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ناوی هەژمار / بانک
                </label>
                <input
                  type="text"
                  required
                  placeholder="وەکو: بانکی FIB، زەین کاش، کیو کارت..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    جۆری هەژمار
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="bank">بانک (Bank)</option>
                    <option value="wallet">جزدان (FastPay, ZainCash...)</option>
                    <option value="card">کارت (Mastercard/Visa)</option>
                    <option value="cash">کاش (دەست)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    ژمارەی هەژمار یان کارت (ئارەزوومەندانە)
                  </label>
                  <input
                    type="text"
                    placeholder="•••• 1234"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    باڵانسی سەرەتایی (Initial Balance)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="بڕی پارەی ئێستا لە ناویەتی"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-blue-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">دراو</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IQD">دینار IQD</option>
                    <option value="USD">دۆلار USD</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md mt-4"
              >
                پاشەکەوتکردنی هەژمار
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Internal Transfer Modal */}
      {showTransferModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="گواستنەوەی نێوان هەژمارەکان"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                <span>گواستنەوەی نێوان هەژمارەکان</span>
              </h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-4">
                <Check className="w-4 h-4" />
                <span>پارەکە بە سەرکەوتوویی لە نێوان هەژمارەکان گوازرایەوە!</span>
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    لە هەژماری (سەرچاوە)
                  </label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    بۆ هەژماری (مەبەست)
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  بڕی پارەی گواستراوە
                </label>
                <input
                  type="number"
                  required
                  placeholder="بڕی پارە"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  تێبینی
                </label>
                <input
                  type="text"
                  placeholder="وەکو: ڕاکێشانی کاش لە ATM، بارگاویکردن..."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md mt-4"
              >
                جێبەجێکردنی گواستنەوە
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal (دەستکاری پارە و زانیاری هەژمار) */}
      {editingAccount && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="دەستکاریکردنی هەژمار و باڵانس"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>دەستکاریکردنی هەژمار و پارەی ناو هەژمار</span>
              </h2>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ناوی هەژمار
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    جۆری هەژمار
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="bank">بانک (Bank)</option>
                    <option value="wallet">جزدان (FastPay, ZainCash...)</option>
                    <option value="card">کارت (Mastercard/Visa)</option>
                    <option value="cash">کاش (دەست)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    ژمارەی هەژمار یان کورتکراوە
                  </label>
                  <input
                    type="text"
                    placeholder="•••• 1234"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold text-blue-400">
                    بڕی پارەی ناو ئەم هەژمارە (باڵانس)
                  </label>
                  <input
                    type="number"
                    required
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-500/50 rounded-xl px-3 py-2 text-xs text-white font-black focus:outline-none focus:border-blue-500 font-mono text-base"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    دەتوانی ڕاستەوخۆ پارەی ناو ئەم هەژمارە بگۆڕیت یان زیادی بکەیت
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">دراو</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IQD">دینار IQD</option>
                    <option value="USD">دۆلار USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ڕەنگی نیشانە
                </label>
                <div className="flex gap-2">
                  {ACCOUNT_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
                        editColor === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  پاشەکەوتکردنی گۆڕانکارییەکان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
