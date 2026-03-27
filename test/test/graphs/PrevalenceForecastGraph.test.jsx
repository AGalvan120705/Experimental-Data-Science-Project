import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PrevalenceForecast, {
    linearRegression,
    generateChartData,
    FORECAST_END_YEAR,
} from '../../src/components/graphs/PrevalenceForecastGraph';

describe('PrevalenceForecast Component', () => {
    it('renders the forecast headers and toggles', () => {
        render(<PrevalenceForecast />);

        // Headers
        expect(screen.getByText(/prevalence forecast model/i)).toBeInTheDocument();
        expect(screen.getByText(/linear regression projection based on current demographic trends/i)).toBeInTheDocument();
        expect(screen.getByText(/linear regression model/i)).toBeInTheDocument();
    });

    it('linearRegression computes slope and intercept from known points', () => {
        const data = [
            { year: 2021, value: 7.0 },
            { year: 2022, value: 7.2 },
            { year: 2023, value: 7.4 },
        ];

        const result = linearRegression(data);
        expect(result.slope).toBeGreaterThan(0);
        expect(Number.isFinite(result.intercept)).toBe(true);
    });

    it('generateChartData handles empty/small datasets safely', () => {
        expect(generateChartData([])).toEqual({ chartData: [], slope: 0, intercept: 0 });
        expect(generateChartData([{ year: 2024, value: 7.5 }])).toEqual({ chartData: [], slope: 0, intercept: 0 });
    });

    it('generateChartData returns projected values through forecast end year', () => {
        const input = {
            trends: [
                { year: 2022, value: 7.1 },
                { year: 2023, value: 7.3 },
                { year: 2024, value: 7.6 },
            ],
        };

        const { chartData, slope } = generateChartData(input);
        expect(chartData.length).toBeGreaterThanOrEqual(3);
        expect(slope).toBeGreaterThan(0);

        const last = chartData[chartData.length - 1];
        expect(last.year).toBe(FORECAST_END_YEAR);
        expect(typeof last.baseline).toBe('number');
        expect(typeof last.adjusted).toBe('number');
    });

    it('can render component without crashing', () => {
        const { container } = render(<PrevalenceForecast />);
        expect(container).toBeInTheDocument();
    });
});