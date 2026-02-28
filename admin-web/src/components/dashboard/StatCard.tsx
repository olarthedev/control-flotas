import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string;
  icon: IconType;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'yellow' | 'gray';
  trend?: string;
  trendColor?: 'green' | 'red';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  badge,
  badgeColor = 'gray',
  trend,
  trendColor = 'green'
}: StatCardProps) {
  const badgeBgColor = {
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    gray: 'bg-gray-100 text-gray-600'
  };

  const trendTextColor = {
    green: 'text-emerald-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
            {title}
          </p>
          <p className="text-xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {trend && (
          <span className={`text-xs font-semibold ${trendTextColor[trendColor]}`}>
            {trend}
          </span>
        )}
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBgColor[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
