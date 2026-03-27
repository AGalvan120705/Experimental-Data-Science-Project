import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../../src/components/Navbar';

describe('Navbar integration', () => {
    it('renders core nav links when expanded', () => {
        render(
            <MemoryRouter>
                <Navbar
                    expanded={true}
                    onHoverChange={vi.fn()}
                    navbarLocked={false}
                    onToggleNavbar={vi.fn()}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /interactive map/i })).toBeInTheDocument();
    });

    it('calls callbacks for lock and hover interactions', () => {
        const onHoverChange = vi.fn();
        const onToggleNavbar = vi.fn();

        render(
            <MemoryRouter>
                <Navbar
                    expanded={true}
                    onHoverChange={onHoverChange}
                    navbarLocked={false}
                    onToggleNavbar={onToggleNavbar}
                />
            </MemoryRouter>
        );

        const aside = document.querySelector('aside');
        expect(aside).toBeTruthy();

        fireEvent.mouseEnter(aside);
        fireEvent.mouseLeave(aside);
        fireEvent.click(screen.getByRole('button', { name: /lock navbar/i }));

        expect(onHoverChange).toHaveBeenCalledWith(true);
        expect(onHoverChange).toHaveBeenCalledWith(false);
        expect(onToggleNavbar).toHaveBeenCalledTimes(1);
    });
});
