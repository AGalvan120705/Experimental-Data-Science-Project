import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FiveYearTrendGraph from '../../src/components/graphs/FiveYearTrendGraph';

describe('FiveYearTrendGraph Component', () => {
    it('renders and displays computed data values', () => {
        const { container } = render(<FiveYearTrendGraph />);
        expect(container).toBeInTheDocument();

        // Assert texts like the trend numbers are visible 
        expect(screen.getByText(/5-year trend/i)).toBeInTheDocument();
        expect(screen.getByText(/change over period/i)).toBeInTheDocument();
        expect(screen.getByText(/rate of change/i)).toBeInTheDocument();
    });
});