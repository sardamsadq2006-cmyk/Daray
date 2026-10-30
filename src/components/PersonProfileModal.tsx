import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  Share2,
  FileText,
} from 'lucide-react';
import { PersonDebtProfile, BankAccount, DebtPayment } from '../types/finance';
import { formatMoney, calculatePersonDebt } from '../utils/financeCalculations';
import { formatShortKurdishDate } from '../utils/dateUtils';

interface PersonProfileModalProps {
  person: PersonDebtProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePerson: (updated: PersonDebtProfile) => void;
  onDeletePerson: (id: string) => void;
  accounts: BankAccount[];
}

export const PersonProfileModal: React.FC<PersonProfileModalProps> = ({
  person,
  isOpen,
  onClose,
  onUpdatePerson,
  onDeletePerson,
  accounts,
}) => {
  const [showAddPayment, setShowAddPayment] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [paymentAccountId, setPaymentAccountId] = useState<string>(accounts[0]?.id || '');

  // Add more debt under their name state
  const [showIncreaseDebt, setShowIncreaseDebt] = useState<boolean>(false);
  const [additionalDebtAmount, setAdditionalDebtAmount] = useState<string>('');
  const [additionalDebtNote, setAdditionalDebtNote] = useState<string>('');

  if (!isOpen || !person) return null;

  const debtSummary = calculatePersonDebt(person);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentAmount);
    if (!amountNum || amountNum <= 0) return;

    const newPayment: DebtPayment = {
      id: `pay-${Date.now()}`,
      date: paymentDate,
      amount: amountNum,
      currency: person.currency,
      note: paymentNote.trim() || undefined,
      accountId: paymentAccountId,
    };

    const updatedPayments = [...person.payments, newPayment];
    const totalPaidNow = updatedPayments.reduce((s, p) => s + p.amount, 0);
    const isSettled = totalPaidNow >= person.totalOriginalAmount;

    onUpdatePerson({
      ...person,
      payments: updatedPayments,
      status: isSettled ? 'settled' : 'active',
    });

    setPaymentAmount('');
    setPaymentNote('');
    setShowAddPayment(false);
  };

  const handleIncreaseDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const addAmt = parseFloat(additionalDebtAmount);
    if (!addAmt || addAmt <= 0) return;

    onUpdatePerson({
      ...person,
      totalOriginalAmount: person.totalOriginalAmount + addAmt,
      status: 'active',
      notes: person.notes
        ? `${person.notes}\n[${new Date().toISOString().split('T')[0]}] زیادکرا: ${addAmt} ${person.currency} (${additionalDebtNote})`
        : additionalDebtNote,
    });

    setAdditionalDebtAmount('');
    setAdditionalDebtNote('');
    setShowIncreaseDebt(false);
  };

  const handleDeletePayment = (paymentId: string) => {
    const updated = person.payments.filter((p) => p.id !== paymentId);
    const totalPaidNow = updated.reduce((s, p) => s + p.amount, 0);
    const isSettled = totalPaidNow >= person.totalOriginalAmount;
    onUpdatePerson({
      ...person,
      payments: updated,
      status: isSettled ? 'settled' : 'active',
    });
  };

  const getWhatsAppReminderUrl = () => {
    if (!person.phone) return null;
    const cleanPhone = person.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `سڵاو کاک ${person.personName}ی بەڕێز، هیوای باشیت بۆ دەخوازم. سەبارەت بە قەرزەکەت (${formatMoney(
        debtSummary.remainingBalance,
        person.currency
      )}) کە مابوویەوە، کەی گونجاو بوو لای بەڕێزت سوپاسگوزار دەبم.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`پرۆفایلی قەرزی ${person.personName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
              style={{ backgroundColor: person.avatarColor || '#3b82f6' }}
            >
              {person.personName.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{person.personName}</h2>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                    person.direction === 'they_owe_me'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {person.direction === 'they_owe_me'
                    ? 'قەرزم لایەتی (من داومە)'
                    : 'قەرزی لای منە (قەرزدارم)'}
                </span>
              </div>
              {person.phone && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5" dir="ltr">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{person.phone}</span>
                </p>
              )}
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

        {/* Debt Progress & Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">کۆی قەرز</span>
            <span className="text-sm sm:text-base font-bold text-white">
              {formatMoney(person.totalOriginalAmount, person.currency)}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">دراوەتەوە</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">
              {formatMoney(debtSummary.totalPaid, person.currency)}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">بڕی ماوە</span>
            <span className="text-sm sm:text-base font-bold text-amber-400">
              {formatMoney(debtSummary.remainingBalance, person.currency)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>ڕێژەی دراوەتەوە:</span>
            <span className="font-bold text-white">{debtSummary.progressPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${debtSummary.progressPercentage}%` }}
            />
          </div>
        </div>

        {person.notes && (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 mb-4 text-xs text-slate-300 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="whitespace-pre-line">{person.notes}</p>
          </div>
        )}

        {/* Action Buttons: Add Payment, Increase Debt, WhatsApp Reminder */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              setShowAddPayment(!showAddPayment);
              setShowIncreaseDebt(false);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            <span>تۆمارکردنی پارەدانانەوە</span>
          </button>

          <button
            onClick={() => {
              setShowIncreaseDebt(!showIncreaseDebt);
              setShowAddPayment(false);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>زیادکردنی بڕی قەرز</span>
          </button>

          {person.phone && person.direction === 'they_owe_me' && (
            <a
              href={getWhatsAppReminderUrl() || '#'}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-teal-500/30"
            >
              <Share2 className="w-4 h-4" />
              <span>نامەی واتسئاپ</span>
            </a>
          )}
        </div>

        {/* Add Payment Form Drawer */}
        {showAddPayment && (
          <form
            onSubmit={handleAddPayment}
            className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 mb-4 space-y-3 animate-fadeIn"
          >
            <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>تۆمارکردنی بەشە پارەی دراوەتەوە</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  بڕی پارە ({person.currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="بڕی پارە"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ڕێکەوت
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  تێبینی
                </label>
                <input
                  type="text"
                  placeholder="وەکو: بە دەست دراوەتەوە، حەواڵە..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  لە ڕێگەی هەژماری
                </label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              پاشەکەوتکردنی پارەدانانەوە
            </button>
          </form>
        )}

        {/* Increase Debt Form Drawer */}
        {showIncreaseDebt && (
          <form
            onSubmit={handleIncreaseDebt}
            className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 mb-4 space-y-3 animate-fadeIn"
          >
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <span>زیادکردنی بڕی قەرز لەسەر ناوی {person.personName}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  بڕی قەرزی نوێ ({person.currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="بڕی پارەی زیادکراو"
                  value={additionalDebtAmount}
                  onChange={(e) => setAdditionalDebtAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  هۆکار یان تێبینی
                </label>
                <input
                  type="text"
                  placeholder="وەکو: کڕینی پێداویستی نوێ"
                  value={additionalDebtNote}
                  onChange={(e) => setAdditionalDebtNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              زیادکردن بۆ سەر ناوی ئەم کەسە
            </button>
          </form>
        )}

        {/* Payments History List */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>مێژووی قیست و پارەدانانەوەکان ({person.payments.length})</span>
          </h3>

          {person.payments.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-950/40 p-4 rounded-xl text-center border border-slate-800">
              تا ئێستا هیچ پارەیەک لەم قەرزە نەدراوەتەوە.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {person.payments.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">
                        {formatMoney(p.amount, p.currency)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatShortKurdishDate(p.date)}
                      </span>
                    </div>
                    {p.note && <p className="text-[11px] text-slate-400 mt-0.5">{p.note}</p>}
                  </div>

                  <button
                    onClick={() => handleDeletePayment(p.id)}
                    aria-label="سڕینەوەی ئەم پارەدانە"
                    className="p-1 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Delete Person Profile */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm(`دڵنیایت لە سڕینەوەی تەواوی پرۆفایلی ${person.personName}؟`)) {
                onDeletePerson(person.id);
                onClose();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>سڕینەوەی ئەم کەسە</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
};
