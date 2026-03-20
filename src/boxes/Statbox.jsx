import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react';

const Statbox = ({ data }) => {
  const {
    label,
    value,
    comparisonText,
    comparisonValue,
    trend,
    iconBg,
    iconColor,
    icon: Icon
  } = data;

  let trendcolor = '';
  let TrendIcon = null;

  if (trend === 'up') {
    trendcolor = 'text-red-500';
    TrendIcon = TrendingUp;
  } else if (trend === 'down') {
    trendcolor = 'text-green-500';
    TrendIcon = TrendingDown;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md w-full flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {TrendIcon && (
        <div className={trendcolor}>
            <TrendIcon className="w-6 h-6" />
        </div>
        )}
        </div>
      <div className="space-y-1">
        <p className="text-sm font-bold uppercase text-gray-500">{label}</p>
        <h2 className="text-2xl font-extrabold text-gray-800">{value}</h2>
      </div>

      <div className="text-sm font-medium">
        <span className={`${trendcolor} mr-1}`}>{comparisonValue}</span>
        <span className="text-gray-500">{comparisonText}</span>
      </div>
    </div>
  );
};

export default Statbox;
