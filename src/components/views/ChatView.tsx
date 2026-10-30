import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Lightbulb,
  RefreshCw,
  Wallet,
  TrendingDown,
  Target,
  Users,
} from 'lucide-react';
import {
  ChatMessage,
  Transaction,
  BankAccount,
  PersonDebtProfile,
  SavingsGoalProfile,
  BudgetPlan,
  RecurringBill,
} from '../../types/finance';
import { calculateCategoryBreakdown, formatMoney } from '../../utils/financeCalculations';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  transactions: Transaction[];
  accounts: BankAccount[];
  debts: PersonDebtProfile[];
  goals: SavingsGoalProfile[];
  budget: BudgetPlan;
  recurringBills: RecurringBill[];
  usdRate?: number;
}

const SUGGESTED_PROMPTS = [
  'چۆن دەتوانم ئەم مانگە زیاتر پاشەکەوت بکەم؟',
  'زۆرترین خەرجیم لە چی بووە بەپێی داتاکانم؟',
  'دۆخی قەرزەکانم چۆنە؟ لای کێم ماوە؟',
  'ئایا دەتوانم ئامانجی ئۆتۆمبێلەکە لە وادەی خۆیدا تەواو بکەم؟',
  'پێشنیاری ٣ ڕێگای کرداری بۆ کەمکردنەوەی خەرجی بکە',
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  transactions,
  accounts,
  debts,
  goals,
  budget,
  recurringBills,
  usdRate = 1500,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePromptClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-185px)] max-h-[850px] bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Top Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                ڕاوێژکاری دارایی زیرەک (Gemini AI)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                بەستراو بە داتاکانت
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              پرسیار لەبارەی خەرجی، پاشەکەوت و دۆخی دارایت بکە
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={onClearChat}
            title="سڕینەوەی چات"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grounded Data Context Mini Bar */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-3 text-[11px] text-slate-400 overflow-x-auto no-scrollbar">
        <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
          <Sparkles className="w-3 h-3" />
          <span>داتای چالاک:</span>
        </span>
        <span className="shrink-0">{transactions.length} مامەڵە</span>
        <span>•</span>
        <span className="shrink-0">{accounts.length} هەژمار</span>
        <span>•</span>
        <span className="shrink-0">{debts.length} قەرزدار</span>
        <span>•</span>
        <span className="shrink-0">{goals.length} ئامانج</span>
        <span>•</span>
        <span className="shrink-0">{recurringBills.length} خەرجی ٣٠ ڕۆژە</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>ڕاوێژکاری زیرەک شیکاری داتاکانت دەکات و دەنووسێت...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] text-slate-500 font-bold shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>پێشنیارەکان:</span>
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              disabled={isLoading}
              className="shrink-0 text-[11px] py-1 px-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="پرسیارەکەت لێرە بنووسە (بۆ نموونە: چۆن دەتوانم خەرجی کەمبکەمەوە؟)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          aria-label="ناردنی پرسیار"
          className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">ناردن</span>
        </button>
      </form>
    </div>
  );
};
