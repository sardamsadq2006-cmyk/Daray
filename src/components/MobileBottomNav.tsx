import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Bot,
  Users,
  Menu,
  Plus,
  Clock,
  Compass,
  Target,
  CreditCard,
  QrCode,
  PieChart,
  Settings,
  X,
  FileText,
  Cloud,
  Lock,
} from 'lucide-react';
import { NavigationTab } from './NavigationTabs';

interface MobileBottomNavProps {
  activeTab: NavigationTab | 'chat';
  onTabChange: (tab: any) => void;
  onOpenAddModal: () => void;
  onOpenReports: () => void;
  onOpenGoogleDrive: () => void;
  onLockApp: () => void;
  recurringCount?: number;
  debtsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenReports,
  onOpenGoogleDrive,
  onLockApp,
  recurringCount = 0,
  debtsCount = 0,
}) => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  const mainItems = [
    { id: 'dashboard', label: 'دەستپێک', icon: LayoutDashboard },
    { id: 'transactions', label: 'خەرجییەکان', icon: Receipt },
    { id: 'chat', label: 'چاتی AI', icon: Bot, isSpecial: true },
    { id: 'debts', label: 'قەرزەکان', icon: Users, badge: debtsCount },
  ];

  const moreItems = [
    {
      id: 'recurring',
      label: 'خەرجی مانگانە (٣٠ ڕۆژ)',
      icon: Clock,
      badge: recurringCount,
    },
    { id: 'budget', label: 'پلانی بودجە', icon: Compass },
    { id: 'goals', label: 'ئامانجەکان', icon: Target },
    { id: 'accounts', label: 'هەژمارە بانکییەکان', icon: CreditCard },
    { id: 'qr', label: 'سیستەمی QR', icon: QrCode },
    { id: 'analytics', label: 'هێڵکاری ١٠٠٪', icon: PieChart },
    { id: 'settings', label: 'ڕێکخستنەکان', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Dock (Fixed at bottom on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 no-print">
        <div className="flex items-center justify-around relative">
          {mainItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setShowMoreDrawer(false);
                }}
                className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* Center Floating Elevated Add Button */}
          <div className="relative -top-4 px-1">
            <button
              onClick={onOpenAddModal}
              aria-label="زیادکردنی خەرجی خێرا"
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 cursor-pointer active:scale-90 transition-transform"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {mainItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setShowMoreDrawer(false);
                }}
                className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  {item.isSpecial && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreDrawer(!showMoreDrawer)}
            className={`flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer ${
              showMoreDrawer ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">بەشەکان</span>
          </button>
        </div>
      </div>

      {/* More Drawer Action Sheet for mobile */}
      {showMoreDrawer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="سەرجەم بەشەکانی سیستەم"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowMoreDrawer(false)}
          />
          <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto animate-slideUp">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">سەرجەم بەشەکانی سیستەم</h3>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onOpenReports();
                }}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center gap-1.5 text-xs text-white"
              >
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>ڕاپۆرتەکان</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onOpenGoogleDrive();
                }}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center gap-1.5 text-xs text-white"
              >
                <Cloud className="w-5 h-5 text-blue-400" />
                <span>گووگڵ درایڤ</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  onLockApp();
                }}
                className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col items-center gap-1.5 text-xs text-white"
              >
                <Lock className="w-5 h-5 text-amber-400" />
                <span>قوفڵکردن</span>
              </button>
            </div>

            {/* More navigation list */}
            <div className="space-y-1.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setShowMoreDrawer(false);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-between border border-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="text-slate-500">←</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
