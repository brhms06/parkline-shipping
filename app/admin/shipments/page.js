'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    ClipboardList, Edit, Trash2, Package, 
    Search, X, MapPin, Eye, Plus, PlusCircle,
    Truck, User, Calendar, DollarSign,
    Info, Clock, ArrowRight, Filter, RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function AdminShipments() {
    const showToast = useToast();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentShipment, setCurrentShipment] = useState(null);
    
    // Status Update state
    const [modalStatus, setModalStatus] = useState('');
    const [modalEvent, setModalEvent] = useState('');
    const [modalLocation, setModalLocation] = useState('');

    useEffect(() => {
        fetchShipments();
    }, []);

    const filteredShipments = useMemo(() => {
        let result = [...shipments];
        if (filterStatus !== 'all') {
            result = result.filter(s => s.status === filterStatus);
        }
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.tracking_id.toLowerCase().includes(q) ||
                (s.sender && s.sender.toLowerCase().includes(q)) ||
                (s.receiver && s.receiver.toLowerCase().includes(q)) ||
                (s.origin && s.origin.toLowerCase().includes(q)) ||
                (s.destination && s.destination.toLowerCase().includes(q)) ||
                (s.type && s.type.toLowerCase().includes(q))
            );
        }
        return result;
    }, [shipments, filterStatus, searchTerm]);

    async function fetchShipments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('shipments')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            showToast('Error fetching shipments: ' + error.message, 'error');
        } else {
            setShipments(data || []);
        }
        setLoading(false);
    }

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

    const handleDelete = async (id) => {
        if (!confirm(`Delete shipment ${id}? This cannot be undone.`)) return;
        const { error } = await supabase.from('shipments').delete().eq('tracking_id', id);
        if (error) {
            showToast('Error: ' + error.message, 'error');
        } else {
            showToast('Shipment deleted successfully.', 'success');
            fetchShipments();
        }
    };

    const openStatusModal = (s) => {
        setCurrentShipment(s);
        setModalStatus(s.status);
        setModalEvent('');
        setModalLocation('');
        setIsStatusModalOpen(true);
    };

    const openDetailModal = (s) => {
        setCurrentShipment(s);
        setIsDetailModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!currentShipment) return;

        const timeline = currentShipment.timeline || [];
        const now = new Date();
        const suggestions = {
            'pending': 'Shipment created - Awaiting pickup',
            'picked-up': 'Package picked up from sender',
            'in-transit': 'Shipment in transit',
            'out-for-delivery': 'Package out for delivery',
            'delivered': 'Package delivered successfully',
            'on-hold': 'Shipment placed on hold',
            'returned': 'Package returned to sender',
            'cancelled': 'Shipment cancelled'
        };

        const newEvent = {
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            event: modalEvent || suggestions[modalStatus] || `Status changed to ${formatStatus(modalStatus)}`,
            location: modalLocation || ''
        };

        const updatedTimeline = [newEvent, ...timeline];

        const { error } = await supabase
            .from('shipments')
            .update({ status: modalStatus, timeline: updatedTimeline })
            .eq('tracking_id', currentShipment.tracking_id);

        if (error) {
            showToast('Error: ' + error.message, 'error');
        } else {
            showToast(`Status updated for ${currentShipment.tracking_id}`, 'success');
            setIsStatusModalOpen(false);
            fetchShipments();
        }
    };

    return (
        <div className="admin-section active">
            <div className="admin-view-header glass-header">
                <div className="header-left">
                    <div className="title-area">
                        <div className="title-icon-box">
                            <Package size={24} />
                        </div>
                        <div>
                            <h1>Shipment Registry</h1>
                            <p>Manage and monitor all freight movements</p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <Link href="/admin/add-shipment" className="btn-add-record">
                        <PlusCircle size={18} /> <span>New Shipment</span>
                    </Link>
                </div>
            </div>

            <div className="filter-panel glass-panel">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by Tracking ID, Name, or City..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <div className="select-wrapper">
                        <Filter size={16} className="select-icon" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Approval</option>
                            <option value="picked-up">Picked Up</option>
                            <option value="in-transit">In Transit</option>
                            <option value="out-for-delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="on-hold">On Hold</option>
                            <option value="returned">Returned</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button className="btn-refresh" onClick={fetchShipments} title="Refresh Data">
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="table-container glass-panel">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Shipment ID</th>
                            <th>Service Details</th>
                            <th>Origin / Destination</th>
                            <th>Status</th>
                            <th>Parties</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="table-loader">
                                    <div className="premium-loader"></div>
                                    <p>Synchronizing registry...</p>
                                </td>
                            </tr>
                        ) : filteredShipments.length > 0 ? (
                            filteredShipments.map(s => (
                                <tr key={s.tracking_id} className="shipment-row-card">
                                    <td data-label="Shipment ID">
                                        <div className="id-cell">
                                            <span className="tracking-code">{s.tracking_id}</span>
                                            <span className="timestamp">{new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </td>
                                    <td data-label="Service Details">
                                        <div className="service-cell">
                                            <span className="service-tag">{s.type || 'General'}</span>
                                            <span className="mode-label">{s.shipment_mode || 'Standard'}</span>
                                        </div>
                                    </td>
                                    <td data-label="Origin / Destination">
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
                                    <td data-label="Parties">
                                        <div className="parties-cell">
                                            <div className="party">
                                                <User size={12} /> <span>{s.sender}</span>
                                            </div>
                                            <div className="party">
                                                <User size={12} /> <span>{s.receiver}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="actions-cell">
                                            <button className="action-btn-circle view" title="View Details" onClick={() => openDetailModal(s)}>
                                                <Eye size={18} />
                                            </button>
                                            <button className="action-btn-circle status" title="Update Status" onClick={() => openStatusModal(s)}>
                                                <ClipboardList size={18} />
                                            </button>
                                            <Link href={`/admin/add-shipment?edit=${s.tracking_id}`} className="action-btn-circle edit" title="Edit Full Record">
                                                <Edit size={18} />
                                            </Link>
                                            <button className="action-btn-circle delete" title="Delete Permanent" onClick={() => handleDelete(s.tracking_id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    <Package size={64} className="empty-icon" />
                                    <h3>No Records Found</h3>
                                    <p>We could not find any shipments matching your criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Update Modal */}
            {isStatusModalOpen && (
                <div className="admin-modal show">
                    <div className="admin-modal-content glass-modal" style={{ maxWidth: '450px' }}>
                        <div className="admin-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ClipboardList size={20} color="var(--accent)" />
                                <h3>Status Update</h3>
                            </div>
                            <button className="admin-modal-close" onClick={() => setIsStatusModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="modal-tracking-box">
                                <span>TRACKING NUMBER</span>
                                <h4>{currentShipment?.tracking_id}</h4>
                            </div>

                            <div className="form-group">
                                <label>Current Location</label>
                                <div className="input-with-icon">
                                    <MapPin size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Distribution Center, London" 
                                        value={modalLocation}
                                        onChange={(e) => setModalLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>New Shipment Status</label>
                                <select 
                                    className="admin-select-modal" 
                                    value={modalStatus}
                                    onChange={(e) => setModalStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="picked-up">Picked Up</option>
                                    <option value="in-transit">In Transit</option>
                                    <option value="out-for-delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="returned">Returned</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Event Description (Optional)</label>
                                <textarea 
                                    placeholder="Brief description of the update..." 
                                    value={modalEvent}
                                    onChange={(e) => setModalEvent(e.target.value)}
                                    style={{ height: '80px', resize: 'none' }}
                                />
                            </div>

                            <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
                                <button className="btn btn-primary" style={{ flex: 1, height: '48px', justifyContent: 'center' }} onClick={handleUpdateStatus}>
                                    Apply Status
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '0 20px' }} onClick={() => setIsStatusModalOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shipment Detail Modal */}
            {isDetailModalOpen && currentShipment && (
                <div className="admin-modal show">
                    <div className="admin-modal-content glass-modal" style={{ maxWidth: '900px', width: '95%' }}>
                        <div className="admin-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Eye size={20} color="var(--accent)" />
                                <h3>Full Record: {currentShipment.tracking_id}</h3>
                            </div>
                            <button className="admin-modal-close" onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="admin-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <div className="detail-grid">
                                <div className="detail-col">
                                    <section className="detail-section-glass">
                                        <div className="section-title"><Info size={14} /> Core Information</div>
                                        <div className="info-item"><span>Current Status:</span> <strong className={`status-badge ${currentShipment.status}`}>{formatStatus(currentShipment.status)}</strong></div>
                                        <div className="info-item"><span>Shipment Type:</span> <strong>{currentShipment.type || 'N/A'}</strong></div>
                                        <div className="info-item"><span>Service Mode:</span> <strong>{currentShipment.shipment_mode || 'N/A'}</strong></div>
                                        <div className="info-item"><span>Carrier:</span> <strong>{currentShipment.carrier || 'Internal'}</strong></div>
                                        <div className="info-item"><span>Reference No:</span> <strong>{currentShipment.carrier_ref_no || 'None'}</strong></div>
                                    </section>

                                    <section className="detail-section-glass">
                                        <div className="section-title"><User size={14} /> Party Information</div>
                                        <div className="party-box sender">
                                            <div className="party-label">SENDER</div>
                                            <h4>{currentShipment.sender}</h4>
                                            <p>{currentShipment.sender_email}</p>
                                            <p>{currentShipment.sender_number}</p>
                                            <div className="party-location"><MapPin size={12} /> {currentShipment.origin}</div>
                                        </div>
                                        <div className="party-box receiver">
                                            <div className="party-label">RECEIVER</div>
                                            <h4>{currentShipment.receiver}</h4>
                                            <p>{currentShipment.receiver_email}</p>
                                            <p>{currentShipment.receiver_number}</p>
                                            <div className="party-location"><MapPin size={12} /> {currentShipment.destination}</div>
                                        </div>
                                    </section>
                                </div>

                                <div className="detail-col">
                                    <section className="detail-section-glass">
                                        <div className="section-title"><Package size={14} /> Inventory Breakdown</div>
                                        {currentShipment.packages && currentShipment.packages.length > 0 ? (
                                            <div className="pkg-list">
                                                {currentShipment.packages.map((p, i) => (
                                                    <div key={i} className="pkg-item">
                                                        <div className="pkg-main">{p.qty}x {p.type} - {p.description || 'General Cargo'}</div>
                                                        <div className="pkg-dims">
                                                            {p.length}×{p.width}×{p.height} cm • {p.weight} kg
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="empty-text">No package breakdown available.</p>
                                        )}
                                    </section>

                                    <section className="detail-section-glass">
                                        <div className="section-title"><Clock size={14} /> Tracking Timeline</div>
                                        {currentShipment.timeline && currentShipment.timeline.length > 0 ? (
                                            <div className="detail-timeline-custom">
                                                {currentShipment.timeline.map((t, i) => (
                                                    <div key={i} className="timeline-entry">
                                                        <div className="entry-dot"></div>
                                                        <div className="entry-body">
                                                            <div className="entry-meta">{t.date} • {t.time}</div>
                                                            <div className="entry-event">{t.event}</div>
                                                            {t.location && <div className="entry-loc"><MapPin size={10} /> {t.location}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="empty-text">Timeline has not been initiated.</p>
                                        )}
                                    </section>

                                    {currentShipment.comments && (
                                        <section className="detail-section-glass">
                                            <div className="section-title">Administrative Notes</div>
                                            <div className="notes-box">{currentShipment.comments}</div>
                                        </section>
                                    )}
                                </div>
                            </div>
                            
                            <div className="detail-footer">
                                <Link href={`/admin/add-shipment?edit=${currentShipment.tracking_id}`} className="btn-edit-full">
                                    <Edit size={16} /> Edit Complete Record
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                      <style jsx>{`
                .admin-section {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .registry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .title-area {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .title-icon {
                    color: var(--accent);
                    padding: 10px;
                    background: rgba(255, 90, 0, 0.1);
                    border-radius: 12px;
                }
                h1 {
                    font-size: 24px;
                    color: #ffffff;
                    margin: 0;
                    font-family: var(--font-heading);
                }
                p {
                    color: var(--text-muted);
                    margin: 5px 0 0 0;
                    font-size: 14px;
                }
                .btn-premium {
                    background: var(--accent);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 12px;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .btn-premium:hover {
                    background: var(--accent-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 90, 0, 0.3);
                }

                /* Panels */
                .glass-panel {
                    background: rgba(10, 10, 11, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                }
                .filter-panel {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    margin-bottom: 25px;
                    gap: 20px;
                }
                .search-box {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                }
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .search-box input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #ffffff;
                    padding: 12px 15px 12px 42px;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.3s;
                }
                .search-box input:focus {
                    border-color: var(--accent);
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 0 3px rgba(255, 90, 0, 0.1);
                }
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .select-wrapper {
                    position: relative;
                }
                .select-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .select-wrapper select {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #ffffff;
                    padding: 12px 35px 12px 40px;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    appearance: none;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .select-wrapper select:focus { border-color: var(--accent); }
                .select-wrapper select option { background: #ffffff; color: #000000; }
                .select-wrapper::after {
                    content: '▼';
                    font-size: 10px;
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .btn-refresh {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: var(--text-muted);
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-refresh:hover {
                    color: var(--accent);
                    border-color: var(--accent);
                    background: rgba(255, 90, 0, 0.05);
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* Table Styles */
                .table-container {
                    padding: 0;
                    overflow: hidden;
                    overflow-x: auto;
                }
                .premium-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .premium-table th {
                    background: rgba(0, 0, 0, 0.2);
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .premium-table td {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    vertical-align: middle;
                }
                .row-hover { transition: background 0.2s; }
                .row-hover:hover { background: rgba(255, 255, 255, 0.02); }
                
                .id-cell { display: flex; flex-direction: column; }
                .tracking-code { font-weight: 700; color: #fff; font-size: 0.95rem; }
                .timestamp { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
                
                .service-cell { display: flex; flex-direction: column; gap: 6px; }
                .service-tag {
                    font-size: 0.7rem;
                    font-weight: 800;
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    padding: 4px 8px;
                    border-radius: 6px;
                    width: fit-content;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .mode-label { font-size: 0.8rem; color: var(--accent); font-weight: 600; }
                
                .route-cell { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #fff; }
                .loc-box { display: flex; align-items: center; gap: 6px; }
                .loc-icon { color: var(--text-muted); }
                .route-line { width: 20px; height: 1px; background: rgba(255, 255, 255, 0.1); position: relative; }
                .route-line::after {
                    content: '▶'; font-size: 8px; color: rgba(255, 255, 255, 0.2);
                    position: absolute; right: -4px; top: -5px;
                }

                .status-pill {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    display: inline-block;
                }
                .status-pill.pending { background: rgba(241, 196, 15, 0.1); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.2); }
                .status-pill.picked-up { background: rgba(52, 152, 219, 0.1); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.2); }
                .status-pill.in-transit { background: rgba(155, 89, 182, 0.1); color: #9b59b6; border: 1px solid rgba(155, 89, 182, 0.2); }
                .status-pill.out-for-delivery { background: rgba(230, 126, 34, 0.1); color: #e67e22; border: 1px solid rgba(230, 126, 34, 0.2); }
                .status-pill.delivered { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); }
                .status-pill.on-hold { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.2); }
                .status-pill.returned { background: rgba(149, 165, 166, 0.1); color: #95a5a6; border: 1px solid rgba(149, 165, 166, 0.2); }
                .status-pill.cancelled { background: rgba(255, 255, 255, 0.05); color: #bdc3c7; border: 1px solid rgba(255, 255, 255, 0.1); }
                
                .parties-cell { display: flex; flex-direction: column; gap: 8px; }
                .party { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-muted); }
                .party span { color: #fff; }

                .actions-cell {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 8px;
                }
                .action-btn {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                    background: rgba(255, 90, 0, 0.05);
                }
                .action-btn.delete:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                }

                .empty-state { text-align: center; padding: 60px 20px !important; }
                .empty-icon { color: rgba(255, 255, 255, 0.05); margin-bottom: 20px; }
                .empty-state h3 { color: #fff; margin: 0 0 10px 0; font-size: 1.2rem; }
                .empty-state p { color: var(--text-muted); margin: 0; }
                .table-loader { text-align: center; padding: 60px 20px !important; }
                .premium-loader {
                    width: 40px; height: 40px;
                    border: 3px solid rgba(255,90,0,0.1);
                    border-top: 3px solid var(--accent);
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                }

                /* Modals */
                .admin-modal {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(5px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                }
                .admin-modal.show { opacity: 1; visibility: visible; }
                .glass-modal {
                    background: rgba(15, 15, 18, 0.95);
                    backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    width: 100%;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                }
                .admin-modal-header {
                    padding: 20px 25px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .admin-modal-header h3 { margin: 0; color: #fff; font-size: 1.2rem; }
                .admin-modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
                .admin-modal-close:hover { color: #fff; }
                .admin-modal-body { padding: 25px; }
                
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
                
                .modal-tracking-box {
                    background: rgba(255, 90, 0, 0.05);
                    border-left: 4px solid var(--accent);
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                }
                .modal-tracking-box span { font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; color: var(--accent); display: block; margin-bottom: 4px; }
                .modal-tracking-box h4 { margin: 0; font-size: 1.3rem; color: #fff; }
                
                .input-with-icon { position: relative; display: flex; align-items: center; }
                .input-with-icon :global(svg) { position: absolute; left: 14px; color: var(--text-muted); }
                .input-with-icon input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #fff;
                    padding: 12px 15px 12px 42px;
                    border-radius: 10px;
                    outline: none;
                    transition: 0.2s;
                }
                .input-with-icon input:focus { border-color: var(--accent); }
                .form-group textarea {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #fff;
                    padding: 15px;
                    border-radius: 10px;
                    outline: none;
                    transition: 0.2s;
                }
                .form-group textarea:focus { border-color: var(--accent); }
                
                .admin-select-modal {
                    width: 100%;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: #fff;
                    padding: 0 15px;
                    border-radius: 10px;
                    outline: none;
                    appearance: none;
                }
                .admin-select-modal option { background: var(--secondary); color: white; }

                /* Detail Modal Styles */
                .detail-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 25px; }
                .detail-section-glass { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
                .section-title { font-size: 0.75rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
                
                .info-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; }
                .info-item span { color: var(--text-muted); }
                .info-item strong { color: #fff; }
                .info-item .status-badge { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; text-transform: uppercase; }
                
                .party-box { padding: 15px; background: rgba(0, 0, 0, 0.2); border-radius: 12px; margin-bottom: 15px; }
                .party-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 1px; }
                .party-box h4 { margin: 0 0 4px 0; color: #fff; font-size: 1rem; }
                .party-box p { margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }
                .party-location { margin-top: 10px; font-size: 0.8rem; color: var(--accent); display: flex; align-items: center; gap: 6px; }
                
                .pkg-list { display: flex; flex-direction: column; gap: 12px; }
                .pkg-item { padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: 10px; border-left: 3px solid var(--accent); }
                .pkg-main { font-weight: 600; font-size: 0.9rem; color: #fff; margin-bottom: 4px; }
                .pkg-dims { font-size: 0.75rem; color: var(--text-muted); }
                
                .detail-timeline-custom { padding-left: 15px; position: relative; }
                .detail-timeline-custom::before { content: ''; position: absolute; left: 4px; top: 5px; bottom: 5px; width: 1px; background: rgba(255, 255, 255, 0.1); }
                .timeline-entry { position: relative; padding-bottom: 25px; }
                .timeline-entry:last-child { padding-bottom: 0; }
                .entry-dot { position: absolute; left: -15px; top: 6px; width: 9px; height: 9px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent); }
                .entry-meta { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px; }
                .entry-event { font-weight: 700; font-size: 0.9rem; color: #fff; margin-bottom: 4px; }
                .entry-loc { font-size: 0.75rem; color: var(--accent); display: flex; align-items: center; gap: 4px; }
                
                .notes-box { font-size: 0.85rem; font-style: italic; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; line-height: 1.6; }
                .detail-footer { margin-top: 25px; display: flex; justify-content: flex-end; }
                .btn-edit-full { background: var(--accent); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .btn-edit-full:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255, 90, 0, 0.3); }

                @media (max-width: 992px) {
                    .registry-header { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .filter-panel { flex-direction: column; align-items: stretch; gap: 15px; }
                    .search-box { max-width: 100%; }
                    .header-controls { width: 100%; justify-content: space-between; }
                }

                @media (max-width: 768px) {
                    .admin-section { padding: 15px; }
                    .premium-table thead { display: none; }
                    .premium-table tr { 
                        display: block; 
                        margin-bottom: 20px; 
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 15px;
                        padding: 15px;
                    }
                    .premium-table td { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center; 
                        padding: 10px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                        text-align: right;
                    }
                    .premium-table td:last-child { border-bottom: none; padding-top: 15px; justify-content: center; }
                    .premium-table td::before { 
                        content: attr(data-label); 
                        font-weight: 700; 
                        text-align: left; 
                        color: var(--accent);
                        font-size: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .id-cell, .service-cell, .route-cell, .parties-cell, .actions-cell { justify-content: flex-end; text-align: right; }
                    .route-cell { flex-direction: column; align-items: flex-end; gap: 5px; }
                    .route-line { width: 1px; height: 10px; margin: 0 6px 0 0; display: none; }
                    .actions-cell { width: 100%; gap: 12px; }
                    .action-btn { width: 44px; height: 44px; } /* Larger touch targets on mobile */

                    .glass-modal { width: 95%; margin: 10px; }
                    .detail-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 480px) {
                    .title-area h1 { font-size: 1.5rem; }
                    .btn-primary { width: 100%; justify-content: center; }
                    .premium-table td { flex-direction: column; align-items: flex-start; gap: 5px; text-align: left; }
                    .premium-table td::before { margin-bottom: 2px; }
                    .id-cell, .service-cell, .route-cell, .parties-cell, .actions-cell { align-items: flex-start; text-align: left; }
                }
            `}</style>
        </div>
    );
}
