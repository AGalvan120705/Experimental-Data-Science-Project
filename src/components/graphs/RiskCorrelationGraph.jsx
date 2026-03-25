import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";

import wardDataJson from "../../Data/tower_hamlets_health_ward_data.json";

// Ward data: obesity (x) vs diabetes (y)
const wardData = Object.entries(wardDataJson.wards || {})
  .filter(([_, values]) => values.diabetes !== null && values.obesity !== null)
  .map(([ward, values]) => ({
    ward,
    obesity: values.obesity,
    diabetes: values.diabetes,
  }));

// Calculate Pearson correlation coefficient
const calculateCorrelation = (data) => {
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.obesity, 0);
  const sumY = data.reduce((sum, d) => sum + d.diabetes, 0);
  const sumXY = data.reduce((sum, d) => sum + d.obesity * d.diabetes, 0);
  const sumX2 = data.reduce((sum, d) => sum + d.obesity * d.obesity, 0);
  const sumY2 = data.reduce((sum, d) => sum + d.diabetes * d.diabetes, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );

  return (numerator / denominator).toFixed(2);
};

// Calculate linear regression (least squares)
const calculateTrendLine = (data) => {
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.obesity, 0);
  const sumY = data.reduce((sum, d) => sum + d.diabetes, 0);
  const sumXY = data.reduce((sum, d) => sum + d.obesity * d.diabetes, 0);
  const sumX2 = data.reduce((sum, d) => sum + d.obesity * d.obesity, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

const correlation = calculateCorrelation(wardData);
const { slope, intercept } = calculateTrendLine(wardData);

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 min-w-45">
        <p className="text-gray-900 font-semibold text-[15px] mb-2">
          {data.ward}
        </p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-gray-500">Obesity: </span>{" "}
            <span className="text-amber-600 font-medium">{data.obesity}%</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Diabetes: </span>{" "}
            <span className="text-blue-600 font-medium">{data.diabetes}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom refrence line for trend

const TrendLine = ({ xScale, yScale }) => {
  const x1 = xScale(6);
  const y1 = yScale(slope * 6 + intercept);
  const x2 = xScale(16);
  const y2 = yScale(slope * 16 + intercept);

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#94a3b8"
      strokeWidth={2}
      strokeDasharray="6 4"
    />
  );
};

export default function RiskCorrelationGraph() {
  const [activeWard, setActiveWard] = useState(null);

  // Custom dot renderer with hover effect
  const renderDot = (props) => {
    const { cx, cy, payload } = props;

    const isActive = activeWard === payload.ward;
    const isAnyActive = activeWard !== null;
    const opacity = !isAnyActive || isActive ? 1 : 0.25;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 9 : 7}
        fill="#3b82f6"
        fillOpacity={opacity}
        stroke={isActive ? "#1e40af" : "#3b82f6"}
        strokeWidth={isActive ? 2.5 : 2}
        style={{
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onMouseEnter={() => setActiveWard(payload.ward)}
        onMouseLeave={() => setActiveWard(null)}
      />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full h-full flex flex-col">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-gray-900 font-bold text-xl tracking-tight">
            Risk Factor Correlation
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Relationship Between Obesity and Diabetes Prevalence Across Wards
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 whitespace-nowrap">
          <span className="text-gray-500 text-sm">
            Correlation Coefficient:
          </span>
          <span className="text-gray-900 font-bold">r = {correlation}</span>
        </div>
      </div>

      {/* chart */}
      <div style={{ height: "420px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 20 }}>
            {/* grid lines */}
            <ReferenceLine y={4} stroke="#f3f4f6" ifOverflow="extendDomain" />
            <ReferenceLine y={6} stroke="#f3f4f6" ifOverflow="extendDomain" />
            <ReferenceLine y={8} stroke="#f3f4f6" ifOverflow="extendDomain" />
            <ReferenceLine y={10} stroke="#f3f4f6" ifOverflow="extendDomain" />
            <ReferenceLine y={12} stroke="#f3f4f6" ifOverflow="extendDomain" />

            <ReferenceLine
              segment={[
                { x: 6, y: slope * 6 + intercept },
                { x: 16, y: slope * 16 + intercept },
              ]}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
            />

            <XAxis
              type="number"
              dataKey="obesity"
              name="obesity"
              domain={[6, 16]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#f3f4f6" }}
              tickLine={{ stroke: "#f3f4f6" }}
            >
              <label
                value="Obesity Rate (%)"
                position="bottom"
                offset={25}
                style={{ fill: "#6b7280", fontSize: 13, fontWeight: 500 }}
              />
            </XAxis>

            <YAxis
              type="number"
              dataKey="diabetes"
              name="diabetes"
              domain={[0, 14]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#f3f4f6" }}
              tickLine={{ stroke: "#f3f4f6" }}
            >
              <label
                value="Diabetes Prevalence (%)"
                angle={-90}
                position="insideLeft"
                offset={0}
                style={{
                  fill: "#6b7280",
                  fontSize: 13,
                  fontWeight: 500,
                  textAnchor: "middle",
                }}
              />
            </YAxis>

            <ZAxis range={[100, 100]} />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3", stroke: "#d1d5db" }}
            />

            {/* Scatter points */}
            <Scatter
              name="Wards"
              data={wardData}
              fill="#3b82f6"
              shape={renderDot}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-gray-500 text-sm">Wards data point</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0 border-t-2 border-gray-400 border-dashed"></div>
          <span className="text-gray-500 text-sm">Line of best fit</span>
        </div>
      </div>

      {/* footer */}
      <p className="text-gray-300 text-xs mt-auto pt-4 text-center">
        NHS QQF 2024-25 * Tower Hamlets
      </p>
    </div>
  );
}
