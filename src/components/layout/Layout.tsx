import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import { useI18n } from '../../i18n';
import './Layout.css';

const Layout: React.FC = () => {
    const { t } = useI18n();
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as 'light' | 'dark') || 'dark';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, labelKey: 'dashboard' as const },
        { path: '/subscriptions', icon: <CreditCard size={20} />, labelKey: 'subscriptions' as const },
        { path: '/statistics', icon: <BarChart3 size={20} />, labelKey: 'statistics' as const },
        { path: '/settings', icon: <Settings size={20} />, labelKey: 'settings' as const },
    ];

    return (
        <div className="app-layout">
            {/* Drag region for Tauri */}
            <div className="drag-region" data-tauri-drag-region />

            {/* Left Sidebar - Modern Icon Style */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <img
                            src="/app-icon.png"
                            alt="Subscription Tracker"
                            className="logo-icon"
                        />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            end={item.path === '/'}
                            title={t.nav[item.labelKey]}
                        >
                            <div className="nav-icon-wrapper">
                                {item.icon}
                            </div>
                            <span className="nav-label">{t.nav[item.labelKey]}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
