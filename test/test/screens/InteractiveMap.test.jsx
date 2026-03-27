import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InteractiveMap from '../../src/screens/InteractiveMap';
import { BrowserRouter } from 'react-router-dom';

describe('InteractiveMap Screen', () => {
    it('renders the map page content', () => {
        render(
            <BrowserRouter>
                <InteractiveMap />
            </BrowserRouter>
        );
        expect(screen.getByRole('button', { name: /diabetes prevalence/i })).toBeInTheDocument();
    });
});