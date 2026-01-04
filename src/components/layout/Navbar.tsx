import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, BarChart3, Settings, CreditCard } from 'lucide-react';
import './Navbar.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const Navbar: React.FC = () => {
    const location = useLocation();
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as 'light' | 'dark') || 'dark';
    });

    const navItems: NavItem[] = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { path: '/subscriptions', label: 'Subscriptions', icon: <CreditCard size={16} /> },
        { path: '/statistics', label: 'Statistics', icon: <BarChart3 size={16} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={16} /> },
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <nav className="navbar">
            <div className="navbar-content">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">📊</span>
                    <span className="logo-text">SubTracker</span>
                </Link>

                {/* Pill Navigation */}
                <div className="nav-pills">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-pill ${isActive(item.path) ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
