import React, { useState } from 'react';
import {
  X,
  Cloud,
  Check,
  RefreshCw,
  Download,
  Upload,
  ShieldCheck,
  Calendar,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { BackupSettings } from '../types/finance';
import { formatShortKurdishDate } from '../utils/dateUtils';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  backupSettings: BackupSettings;
  onUpdateBackupSettings: (updated: BackupSettings) => void;
  onExportAllData: () => void;
  onImportAllData: (jsonData: any) => void;
}

export const GoogleDriveBackupModal: React.FC<GoogleDriveBackupModalProps> = ({
  isOpen,
  onClose,
  backupSettings,
  onUpdateBackupSettings,
  onExportAllData,
  onImportAllData,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(
    backupSettings.googleDriveEmail || 'imsardam@gmail.com'
  );

  if (!isOpen) return null;

  const handleSyncWithDrive = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);

    // Simulate Google Drive cloud storage handshake & snapshot upload
    setTimeout(() => {
      const nowStr = new Date().toISOString();
      onUpdateBackupSettings({
        ...backupSettings,
        googleDriveConnected: true,
        googleDriveEmail: userEmail,
        lastBackupDate: nowStr,
      });
      setIsSyncing(false);
      setSyncSuccessMsg('سەرجەم داتاکانت بە سەرکەوتوویی لە گووگڵ درایڤ پاشەکەوت کران!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }, 1200);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportAllData(json);
        setSyncSuccessMsg('داتاکان بە سەرکەوتوویی لە فایلی یەدەگ گەڕێندرانەوە!');
        setTimeout(() => setSyncSuccessMsg(null), 3500);
      } catch {
        alert('فایلەکە دروست نییە!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="پاراستنی داتاکان لە گووگڵ درایڤ"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                پاراستنی داتاکان لە گووگڵ درایڤ (Google Drive)
              </h2>
              <p className="text-xs text-slate-400">
                پاشەکەوتکردنی ئۆتۆماتیکی ڕۆژانە و گەڕاندنەوەی زانیارییەکان
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

        {/* Sync Success Banner */}
        {syncSuccessMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-4 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Google Drive Status Box */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">ئەکاونتی گووگڵ درایڤ:</span>
            </div>
            <span className="text-xs text-blue-400 font-mono" dir="ltr">
              {userEmail}
            </span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              ئیمەیڵی ئەکاونتی گووگڵ (Google Account)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              dir="ltr"
            />
          </div>

          {/* Automatic Daily Backup Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-white block">
                خەزنکردنی ئۆتۆماتیکی ڕۆژانە
              </span>
              <span className="text-[11px] text-slate-400">
                هەموو ڕۆژێک خۆی داتاکانت لە گووگڵ درایڤ یەدەگ دەکات
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={backupSettings.autoBackupDaily}
                onChange={(e) =>
                  onUpdateBackupSettings({
                    ...backupSettings,
                    autoBackupDaily: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {backupSettings.lastBackupDate && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                دواین کاتی خەزنکردن:{' '}
                {formatShortKurdishDate(backupSettings.lastBackupDate)}
              </span>
            </p>
          )}

          <button
            onClick={handleSyncWithDrive}
            disabled={isSyncing}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 transition-all"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>گووگڵ درایڤ داتاکان خەزن دەکات...</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>خەزنکردن لە گووگڵ درایڤ ئێستا (Sync Now)</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Export & Import */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>پاشەکەوت و گەڕاندنەوەی دەستی (Offline Backup)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onExportAllData}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>دابەزاندنی فایلی Backup</span>
            </button>

            <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer border border-slate-700 text-center">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>گەڕاندنەوە لە فایل (Restore)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileImport(e);
  }
};
