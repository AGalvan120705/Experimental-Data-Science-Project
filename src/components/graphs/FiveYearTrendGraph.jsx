import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Import the JSON data:
import trendData from "../../Data/tower_hamlets_trends.json";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
        <p className="text-gray-900 font-semibold">{data.period}</p>
        <p className="text-blue-600 font-medium">{data.value}%</p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props) => {
  const { cx, cy, payload, activeYear } = props;
  const isActive = activeYear === payload.year;
  const isAnyActive = activeYear !== null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isActive ? 6 : 4}
      fill="#1e3a5f"
      fillOpacity={!isAnyActive || isActive ? 1 : 0.3}
      stroke="white"
      strokeWidth={2}
      style={{ transition: "all 0.2s ease" }}
    />
  );
};

export default function FiveYearTrend() {
  const [activeYear, setActiveYear] = useState(null);

  const trends = Array.isArray(trendData?.trends) ? trendData.trends : [];
  const startValue = trends[0]?.value ?? 0;
  const endValue = trends[trends.length - 1]?.value ?? 0;
  const change = (endValue - startValue).toFixed(2);
  const changePercent =
    startValue === 0
      ? "0.0"
      : (((endValue - startValue) / startValue) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full h-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-gray-900 font-bold text-xl tracking-tight">
          5-Year Trend
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Overall borough pervalance rate over time
        </p>
      </div>

      <div style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trends}
            margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
            onMouseMove={(state) => {
              if (state?.activePayload?.[0]) {
                setActiveYear(state.activePayload[0].payload.year);
              }
            }}
            onMouseLeave={() => setActiveYear(null)}
          >
            <ReferenceLine y={7} stroke="#f3f4f6" />
            <ReferenceLine y={7.5} stroke="#f3f4f6" />
            <ReferenceLine y={6.5} stroke="#f3f4f6" />

            <XAxis
              dataKey="year"
              axisLine={{ stroke: "#f3f4f6" }}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              padding={{ left: 10, right: 10 }}
            />

            <YAxis
              domain={[6, 8]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              width={45}
            />

            <Tooltip content={<CustomTooltip />} cursor={false} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#1e3a5f"
              strokeWidth={2.5}
              dot={(props) => <CustomDot {...props} activeYear={activeYear} />}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs">Change over period</p>
          <p className="text-lg font-bold text-gray-500">
            +{change}{" "}
            <span className="text-sm font-normal text-gray-500">
              percentage points
            </span>
          </p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-right leading-tight">
          <p className="text-[11px] tracking-wide">Rate of change</p>
          <p className="text-base font-semibold">+ {changePercent}%</p>
        </div>
      </div>

      <p className="text-gray-300 text-xs mt-auto pt-4 text-center">
        PHE Fingertips 2019-2025 • Tower Hamlets
      </p>
    </div>
  );
}
