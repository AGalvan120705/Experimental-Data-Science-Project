import React from 'react'
import { NavLink } from 'react-router-dom';
import {Menu, Home, LayoutDashboard, Map, User, FileText, TrendingUp} from 'lucide-react';

const Navbar = ({expanded, onHoverChange, navbarLocked, onToggleNavbar}) => {
  const navItems = [
    { label: 'Overview', icon: <Home size={20} />, path: '/' },
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Interactive Map', icon: <Map size={20} />, path: '/interactive-map' },
    { label: 'Predictive Model', icon: <TrendingUp size={20} />, path: '/predictive-modeling' },
    { label: 'Personal Risk tool', icon: <User size={20} />, path: '/personal-risk-tool' },
    { label: 'Recommendations', icon: <FileText size={20} />, path: '/recommendations' },
  ];
  
    return (
        <aside
            className= { `fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-slate-800 bg-[#0f172A] text-white shadow-xl transition-all duration-300 ${expanded ? 'w-70' : 'w-20'}` }
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
        >
        <div className = {`flex h-20 items-center border-b border-slate-800 transition-all duration-300 ${expanded ? 'px-4' : 'justify-center px-2.5'}`}>
            <button
                type = "button"
                onClick={onToggleNavbar}
                className={`flex items-center rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${navbarLocked ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-900 text-slate-100 hover:bg-slate-800' } ${expanded ? 'px-4 justify-start h-12 gap-4 w-full' : 'h-12 w-15 justify-center px-0'}`}

                aria-label={navbarLocked ? 'Unlock Navbar' : 'Lock Navbar'}
                aria-pressed={navbarLocked}
            >
                <Menu size={20} className='shrink-0' />

                <span className={`overflow-hidden whitespace-nowrap text-[1.05rem] font-semibold transition-all duration-300 ${expanded ? 'opacity-100 max-w-40' : 'opacity-0 max-w-0'}`}>
                    SugarAware
                </span>
            </button>
        </div>

        <nav className = {`flex flex-1 flex-col gap-3 py-5 transition-all duration-300 ${expanded ? 'px-4' : 'items-center px-2.5'}`}>

            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={({ isActive }) =>
                        `flex items-center h-14 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#3b82f6] text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white' } ${expanded ? 'justify-start gap-4 px-4 w-full' : 'justify-center w-15 px-0'}`
                    }
                >
                    <span className= "flex h-6 w-6 shrink-0 items-center justify-center"> 
                        {item.icon}
                     </span>

                    
                    <span className={`overflow-hidden whitespace-nowrap text-[1.05rem] font-semibold transition-all duration-300 ${expanded ? 'opacity-100 max-w-48' : 'opacity-0 max-w-0'}`}>
                        {item.label}
                    </span>
                </NavLink>
            ))}
        </nav>
        </aside>
    )
}

export default Navbar
