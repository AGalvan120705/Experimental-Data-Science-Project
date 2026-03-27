import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../../src/screens/Dashboard';

describe('Dashboard Screen', () => {
    it('renders the Dashboard header correctly', () => {
        render(<Dashboard />);
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
});