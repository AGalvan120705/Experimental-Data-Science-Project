import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Statbox = ({ data }) => {
  const {
    label,
    value,
    comparisonText,
    comparisonValue,
    trend,
    iconBg,
    iconColor,
    icon: Icon,
    linkText,
    linkColor,
    linkHoverColor,
    linkHref,
    linkOnClick
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

  const showFooterLink = Boolean(linkText && (linkHref || linkOnClick));

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
        <span className={`${trendcolor}`}>{comparisonValue}</span>
        <span className="text-gray-500">{comparisonText}</span>
      </div>

      {showFooterLink && (
        <div className="pt-1">
          {linkOnClick ? (
            <button
              type="button"
              onClick={linkOnClick}
              className={`text-sm font-semibold transition-colors ${linkColor || 'text-blue-600'} ${linkHoverColor || 'hover:text-blue-700'}`}
            >
              {linkText}
            </button>
          ) : (
            <Link
              to={linkHref}
              className={`text-sm font-semibold transition-colors ${linkColor || 'text-blue-600'} ${linkHoverColor || 'hover:text-blue-700'}`}
            >
              {linkText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Statbox;
