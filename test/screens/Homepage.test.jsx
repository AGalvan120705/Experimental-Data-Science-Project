import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../../src/screens/Homepage';

describe('Homepage Screen', () => {
    it('renders the homepage content correctly', () => {
        // Since Homepage uses react-router-dom (useNavigate), we MUST wrap it in a Router
        render(
            <BrowserRouter>
                <Homepage />
            </BrowserRouter>
        );

        // Check for main heading
        expect(screen.getByRole('heading', { name: /homepage/i })).toBeInTheDocument();

        // Check for the subtext
        expect(screen.getByText(/overview of the health landscape of tower hamlets/i)).toBeInTheDocument();
    });
});
