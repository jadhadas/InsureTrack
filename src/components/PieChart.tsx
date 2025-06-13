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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const radius = 100;
  const centerX = 120;
  const centerY = 120;

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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <svg width="240" height="240" className="flex-shrink-0">
          {slices.map((slice, index) => (
            <g key={slice.key}>
              <path
                d={slice.pathData}
                fill={slice.color}
                className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                title={`${slice.key}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}
              />
            </g>
          ))}
        </svg>
        <div className="flex flex-col gap-2 w-full">
          {slices.map((slice) => (
            <div key={slice.key} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-600 capitalize flex-grow">
                {slice.key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-sm font-medium text-gray-800">
                {slice.value} ({slice.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;