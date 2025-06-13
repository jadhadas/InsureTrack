import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      card: 'bg-blue-50 border-blue-100',
      icon: 'text-white'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      card: 'bg-green-50 border-green-100',
      icon: 'text-white'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      card: 'bg-yellow-50 border-yellow-100',
      icon: 'text-white'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      card: 'bg-purple-50 border-purple-100',
      icon: 'text-white'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.card} p-6 rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg border`}>
      <div className="flex items-center">
        <div className={`${colors.bg} p-3 rounded-xl shadow-md`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colors.text} mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 leading-tight">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;