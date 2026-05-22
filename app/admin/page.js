'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Package, RefreshCw, CheckCircle, PauseCircle, 
    ArrowRight, TrendingUp, Users, MessageSquare,
    PlusCircle, Search, Calendar, Edit, MapPin, User
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        inTransit: 0,
        delivered: 0,
        onHold: 0
    });
    const [recentShipments, setRecentShipments] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchDashboardData() {
        setLoading(true);
        try {
            const { data: shipments, error } = await supabase
                .from('shipments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (shipments) {
                setStats({
                    total: shipments.length,
                    inTransit: shipments.filter(s => s.status === 'in-transit').length,
                    delivered: shipments.filter(s => s.status === 'delivered').length,
                    onHold: shipments.filter(s => ['on-hold', 'pending', 'picked-up'].includes(s.status)).length
                });
                setRecentShipments(shipments.slice(0, 6));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setTimeout(() => fetchDashboardData(), 0);
    }, []);

    const formatStatus = (status) => {
        const options = {
            'pending': 'Pending',
            'picked-up': 'Picked Up',
            'in-transit': 'In Transit',
            'out-for-delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'on-hold': 'On Hold',
            'returned': 'Returned',
            'cancelled': 'Cancelled'
        };
        return options[status] || status;
    };

    return (
        <div className="admin-section active">
            <div className="dashboard-welcome">
                <div>
                    <h1 className="welcome-title">
                        Welcome back, Admin
                    </h1>
                    <p className="welcome-subtitle">
                        Monitoring Parkline Shipping operations in real time.
                    </p>
                </div>
                <div className="dashboard-actions">
                    <Link href="/admin/add-shipment" className="btn-premium">
                        <PlusCircle size={18} /> <span>New Shipment</span>
                    </Link>
                </div>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card glass-stat">
                    <div className="stat-content">
                        <p className="stat-label">Total Shipments</p>
                        <h3 className="stat-value">{stats.total}</h3>
                        <div className="stat-trend positive">
                            <div className="trend-dot"></div>
                            <span>Live Database</span>
                        </div>
                    </div>
                    <div className="stat-icon-wrapper blue">
                        <Package size={24} />
                    </div>
                </div>
                <div className="admin-stat-card glass-stat">
                    <div className="stat-content">
                        <p className="stat-label">In Transit</p>
                        <h3 className="stat-value">{stats.inTransit}</h3>
                        <div className="stat-trend neutral">
                            <RefreshCw size={12} className="spin" /> 
                            <span>Active Logistics</span>
                        </div>
                    </div>
                    <div className="stat-icon-wrapper yellow">
                        <RefreshCw size={24} />
                    </div>
                </div>
                <div className="admin-stat-card glass-stat">
                    <div className="stat-content">
                        <p className="stat-label">Delivered</p>
                        <h3 className="stat-value">{stats.delivered}</h3>
                        <div className="stat-trend positive">
                            <CheckCircle size={12} /> 
                            <span>Successfully Completed</span>
                        </div>
                    </div>
                    <div className="stat-icon-wrapper green">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="admin-stat-card glass-stat">
                    <div className="stat-content">
                        <p className="stat-label">Hold / Pending</p>
                        <h3 className="stat-value">{stats.onHold}</h3>
                        <div className="stat-trend warning">
                            <PauseCircle size={12} /> 
                            <span>Requires Attention</span>
                        </div>
                    </div>
                    <div className="stat-icon-wrapper red">
                        <PauseCircle size={24} />
                    </div>
                </div>
            </div>

            <div className="dashboard-main-grid">
                <div className="admin-card glass-panel">
                    <div className="admin-card-header">
                        <div className="header-title">
                            <TrendingUp size={18} className="header-icon" />
                            <h3>Recent Activity</h3>
                        </div>
                        <Link href="/admin/shipments" className="view-all-btn">
                            View Registry <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tracking ID</th>
                                    <th>Route Details</th>
                                    <th>Current Status</th>
                                    <th>Created At</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="table-loader">
                                        <div className="premium-loader"></div>
                                        <p>Fetching active shipments...</p>
                                    </td></tr>
                                ) : recentShipments.length > 0 ? (
                                    recentShipments.map(s => (
                                        <tr key={s.tracking_id} className="shipment-row-card">
                                            <td data-label="Shipment ID">
                                                <div className="id-cell">
                                                    <span className="tracking-code">{s.tracking_id}</span>
                                                    <span className="timestamp">{new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            <td data-label="Route Details">
                                                <div className="route-cell">
                                                    <div className="loc-box">
                                                        <MapPin size={12} className="loc-icon" />
                                                        <span>{s.origin?.split(',')[0]}</span>
                                                    </div>
                                                    <ArrowRight size={12} className="route-arrow" />
                                                    <div className="loc-box">
                                                        <MapPin size={12} className="loc-icon" />
                                                        <span>{s.destination?.split(',')[0]}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Status">
                                                <span className={`status-pill ${s.status}`}>
                                                    {formatStatus(s.status)}
                                                </span>
                                            </td>
                                            <td data-label="Sender">
                                                <div className="party">
                                                    <User size={12} /> <span>{s.sender}</span>
                                                </div>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="actions-cell">
                                                    <Link href={`/admin/add-shipment?edit=${s.tracking_id}`} className="action-btn-circle edit" title="Edit Shipment">
                                                        <Edit size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-table-state">
                                            <Package size={48} className="empty-icon" />
                                            <p>No shipment records found in database.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="side-panels">
                    <div className="quick-actions-card glass-panel">
                        <div className="panel-header">
                            <h3>Quick Shortcuts</h3>
                        </div>
                        <div className="shortcuts-modern">
                            <Link href="/admin/add-shipment" className="modern-shortcut">
                                <div className="icon-box"><PlusCircle /></div>
                                <span>Add Record</span>
                            </Link>
                            <Link href="/admin/shipments" className="modern-shortcut">
                                <div className="icon-box"><Search /></div>
                                <span>Registry</span>
                            </Link>
                            <Link href="/admin/messages" className="modern-shortcut">
                                <div className="icon-box"><MessageSquare /></div>
                                <span>Messages</span>
                            </Link>
                            <div className="modern-shortcut disabled">
                                <div className="icon-box"><Users /></div>
                                <span>Customers</span>
                            </div>
                        </div>
                    </div>

                    <div className="health-card glass-panel">
                        <div className="panel-header">
                            <h3>System Intelligence</h3>
                        </div>
                        <div className="intelligence-grid">
                            <div className="intel-item">
                                <div className="intel-info">
                                    <span className="intel-label">Database Cluster</span>
                                    <span className="intel-status">Supabase Cloud</span>
                                </div>
                                <div className="pulse-indicator online"></div>
                            </div>
                            <div className="intel-item">
                                <div className="intel-info">
                                    <span className="intel-label">Edge Network</span>
                                    <span className="intel-status">Vercel Global</span>
                                </div>
                                <div className="pulse-indicator online"></div>
                            </div>
                            <div className="intel-item">
                                <div className="intel-info">
                                    <span className="intel-label">API Gateway</span>
                                    <span className="intel-status">Healthy (24ms)</span>
                                </div>
                                <div className="pulse-indicator online"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-welcome {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    background: #FFFFFF;
                    border-radius: 20px;
                    padding: 28px 32px;
                    border: 2px solid #DBEAFE;
                    box-shadow: 0 2px 12px rgba(37, 99, 235, 0.07);
                }
                .welcome-title {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 6px 0;
                    color: #1E3A8A;
                }
                .welcome-subtitle {
                    color: #64748B;
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 500;
                }
                .btn-premium {
                    background: #F97316;
                    color: white;
                    padding: 13px 28px;
                    border-radius: 14px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    transition: all 0.25s;
                    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
                    font-size: 0.95rem;
                    cursor: pointer;
                }
                .btn-premium:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.45);
                    background: #EA6C00;
                }

                /* ── Stat Cards ── */
                .glass-stat {
                    border-radius: 20px;
                    padding: 26px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    transition: all 0.25s ease;
                    position: relative;
                    overflow: hidden;
                    cursor: default;
                }
                .glass-stat:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }

                /* Card 1 — blue */
                .glass-stat:nth-child(1) { background: #2563EB; }
                /* Card 2 — amber */
                .glass-stat:nth-child(2) { background: #F59E0B; }
                /* Card 3 — emerald */
                .glass-stat:nth-child(3) { background: #10B981; }
                /* Card 4 — rose */
                .glass-stat:nth-child(4) { background: #EF4444; }

                .stat-label {
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255,255,255,0.75);
                    font-weight: 700;
                    margin: 0 0 10px 0;
                }
                .stat-value {
                    font-size: 2.8rem;
                    font-weight: 900;
                    margin: 0 0 12px 0;
                    color: #FFFFFF;
                    line-height: 1;
                }
                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 5px 12px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 20px;
                    width: fit-content;
                    color: #FFFFFF;
                }
                .trend-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #FFFFFF;
                }
                .stat-icon-wrapper {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #FFFFFF;
                    transition: all 0.25s;
                    flex-shrink: 0;
                }
                .glass-stat:hover .stat-icon-wrapper { background: rgba(255,255,255,0.3); transform: scale(1.1); }
                /* override per-color classes since card provides the color */
                .stat-icon-wrapper.blue,
                .stat-icon-wrapper.yellow,
                .stat-icon-wrapper.green,
                .stat-icon-wrapper.red { background: rgba(255,255,255,0.2); color: #FFFFFF; }

                /* ── Main Grid ── */
                .dashboard-main-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 28px;
                    margin-top: 28px;
                }
                .glass-panel {
                    background: #FFFFFF;
                    border: 2px solid #DBEAFE;
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 2px 12px rgba(37, 99, 235, 0.06);
                }
                .admin-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .header-title h3 { font-size: 1.05rem; font-weight: 800; color: #1E3A8A; margin: 0; }
                .header-icon { color: #2563EB; }
                .view-all-btn {
                    color: #2563EB;
                    font-size: 0.82rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 16px;
                    background: #EFF6FF;
                    border-radius: 10px;
                    text-decoration: none;
                    border: 1.5px solid #BFDBFE;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .view-all-btn:hover { background: #2563EB; color: #fff; border-color: #2563EB; transform: translateX(3px); }

                /* ── Table ── */
                .admin-table-wrap { overflow-x: auto; }
                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .admin-table th {
                    padding: 11px 14px;
                    text-align: left;
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #64748B;
                    font-weight: 700;
                    border-bottom: 2px solid #EFF6FF;
                    white-space: nowrap;
                }
                .admin-table td {
                    padding: 13px 14px;
                    vertical-align: middle;
                    border-bottom: 1px solid #F0F7FF;
                    font-size: 0.88rem;
                    color: #1E3A8A;
                }
                .shipment-row-card { transition: background 0.15s; }
                .shipment-row-card:hover td { background: #F0F7FF; }

                .tracking-code {
                    font-family: 'Courier New', monospace;
                    font-weight: 700;
                    color: #2563EB;
                    background: #EFF6FF;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.82rem;
                    display: inline-block;
                }
                .timestamp { display: block; font-size: 0.72rem; color: #94A3B8; margin-top: 3px; }
                .id-cell { display: flex; flex-direction: column; gap: 2px; }

                .route-cell { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
                .loc-box { display: flex; align-items: center; gap: 4px; font-size: 0.82rem; font-weight: 600; color: #374151; }
                .loc-icon { color: #2563EB; flex-shrink: 0; }
                .route-arrow { color: #9CA3AF; flex-shrink: 0; }

                .party { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; color: #374151; }

                /* ── Status Pills ── */
                .status-pill {
                    padding: 5px 14px;
                    border-radius: 20px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-block;
                    white-space: nowrap;
                }
                .status-pill.pending    { background: #FEF3C7; color: #92400E; border: 1.5px solid #FCD34D; }
                .status-pill.delivered  { background: #D1FAE5; color: #065F46; border: 1.5px solid #6EE7B7; }
                .status-pill.in-transit { background: #DBEAFE; color: #1E40AF; border: 1.5px solid #93C5FD; }
                .status-pill.on-hold    { background: #FEE2E2; color: #991B1B; border: 1.5px solid #FCA5A5; }
                .status-pill.picked-up  { background: #F3E8FF; color: #6B21A8; border: 1.5px solid #D8B4FE; }
                .status-pill.out-for-delivery { background: #ECFDF5; color: #065F46; border: 1.5px solid #6EE7B7; }
                .status-pill.returned   { background: #FFF7ED; color: #9A3412; border: 1.5px solid #FDBA74; }
                .status-pill.cancelled  { background: #F1F5F9; color: #475569; border: 1.5px solid #CBD5E1; }

                /* ── Action button ── */
                .actions-cell { display: flex; align-items: center; gap: 8px; }
                .action-btn-circle {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    cursor: pointer;
                    text-decoration: none;
                }
                .action-btn-circle.edit { background: #EFF6FF; color: #2563EB; border: 1.5px solid #BFDBFE; }
                .action-btn-circle.edit:hover { background: #2563EB; color: #fff; border-color: #2563EB; transform: scale(1.1); }

                /* ── Side Panels ── */
                .side-panels { display: flex; flex-direction: column; gap: 24px; }
                .panel-header { margin-bottom: 18px; }
                .panel-header h3 { font-size: 1rem; font-weight: 800; color: #1E3A8A; margin: 0; }

                /* Quick Shortcuts */
                .shortcuts-modern {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .modern-shortcut {
                    background: #F8FAFF;
                    border: 2px solid #DBEAFE;
                    border-radius: 16px;
                    padding: 18px 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    transition: all 0.25s ease;
                    cursor: pointer;
                }
                .modern-shortcut:hover {
                    background: #2563EB;
                    border-color: #2563EB;
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.28);
                }
                .icon-box {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: #EFF6FF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #2563EB;
                    transition: all 0.25s;
                }
                .modern-shortcut:hover .icon-box { background: rgba(255,255,255,0.2); color: #FFFFFF; }
                .modern-shortcut span { font-size: 0.78rem; font-weight: 700; color: #374151; transition: color 0.2s; }
                .modern-shortcut:hover span { color: #FFFFFF; }
                .modern-shortcut.disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }

                /* System Intel */
                .intelligence-grid { display: flex; flex-direction: column; gap: 12px; }
                .intel-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 13px 16px;
                    background: #F0F7FF;
                    border-radius: 12px;
                    border: 1.5px solid #DBEAFE;
                }
                .intel-info { display: flex; flex-direction: column; gap: 2px; }
                .intel-label { font-size: 0.68rem; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px; }
                .intel-status { font-size: 0.85rem; font-weight: 700; color: #1E3A8A; }
                .pulse-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    position: relative;
                    flex-shrink: 0;
                }
                .pulse-indicator.online { background: #10B981; box-shadow: 0 0 6px rgba(16,185,129,0.5); }
                .pulse-indicator.online::after {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    border: 2px solid #10B981;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 3s linear infinite; }

                /* Loader / Empty States */
                .table-loader { text-align: center; padding: 60px 0; }
                .premium-loader {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #BFDBFE;
                    border-top-color: #2563EB;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    animation: spin 0.8s linear infinite;
                }
                .table-loader p { color: #64748B; font-weight: 600; font-size: 0.9rem; }
                .empty-table-state { text-align: center; padding: 60px 0; color: #94A3B8; }
                .empty-icon { opacity: 0.2; margin-bottom: 15px; color: #2563EB; }

                /* Responsive */
                @media (max-width: 1200px) {
                    .dashboard-main-grid { grid-template-columns: 1fr; }
                    .side-panels { flex-direction: row; }
                    .side-panels > div { flex: 1; }
                }
                @media (max-width: 768px) {
                    .side-panels { flex-direction: column; }
                    .dashboard-welcome { flex-direction: column; align-items: flex-start; gap: 20px; padding: 20px; }
                }
            `}</style>
        </div>
    );
}
