import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PredictiveModeling from '../../src/screens/PredictiveModeling';
import { BrowserRouter } from 'react-router-dom';

describe('PredictiveModeling Screen', () => {
    it('renders the projection page title', () => {
        render(
            <BrowserRouter>
                <PredictiveModeling />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        expect(screen.getByText(/estimated prevalence in 2030/i)).toBeInTheDocument();
    });
});