import { useLanguage } from '@/hooks/useLanguage';

interface Activity {
  id: number;
  type: string;
  vehicleId: string;
  status: 'active' | 'pending' | 'completed';
  timestamp: Date;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-accent';
      case 'pending':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    return t(`activity.${status}`);
  };

  return (
    <div className="px-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('activity.recentActivity')}
      </h3>
      
      {activities.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 text-center text-gray-500 border border-white/20">
          No recent activity
        </div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-5 mb-3 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 ${getStatusColor(activity.status)} rounded-full shadow-sm`}></div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {t('activity.rewardEarned')}
                  </span>
                  <span className="text-sm font-medium text-green-primary bg-green-50 px-3 py-1 rounded-full">
                    {getStatusText(activity.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.vehicleId}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
