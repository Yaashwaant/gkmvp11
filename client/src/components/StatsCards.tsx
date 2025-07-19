import { useLanguage } from '@/hooks/useLanguage';

interface StatsCardsProps {
  monthlyReward: number;
  totalDistance: number;
}

export function StatsCards({ monthlyReward, totalDistance }: StatsCardsProps) {
  const { t } = useLanguage();

  return (
    <div className="px-4 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 mb-1">{t('wallet.thisMonth')}</p>
          <p className="text-xl font-bold text-gray-900">₹{monthlyReward}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <div className="w-12 h-12 bg-violet-500 rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 mb-1">{t('wallet.distance')}</p>
          <p className="text-xl font-bold text-gray-900">{totalDistance} km</p>
        </div>
      </div>
    </div>
  );
}
