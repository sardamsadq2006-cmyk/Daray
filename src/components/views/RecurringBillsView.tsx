import React, { useState } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Trash2,
  Edit2,
  RefreshCw,
  Zap,
  X,
  CreditCard,
} from 'lucide-react';
import { RecurringBill, BankAccount, Currency } from '../../types/finance';
import { formatMoney } from '../../utils/financeCalculations';
import {
  formatShortKurdishDate,
  calculateDaysRemaining,
  addDays,
} from '../../utils/dateUtils';
import { CATEGORIES } from '../AddTransactionModal';

interface RecurringBillsViewProps {
  recurringBills: RecurringBill[];
  accounts: BankAccount[];
  onAddRecurringBill: (bill: RecurringBill) => void;
  onUpdateRecurringBill: (bill: RecurringBill) => void;
  onPayRecurringBill: (bill: RecurringBill) => void;
  onDeleteRecurringBill: (id: string) => void;
}

export const RecurringBillsView: React.FC<RecurringBillsViewProps> = ({
  recurringBills,
  accounts,
  onAddRecurringBill,
  onUpdateRecurringBill,
  onPayRecurringBill,
  onDeleteRecurringBill,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);

  // Add bill form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [category, setCategory] = useState('ئینتەرنێت_و_تەلەفۆن');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-cash');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState(
    addDays(new Date().toISOString().split('T')[0], 30)
  );
  const [notes, setNotes] = useState('');

  // Edit bill form state
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCurrency, setEditCurrency] = useState<Currency>('IQD');
  const [editCategory, setEditCategory] = useState('ئینتەرنێت_و_تەلەفۆن');
  const [editAccountId, setEditAccountId] = useState('');
  const [editNextDueDate, setEditNextDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    const newBill: RecurringBill = {
      id: `rec-${Date.now()}`,
      title,
      amount: amt,
      currency,
      category,
      intervalDays: 30, // 30-day recurring as requested
      startDate,
      nextDueDate,
      accountId,
      notes: notes || undefined,
      autoLog: false,
    };

    onAddRecurringBill(newBill);
    setTitle('');
    setAmount('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleOpenEdit = (bill: RecurringBill) => {
    setEditingBill(bill);
    setEditTitle(bill.title);
    setEditAmount(bill.amount.toString());
    setEditCurrency(bill.currency);
    setEditCategory(bill.category);
    setEditAccountId(bill.accountId);
    setEditNextDueDate(bill.nextDueDate);
    setEditNotes(bill.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;
    const amt = parseFloat(editAmount);
    if (!amt || amt <= 0 || !editTitle.trim()) return;

    const updated: RecurringBill = {
      ...editingBill,
      title: editTitle.trim(),
      amount: amt,
      currency: editCurrency,
      category: editCategory,
      accountId: editAccountId,
      nextDueDate: editNextDueDate,
      notes: editNotes.trim() || undefined,
    };

    onUpdateRecurringBill(updated);
    setEditingBill(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-0.5 flex items-center gap-2">
            <span>خەرجییە مانگانەکان (٣٠ ڕۆژ جارێک)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              ٣٠ ڕۆژ دووبارەبووەوە
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            خەتی ئینتەرنێت، موەلیدە، کرێی خانوو، هۆڵی وەرزش (بە توانای دەستکاریکردنی نرخ و سڕینەوە)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>زیادکردنی خەرجی مانگانەی ٣٠ ڕۆژە</span>
        </button>
      </div>

      {/* Empty State */}
      {recurringBills.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            هیچ خەرجییەکی مانگانەی ٣٠ ڕۆژە تۆمار نەکراوە
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            دەتوانی خەتی ئینتەرنێت، کارەبای موەلیدە، کرێی خانوو و شتە مانگانەکانت زیاد بکەیت تا کاتی پارەدانی بیرت بخاتەوە.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>زیادکردنی یەکەمین خەرجی مانگانە</span>
          </button>
        </div>
      ) : (
        /* Recurring Bills Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringBills.map((bill) => {
            const daysLeft = calculateDaysRemaining(bill.nextDueDate);
            const account = accounts.find((a) => a.id === bill.accountId);

            return (
              <div
                key={bill.id}
                className="bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      <Clock className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          daysLeft <= 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : daysLeft <= 5
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}
                      >
                        {daysLeft <= 0 ? 'کاتی هاتووە!' : `مابووە: ${daysLeft} ڕۆژ`}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(bill)}
                        title="دەستکاری نرخ و زانیاری"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-teal-400 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `دڵنیایت لە سڕینەوەی ئەم خەرجییە مانگانەیە: "${bill.title}"؟`
                            )
                          ) {
                            onDeleteRecurringBill(bill.id);
                          }
                        }}
                        title="سڕینەوەی ئەم خەرجییە مانگانەیە"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{bill.title}</h3>
                  <div className="text-2xl font-black text-teal-400 mb-3 font-mono">
                    {formatMoney(bill.amount, bill.currency)}
                    <span className="text-xs text-slate-400 font-normal mr-1 font-sans">
                      / ٣٠ ڕۆژ
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-4">
                    <div className="flex justify-between">
                      <span>کاتی نوێکردنەوەی داهاتوو:</span>
                      <span className="font-bold text-slate-200">
                        {formatShortKurdishDate(bill.nextDueDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>بەش:</span>
                      <span className="text-slate-300">{bill.category}</span>
                    </div>
                    {account && (
                      <div className="flex justify-between">
                        <span>لە هەژماری:</span>
                        <span className="text-slate-300">{account.name}</span>
                      </div>
                    )}
                    {bill.notes && (
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        {bill.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onPayRecurringBill(bill)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تۆمارکردنی پارەی ئەم مانگە</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(bill)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold cursor-pointer transition-colors"
                  >
                    دەستکاری نرخ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Recurring Bill Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="زیادکردنی خەرجی مانگانەی ٣٠ ڕۆژە"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <span>زیادکردنی خەرجی مانگانە (٣٠ ڕۆژ)</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ناوی خەرجی مانگانە
                </label>
                <input
                  type="text"
                  required
                  placeholder="وەکو: خەتی ئینتەرنێت، کرێی خانوو، کارەبای موەلیدە..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    بڕی پارەی مانگانە (نرخ)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="بڕی پارە"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-teal-500 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">دراو</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="IQD">دینار IQD</option>
                    <option value="USD">دۆلار USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    بەش
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    لە هەژماری
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    ڕێکەوتی دەستپێک
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    کاتی نوێکردنەوەی داهاتوو (٣٠ ڕۆژ دواتر)
                  </label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  تێبینی
                </label>
                <input
                  type="text"
                  placeholder="وەکو: خێرایی ئینتەرنێت، ژمارەی ئەمپێر..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md mt-4"
              >
                پاشەکەوتکردنی خەرجی ٣٠ ڕۆژە
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Recurring Bill Modal (دەستکاری نرخی خەرجی مانگانە) */}
      {editingBill && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="دەستکاریکردنی نرخی خەرجی مانگانە"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-400" />
                <span>دەستکاریکردنی نرخی خەرجی مانگانە</span>
              </h2>
              <button
                onClick={() => setEditingBill(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ناوی خەرجی مانگانە
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold text-teal-400">
                    دەستکاریکردنی نرخی مانگانە
                  </label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-teal-500/50 rounded-xl px-3 py-2 text-xs text-white font-black focus:outline-none focus:border-teal-500 font-mono text-base"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    نرخی نوێی ٣٠ ڕۆژە دیاریبکە
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">دراو</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="IQD">دینار IQD</option>
                    <option value="USD">دۆلار USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    بەش
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    لە هەژماری
                  </label>
                  <select
                    value={editAccountId}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  کاتی نوێکردنەوەی داهاتوو
                </label>
                <input
                  type="date"
                  required
                  value={editNextDueDate}
                  onChange={(e) => setEditNextDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  تێبینی
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  پاشەکەوتکردنی نرخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
