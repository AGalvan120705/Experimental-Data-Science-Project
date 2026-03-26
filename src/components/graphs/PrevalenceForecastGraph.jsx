import { useState, useMemo } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
    Area,
} from 'recharts';

// Import trend data from the project dataset.
import trendData from '../../Data/tower_hamlets_trends.json';

export const CURRENT_YEAR = 2024;
export const FORECAST_END_YEAR = 2030;
export const INTERVENTION_REDUCTION = 0.4; // 40% reduction in growth rate with aggressive, multi-faceted public health interventions

function TrendData(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.trends)) return data.trends;
    return [];
}

export function linearRegression(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach(d => {
        sumX += d.year;
        sumY += d.value;
        sumXY += d.year * d.value;
        sumXX += d.year * d.year;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

export function generateChartData(actualData) {
    const ActualData = TrendData(actualData);

    if (ActualData.length < 2) {
        return { chartData: [], slope: 0, intercept: 0 };
    }

    // Use only the last 3 data points to capture the recent accelerated growth
    const recentData = ActualData.slice(-3);
    const { slope: recentSlope } = linearRegression(recentData);

    const chartData = [];
    const startYear = ActualData[0].year;
    const lastActualYear = ActualData[ActualData.length - 1].year;
    const lastActualValue = ActualData[ActualData.length - 1].value;

    // Recalculate an intercept that forces the baseline to start exactly from the last actual point
    const projectedIntercept = lastActualValue - (recentSlope * lastActualYear);

    // Add actual data points
    ActualData.forEach(d => {
        chartData.push({
            year: d.year,
            actual: d.value,
            baseline: null,
            adjusted: null,
        });
    });

    // Add forecast years
    for (let year = lastActualYear + 1; year <= FORECAST_END_YEAR; year++) {
        const baselineValue = recentSlope * year + projectedIntercept;
        const yearsFromNow = year - lastActualYear;
        const adjustedValue = lastActualValue + (recentSlope * yearsFromNow * (1 - INTERVENTION_REDUCTION));

        chartData.push({
            year,
            actual: null,
            baseline: Math.round(baselineValue * 100) / 100,
            adjusted: Math.round(adjustedValue * 100) / 100,
        });
    }

    // Add connection point (last actual year also has forecast start)
    const lastActualIndex = chartData.findIndex(d => d.year === lastActualYear);
    if (lastActualIndex !== -1) {
        chartData[lastActualIndex].baseline = lastActualValue;
        chartData[lastActualIndex].adjusted = lastActualValue;
    }

    return { chartData, slope: recentSlope, intercept: projectedIntercept };
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isProjection = data.year > CURRENT_YEAR;

        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 min-w-[160px]">
                <p className="text-gray-900 font-semibold mb-2">{label}/{(label + 1).toString().slice(-2)}</p>
                {data.actual !== null && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Actual</span>
                        <span className="text-emerald-600 font-medium">{data.actual}%</span>
                    </div>
                )}
                {data.baseline !== null && isProjection && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Baseline</span>
                        <span className="text-blue-400 font-medium">{data.baseline}%</span>
                    </div>
                )}
                {data.adjusted !== null && isProjection && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">With Intervention</span>
                        <span className="text-teal-500 font-medium">{data.adjusted}%</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const CustomDot = ({ cx, cy, payload, dataKey, activeYear }) => {
    if (payload[dataKey] === null) return null;

    const colors = {
        actual: '#059669',
        baseline: '#93c5fd',
        adjusted: '#14b8a6',
    };

    const isActive = activeYear === payload.year;

    return (
        <circle
            cx={cx}
            cy={cy}
            r={isActive ? 6 : 4}
            fill={colors[dataKey]}
            stroke="white"
            strokeWidth={2}
            style={{ transition: 'all 0.2s ease' }}
        />
    );
};

export default function PrevalenceForecast() {
    const [activeYear, setActiveYear] = useState(null);

    const DataTrend = useMemo(() => TrendData(trendData), []);

    const { chartData } = useMemo(() => generateChartData(trendData), []);

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full h-full flex flex-col">
            <div className="mb-2">
                <h3 className="text-gray-900 font-bold text-xl tracking-tight">
                    Prevalence Forecast Model
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                    Linear regression projection based on current demographic trends
                </p>
            </div>

            <div className="flex flex-col gap-6 w-full mt-4">
                {/* Chart */}
                <div className="w-full" style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                            onMouseMove={(state) => {
                                if (state?.activePayload?.[0]) {
                                    setActiveYear(state.activePayload[0].payload.year);
                                }
                            }}
                            onMouseLeave={() => setActiveYear(null)}
                        >
                            <defs>
                                <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <XAxis
                                dataKey="year"
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                domain={[TrendData[0]?.year ?? CURRENT_YEAR, FORECAST_END_YEAR]}
                                ticks={[2019, 2021, 2023, 2025, 2027, 2029]}
                            />

                            <YAxis
                                domain={[6.5, 8.0]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => `${Number(value).toFixed(2)}%`}
                                width={55}
                            />

                            <Tooltip content={<CustomTooltip />} cursor={false} />

                            {/* Today marker */}
                            <ReferenceLine
                                x={CURRENT_YEAR}
                                stroke="#9ca3af"
                                strokeDasharray="4 4"
                                label={{
                                    value: 'Today',
                                    position: 'top',
                                    fill: '#9ca3af',
                                    fontSize: 12,
                                }}
                            />

                            {/* Baseline forecast area */}
                            <Area
                                type="monotone"
                                dataKey="baseline"
                                stroke="none"
                                fill="url(#baselineGradient)"
                                connectNulls={false}
                                legendType="none"
                            />

                            {/* Actual line */}
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#059669"
                                strokeWidth={2.5}
                                dot={(props) => <CustomDot {...props} dataKey="actual" activeYear={activeYear} />}
                                activeDot={false}
                                connectNulls={false}
                            />

                            {/* Baseline forecast line */}
                            <Line
                                type="monotone"
                                dataKey="baseline"
                                stroke="#93c5fd"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={(props) => <CustomDot {...props} dataKey="baseline" activeYear={activeYear} />}
                                activeDot={false}
                                connectNulls={false}
                            />

                            {/* Adjusted forecast line */}
                            <Line
                                type="monotone"
                                dataKey="adjusted"
                                stroke="#14b8a6"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                dot={(props) => <CustomDot {...props} dataKey="adjusted" activeYear={activeYear} />}
                                activeDot={false}
                                connectNulls={false}
                            />

                            <Legend
                                verticalAlign="bottom"
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => {
                                    const labels = {
                                        actual: 'Actual',
                                        baseline: 'Baseline Forecast',
                                        adjusted: 'Adjusted Forecast',
                                    };
                                    return <span className="text-sm text-gray-600 font-medium ml-1">{labels[value]}</span>;
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <p className="text-gray-300 text-xs mt-4 text-center">
                PHE Fingertips • Linear regression model • Tower Hamlets
            </p>
        </div>
    );
}