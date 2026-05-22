'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, PlusCircle, MessageSquare, LogOut, Menu, X, Bell, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/admin/login');
            } else {
                setIsAuthenticated(true);
                setUserEmail(session.user.email);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/admin/login');
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
                setUserEmail(session.user.email);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    // Allow login page to render without authentication
    if (pathname === '/admin/login') {
        return children;
    }

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF6FF' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader" style={{ margin: '0 auto 20px' }}></div>
                    <p style={{ fontWeight: 700, color: '#1E3A8A', fontSize: '0.95rem' }}>Authenticating Portal Access...</p>
                </div>
                <style jsx>{`
                    .loader {
                        width: 48px;
                        height: 48px;
                        border: 4px solid #BFDBFE;
                        border-top: 4px solid #2563EB;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { id: 'shipments', label: 'Shipments', icon: Package, href: '/admin/shipments' },
        { id: 'add-shipment', label: 'Add Shipment', icon: PlusCircle, href: '/admin/add-shipment' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
    ];

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} id="adminSidebar">
                <div className="sidebar-header">
                    <Link href="/" className="nav-logo">
                        <div className="logo-box" style={{ width: '36px', height: '36px', fontFamily: "'Archivo', sans-serif", fontStyle: 'italic', fontWeight: 900, fontSize: '1.35rem', letterSpacing: '-1px', borderRadius: '10px' }}>P</div>
                        <div className="logo-text" style={{ fontSize: '1.1rem', color: '#1E3A8A', fontWeight: 800, letterSpacing: '0.5px' }}>Parkline<span style={{ color: '#2563EB' }}> Admin</span></div>
                    </Link>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <a 
                                key={item.id}
                                href={item.href} 
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <span className="sidebar-icon"><Icon size={18} /></span> {item.label}
                                {isActive && <div className="active-indicator"></div>}
                            </a>
                        );
                    })}
                </nav>
                <div className="sidebar-footer">
                    <button 
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} /> <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header glass-header">
                    <div className="admin-header-left">
                        <button 
                            className="admin-menu-toggle" 
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>
                        <div className="header-page-title">
                            <span className="breadcrumb">Admin /</span>
                            <h2>{navItems.find(item => item.href === pathname)?.label || 'Panel'}</h2>
                        </div>
                    </div>
                    <div className="admin-header-right">
                        <div className="header-actions">
                            <button className="header-icon-btn">
                                <Bell size={20} />
                                <span className="notif-dot"></span>
                            </button>
                            <div className="divider"></div>
                            <div className="admin-user-profile">
                                <div className="user-info">
                                    <span className="user-name">{userEmail}</span>
                                    <span className="user-role">Administrator</span>
                                </div>
                                <div className="user-avatar">
                                    <User size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="admin-content-wrapper">
                    {children}
                </div>
            </main>

            <style jsx>{`
                .admin-layout {
                    background: #EFF6FF;
                }
                .admin-sidebar {
                    background: #FFFFFF;
                    border-right: 2px solid #DBEAFE;
                    box-shadow: 4px 0 20px rgba(37, 99, 235, 0.08);
                }
                .sidebar-link {
                    position: relative;
                    margin: 4px 12px;
                    border-radius: 12px;
                    color: #475569;
                    font-weight: 600;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .sidebar-link:hover {
                    background: #EFF6FF;
                    color: #2563EB;
                }
                .sidebar-link.active {
                    background: #2563EB;
                    color: #FFFFFF;
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
                }
                .sidebar-link.active .active-indicator {
                    display: none;
                }
                .active-indicator {
                    display: none;
                }
                .logout-btn {
                    width: calc(100% - 24px);
                    margin: 0 12px;
                    padding: 12px;
                    border-radius: 12px;
                    background: #FEF2F2;
                    border: 1.5px solid #FECACA;
                    color: #DC2626;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .logout-btn:hover {
                    background: #EF4444;
                    border-color: #EF4444;
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
                }
                .glass-header {
                    background: #FFFFFF;
                    border-bottom: 2px solid #DBEAFE;
                    box-shadow: 0 2px 12px rgba(37, 99, 235, 0.07);
                    height: 80px;
                    padding: 0 30px;
                }
                .header-page-title {
                    margin-left: 15px;
                }
                .breadcrumb {
                    font-size: 0.72rem;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    display: block;
                    margin-bottom: 2px;
                    font-weight: 600;
                }
                .header-page-title h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 0;
                    color: #1E3A8A;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .header-icon-btn {
                    background: #EFF6FF;
                    border: 1.5px solid #BFDBFE;
                    color: #2563EB;
                    cursor: pointer;
                    position: relative;
                    padding: 8px;
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .header-icon-btn:hover {
                    background: #2563EB;
                    border-color: #2563EB;
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                .notif-dot {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 8px;
                    height: 8px;
                    background: #F97316;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 0 6px rgba(249, 115, 22, 0.5);
                }
                .divider {
                    width: 1px;
                    height: 30px;
                    background: #DBEAFE;
                }
                .user-info {
                    text-align: right;
                }
                .user-name {
                    display: block;
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #1E3A8A;
                }
                .user-role {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: #2563EB;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    background: #2563EB;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
                }
                @media (max-width: 768px) {
                    .glass-header {
                        height: 70px;
                        padding: 0 16px;
                    }
                    .user-info {
                        display: none;
                    }
                    .header-actions {
                        gap: 12px;
                    }
                    .divider {
                        height: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
