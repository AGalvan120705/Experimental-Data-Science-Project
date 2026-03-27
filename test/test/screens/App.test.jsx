import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';

describe('App shell integration', () => {
    it('renders shared shell and default route content', () => {
        render(<App />);

        expect(screen.getAllByText(/sugaraware/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/type 2 diabetes awareness platform/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /lock navbar/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /homepage/i })).toBeInTheDocument();
    });
});
