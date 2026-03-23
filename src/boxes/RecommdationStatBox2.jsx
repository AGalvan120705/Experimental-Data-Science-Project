import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react';

const RecommendationsStatBox2 = ({ data }) => {
  const {
    label,
    Text,
    Icon: Icon,
    backgroundColorBorder,
    ImpactBorderColor,
    EffortBorderColor,
    ImpactBox,
    EffortBox
  } = data;

  return (
    <div className={`bg-white p-6 rounded-2xl border ${backgroundColorBorder} shadow-md w-full flex flex-col gap-4`}>
        <div className="flex items-start gap-3">
            <div className="shrink-0">
                <Icon className="w-10 h-10 text-gray-800 mt-0.5" />
            </div>
        </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-black">{label}</h3>
        <p className="text-md text-gray-800">{Text}</p>
      </div>

        <div className="flex gap-4">
            <div className={`p-3 rounded-lg border ${ImpactBorderColor}`}>
                <p className="text-sm font-bold text-gray-500">{ImpactBox}</p>
            </div>
            <div className={`p-3 rounded-lg border ${EffortBorderColor}`}>
                <p className="text-sm font-bold text-gray-500">{EffortBox}</p>
            </div>
        </div>
    </div>
  );
};

export default RecommendationsStatBox2;
