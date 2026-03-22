import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react';

const Dashboardstatbox  = ({ data }) => {
  const {
    label,
    value,
    comparisonText,
    comparisonValue,
    iconBg,
    iconColor,
    icon: Icon,
  } = data;


    let trendcolor = 'text-gray-500';
  
    if ( String(comparisonValue).trim().startsWith('+') ) {
      trendcolor = 'text-red-500';
    } else if (String(comparisonValue).trim().startsWith('-')) {
      trendcolor = 'text-green-500';
    }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md w-full flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-500">{label}</p>
          <h2 className="text-2xl font-extrabold text-gray-800">{value}</h2>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>

      <div className="text-sm font-medium">
        <span className={` ${trendcolor}`}>{comparisonValue}</span>
        <span className="text-gray-500">{comparisonText}</span>
      </div>
    </div>
  );
};

export default Dashboardstatbox;
