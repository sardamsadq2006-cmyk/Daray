import React, { useState } from 'react';
import {
  Users,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  CheckCircle,
  Clock,
  Search,
  X,
  UserPlus,
} from 'lucide-react';
import { PersonDebtProfile, BankAccount, Currency } from '../../types/finance';
import {
  calculatePersonDebt,
  formatMoney,
} from '../../utils/financeCalculations';
import { formatShortKurdishDate } from '../../utils/dateUtils';

interface DebtsViewProps {
  debts: PersonDebtProfile[];
  accounts: BankAccount[];
  onOpenPersonProfile: (person: PersonDebtProfile) => void;
  onAddPersonDebt: (newPerson: PersonDebtProfile) => void;
}

const AVATAR_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ef4444',
];

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  accounts,
  onOpenPersonProfile,
  onAddPersonDebt,
}) => {
  const [tab, setTab] = useState<'they_owe_me' | 'i_owe_them' | 'all'>('they_owe_me');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);

  // Form states for new person
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [direction, setDirection] = useState<'they_owe_me' | 'i_owe_them'>('they_owe_me');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const filteredDebts = debts.filter((d) => {
    if (tab !== 'all' && d.direction !== tab) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = d.personName.toLowerCase().includes(term);
      const matchPhone = d.phone?.includes(term);
      const matchNotes = d.notes?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchNotes) return false;
    }
    return true;
  });

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(totalAmount);
    if (!amt || amt <= 0 || !personName.trim()) return;

    const randomColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newPerson: PersonDebtProfile = {
      id: `debt-${Date.now()}`,
      personName: personName.trim(),
      phone: phone.trim() || undefined,
      avatarColor: randomColor,
      direction,
      totalOriginalAmount: amt,
      currency,
      startDate,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
      status: 'active',
      payments: [],
      createdAt: Date.now(),
    };

    onAddPersonDebt(newPerson);
    setPersonName('');
    setPhone('');
    setTotalAmount('');
    setNotes('');
    setDueDate('');
    setShowAddPersonModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white mb-0.5 flex items-center gap-2">
            <span>بەڕێوەبردنی قەرزەکان و پرۆفایلی کەسەکان</span>
          </h2>
          <p className="text-xs text-slate-400">
            هەر کەسێک پرۆفایلی تایبەتی خۆی هەیە بۆ تۆمارکردن و زیادکردنی قەرز لەسەر ناوی ئەو
          </p>
        </div>

        <button
          onClick={() => setShowAddPersonModal(true)}
          className="py-2.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>زیادکردنی پرۆفایلی کەسی نوێ</span>
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setTab('they_owe_me')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
              tab === 'they_owe_me'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            قەرزم لایەتی (من داومە)
          </button>
          <button
            onClick={() => setTab('i_owe_them')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
              tab === 'i_owe_them'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            قەرزی لای منە (قەرزدارم)
          </button>
          <button
            onClick={() => setTab('all')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer ${
              tab === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            سەرجەم کەسەکان
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="گەڕان بەپێی ناوی کەس یان تەلەفۆن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Person Debt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDebts.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
            هیچ کەسێک نەدۆزرایەوە لەم بەشەدا. کلیک لە &quot;زیادکردنی پرۆفایلی کەسی نوێ&quot; بکە.
          </div>
        ) : (
          filteredDebts.map((person) => {
            const summary = calculatePersonDebt(person);

            return (
              <div
                key={person.id}
                onClick={() => onOpenPersonProfile(person)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                        style={{ backgroundColor: person.avatarColor || '#3b82f6' }}
                      >
                        {person.personName.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {person.personName}
                        </h3>
                        {person.phone && (
                          <p className="text-[11px] text-slate-400 mt-0.5" dir="ltr">
                            {person.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        person.direction === 'they_owe_me'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {person.direction === 'they_owe_me' ? 'قەرزم لایەتی' : 'قەرزی لای منە'}
                    </span>
                  </div>

                  {/* Balances */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 mb-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">بڕی ماوە:</span>
                      <span className="text-base font-black text-white font-mono">
                        {formatMoney(summary.remainingBalance, person.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>کۆی سەرەتایی:</span>
                      <span>{formatMoney(person.totalOriginalAmount, person.currency)}</span>
                    </div>

                    {/* Mini progress */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${summary.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                  <span>{person.payments.length} جار پارە دراوەتەوە</span>
                  <span className="text-blue-400 font-bold group-hover:underline">
                    بینینی پرۆفایل ←
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="زیادکردنی پرۆفایلی کەسی نوێ بۆ قەرز"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>زیادکردنی کەسی نوێ بۆ قەرز</span>
              </h2>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePerson} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    ناوی کەسەکە
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="وەکو: ئەحمەد، ڕێبوار..."
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    ژمارەی مۆبایل (ئارەزوومەندانە)
                  </label>
                  <input
                    type="tel"
                    placeholder="0750 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Direction Toggle */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  جۆری قەرزەکە
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection('they_owe_me')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      direction === 'they_owe_me'
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    قەرزم لایەتی (من پێمدابوو)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('i_owe_them')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      direction === 'i_owe_them'
                        ? 'bg-rose-600/30 text-rose-300 border-rose-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    قەرزی لای منە (قەرزدارم)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    کۆی بڕی قەرز
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="بڕی پارە"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-blue-500 text-left font-mono"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    ڕێکەوتی پێدان
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    وادەی کۆتایی (ئارەزوومەندانە)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  تێبینی دەربارەی قەرزەکە
                </label>
                <input
                  type="text"
                  placeholder="هۆکاری قەرز، ڕێککەوتن..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md mt-4"
              >
                دروستکردنی پرۆفایلی کەسەکە
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
