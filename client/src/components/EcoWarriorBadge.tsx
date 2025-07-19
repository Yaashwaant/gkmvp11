import { Trophy } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface EcoWarriorBadgeProps {
  co2Saved: number;
  progress?: number; // 0-100
}

export function EcoWarriorBadge({ co2Saved, progress = 60 }: EcoWarriorBadgeProps) {
  const { t } = useLanguage();

  return (
    <div className="px-4 mb-20">
      <div className="eco-badge-bg rounded-3xl shadow-2xl p-6 border border-amber-200/30">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 badge-icon-bg rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="text-white w-7 h-7" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2 text-lg">
              {t('badge.ecoWarrior')}
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              {t('badge.description', { co2: co2Saved.toFixed(1) })}
            </p>
            
            <div className="mt-3 bg-amber-200 rounded-full h-3 shadow-inner">
              <div 
                className="badge-icon-bg h-3 rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
