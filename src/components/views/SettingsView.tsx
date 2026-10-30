import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Cloud,
  DollarSign,
  RefreshCw,
  HardDrive,
  Check,
  Sun,
  Moon,
  Bell,
  Clock,
} from 'lucide-react';
import { SecuritySettings, BackupSettings, ReminderSettings } from '../../types/finance';

interface SettingsViewProps {
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (updated: SecuritySettings) => void;
  backupSettings: BackupSettings;
  onUpdateBackupSettings: (updated: BackupSettings) => void;
  reminderSettings: ReminderSettings;
  onUpdateReminderSettings: (updated: ReminderSettings) => void;
  usdRate: number;
  onUpdateUsdRate: (rate: number) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onTriggerReminderTest: () => void;
  onOpenGoogleDriveModal: () => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  securitySettings,
  onUpdateSecuritySettings,
  backupSettings,
  onUpdateBackupSettings,
  reminderSettings,
  onUpdateReminderSettings,
  usdRate,
  onUpdateUsdRate,
  theme,
  onToggleTheme,
  onTriggerReminderTest,
  onOpenGoogleDriveModal,
  onResetDemoData,
}) => {
  const [pinInput, setPinInput] = useState(securitySettings.pinCode);
  const [rateInput, setRateInput] = useState(usdRate.toString());
  const [reminderTimeInput, setReminderTimeInput] = useState(reminderSettings.reminderTime);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      alert('کۆدی نهێنی دەبێت ڕێک ٤ ژمارە بێت!');
      return;
    }
    onUpdateSecuritySettings({
      ...securitySettings,
      pinCode: pinInput,
    });
    setSavedFeedback('کۆدی نهێنی بە سەرکەوتوویی نوێکرایەوە!');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(rateInput);
    if (!rateNum || rateNum <= 0) return;
    onUpdateUsdRate(rateNum);
    setSavedFeedback('نرخی دۆلار بە سەرکەوتوویی گۆڕدرا!');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-0.5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>ڕێکخستنەکانی سیستەم و ئاسایش</span>
        </h2>
        <p className="text-xs text-slate-400">
          ڕێکخستنی سیستەمی بایۆمەتری، کۆدی نهێنی، نرخی دۆلار و خەزنکردن لە گوگل درایڤ
        </p>
      </div>

      {savedFeedback && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Security & Biometrics Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>سیستەمی پاراستنی بایۆمەتری و قوفڵ (Bank Security)</span>
        </h3>

        {/* Biometric Toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-bold text-white block">
              چالاککردنی پەنجەمۆر / بایۆمەتری (Biometric Lock)
            </span>
            <span className="text-[11px] text-slate-400">
              کردنەوەی سیستەم بە پەنجەمۆر لەسەر مۆبایل و کۆمپیوتەر
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securitySettings.isBiometricEnabled}
              onChange={(e) =>
                onUpdateSecuritySettings({
                  ...securitySettings,
                  isBiometricEnabled: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Change PIN Code Form */}
        <form onSubmit={handleSavePin} className="pt-2 border-t border-slate-800/80">
          <label className="text-xs font-bold text-slate-300 block mb-1">
            کۆدی نهێنی بانک (٤ ژمارە)
          </label>
          <div className="flex gap-2 max-w-xs">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono text-center tracking-widest focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              نوێکردنەوە
            </button>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            کۆدی ئێستا: {securitySettings.pinCode}
          </span>
        </form>
      </div>

      {/* Appearance / Theme Mode Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>دۆخی ڕووکار (Theme Mode)</span>
        </h3>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-bold text-white block">
              گۆڕینی دۆخی ڕووکار: {theme === 'dark' ? 'دۆخی تاریک (Dark)' : 'دۆخی ڕووناك (Light)'}
            </span>
            <span className="text-[11px] text-slate-400">
              دۆخی ڕووناك ڕەنگێکی سپی و کراوە پێشکەش دەکات بۆ ئاسوودەیی چاو
            </span>
          </div>

          <button
            onClick={onToggleTheme}
            className={`py-2 px-4 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border ${
              theme === 'light'
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span>گۆڕین بۆ دۆخی ڕووناك</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-500" />
                <span>گۆڕین بۆ دۆخی تاریک</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Daily Expense Reminder Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>ئاگادارکردنەوەی ڕۆژانە (Daily Reminder)</span>
          </h3>

          <button
            onClick={onTriggerReminderTest}
            className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer"
          >
            تاقیکردنەوەی ئاگاداری ئێستا
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-bold text-white block">
              چالاککردنی ئاگادارکردنەوەی ڕۆژانە
            </span>
            <span className="text-[11px] text-slate-400">
              لە کاتێکی دیاریکراودا ئاگادارت دەکاتەوە تا خەرجییەکانی ئەو ڕۆژەت لەبیر نەچێت
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reminderSettings.isEnabled}
              onChange={(e) =>
                onUpdateReminderSettings({
                  ...reminderSettings,
                  isEnabled: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {reminderSettings.isEnabled && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                کاتی ئاگادارکردنەوە لە شەودا (کاتی ٢٤ کاتژمێری)
              </label>
              <input
                type="time"
                value={reminderTimeInput}
                onChange={(e) => {
                  setReminderTimeInput(e.target.value);
                  onUpdateReminderSettings({
                    ...reminderSettings,
                    reminderTime: e.target.value,
                  });
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <p className="text-[11px] text-slate-400 max-w-xs">
              پێشنیارکراو: ٢١:٠٠ (٩:٠٠ی شەو) کاتێکی گونجاوە بۆ تۆمارکردنی خەرجی و داهاتەکانی تەواوی ڕۆژەکە.
            </p>
          </div>
        )}
      </div>

      {/* Google Drive Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>خەزنکردن و پاراستن لە گووگڵ درایڤ</span>
          </h3>

          <button
            onClick={onOpenGoogleDriveModal}
            className="py-1.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30 cursor-pointer"
          >
            بەڕێوەبردنی درایڤ ←
          </button>
        </div>

        <p className="text-xs text-slate-400">
          بە یەک جار ئەکاونتەکەت ببەستەوە، سیستەمەکە هەموو ڕۆژێک بە شێوەی ئۆتۆماتیکی سەرجەم داتاکانت لە گووگڵ درایڤ پارێزراو دەکات.
        </p>

        <div className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <span>دۆخی بەستنەوە:</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>ئامادەیە بۆ Sync ({backupSettings.googleDriveEmail})</span>
          </span>
        </div>
      </div>

      {/* Exchange Rate Setting */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>نرخی ئاڵوگۆڕی دۆلار (USD to IQD)</span>
        </h3>

        <form onSubmit={handleSaveRate} className="flex gap-2 max-w-xs">
          <input
            type="number"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            dir="ltr"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer border border-slate-700"
          >
            پاشەکەوت
          </button>
        </form>
        <span className="text-[11px] text-slate-400">
          ١٠٠ دۆلار = {(parseFloat(rateInput) * 100 || 0).toLocaleString()} دیناری عێراقی
        </span>
      </div>

      {/* Reset to Zero / Clear All Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-white mb-0.5">
            سڕینەوەی سەرجەم داتاکان و دەستپێکردنەوە لە سفڕ (Clear All Data)
          </h4>
          <p className="text-[11px] text-slate-400">
            سڕینەوەی هەموو خەرجی، داهات، قەرز، ئامانج و سفڕکردنەوەی هەژمارەکان
          </p>
        </div>

        <button
          onClick={() => {
            if (
              window.confirm(
                'ئایا دڵنیایت لە سڕینەوە و سفڕکردنەوەی تەواوی داتاکان؟ ئەم کردارە هەموو مامەڵەکان دەسڕێتەوە و دەتوانیت لە سفڕەوە دەستپێبکەیت.'
              )
            ) {
              onResetDemoData();
            }
          }}
          className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold cursor-pointer transition-colors"
        >
          سڕینەوەی هەموو داتاکان (سفڕکردنەوە)
        </button>
      </div>
    </div>
  );
};
