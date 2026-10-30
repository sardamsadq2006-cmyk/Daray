import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Calendar,
  Lock,
  Cloud,
  Plus,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  Sun,
  Moon,
  Bell,
  Bot,
} from 'lucide-react';
import { formatKurdishDate, getKurdishDayName } from '../utils/dateUtils';
import { BackupSettings, ReminderSettings } from '../types/finance';

interface NavbarProps {
  onLockApp: () => void;
  onOpenAddModal: () => void;
  onOpenReports: () => void;
  onOpenGoogleDrive: () => void;
  onOpenChat: () => void;
  onTriggerReminderTest: () => void;
  backupSettings: BackupSettings;
  reminderSettings: ReminderSettings;
  usdRate: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLockApp,
  onOpenAddModal,
  onOpenReports,
  onOpenGoogleDrive,
  onOpenChat,
  onTriggerReminderTest,
  backupSettings,
  reminderSettings,
  usdRate,
  theme,
  onToggleTheme,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateStr(formatKurdishDate(now));
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 no-print transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Kurdish Date Header (Requirement 13) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                سیستەمی دارایی کەسی
              </h1>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                PRO VAULT
              </span>
            </div>

            {/* Prominent Kurdish Date Requirement: "ئەم سیتمە ڕوژ و مانگ و سال دیار بیتن لەگەک ڕوژەکە واتە گەر شەمە بیتن بلیتن ئەمرو شەمە یە" */}
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{currentDateStr}</span>
              <span className="text-slate-500 text-[10px] font-mono hidden md:inline">
                ({timeStr})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Controls, Reports, Drive Sync & Biometric Lock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rate Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="text-slate-500">$1 =</span>
            <span className="font-bold text-white font-mono">{usdRate.toLocaleString()} د.ع</span>
          </div>

          {/* AI Financial Chat Button */}
          <button
            onClick={onOpenChat}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="چاتی دارایی زیرەک"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">چاتی AI</span>
          </button>

          {/* Daily Reminder Bell Button */}
          <button
            onClick={onTriggerReminderTest}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title={`ئاگادارکردنەوەی ڕۆژانە (${reminderSettings.reminderTime})`}
            aria-label="ئاگادارکردنەوەی ڕۆژانە"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline text-[11px] font-mono">{reminderSettings.reminderTime}</span>
          </button>

          {/* Theme Switcher Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center cursor-pointer transition-all"
            title={theme === 'dark' ? 'گۆڕین بۆ دۆخی ڕووناك (Light Mode)' : 'گۆڕین بۆ دۆخی تاریک (Dark Mode)'}
            aria-label="گۆڕینی دۆخی ڕووکار"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500" />
            )}
          </button>

          {/* Reports Button */}
          <button
            onClick={onOpenReports}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="ڕاپۆرتی دارایی و AI"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">ڕاپۆرت</span>
          </button>

          {/* Google Drive Status Indicator */}
          <button
            onClick={onOpenGoogleDrive}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
              backupSettings.googleDriveConnected
                ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="پاراستن لە گووگڵ درایڤ"
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">گووگڵ درایڤ</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Lock Vault Button */}
          <button
            onClick={onLockApp}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="قوفڵکردنی بانکی (Biometric Lock)"
            aria-label="قوفڵکردنی سیستەم"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">قوفڵکردن</span>
          </button>

          {/* Primary Quick Add Transaction */}
          <button
            onClick={onOpenAddModal}
            className="py-2 px-3.5 sm:px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            aria-label="زیادکردنی خەرجی یان داهات"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">تۆمارکردن</span>
          </button>
        </div>
      </div>
    </header>
  );
};
