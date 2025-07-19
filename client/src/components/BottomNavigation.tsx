import { Wallet, Camera, History } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/hooks/useLanguage';

export function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { 
      path: '/wallet', 
      icon: Wallet, 
      label: t('navigation.wallet'),
      isActive: location === '/wallet' || location === '/'
    },
    { 
      path: '/upload', 
      icon: Camera, 
      label: t('navigation.upload'),
      isActive: location === '/upload',
      isCenter: true
    },
    { 
      path: '/history', 
      icon: History, 
      label: t('navigation.history'),
      isActive: location === '/history'
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg transform -translate-y-2 border-4 border-white"
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                item.isActive 
                  ? 'text-green-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
