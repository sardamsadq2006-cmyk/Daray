import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  Receipt,
  QrCode,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { Transaction, BankAccount, Currency } from '../../types/finance';
import { formatMoney } from '../../utils/financeCalculations';
import { formatShortKurdishDate } from '../../utils/dateUtils';
import { CATEGORIES } from '../AddTransactionModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  onOpenAddModal: () => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction?: (tx: Transaction) => void;
  onClearAllTransactions?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  onOpenAddModal,
  onDeleteTransaction,
  onUpdateTransaction,
  onClearAllTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string | null>(null);

  // Edit transaction state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'expense' | 'income'>('expense');
  const [editCurrency, setEditCurrency] = useState<Currency>('IQD');
  const [editCategory, setEditCategory] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(term);
      const matchNotes = t.notes?.toLowerCase().includes(term);
      const matchCat = t.category.toLowerCase().includes(term);
      if (!matchTitle && !matchNotes && !matchCat) return false;
    }
    return true;
  });

  const handleOpenEdit = (t: Transaction) => {
    setEditingTx(t);
    setEditTitle(t.title);
    setEditAmount(t.amount.toString());
    setEditType(t.type);
    setEditCurrency(t.currency);
    setEditCategory(t.category);
    setEditAccountId(t.accountId);
    setEditDate(t.date);
    setEditNotes(t.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !onUpdateTransaction) return;
    const amt = parseFloat(editAmount);
    if (!amt || amt <= 0 || !editTitle.trim()) return;

    const updated: Transaction = {
      ...editingTx,
      title: editTitle.trim(),
      amount: amt,
      type: editType,
      currency: editCurrency,
      category: editCategory,
      accountId: editAccountId,
      date: editDate,
      notes: editNotes.trim() || undefined,
    };

    onUpdateTransaction(updated);
    setEditingTx(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-0.5">
            خەرجی و داهاتە ڕۆژانەکان
          </h2>
          <p className="text-xs text-slate-400">
            تۆماری تەواوی کڕین، خەرجی و داهاتی ڕۆژانەت (زیادکردن، سڕینەوە و دەستکاریکردن)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {transactions.length > 0 && onClearAllTransactions && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'ئایا دڵنیایت لە سڕینەوەی سەرجەم خەرجی و داهاتەکان؟ ئەم کردارە ناگەڕێتەوە.'
                  )
                ) {
                  onClearAllTransactions();
                }
              }}
              className="py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-rose-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>سڕینەوەی هەمووی</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="py-2.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تۆمارکردنی خەرجی یان داهات</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="گەڕان بەپێی ناو، تێبینی یان بەش..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Type pills */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`py-1.5 px-3 rounded-lg font-medium cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            هەمووی
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`py-1.5 px-3 rounded-lg font-medium cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تەنها خەرجی
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`py-1.5 px-3 rounded-lg font-medium cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تەنها داهات
          </button>
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="all">سەرجەم بەشەکان</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              هیچ خەرجی یان داهاتێک نەدۆزرایەوە
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              تۆمارەکان بەتاڵن، دەتوانیت بە دوگمەی سەرەوە خەرجییە نوێیەکانی ئەمڕۆت بنووسیت.
            </p>
            <button
              onClick={onOpenAddModal}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تۆمارکردنی یەکەمین خەرجی</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((t) => {
              const account = accounts.find((a) => a.id === t.accountId);
              return (
                <div
                  key={t.id}
                  className="py-3.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        t.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {t.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {t.title}
                        </h4>
                        {t.receiptImage && (
                          <button
                            onClick={() => setSelectedReceiptImage(t.receiptImage!)}
                            title="بینینی وێنەی پسولە"
                            className="p-1 rounded bg-slate-800 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {t.qrCode && (
                          <span
                            title="کڕین بە QR"
                            className="p-1 rounded bg-slate-800 text-teal-400"
                          >
                            <QrCode className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{formatShortKurdishDate(t.date)}</span>
                        <span>•</span>
                        <span className="text-slate-300">{t.category}</span>
                        {account && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">
                              {account.name}
                            </span>
                          </>
                        )}
                        {t.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 italic max-w-xs truncate">
                              {t.notes}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-left font-mono">
                      <span
                        className={`text-sm sm:text-base font-black ${
                          t.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatMoney(t.amount, t.currency)}
                      </span>
                    </div>

                    {onUpdateTransaction && (
                      <button
                        onClick={() => handleOpenEdit(t)}
                        title="دەستکاری ئەم خەرجییە"
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm(`دڵنیایت لە سڕینەوەی ئەم مامەڵەیە: "${t.title}"؟`)) {
                          onDeleteTransaction(t.id);
                        }
                      }}
                      title="سڕینەوە"
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="دەستکاریکردنی مامەڵە"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>دەستکاریکردنی خەرجی یان داهات</span>
              </h2>
              <button
                onClick={() => setEditingTx(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditType('expense')}
                  className={`py-2 rounded-lg font-bold text-xs cursor-pointer ${
                    editType === 'expense'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  خەرجی
                </button>
                <button
                  type="button"
                  onClick={() => setEditType('income')}
                  className={`py-2 rounded-lg font-bold text-xs cursor-pointer ${
                    editType === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400'
                  }`}
                >
                  داهات
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ناوی بابەت</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1 font-bold text-blue-400">
                    بڕی پارە
                  </label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-black font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">بەش</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">لە هەژماری</label>
                  <select
                    value={editAccountId}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                <label className="text-[11px] text-slate-400 block mb-1">ڕێکەوت</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">تێبینی</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  پاشەکەوتکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Image Lightbox Modal */}
      {selectedReceiptImage && (
        <div
          role="dialog"
          aria-label="پسولەی کڕین"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-4">
            <button
              onClick={() => setSelectedReceiptImage(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white mb-3">وێنەی پسولە</h3>
            <img
              src={selectedReceiptImage}
              alt="پسولە"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
