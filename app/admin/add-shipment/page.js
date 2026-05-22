'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { 
    Save, X, PlusCircle, Trash2, 
    User, MapPin, Box, Truck, 
    Calendar, Clock, DollarSign, 
    MessageSquare, Package, 
    ArrowRight, Info, Plus, ChevronLeft
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

const packageSchema = z.object({
    qty: z.union([z.string(), z.number()]).transform(v => parseInt(v) || 1),
    type: z.string().optional(),
    length: z.union([z.string(), z.number()]).optional(),
    width: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
    weight: z.union([z.string(), z.number()]).optional(),
    description: z.string().optional()
});

const timelineSchema = z.object({
    date: z.string().min(1, "Event date is required"),
    time: z.string().optional(),
    event: z.string().min(1, "Event description is required"),
    location: z.string().optional()
});

const shipmentSchema = z.object({
    tracking_id: z.string().optional(),
    type: z.string().min(1, "Transport mode is required"),
    shipment_mode: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    carrier: z.string().optional(),
    carrier_ref_no: z.string().optional(),
    
    sender: z.string().min(1, "Sender name is required"),
    sender_email: z.union([z.string().email("Invalid sender email"), z.literal(''), z.null()]).optional(),
    sender_number: z.string().optional(),
    receiver: z.string().min(1, "Receiver name is required"),
    receiver_email: z.union([z.string().email("Invalid receiver email"), z.literal(''), z.null()]).optional(),
    receiver_number: z.string().optional(),
    
    origin: z.string().min(1, "Origin terminal/city is required"),
    destination: z.string().min(1, "Destination terminal/city is required"),
    
    product: z.string().optional(),
    qty: z.union([z.string(), z.number()]).transform(v => parseInt(v) || 1),
    weight: z.union([z.string(), z.number()]).transform(v => parseFloat(v) || 0),
    piece_type: z.string().optional(),
    description: z.string().optional(),
    
    ship_date: z.string().min(1, "Shipment date is required"),
    delivery_date: z.string().nullable().optional(),
    delivery_time: z.string().nullable().optional(),
    departure_time: z.string().nullable().optional(),
    pickup_date: z.string().nullable().optional(),
    pickup_time: z.string().nullable().optional(),
    
    payment_mode: z.string().optional(),
    total_freight: z.union([z.string(), z.number()]).transform(v => parseFloat(v) || 0),
    comments: z.string().optional(),
    
    packages: z.array(packageSchema).optional(),
    timeline: z.array(timelineSchema).optional()
});

export default function AddShipment() {
    const showToast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [formData, setFormData] = useState({
        tracking_id: '',
        type: '',
        shipment_mode: '',
        status: 'pending',
        carrier: '',
        carrier_ref_no: '',
        
        sender: '',
        sender_email: '',
        sender_number: '',
        receiver: '',
        receiver_email: '',
        receiver_number: '',
        
        origin: '',
        destination: '',
        
        product: '',
        qty: '1',
        weight: '',
        piece_type: '',
        description: '',
        
        ship_date: '',
        delivery_date: '',
        delivery_time: '',
        departure_time: '',
        pickup_date: '',
        pickup_time: '',
        
        payment_mode: '',
        total_freight: '',
        comments: '',
        
        packages: [],
        timeline: []
    });

    async function fetchShipment(id) {
        setFetching(true);
        const { data, error } = await supabase
            .from('shipments')
            .select('*')
            .eq('tracking_id', id)
            .single();
        
        if (error) {
            showToast('Error loading shipment: ' + error.message, 'error');
            router.push('/admin/shipments');
        } else {
            // Sanitize data: replace null values with empty strings to avoid React controlled input warnings
            const sanitizedData = {};
            Object.keys(data).forEach(key => {
                sanitizedData[key] = data[key] === null ? '' : data[key];
            });

            setFormData({
                ...sanitizedData,
                qty: data.qty?.toString() || '1',
                weight: data.weight?.toString() || '',
                total_freight: data.total_freight?.toString() || '',
                packages: data.packages || [],
                timeline: data.timeline || []
            });
        }
        setFetching(false);
    }

    useEffect(() => {
        if (editId) {
            setTimeout(() => fetchShipment(editId), 0);
        }
    }, [editId]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // --- Package Management ---
    const addPackageRow = () => {
        const newPackage = {
            qty: '1',
            type: formData.piece_type || 'Crate',
            description: '',
            length: '',
            width: '',
            height: '',
            weight: ''
        };
        setFormData(prev => ({ ...prev, packages: [...prev.packages, newPackage] }));
    };

    const removePackageRow = (index) => {
        const newPackages = [...formData.packages];
        newPackages.splice(index, 1);
        setFormData(prev => ({ ...prev, packages: newPackages }));
    };

    const handlePackageChange = (index, field, value) => {
        const newPackages = [...formData.packages];
        newPackages[index][field] = value;
        setFormData(prev => ({ ...prev, packages: newPackages }));
    };

    // --- Timeline Management ---
    const addTimelineRow = () => {
        const now = new Date();
        const newRow = {
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            event: '',
            location: formData.origin || ''
        };
        setFormData(prev => ({ ...prev, timeline: [newRow, ...prev.timeline] }));
    };

    const removeTimelineRow = (index) => {
        const newTimeline = [...formData.timeline];
        newTimeline.splice(index, 1);
        setFormData(prev => ({ ...prev, timeline: newTimeline }));
    };

    const handleTimelineChange = (index, field, value) => {
        const newTimeline = [...formData.timeline];
        newTimeline[index][field] = value;
        setFormData(prev => ({ ...prev, timeline: newTimeline }));
    };

    const generateId = async () => {
        const { data } = await supabase.from('shipments').select('tracking_id');
        const existing = new Set(data?.map(s => s.tracking_id) || []);
        let id;
        do {
            const p1 = String(Math.floor(10000 + Math.random() * 90000));
            const p2 = String(Math.floor(10000 + Math.random() * 90000));
            id = `PRLS-${p1}-${p2}`;
        } while (existing.has(id));
        return id;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const trackingId = editId || await generateId();
            const rawData = {
                ...formData,
                tracking_id: trackingId,
                packages: formData.packages,
                timeline: formData.timeline.filter(t => t.event)
            };

            // Auto-add "Shipment Created" timeline if new and no timeline
            if (!editId && rawData.timeline.length === 0) {
                const now = new Date();
                rawData.timeline = [{
                    date: now.toISOString().split('T')[0],
                    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                    event: 'Shipment created',
                    location: rawData.origin || ''
                }];
            }

            const validationResult = shipmentSchema.safeParse(rawData);
            
            if (!validationResult.success) {
                const firstError = validationResult.error.issues[0];
                let fieldName = firstError.path.join('.');
                showToast(`Validation Error: ${firstError.message} (${fieldName})`, 'error');
                setLoading(false);
                return;
            }

            const submissionData = validationResult.data;

            let error;
            if (editId) {
                const { error: err } = await supabase
                    .from('shipments')
                    .update(submissionData)
                    .eq('tracking_id', editId);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('shipments')
                    .insert([submissionData]);
                error = err;
            }

            if (error) throw error;

            showToast(editId ? 'Shipment Record Updated' : 'New Shipment Registered', 'success');
            router.push('/admin/shipments');
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="admin-section active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="admin-section active">
            <div className="form-header-premium">
                <div className="header-left">
                    <Link href="/admin/shipments" className="btn-back-circle">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="premium-title">{editId ? 'Update Record' : 'New Shipment'}</h2>
                        <p className="premium-subtitle">{editId ? `Editing tracking: ${editId}` : 'Register a new cargo shipment in the system'}</p>
                    </div>
                </div>
                <div className="header-right">
                    <button type="button" className="btn-cancel-glass" onClick={() => router.push('/admin/shipments')}>
                        Discard
                    </button>
                    <button form="shipmentForm" type="submit" className="btn-save-premium" disabled={loading}>
                        {loading ? 'Processing...' : <><Save size={18} /> {editId ? 'Update Record' : 'Register Shipment'}</>}
                    </button>
                </div>
            </div>

            <form id="shipmentForm" className="premium-admin-form" onSubmit={handleSubmit}>
                <div className="form-grid-layout">
                    {/* LEFT COLUMN: CORE INFO & CONTACTS */}
                    <div className="form-column">
                        {/* Section: Logistics Overview */}
                        <div className="form-card-glass">
                            <div className="card-header-clean">
                                <Truck size={18} color="var(--accent)" />
                                <h3>Shipment Parameters</h3>
                            </div>
                            <div className="card-body-clean">
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Current Status</label>
                                        <select id="status" value={formData.status} onChange={handleChange} required className="input-premium">
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
                                    <div className="form-group-clean">
                                        <label>Transport Mode</label>
                                        <select id="type" value={formData.type} onChange={handleChange} required className="input-premium">
                                            <option value="">Select mode</option>
                                            <option value="Air Freight">Air Freight</option>
                                            <option value="Sea Freight">Sea Freight</option>
                                            <option value="Land Transport">Land Transport</option>
                                            <option value="Express Courier">Express Courier</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Service Class</label>
                                        <input type="text" id="shipment_mode" value={formData.shipment_mode} onChange={handleChange} placeholder="e.g. Express, Priority" className="input-premium" />
                                    </div>
                                    <div className="form-group-clean">
                                        <label>Carrier Name</label>
                                        <input type="text" id="carrier" value={formData.carrier} onChange={handleChange} placeholder="Internal or External Carrier" className="input-premium" />
                                    </div>
                                </div>
                                <div className="form-group-clean">
                                    <label>Carrier Reference / External ID</label>
                                    <input type="text" id="carrier_ref_no" value={formData.carrier_ref_no} onChange={handleChange} placeholder="External tracking number if applicable" className="input-premium" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Route & Location */}
                        <div className="form-card-glass">
                            <div className="card-header-clean">
                                <MapPin size={18} color="var(--accent)" />
                                <h3>Route Information</h3>
                            </div>
                            <div className="card-body-clean">
                                <div className="form-group-clean">
                                    <label>Origin Terminal / City *</label>
                                    <div className="input-icon-wrap">
                                        <MapPin size={14} />
                                        <input type="text" id="origin" value={formData.origin} onChange={handleChange} placeholder="City, State, Country" required className="input-premium has-icon" />
                                    </div>
                                </div>
                                <div className="form-group-clean">
                                    <label>Destination Terminal / City *</label>
                                    <div className="input-icon-wrap">
                                        <MapPin size={14} />
                                        <input type="text" id="destination" value={formData.destination} onChange={handleChange} placeholder="City, State, Country" required className="input-premium has-icon" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Contacts */}
                        <div className="form-card-glass">
                            <div className="card-header-clean">
                                <User size={18} color="var(--accent)" />
                                <h3>Party Details</h3>
                            </div>
                            <div className="card-body-clean">
                                <div className="party-split">
                                    <div className="party-section">
                                        <h5 className="mini-heading">Sender</h5>
                                        <input type="text" id="sender" value={formData.sender} onChange={handleChange} placeholder="Name" required className="input-premium compact" />
                                        <input type="email" id="sender_email" value={formData.sender_email} onChange={handleChange} placeholder="Email" className="input-premium compact" />
                                        <input type="tel" id="sender_number" value={formData.sender_number} onChange={handleChange} placeholder="Phone" className="input-premium compact" />
                                    </div>
                                    <div className="party-divider"></div>
                                    <div className="party-section">
                                        <h5 className="mini-heading">Receiver</h5>
                                        <input type="text" id="receiver" value={formData.receiver} onChange={handleChange} placeholder="Name" required className="input-premium compact" />
                                        <input type="email" id="receiver_email" value={formData.receiver_email} onChange={handleChange} placeholder="Email" className="input-premium compact" />
                                        <input type="tel" id="receiver_number" value={formData.receiver_number} onChange={handleChange} placeholder="Phone" className="input-premium compact" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CARGO & LOGISTICS */}
                    <div className="form-column">
                        {/* Section: Cargo Details */}
                        <div className="form-card-glass">
                            <div className="card-header-clean">
                                <Box size={18} color="var(--accent)" />
                                <h3>Cargo & Inventory</h3>
                            </div>
                            <div className="card-body-clean">
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Commodity / Product</label>
                                        <input type="text" id="product" value={formData.product} onChange={handleChange} placeholder="e.g. Electronics" className="input-premium" />
                                    </div>
                                    <div className="form-group-clean">
                                        <label>Default Packaging</label>
                                        <input type="text" id="piece_type" value={formData.piece_type} onChange={handleChange} placeholder="Carton, Pallet" className="input-premium" />
                                    </div>
                                </div>
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Total Qty</label>
                                        <input type="number" id="qty" value={formData.qty} onChange={handleChange} className="input-premium" />
                                    </div>
                                    <div className="form-group-clean">
                                        <label>Total Weight (kg)</label>
                                        <input type="number" id="weight" value={formData.weight} onChange={handleChange} step="0.01" className="input-premium" />
                                    </div>
                                </div>
                                
                                <div className="package-breakdown-box">
                                    <div className="box-header">
                                        <span>Detailed Itemization</span>
                                        <button type="button" className="btn-add-mini" onClick={addPackageRow}><Plus size={12} /> Add Item</button>
                                    </div>
                                    
                                    <div className="package-table-scroll">
                                        <table className="mini-table">
                                            <thead>
                                                <tr>
                                                    <th>Qty</th>
                                                    <th>Type</th>
                                                    <th>Dims (cm)</th>
                                                    <th>Wt</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.packages.map((pkg, idx) => (
                                                    <tr key={idx}>
                                                        <td data-label="Qty"><input type="number" value={pkg.qty} onChange={(e) => handlePackageChange(idx, 'qty', e.target.value)} className="mini-input" /></td>
                                                        <td data-label="Type"><input type="text" value={pkg.type} onChange={(e) => handlePackageChange(idx, 'type', e.target.value)} className="mini-input" /></td>
                                                        <td data-label="Dims (cm)">
                                                            <div className="dims-flex">
                                                                <input type="number" value={pkg.length} onChange={(e) => handlePackageChange(idx, 'length', e.target.value)} placeholder="L" className="mini-input" />
                                                                <input type="number" value={pkg.width} onChange={(e) => handlePackageChange(idx, 'width', e.target.value)} placeholder="W" className="mini-input" />
                                                                <input type="number" value={pkg.height} onChange={(e) => handlePackageChange(idx, 'height', e.target.value)} placeholder="H" className="mini-input" />
                                                            </div>
                                                        </td>
                                                        <td data-label="Weight"><input type="number" value={pkg.weight} onChange={(e) => handlePackageChange(idx, 'weight', e.target.value)} className="mini-input" /></td>
                                                        <td><button type="button" className="btn-del-mini" onClick={() => removePackageRow(idx)}><Trash2 size={12} /></button></td>
                                                    </tr>
                                                ))}
                                                {formData.packages.length === 0 && (
                                                    <tr><td colSpan="5" className="empty-mini">No items added</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Logistics & Financials */}
                        <div className="form-card-glass">
                            <div className="card-header-clean">
                                <Calendar size={18} color="var(--accent)" />
                                <h3>Logistics Schedule</h3>
                            </div>
                            <div className="card-body-clean">
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Pickup Date</label>
                                        <input type="date" id="pickup_date" value={formData.pickup_date} onChange={handleChange} className="input-premium" />
                                    </div>
                                    <div className="form-group-clean">
                                        <label>Pickup Time</label>
                                        <input type="text" id="pickup_time" value={formData.pickup_time} onChange={handleChange} placeholder="10:00 AM" className="input-premium" />
                                    </div>
                                </div>
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Shipment Date</label>
                                        <input type="date" id="ship_date" value={formData.ship_date} onChange={handleChange} required className="input-premium" />
                                    </div>
                                    <div className="form-group-clean">
                                        <label>Estimated Delivery</label>
                                        <input type="date" id="delivery_date" value={formData.delivery_date} onChange={handleChange} className="input-premium" />
                                    </div>
                                </div>
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Departure Time</label>
                                        <input type="text" id="departure_time" value={formData.departure_time} onChange={handleChange} placeholder="08:00 AM" className="input-premium" />
                                    </div>
                                    <div className="form-group-clean">
                                        <label>Delivery Time</label>
                                        <input type="text" id="delivery_time" value={formData.delivery_time} onChange={handleChange} placeholder="04:00 PM" className="input-premium" />
                                    </div>
                                </div>
                                <div className="form-row-custom">
                                    <div className="form-group-clean">
                                        <label>Total Freight Cost</label>
                                        <div className="input-icon-wrap">
                                            <DollarSign size={14} />
                                            <input type="number" id="total_freight" value={formData.total_freight} onChange={handleChange} step="0.01" className="input-premium has-icon" />
                                        </div>
                                    </div>
                                    <div className="form-group-clean">
                                        <label>Payment Method</label>
                                        <select id="payment_mode" value={formData.payment_mode} onChange={handleChange} className="input-premium">
                                            <option value="">Select method</option>
                                            <option value="CASH">CASH</option>
                                            <option value="BANK TRANSFER">BANK TRANSFER</option>
                                            <option value="CREDIT CARD">CREDIT CARD</option>
                                            <option value="ON DELIVERY">ON DELIVERY</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Timeline Editor */}
                        <div className="form-card-glass">
                            <div className="card-header-clean">
                                <Clock size={18} color="var(--accent)" />
                                <h3>Tracking Timeline</h3>
                                <button type="button" className="btn-add-mini" style={{ marginLeft: 'auto' }} onClick={addTimelineRow}><Plus size={12} /> New Event</button>
                            </div>
                            <div className="card-body-clean">
                                <div className="timeline-editor-list">
                                    {formData.timeline.map((item, idx) => (
                                        <div key={idx} className="timeline-edit-row">
                                            <div className="time-edit-meta">
                                                <input type="date" value={item.date} onChange={(e) => handleTimelineChange(idx, 'date', e.target.value)} className="mini-input-flat" />
                                                <input type="text" value={item.time} onChange={(e) => handleTimelineChange(idx, 'time', e.target.value)} placeholder="Time" className="mini-input-flat" />
                                            </div>
                                            <div className="time-edit-main">
                                                <input type="text" value={item.event} onChange={(e) => handleTimelineChange(idx, 'event', e.target.value)} placeholder="Event description" className="mini-input-flat bold" />
                                                <input type="text" value={item.location} onChange={(e) => handleTimelineChange(idx, 'location', e.target.value)} placeholder="Location" className="mini-input-flat" />
                                            </div>
                                            <button type="button" className="btn-del-mini" onClick={() => removeTimelineRow(idx)}><X size={14} /></button>
                                        </div>
                                    ))}
                                    {formData.timeline.length === 0 && <p className="empty-mini">No tracking events recorded.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-footer-premium">
                    <div className="admin-notes-premium">
                        <label>Internal Administrator Notes</label>
                        <textarea id="comments" value={formData.comments} onChange={handleChange} placeholder="Private notes, internal handling instructions, etc..." rows="3"></textarea>
                    </div>
                </div>
            </form>

            <style jsx>{`
                .form-header-premium {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 40px;
                    padding: 0 5px;
                }
                .header-left { display: flex; align-items: center; gap: 20px; }
                .btn-back-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--secondary);
                    transition: all 0.2s;
                }
                .btn-back-circle:hover { background: rgba(255, 255, 255, 0.1); color: var(--accent); }
                
                .premium-title { font-size: 2rem; margin: 0; color: #fff; }
                .premium-subtitle { font-size: 0.9rem; color: var(--text-muted); margin: 5px 0 0 0; }
                
                .header-right { display: flex; gap: 15px; }
                .btn-cancel-glass {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--glass-border);
                    color: #fff;
                    padding: 0 25px;
                    height: 48px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cancel-glass:hover { background: rgba(255, 255, 255, 0.08); }
                .btn-save-premium {
                    background: var(--accent);
                    color: #fff;
                    border: none;
                    padding: 0 30px;
                    height: 48px;
                    border-radius: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-save-premium:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255, 90, 0, 0.4); }
                .btn-save-premium:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

                .form-grid-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }

                .form-card-glass {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 30px;
                    backdrop-filter: blur(10px);
                }
                .card-header-clean {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 25px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .card-header-clean h3 { margin: 0; font-size: 1rem; color: #fff; text-transform: uppercase; letter-spacing: 1px; }

                .form-row-custom { display: flex; gap: 20px; }
                .form-group-clean { flex: 1; margin-bottom: 20px; }
                .form-group-clean label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }

                .input-premium {
                    width: 100%;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 0 16px;
                    color: #fff;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }
                .input-premium:focus { outline: none; border-color: var(--accent); background: rgba(255, 255, 255, 0.06); }
                .input-premium option { background-color: #0a0e1b; color: #fff; }
                .input-premium.compact { height: 42px; margin-bottom: 10px; }
                
                .input-icon-wrap { position: relative; }
                .input-icon-wrap :global(svg) { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
                .input-premium.has-icon { padding-left: 44px; }

                .party-split { display: flex; gap: 25px; }
                .party-section { flex: 1; }
                .party-divider { width: 1px; background: rgba(255, 255, 255, 0.05); }
                .mini-heading { font-size: 0.7rem; color: var(--accent); margin: 0 0 15px 0; font-weight: 800; text-transform: uppercase; }

                .package-breakdown-box {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 15px;
                    padding: 15px;
                    margin-top: 10px;
                }
                .box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .box-header span { font-size: 0.8rem; font-weight: 700; color: #fff; }
                .btn-add-mini {
                    background: rgba(255, 90, 0, 0.1);
                    color: var(--accent);
                    border: 1px solid rgba(255, 90, 0, 0.2);
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .btn-add-mini:hover { background: var(--accent); color: #fff; }

                .mini-table { width: 100%; border-collapse: collapse; }
                .mini-table th { text-align: left; font-size: 0.7rem; color: var(--text-muted); padding: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
                .mini-table td { padding: 8px 4px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
                .mini-input { width: 100%; background: transparent; border: 1px solid transparent; color: #fff; font-size: 0.85rem; padding: 4px; border-radius: 4px; }
                .mini-input:focus { background: rgba(255,255,255,0.05); border-color: var(--accent); outline: none; }
                .dims-flex { display: flex; gap: 4px; }
                .btn-del-mini { background: transparent; border: none; color: #ef4444; opacity: 0.5; cursor: pointer; }
                .btn-del-mini:hover { opacity: 1; }
                .empty-mini { text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px; }

                .timeline-editor-list { display: flex; flex-direction: column; gap: 15px; }
                .timeline-edit-row {
                    display: flex;
                    gap: 15px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    align-items: center;
                }
                .time-edit-meta { width: 120px; display: flex; flex-direction: column; gap: 5px; }
                .time-edit-main { flex: 1; display: flex; flex-direction: column; gap: 5px; }
                .mini-input-flat { background: transparent; border: none; color: var(--text-muted); font-size: 0.75rem; padding: 2px 0; outline: none; border-bottom: 1px solid transparent; }
                .mini-input-flat:focus { color: #fff; border-bottom-color: var(--accent); }
                .mini-input-flat.bold { font-weight: 700; color: #fff; font-size: 0.85rem; }

                .admin-notes-premium {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 25px;
                }
                .admin-notes-premium label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--accent); text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px; }
                .admin-notes-premium textarea { width: 100%; background: transparent; border: none; color: #fff; font-size: 0.95rem; resize: none; outline: none; line-height: 1.6; }

                @media (max-width: 1024px) {
                    .form-grid-layout { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .form-header-premium { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .header-right { width: 100%; display: flex; gap: 10px; }
                    .btn-save-premium { flex: 1; justify-content: center; }
                    .form-row-custom { flex-direction: column; gap: 0; }
                    .party-split { flex-direction: column; }
                    .party-divider { height: 1px; width: 100%; margin: 10px 0; }
                    
                    /* Mini Table Responsiveness */
                    .mini-table thead { display: none; }
                    .mini-table tr { display: block; margin-bottom: 15px; background: rgba(255,255,255,0.02); border-radius: 8px; padding: 10px; }
                    .mini-table td { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border: none; }
                    .mini-table td::before { content: attr(data-label); font-size: 0.65rem; font-weight: 700; color: var(--accent); text-transform: uppercase; }
                    .mini-input { text-align: right; width: auto; max-width: 60%; }
                    .dims-flex { justify-content: flex-end; }
                    
                    .timeline-edit-row { flex-direction: column; align-items: stretch; }
                    .time-edit-meta { width: 100%; }
                }

                @media (max-width: 480px) {
                    .glass-card-premium { padding: 15px; }
                    .input-premium { font-size: 0.85rem; }
                    .mini-heading { font-size: 0.65rem; }
                    .header-right { flex-direction: column; }
                    .btn-back-clean { order: 2; width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
}
