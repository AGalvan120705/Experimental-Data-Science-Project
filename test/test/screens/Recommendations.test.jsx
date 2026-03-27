import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Recommendations from '../../src/screens/Recommendations';
import { BrowserRouter } from 'react-router-dom';

describe('Recommendations Screen', () => {
    it('renders the recommendations title', () => {
        render(
            <BrowserRouter>
                <Recommendations />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { level: 2, name: /recommendations/i })).toBeInTheDocument();
        expect(screen.getAllByText(/what you can do: personal actions/i)[0]).toBeInTheDocument();
    });
});