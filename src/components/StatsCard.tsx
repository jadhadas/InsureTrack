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
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-600',
      card: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200/50',
      icon: 'text-white',
      shadow: 'shadow-blue-200/50',
      glow: 'group-hover:shadow-blue-300/30'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      text: 'text-emerald-600',
      card: 'bg-gradient-to-br from-emerald-50/80 to-green-100/80 border-emerald-200/50',
      icon: 'text-white',
      shadow: 'shadow-emerald-200/50',
      glow: 'group-hover:shadow-emerald-300/30'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
      text: 'text-amber-600',
      card: 'bg-gradient-to-br from-amber-50/80 to-yellow-100/80 border-amber-200/50',
      icon: 'text-white',
      shadow: 'shadow-amber-200/50',
      glow: 'group-hover:shadow-amber-300/30'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      text: 'text-purple-600',
      card: 'bg-gradient-to-br from-purple-50/80 to-violet-100/80 border-purple-200/50',
      icon: 'text-white',
      shadow: 'shadow-purple-200/50',
      glow: 'group-hover:shadow-purple-300/30'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`group ${colors.card} backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.glow} border cursor-pointer relative overflow-hidden w-full`}>
      {/* Background Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
        <div className={`absolute inset-0 ${colors.bg} rounded-xl sm:rounded-2xl lg:rounded-3xl`}></div>
      </div>
      
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4">
        <div className={`${colors.bg} p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg ${colors.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 truncate group-hover:text-gray-700 transition-colors duration-200">
            {title}
          </p>
          <p className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-bold ${colors.text} mb-1 group-hover:scale-105 transition-all duration-300 truncate`}>
            {typeof value === 'string' && value.length > 12 ? (
              <span className="text-sm sm:text-base lg:text-lg">{value}</span>
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 leading-tight truncate group-hover:text-gray-600 transition-colors duration-200">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* Subtle Animation Indicator */}
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default StatsCard;