import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import { Activity, Users, Calendar, CreditCard, MoreHorizontal } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, stats } = useApp();

  const items: { id: NavigationTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Accueil', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users, badge: stats.totalPatients },
    { id: 'planning', label: 'Agenda', icon: Calendar, badge: stats.seancesAujourdhui },
    { id: 'finances', label: 'Paiements', icon: CreditCard, badge: stats.creancesTotal > 0 ? 1 : undefined },
    { id: 'plus', label: 'Plus', icon: MoreHorizontal },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 safe-area-pb shadow-lg">
      <div className="grid grid-cols-5 h-15">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                isActive ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active pill indicator */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-teal-600 rounded-b-full animate-in fade-in" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.id === 'planning' && stats.seancesAujourdhui > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-teal-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {stats.seancesAujourdhui}
                  </span>
                )}
                {item.id === 'finances' && stats.creancesTotal > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </div>

              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
