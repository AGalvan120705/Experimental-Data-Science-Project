import {useState} from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle } from 'recharts'

import wardDataJson from '../../Data/tower_hamlets_health_ward_data.json';

const wardData = Object.entries(wardDataJson.wards || {}).filter(([, values]) => values.diabetes !== null)
  .map(([ward, values]) => ({
    ward,
    prevalence: values.diabetes,
    diagnosed: values.diagnosed_count || 0
  }))
  .sort((a, b) => b.prevalence - a.prevalence);

const displayData = wardData.slice(0, 9);

const renderWardTick = ({ x, y, payload }) => {
  const words = String(payload.value || '').split(' ');
  const lines = [];
  let currentLine = '';
  const maxCharsPerLine = 14;

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);

  return (
    <text x={x} y={y} textAnchor="end" fill="#374151" fontSize={13} fontWeight={500}>
      {lines.map((line, index) => (
        <tspan key={`${payload.value}-${index}`} x={x} dy={index === 0 ? 4 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

const customTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white round-xl shadow-lg border border-gray-100 px-4 py-3 min-w-37.5">
        <p className="text-gray-900 font-semibold text-[15px] mb-1" >
          {data.ward}
        </p>
        <p className ="text-blue-500 font-medium text-sm">
          prevalence: {data.prevalence.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function PrevalenceByWardChart() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // handles mouse enter on bar
  const handleMouseEnter = (data, index) => {
    setActiveIndex(index);
  };
  // handles mouse leave on bar
  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return(
    <div className="w-full h-full">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full">
        {/* header */}
        <div className = "flex items-start justify-between mb-5">
          <div>
            <h3 className="text-gray-900 font-bold text-xl tracking-tight">Prevalence by Ward
            </h3>
            <p className="text-gray-400 text-sm mt-1">Percentage of registered patients diagnosed with Diabetes</p>
          </div>
          <div className="relative">
            <button className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all"
            onMouseEnter={()=> setShowInfo(true)}
            onMouseLeave={()=> setShowInfo(false)}
            onClick={()=> setShowInfo(!showInfo)}
            >
              <span className="text-xs font-bold">i</span>
            </button>

            {showInfo && (
              <div className="absolute right-0 top-9 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-10">
                <div className="absolute -top-2 right-3 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                <p className="text-gray-900 font-semibold text-sm mb-2">About this Data</p>
                <p className="text-gray-500 text-xs leading-relaxed">Prevalence based on GP practice location, not patient location. Patients may register at GPs outside of their home ward.</p>
                <p className="text-gray-400 text-xs mt-3 pt-2 border-t border-gray-100">Source: NHS QOF 2024-25</p>
              </div>
            )}
          </div>
        </div>
        
        {/* chart */}
        <div className="w-full" style={{height: '340px'}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: -10, bottom: 0 }}
            >
              <XAxis
              type = "number"
              domain={[0, 14]}
              hide />
              <YAxis 
              type = "category"
              dataKey="ward"
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={renderWardTick}
              width={128}
              />
              <Tooltip 
              content={customTooltip}
              cursor={{fill: 'transparent'}}
              offset={15}
              allowEscapeViewBox={{x:true, y:true}}
               />
              <Bar 
              dataKey="prevalence" 
              fill="#3b82f6" 
              barSize={20}
              barCategoryGap="30%"
              radius={[0,6,6,0]}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              activeBar={<Rectangle fill="#3b82f6" radius={[0,6,6,0]} />}

              shape={(props) => {
                const {x, y, width, height, fill, index} = props;
                const isActive = activeIndex === null || index === activeIndex;

                return (
                  <Rectangle
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fill}
                    radius={[0,6,6,0]}
                    opacity={isActive ? 1 : 0.3}
                    style={{ 
                      transition: 'fill-opacity 0.15 ease' ,
                    }}
                  />
                );
              }}

            />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* footer */}
        <p className="text-gray-300 text-xs mt-3 text-center">NHS QOF 2024-25 * Tower Hamlets
        </p>
      </div>
    </div>
  );
}
