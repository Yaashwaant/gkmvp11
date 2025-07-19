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
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 text-center border border-white/20">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 shadow-lg"></div>
          <p className="text-sm text-gray-500 mb-2">{t('wallet.thisMonth')}</p>
          <p className="text-2xl font-bold text-gray-900">₹{monthlyReward}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 text-center border border-white/20">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mx-auto mb-4 shadow-lg"></div>
          <p className="text-sm text-gray-500 mb-2">{t('wallet.distance')}</p>
          <p className="text-2xl font-bold text-gray-900">{totalDistance} km</p>
        </div>
      </div>
    </div>
  );
}
