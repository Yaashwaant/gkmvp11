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
      <div className="eco-badge-bg rounded-2xl shadow-md p-4 border border-amber-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 badge-icon-bg rounded-full flex items-center justify-center">
            <Trophy className="text-white w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {t('badge.ecoWarrior')}
            </h4>
            <p className="text-sm text-gray-600">
              {t('badge.description', { co2: co2Saved.toFixed(1) })}
            </p>
            
            <div className="mt-2 bg-amber-200 rounded-full h-2">
              <div 
                className="badge-icon-bg h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
