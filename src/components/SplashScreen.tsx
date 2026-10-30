import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, TrendingUp, Wallet, ArrowLeft } from 'lucide-react';
import { formatKurdishDate } from '../utils/dateUtils';

interface SplashScreenProps {
  onComplete: () => void;
  userName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  userName = 'سەردەم',
}) => {
  const [stage, setStage] = useState<number>(0);
  const kurdishToday = formatKurdishDate();

  useEffect(() => {
    // Check if ?autostart=1 is present (Ultra mode testable rule)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 1600);
    const t3 = setTimeout(() => {
      // Auto transition after 3.2 seconds or user can click
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      role="region"
      aria-label="شاشەی بەخێرهاتن"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 sm:p-12 text-slate-100 select-none overflow-hidden"
    >
      {/* Background ambient light */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Kurdish Date badge */}
      <div
        className={`transition-all duration-700 transform ${
          stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/60 text-emerald-400 text-sm font-medium shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{kurdishToday}</span>
        </div>
      </div>

      {/* Center Hero Logo & Welcome */}
      <div className="flex flex-col items-center text-center max-w-md mx-auto my-auto space-y-6">
        <div
          className={`relative transition-all duration-700 transform ${
            stage >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10" />
              <Wallet className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 relative z-10" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-emerald-500/40 p-1.5 rounded-xl shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div
          className={`transition-all duration-700 delay-150 transform ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            بەخێربێیت، <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{userName}</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-medium">
            سیستەمی زیرەکی دارایی کەسی
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
            کۆنتڕۆڵی تەواوی خەرجییەکان، قەرز، ئامانج و پاراستنی سەرمایەکەت
          </p>
        </div>

        {/* Feature badges */}
        <div
          className={`grid grid-cols-3 gap-3 w-full transition-all duration-700 delay-300 transform ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[11px] text-slate-300">هێڵکاری ١٠٠٪</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <Sparkles className="w-5 h-5 text-teal-400 mb-1" />
            <span className="text-[11px] text-slate-300">خوێندنەوەی پسولە بە AI</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-[11px] text-slate-300">پاراستنی بانکی</span>
          </div>
        </div>
      </div>

      {/* Bottom Action & Skip Button */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        <button
          onClick={onComplete}
          aria-label="چوونە ژوورەوە بۆ ناو سیستەم"
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>چوونە ژوورەوە</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onComplete}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 px-3"
        >
          تێپەڕاندن (داخڵبوون)
        </button>
      </div>
    </div>
  );
};
