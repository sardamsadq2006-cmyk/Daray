import React, { useState } from 'react';
import {
  X,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Sparkles,
  QrCode,
  Calendar,
  Wallet,
  Tag,
  FileText,
} from 'lucide-react';
import { Transaction, BankAccount, Currency, TransactionType } from '../types/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  accounts: BankAccount[];
  onOpenReceiptScanner: () => void;
  onOpenQRSystem: () => void;
}

export const CATEGORIES = [
  'خۆراک',
  'هاتوچۆ',
  'ماڵ_و_خێزان',
  'تەندروستی',
  'پۆشاک',
  'ئینتەرنێت_و_تەلەفۆن',
  'کابانی_ماڵ_و_مارکێت',
  'خۆشی_و_گەشت',
  'پەروەردە',
  'وەبەرهێنان',
  'مووچە',
  'دیاری',
  'خەرجی_تر',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  accounts,
  onOpenReceiptScanner,
  onOpenQRSystem,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [category, setCategory] = useState('خۆراک');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    onAddTransaction({
      type,
      title: title.trim(),
      amount: amt,
      currency,
      category,
      accountId,
      date,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setTitle('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="زیادکردنی مامەڵەی دارایی نوێ"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-xl ${
                type === 'expense'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {type === 'expense' ? (
                <ArrowDownCircle className="w-5 h-5" />
              ) : (
                <ArrowUpCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {type === 'expense' ? 'تۆمارکردنی خەرجی نوێ' : 'تۆمارکردنی داهاتی نوێ'}
              </h2>
              <p className="text-xs text-slate-400">
                خەرجی یان داهاتی ڕۆژانەت بە وردی بنووسە
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="داخستن"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle: Expense / Income */}
        <div className="flex p-1 bg-slate-950 rounded-2xl mb-4 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              if (category === 'مووچە') setCategory('خۆراک');
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>خەرجی (پارەدەرچوون)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('مووچە');
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>داهات (پارەهاتن)</span>
          </button>
        </div>

        {/* Quick Shortcuts: AI Receipt Scanner & QR Scanner */}
        {type === 'expense' && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReceiptScanner();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>سکانی پسولە بە AI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQRSystem();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-teal-400" />
              <span>کڕینی خێرا بە QR</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              ناوی مامەڵەکە / شوێن
            </label>
            <input
              type="text"
              required
              placeholder={type === 'expense' ? 'وەکو: کڕینی مارکێت، بەنزین...' : 'وەکو: مووچەی مانگانە، قازانج...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] text-slate-400 block mb-1">
                بڕی پارە
              </label>
              <input
                type="number"
                required
                placeholder="بڕی پارە بە ژمارە"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 text-left font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">دراو</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="IQD">دینار IQD</option>
                <option value="USD">دۆلار USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                بەش / پۆلێن
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                ڕێکەوت
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                تێبینی (ئارەزوومەندانە)
              </label>
              <input
                type="text"
                placeholder="تێبینی زیاتر..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4 ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{type === 'expense' ? 'تۆمارکردنی خەرجی' : 'تۆمارکردنی داهات'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
