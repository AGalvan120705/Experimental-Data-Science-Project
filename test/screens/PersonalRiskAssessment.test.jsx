import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PersonalRiskAssessment from '../../src/screens/PersonalRiskAssessment';
import { BrowserRouter } from 'react-router-dom';

describe('PersonalRiskAssessment Screen', () => {
    it('renders the risk assessment title', () => {
        render(
            <BrowserRouter>
                <PersonalRiskAssessment />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
});