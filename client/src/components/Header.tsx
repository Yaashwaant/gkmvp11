import { Leaf, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="flex items-center justify-between p-4 bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-primary rounded-full flex items-center justify-center">
          <Leaf className="text-white text-sm w-4 h-4" />
        </div>
        <span className="text-lg font-semibold text-gray-900">
          {t('header.appName')}
        </span>
      </div>
      
      <div className="relative">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
          className="appearance-none bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-primary focus:border-transparent"
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
      </div>
    </header>
  );
}
