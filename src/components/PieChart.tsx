import React from 'react';

interface PieChartProps {
  data: Record<string, number>;
  colors: string[];
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, colors, title }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  if (total === 0) {
    return (
      <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">{title}</h3>
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm sm:text-base">No data available</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Add some policies to see the distribution</p>
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
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">{title}</h3>
      <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-8">
        <div className="relative flex-shrink-0">
          <svg width="200" height="200" className="drop-shadow-lg">
            {slices.map((slice, index) => (
              <g key={slice.key}>
                <path
                  d={slice.pathData}
                  fill={slice.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer hover:scale-105 transform-origin-center"
                  title={`${slice.key}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              </g>
            ))}
          </svg>
          {/* Center circle for donut effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:gap-3 w-full">
          {slices.map((slice) => (
            <div key={slice.key} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div 
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-xs sm:text-sm text-gray-600 capitalize flex-grow font-medium truncate">
                {slice.key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="text-right flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold text-gray-800 block">
                  {slice.value}
                </span>
                <span className="text-xs text-gray-500">
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