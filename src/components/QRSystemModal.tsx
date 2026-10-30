import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Plus,
  Zap,
  Camera,
  Check,
  Trash2,
  Share2,
  Scan,
  Store,
  DollarSign,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { SavedQREntry, BankAccount, Transaction, Currency } from '../types/finance';
import { formatMoney } from '../utils/financeCalculations';

interface QRSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedQREntries: SavedQREntry[];
  onSaveQREntry: (entry: SavedQREntry) => void;
  onDeleteQREntry: (id: string) => void;
  onQuickLogExpense: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  accounts: BankAccount[];
}

export const QRSystemModal: React.FC<QRSystemModalProps> = ({
  isOpen,
  onClose,
  savedQREntries,
  onSaveQREntry,
  onDeleteQREntry,
  onQuickLogExpense,
  accounts,
}) => {
  const [activeTab, setActiveTab] = useState<'quick_list' | 'create_new' | 'camera_scan'>(
    'quick_list'
  );
  const [viewingQR, setViewingQR] = useState<{ entry: SavedQREntry; dataUrl: string } | null>(
    null
  );

  // Form for creating a new QR preset
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [category, setCategory] = useState('خۆراک');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [vendorName, setVendorName] = useState('');
  const [notes, setNotes] = useState('');

  // Scanner simulation / camera
  const [scanInputText, setScanInputText] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [scannerFeedback, setScannerFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateQRView = async (entry: SavedQREntry) => {
    try {
      const url = await QRCodeLib.toDataURL(entry.qrPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setViewingQR({ entry, dataUrl: url });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewQR = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) return;

    const payload = `ZIRAK:PAY:${amtNum}:${currency}:${category}:${encodeURIComponent(
      vendorName || title
    )}`;

    const newEntry: SavedQREntry = {
      id: `qr-${Date.now()}`,
      title,
      amount: amtNum,
      currency,
      category,
      accountId: accountId || accounts[0]?.id || 'acc-cash',
      vendorName: vendorName || undefined,
      notes: notes || undefined,
      qrPayload: payload,
    };

    onSaveQREntry(newEntry);
    setTitle('');
    setAmount('');
    setVendorName('');
    setNotes('');
    setActiveTab('quick_list');
  };

  const handleExecuteQuickPurchase = (entry: SavedQREntry) => {
    onQuickLogExpense({
      type: 'expense',
      title: entry.title,
      amount: entry.amount,
      currency: entry.currency,
      category: entry.category,
      date: new Date().toISOString().split('T')[0],
      accountId: entry.accountId,
      notes: `تۆمارکرا لە ڕێگەی کۆدی QR خێرا (${entry.vendorName || entry.title})`,
      qrCode: entry.qrPayload,
    });
    setScannerFeedback(`خەرجی "${entry.title}" بە سەرکەوتوویی تۆمارکرا!`);
    setTimeout(() => {
      setScannerFeedback(null);
      onClose();
    }, 1000);
  };

  const handleProcessScannedCode = (text: string) => {
    if (!text.trim()) return;

    // Check if matches ZIRAK payload or standard json
    if (text.startsWith('ZIRAK:PAY:')) {
      const parts = text.split(':');
      const amt = parseFloat(parts[2]) || 0;
      const curr = (parts[3] === 'USD' ? 'USD' : 'IQD') as Currency;
      const cat = parts[4] || 'خۆراک';
      const vendor = decodeURIComponent(parts[5] || 'کڕینی QR');

      onQuickLogExpense({
        type: 'expense',
        title: `کڕین بە QR: ${vendor}`,
        amount: amt,
        currency: curr,
        category: cat,
        date: new Date().toISOString().split('T')[0],
        accountId: accounts[0]?.id || 'acc-cash',
        notes: `خوێندراوەتەوە لە کۆدی QR: ${text}`,
        qrCode: text,
      });

      setScannerFeedback(`کۆدی QR خوێندرایەوە و ${formatMoney(amt, curr)} تۆمارکرا!`);
      setTimeout(() => {
        setScannerFeedback(null);
        onClose();
      }, 1200);
    } else {
      // General QR fallback: logs as an expense with amount or generic title
      onQuickLogExpense({
        type: 'expense',
        title: 'کڕین لە ڕێگەی کۆدی QR',
        amount: 10000,
        currency: 'IQD',
        category: 'خۆراک',
        date: new Date().toISOString().split('T')[0],
        accountId: accounts[0]?.id || 'acc-cash',
        notes: `زانیاری QR: ${text}`,
        qrCode: text,
      });

      setScannerFeedback('کۆدەکە تۆمارکرا لە خەرجی ڕۆژانە!');
      setTimeout(() => {
        setScannerFeedback(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="سیستەمی QR بۆ کڕینی خێرا"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">سیستەمی QR بۆ کڕینی خێرا</h2>
              <p className="text-xs text-slate-400">
                شتە ڕۆژانەکان پاشەکەوت بکە بۆ ئەوەی جارێکی تر بە دەست نەینووسیتەوە
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

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-2xl mb-4 border border-slate-800 text-xs">
          <button
            onClick={() => {
              setActiveTab('quick_list');
              setViewingQR(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'quick_list'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>کڕینی خێرا بە ١ کلیک</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('create_new');
              setViewingQR(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'create_new'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>دروستکردنی QR نوێ</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('camera_scan');
              setViewingQR(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'camera_scan'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>سکانی QR</span>
          </button>
        </div>

        {scannerFeedback && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-4 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{scannerFeedback}</span>
          </div>
        )}

        {/* Viewing single generated QR modal */}
        {viewingQR && (
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-6 text-center mb-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-white mb-1">
              کۆدی QR بۆ: {viewingQR.entry.title}
            </h3>
            <p className="text-xs text-emerald-400 font-bold mb-4">
              {formatMoney(viewingQR.entry.amount, viewingQR.entry.currency)}
            </p>

            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto mb-4">
              <img
                src={viewingQR.dataUrl}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
              دەتوانی ئەم کۆدە پیشانی کامێرای مۆبایلەکەت بدەیت یان بە ١ کلیک لە خوارەوە کڕینەکە تۆمار بکەیت:
            </p>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleExecuteQuickPurchase(viewingQR.entry)}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>تۆمارکردنی ئێستای ئەم خەرجییە</span>
              </button>
              <button
                onClick={() => setViewingQR(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                گەڕانەوە
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Quick purchase list */}
        {activeTab === 'quick_list' && !viewingQR && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>لیستی کاڵا و فرۆشگا پاشەکەوتکراوەکان:</span>
              <span>{savedQREntries.length} دانە</span>
            </div>

            {savedQREntries.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-950/40 p-6 rounded-2xl text-center border border-slate-800">
                هیچ کڕینێکی خێرا تا ئێستا زیاد نەکراوە. کلیک لە &quot;دروستکردنی QR نوێ&quot; بکە.
              </p>
            ) : (
              savedQREntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleGenerateQRView(entry)}
                      title="پیشاندانی کۆدی QR"
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {entry.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-bold">
                          {formatMoney(entry.amount, entry.currency)}
                        </span>
                        <span>•</span>
                        <span>{entry.category}</span>
                        {entry.vendorName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Store className="w-3 h-3 text-slate-500" />
                              {entry.vendorName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExecuteQuickPurchase(entry)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-emerald-500/30"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>تۆمارکردن</span>
                    </button>
                    <button
                      onClick={() => onDeleteQREntry(entry.id)}
                      aria-label="سڕینەوە"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Create new QR entry */}
        {activeTab === 'create_new' && (
          <form onSubmit={handleCreateNewQR} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ناوی کاڵا یان خەرجی
                </label>
                <input
                  type="text"
                  required
                  placeholder="وەکو: بەنزین، نان، مارکێت..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  فرۆشگا / شوێن
                </label>
                <input
                  type="text"
                  placeholder="وەکو: مارکێتی گەڕەک"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] text-slate-400 block mb-1">
                  بڕی پارەی خەرجی
                </label>
                <input
                  type="number"
                  required
                  placeholder="بڕی پارە"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
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
                  جۆری خەرجی
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="خۆراک">خۆراک</option>
                  <option value="هاتوچۆ">هاتوچۆ</option>
                  <option value="ماڵ_و_خێزان">ماڵ و خێزان</option>
                  <option value="تەندروستی">تەندروستی</option>
                  <option value="پۆشاک">پۆشاک</option>
                  <option value="ئینتەرنێت_و_تەلەفۆن">ئینتەرنێت و تەلەفۆن</option>
                  <option value="خەرجی_تر">خەرجی تر</option>
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
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                تێبینی
              </label>
              <input
                type="text"
                placeholder="تێبینی دەربارەی ئەم کڕینە خێرایە"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md mt-2"
            >
              پاشەکەوتکردنی ئەم کڕینە لە سیستەمی QR
            </button>
          </form>
        )}

        {/* Tab 3: Camera scan & code reader */}
        {activeTab === 'camera_scan' && (
          <div className="space-y-4 text-center">
            <div className="p-8 border-2 border-dashed border-emerald-500/40 rounded-3xl bg-slate-950/60 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Scan className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                سکانی ڕاستەوخۆی کۆدی QR
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                دەتوانی کۆدی پسولە، فرۆشگا، یان کۆدی خوارەوە بنووسیت یان پەیستی بکەیت بۆ تۆمارکردنی خێرا
              </p>

              <div className="w-full flex gap-2">
                <input
                  type="text"
                  placeholder="یان کۆدی QR لێرە دابنێ (نموونە: ZIRAK:PAY:15000:IQD:FOOD:Market)"
                  value={scanInputText}
                  onChange={(e) => setScanInputText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 text-left font-mono"
                  dir="ltr"
                />
                <button
                  onClick={() => handleProcessScannedCode(scanInputText)}
                  className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  خوێندنەوە
                </button>
              </div>
            </div>

            {/* Quick demo presets */}
            <div>
              <span className="text-xs text-slate-400 block mb-2">
                نموونەی کۆدە تاقیکارییەکان (تەنها کلیک بکە):
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() =>
                    handleProcessScannedCode(
                      'ZIRAK:PAY:12000:IQD:خۆراک:کافێتریای زانکۆ'
                    )
                  }
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer border border-slate-700"
                >
                  کافێتریای زانکۆ (12,000 د.ع)
                </button>
                <button
                  onClick={() =>
                    handleProcessScannedCode(
                      'ZIRAK:PAY:25000:IQD:هاتوچۆ:تاکسی هەولێر سلێمانی'
                    )
                  }
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer border border-slate-700"
                >
                  کرێی تاکسی (25,000 د.ع)
                </button>
                <button
                  onClick={() =>
                    handleProcessScannedCode(
                      'ZIRAK:PAY:30:USD:تەندروستی:پشکنینی پزیشکی'
                    )
                  }
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer border border-slate-700"
                >
                  پشکنینی کلینیک ($30)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
