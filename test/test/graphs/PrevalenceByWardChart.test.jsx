import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PrevalenceByWardChart from '../../src/components/graphs/PrevalenceByWardChart';

describe('PrevalenceByWardChart Component', () => {
    it('renders the component headers', () => {
        render(<PrevalenceByWardChart />);
        expect(screen.getByText(/prevalence by ward/i)).toBeInTheDocument();
        expect(screen.getByText(/percentage of registered patients diagnosed/i)).toBeInTheDocument();
    });

    it('toggles the info tooltip on button click', () => {
        render(<PrevalenceByWardChart />);

        // The info button should exist
        const infoButton = screen.getByRole('button', { name: /i/i });
        expect(infoButton).toBeInTheDocument();

        // Initially, the info text should not be visible
        expect(screen.queryByText(/about this data/i)).not.toBeInTheDocument();

        // Click to show
        fireEvent.click(infoButton);
        expect(screen.getByText(/about this data/i)).toBeInTheDocument();
        expect(screen.getByText(/prevalence based on gp practice location/i)).toBeInTheDocument();

        // Click to hide
        fireEvent.click(infoButton);
        expect(screen.queryByText(/about this data/i)).not.toBeInTheDocument();
    });

    it('toggles the info tooltip on mouse enter and leave', () => {
        render(<PrevalenceByWardChart />);

        const infoButton = screen.getByRole('button', { name: /i/i });

        fireEvent.mouseEnter(infoButton);
        expect(screen.getByText(/about this data/i)).toBeInTheDocument();

        fireEvent.mouseLeave(infoButton);
        expect(screen.queryByText(/about this data/i)).not.toBeInTheDocument();
    });
});