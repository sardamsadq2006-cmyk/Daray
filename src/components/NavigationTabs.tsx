import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Clock,
  Users,
  Compass,
  Target,
  CreditCard,
  QrCode,
  PieChart,
  Settings,
  FileText,
  Bot,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'transactions'
  | 'chat'
  | 'recurring'
  | 'debts'
  | 'budget'
  | 'goals'
  | 'accounts'
  | 'qr'
  | 'analytics'
  | 'settings';

interface NavigationTabsProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  debtsCount?: number;
  recurringCount?: number;
}

interface TabItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  debtsCount = 0,
  recurringCount = 0,
}) => {
  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'دەستپێک', icon: LayoutDashboard },
    { id: 'transactions', label: 'خەرجی و داهات', icon: Receipt },
    { id: 'chat', label: 'چاتی AI', icon: Bot },
    {
      id: 'recurring',
      label: 'خەرجی مانگانە (٣٠ ڕۆژ)',
      icon: Clock,
      badge: recurringCount > 0 ? recurringCount : undefined,
    },
    {
      id: 'debts',
      label: 'بەشی قەرزەکان',
      icon: Users,
      badge: debtsCount > 0 ? debtsCount : undefined,
    },
    { id: 'budget', label: 'پلانی بودجە', icon: Compass },
    { id: 'goals', label: 'ئامانجەکان', icon: Target },
    { id: 'accounts', label: 'هەژمارە بانکییەکان', icon: CreditCard },
    { id: 'qr', label: 'سیستەمی QR', icon: QrCode },
    { id: 'analytics', label: 'هێڵکاری ١٠٠٪', icon: PieChart },
    { id: 'settings', label: 'ڕێکخستن', icon: Settings },
  ];

  return (
    <nav
      aria-label="بەشەکانی سیستەم"
      className="bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-2 overflow-x-auto no-scrollbar no-print"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavigationTab)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative shrink-0 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
