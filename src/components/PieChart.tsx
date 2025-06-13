import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PieChartProps {
  data: Record<string, number>;
  colors: string[];
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, colors, title }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  if (total === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold text-base mb-2">No data available</p>
            <p className="text-gray-400 text-sm">Add some policies to see the distribution</p>
          </div>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const slices = Object.entries(data).map(([key, value], index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle += angle;
    
    return {
      key,
      value,
      percentage,
      pathData,
      color: colors[index % colors.length]
    };
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-200">{title}</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative flex-shrink-0">
          <svg width="200" height="200" className="drop-shadow-xl group-hover:scale-105 transition-transform duration-300">
            {slices.map((slice, index) => (
              <g key={slice.key}>
                <path
                  d={slice.pathData}
                  fill={slice.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer hover:scale-105 transform-origin-center"
                  title={`${slice.key}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}
                  style={{ 
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                    transformOrigin: '100px 100px'
                  }}
                />
              </g>
            ))}
          </svg>
          
          {/* Enhanced Center Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{total}</div>
                <div className="text-xs text-gray-500 font-semibold">Total</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 w-full">
          {slices.map((slice) => (
            <div key={slice.key} className="group/item flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/80 transition-all duration-200 cursor-pointer hover:scale-102">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm group-hover/item:scale-125 transition-transform duration-200"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-600 capitalize flex-grow font-semibold truncate group-hover/item:text-gray-800 transition-colors duration-200">
                {slice.key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-bold text-gray-800 block group-hover/item:scale-110 transition-transform duration-200">
                  {slice.value}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {slice.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;