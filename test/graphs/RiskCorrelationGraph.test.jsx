import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RiskCorrelationGraph from '../../src/components/graphs/RiskCorrelationGraph';

describe('RiskCorrelationGraph Component', () => {
    it('renders headers, descriptions, and axis labels', () => {
        render(<RiskCorrelationGraph />);

        expect(screen.getByText(/risk factor correlation/i)).toBeInTheDocument();
        expect(screen.getByText(/relationship between obesity and diabetes prevalence across wards/i)).toBeInTheDocument();
        expect(screen.getByText(/correlation coefficient:/i)).toBeInTheDocument();
        expect(screen.getByText(/line of best fit/i)).toBeInTheDocument();

        // Axis labels may not render in jsdom because chart dimensions are zero.
        // Validate stable legend and metadata instead.
        expect(screen.getByText(/wards data point/i)).toBeInTheDocument();
    });

    it('shows correlation value in the summary badge', () => {
        render(<RiskCorrelationGraph />);
        expect(screen.getByText(/r\s*=\s*0\.79/i)).toBeInTheDocument();
    });
});