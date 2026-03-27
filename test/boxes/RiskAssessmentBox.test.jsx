import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DiabetesRiskAssessment from '../../src/boxes/RiskAssessmentBox';

describe('DiabetesRiskAssessment Component', () => {
    it('renders the component with all initial fields', () => {
        render(<DiabetesRiskAssessment />);

        // Check for the main title
        expect(screen.getByText('Risk Assessment')).toBeInTheDocument();

        // Check that the dropdowns rendered
        expect(screen.getByText('Age Group')).toBeInTheDocument();
        expect(screen.getByText('Ethnicity')).toBeInTheDocument();
        expect(screen.getByText('BMI Category')).toBeInTheDocument();

        // Assert the button is disabled initially
        const button = screen.getByRole('button', { name: /calculate risk score/i });
        expect(button).toBeDisabled();
    });

    it('enables the button when all fields correspond to a selection', async () => {
        render(<DiabetesRiskAssessment />);

        // Select options to fill out the form
        fireEvent.change(screen.getByRole('combobox', { name: /age group/i }), { target: { value: '25-34' } });
        fireEvent.change(screen.getByRole('combobox', { name: /ethnicity/i }), { target: { value: 'white' } });
        fireEvent.change(screen.getByRole('combobox', { name: /bmi category/i }), { target: { value: 'healthy' } });
        fireEvent.change(screen.getByRole('combobox', { name: /physical activity/i }), { target: { value: 'active' } });
        fireEvent.change(screen.getByRole('combobox', { name: /family history of diabetes/i }), { target: { value: 'none' } });

        // The button should now be enabled
        const button = screen.getByRole('button', { name: /calculate risk score/i });
        expect(button).not.toBeDisabled();
    });

    it('shows the correct Low Risk output on submit', () => {
        render(<DiabetesRiskAssessment />);

        // Fill out form with lowest risk scores
        fireEvent.change(screen.getByRole('combobox', { name: /age group/i }), { target: { value: 'under25' } });
        fireEvent.change(screen.getByRole('combobox', { name: /ethnicity/i }), { target: { value: 'white' } });
        fireEvent.change(screen.getByRole('combobox', { name: /bmi category/i }), { target: { value: 'healthy' } });
        fireEvent.change(screen.getByRole('combobox', { name: /physical activity/i }), { target: { value: 'active' } });
        fireEvent.change(screen.getByRole('combobox', { name: /family history of diabetes/i }), { target: { value: 'none' } });

        // Click sumbit
        const button = screen.getByRole('button', { name: /calculate risk score/i });
        fireEvent.click(button);

        // Expect the result view
        expect(screen.getByText(/low risk/i)).toBeInTheDocument();
        expect(screen.getByText(/Your current risk of developing Type 2 diabetes is low/i)).toBeInTheDocument();
    });
});
