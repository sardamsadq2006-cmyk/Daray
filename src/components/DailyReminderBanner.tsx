import React from 'react';
import { Bell, Clock, X, Plus, Check } from 'lucide-react';

interface DailyReminderBannerProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
  reminderTime: string;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({
  isVisible,
  onClose,
  onOpenAddModal,
  reminderTime,
}) => {
  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className="max-w-7xl mx-auto px-4 sm:px-8 mt-3 animate-slideDown no-print"
    >
      <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-amber-500/30 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>ئاگادارکردنەوەی ڕۆژانەی تۆمارکردنی خەرجییەکان</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {reminderTime}
                </span>
              </h4>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ئەمڕۆ چی خەرجکراوە؟ چەند داهاتت هەبووە؟ بۆ ڕێکی دۆخی دارایت ئێستا بینوسە.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenAddModal();
            }}
            className="py-1.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تۆمارکردنی ئێستا</span>
          </button>

          <button
            onClick={onClose}
            aria-label="داخستنی ئاگادارکردنەوە"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
