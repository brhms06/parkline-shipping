'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';
import { Package, Search, Printer, MapPin, ArrowRight, Clock, CheckCircle, Truck, Plane, PauseCircle, Undo, XCircle, Upload, Download, Map as MapIcon, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';
import ScrollReveal from '@/components/ScrollReveal';

const ICONS = {
    air: 'https://maps.gstatic.com/mapfiles/ms2/micons/plane.png',
    sea: 'https://maps.gstatic.com/mapfiles/ms2/micons/ferry.png',
    land: 'https://maps.gstatic.com/mapfiles/ms2/micons/truck.png',
    box: 'https://maps.gstatic.com/mapfiles/ms2/micons/package.png'
};

const STATUS_CONFIG = {
    'pending': { icon: Clock, label: 'Pending', desc: 'Your shipment has been created and is awaiting pickup.', step: 0 },
    'picked-up': { icon: Package, label: 'Picked Up', desc: 'Package has been picked up from the sender.', step: 1 },
    'in-transit': { icon: Plane, label: 'In Transit', desc: 'Your shipment is on its way to the destination.', step: 2 },
    'out-for-delivery': { icon: Truck, label: 'Out for Delivery', desc: 'Package is out for delivery to the receiver.', step: 3 },
    'delivered': { icon: CheckCircle, label: 'Delivered', desc: 'Package has been delivered successfully.', step: 4 },
    'on-hold': { icon: PauseCircle, label: 'On Hold', desc: 'Shipment is on hold. Contact support for details.', step: -1 },
    'returned': { icon: Undo, label: 'Returned', desc: 'Package has been returned to the sender.', step: -1 },
    'cancelled': { icon: XCircle, label: 'Cancelled', desc: 'This shipment has been cancelled.', step: -1 }
};

const PROGRESS_STEPS = [
    { icon: Package, label: 'Created' },
    { icon: Package, label: 'Picked Up' },
    { icon: Plane, label: 'In Transit' },
    { icon: Truck, label: 'Out for Delivery' },
    { icon: CheckCircle, label: 'Delivered' }
];

export default function TrackPage() {
    const showToast = useToast();
    const [trackingId, setTrackingId] = useState('');
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    
    // Map state refs to avoid re-renders during animation
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const vehicleMarkerRef = useRef(null);
    const pathCoordsRef = useRef([]);
    const animationIndexRef = useRef(0);
    const animationIntervalRef = useRef(null);
    const subscriptionRef = useRef(null);

    const getIconForType = (type) => {
        if (!type) return ICONS.box;
        const t = type.toLowerCase();
        if (t.includes('air') || t.includes('plane') || t.includes('flight')) return ICONS.air;
        if (t.includes('sea') || t.includes('ocean') || t.includes('ship')) return ICONS.sea;
        if (t.includes('land') || t.includes('road') || t.includes('truck') ||
            t.includes('car') || t.includes('express') || t.includes('motor') ||
            t.includes('bike') || t.includes('ground')) return ICONS.land;
        return ICONS.box;
    };

    const buildCurvedPath = (start, end, numPoints) => {
        const points = [];
        const lat1 = start.lat(), lng1 = start.lng();
        const lat2 = end.lat(), lng2 = end.lng();
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const lat = lat1 + (lat2 - lat1) * t;
            const lng = lng1 + (lng2 - lng1) * t;
            const arc = Math.sin(Math.PI * t) * 0.15 * Math.abs(lat2 - lat1 + lng2 - lng1);
            points.push(new window.google.maps.LatLng(lat + arc, lng));
        }
        return points;
    };

    const updateMapAnimation = (status, type) => {
        if (!vehicleMarkerRef.current || !pathCoordsRef.current.length) return;

        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
        }

        const movingStatuses = ['in-transit', 'out-for-delivery', 'picked-up'];
        const isMoving = movingStatuses.includes(status);

        if (status === 'delivered') {
            animationIndexRef.current = pathCoordsRef.current.length - 1;
            vehicleMarkerRef.current.setPosition(pathCoordsRef.current[animationIndexRef.current]);
            return;
        }

        if (!isMoving) return;

        let targetPct = 80;
        if (status === 'picked-up') targetPct = 8;
        if (status === 'in-transit') targetPct = 80;
        if (status === 'out-for-delivery') targetPct = 97;

        const maxIndex = Math.floor((targetPct / 100) * (pathCoordsRef.current.length - 1));

        if (animationIndexRef.current >= maxIndex) return;

        animationIntervalRef.current = setInterval(() => {
            if (animationIndexRef.current < maxIndex) {
                animationIndexRef.current++;
                vehicleMarkerRef.current.setPosition(pathCoordsRef.current[animationIndexRef.current]);
            } else {
                clearInterval(animationIntervalRef.current);
                animationIntervalRef.current = null;
            }
        }, 1000);
    };

    const initMap = (s) => {
        if (!window.google || !mapRef.current) return;

        const geocoder = new window.google.maps.Geocoder();
        const map = new window.google.maps.Map(mapRef.current, {
            zoom: 3,
            center: { lat: 30, lng: 0 },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
                { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
                { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
                { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
                { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
                { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
                { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
                { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
                { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
                { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
                { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
                { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
                { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
                { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
            ]
        });
        googleMapRef.current = map;

        geocoder.geocode({ address: s.origin }, (r1, s1) => {
            if (s1 !== 'OK' || !r1[0]) return;
            const originCoords = r1[0].geometry.location;

            new window.google.maps.Marker({
                position: originCoords,
                map,
                icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', scaledSize: new window.google.maps.Size(36, 36) }
            });

            geocoder.geocode({ address: s.destination }, (r2, s2) => {
                if (s2 !== 'OK' || !r2[0]) return;
                const destCoords = r2[0].geometry.location;

                new window.google.maps.Marker({
                    position: destCoords,
                    map,
                    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', scaledSize: new window.google.maps.Size(36, 36) }
                });

                const pathCoords = buildCurvedPath(originCoords, destCoords, 600);
                pathCoordsRef.current = pathCoords;

                new window.google.maps.Polyline({
                    path: [originCoords, destCoords],
                    geodesic: true,
                    strokeColor: '#9ca3af',
                    strokeOpacity: 0,
                    icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.5, scale: 3 }, offset: '0', repeat: '18px' }],
                    map
                });

                new window.google.maps.Polyline({
                    path: pathCoords,
                    geodesic: true,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.85,
                    strokeWeight: 4,
                    map
                });

                const vehicleMarker = new window.google.maps.Marker({
                    position: originCoords,
                    map,
                    icon: {
                        url: getIconForType(s.type),
                        scaledSize: new window.google.maps.Size(48, 48),
                        anchor: new window.google.maps.Point(24, 24)
                    },
                    zIndex: 999
                });
                vehicleMarkerRef.current = vehicleMarker;

                // Initial position
                let pct = 0;
                if (s.status === 'pending') pct = 0;
                else if (s.status === 'picked-up') pct = 5;
                else if (s.status === 'in-transit') pct = 10;
                else if (s.status === 'out-for-delivery') pct = 78;
                else if (s.status === 'delivered') pct = 100;
                else pct = 40;
                
                animationIndexRef.current = Math.floor((pct / 100) * (pathCoords.length - 1));
                vehicleMarker.setPosition(pathCoords[animationIndexRef.current]);

                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(originCoords);
                bounds.extend(destCoords);
                map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

                updateMapAnimation(s.status, s.type);
            });
        });
    };

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!trackingId) return;

        setLoading(true);
        setNotFound(false);
        setShipment(null);

        const { data, error } = await supabase
            .from('shipments')
            .select('*')
            .eq('tracking_id', trackingId.toUpperCase())
            .single();

        setLoading(false);

        if (error || !data) {
            setNotFound(true);
            return;
        }

        setShipment(data);
        
        // Subscribe to changes
        if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = supabase
            .channel('shipment-status-' + data.tracking_id)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'shipments', filter: `tracking_id=eq.${data.tracking_id}` },
                payload => {
                    setShipment(payload.new);
                }
            )
            .subscribe();
    };

    useEffect(() => {
        if (shipment && window.google) {
            initMap(shipment);
        }
    }, [shipment?.tracking_id]); // Only re-init map if tracking ID changes

    useEffect(() => {
        if (shipment) {
            updateMapAnimation(shipment.status, shipment.type);
        }
    }, [shipment?.status]); // Update animation when status changes

    useEffect(() => {
        // Handle URL param
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('id');
        if (id) {
            setTimeout(() => setTrackingId(id), 0);
            // Trigger track automatically - need to wait for state update or pass directly
        }

        return () => {
            if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
            if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
        };
    }, []);

    const config = shipment ? (STATUS_CONFIG[shipment.status] || STATUS_CONFIG['pending']) : null;
    const StatusIcon = config?.icon;

    return (
        <>
            <Script 
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                strategy="afterInteractive"
            />

            {/* Page Banner */}
            <section className="page-banner" style={{ background: "linear-gradient(rgba(10,14,27,0.78), rgba(10,14,27,0.78)), url('https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=1470')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="container">
                    <h1>TRACK YOUR SHIPMENT</h1>
                    <p>Enter your tracking number below to get real-time updates on your shipment status.</p>
                </div>
            </section>

            <section className="track-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="track-form-container">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Package /> Shipment Tracker</h2>
                            <p>Enter your tracking ID to see detailed shipment information, live status updates, and route map.</p>
                            <form onSubmit={handleTrack}>
                                <div className="track-input-group">
                                    <input 
                                        type="text" 
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        placeholder="Enter tracking number (e.g., PRLS-47392-81045)" 
                                        required 
                                        autoComplete="off" 
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Searching...' : 'Track'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </ScrollReveal>

                    {notFound && (
                        <div id="trackNoResult">
                            <div className="track-form-container" style={{ textAlign: 'center', padding: '50px 30px', marginTop: '30px' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Search size={64} /></div>
                                <h3 style={{ marginBottom: '10px', fontSize: '1.3rem' }}>No Shipment Found</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Please double-check your tracking number and try again. If the issue persists, <a href="/contact" style={{ color: 'var(--accent)' }}>contact our support team</a>.</p>
                            </div>
                        </div>
                    )}

                    {shipment && (
                        <div id="trackResult">
                            <div className="invoice-container" id="invoiceContainer">
                                <div className="invoice-header">
                                    <div className="logo-side">
                                        <div className="logo-box" style={{ width: '36px', height: '36px', fontFamily: "'Archivo', sans-serif", fontStyle: 'italic', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-1px', borderRadius: '8px' }}>P</div>
                                        <h2 style={{ fontWeight: 700, letterSpacing: '0.5px' }}>Parkline<span>Shipping</span></h2>
                                    </div>
                                    <div className="tracking-num">
                                        <h3>{shipment.tracking_id}</h3>
                                        <p>{shipment.type || 'Standard Shipment'}</p>
                                    </div>
                                </div>

                                <div className="invoice-body">
                                    {/* Status Banner */}
                                    <div className={`status-banner ${shipment.status}`}>
                                        <span className="status-icon">{StatusIcon && <StatusIcon size={24} />}</span>
                                        <div className="status-text">
                                            <strong>{config.label}</strong>
                                            <span>{config.desc}</span>
                                        </div>
                                    </div>

                                    {/* Progress Tracker */}
                                    <div className="progress-tracker">
                                        <div className="progress-fill" style={{ width: `calc(${config.step >= 4 ? 100 : (config.step / 4) * 100}% - 30px)` }}></div>
                                        {PROGRESS_STEPS.map((ps, i) => {
                                            const isDone = i < config.step;
                                            const isCurrent = i === config.step;
                                            const StepIcon = ps.icon;
                                            return (
                                                <div key={i} className={`progress-step ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>
                                                    <div className="step-dot">
                                                        {isDone ? <Check size={18} /> : <StepIcon size={18} />}
                                                    </div>
                                                    <div className="step-label">{ps.label}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Invoice Details */}
                                    <div className="invoice-grid">
                                        <div className="invoice-block">
                                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Upload size={14} /> Sender Information</h4>
                                            <div className="detail-row"><label>Name</label><span>{shipment.sender || '—'}</span></div>
                                            <div className="detail-row"><label>Email</label><span>{shipment.sender_email || '—'}</span></div>
                                            <div className="detail-row"><label>Phone</label><span>{shipment.sender_number || '—'}</span></div>
                                            <div className="detail-row"><label>Origin</label><span>{shipment.origin || '—'}</span></div>
                                        </div>
                                        <div className="invoice-block">
                                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={14} /> Receiver Information</h4>
                                            <div className="detail-row"><label>Name</label><span>{shipment.receiver || '—'}</span></div>
                                            <div className="detail-row"><label>Email</label><span>{shipment.receiver_email || '—'}</span></div>
                                            <div className="detail-row"><label>Phone</label><span>{shipment.receiver_number || '—'}</span></div>
                                            <div className="detail-row"><label>Destination</label><span>{shipment.destination || '—'}</span></div>
                                        </div>
                                    </div>

                                    {/* Package Details */}
                                    <table className="package-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th>Weight</th>
                                                <th>Ship Date</th>
                                                <th>Est. Delivery</th>
                                                <th>Type</th>
                                                <th>Piece Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td data-label="Description">{shipment.description || 'Standard Package'}</td>
                                                <td data-label="Weight">{shipment.weight ? shipment.weight + ' kg' : 'N/A'}</td>
                                                <td data-label="Ship Date">{shipment.ship_date ? new Date(shipment.ship_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                                                <td data-label="Est. Delivery">{shipment.delivery_date ? new Date(shipment.delivery_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + (shipment.delivery_time ? ' at ' + shipment.delivery_time : '') : 'N/A'}</td>
                                                <td data-label="Type">{shipment.type || 'Standard'}</td>
                                                <td data-label="Piece Type">{shipment.piece_type || '—'}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Timeline */}
                                    <div className="invoice-timeline">
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} /> Shipment Timeline</h4>
                                        <div id="invTimeline">
                                            {shipment.timeline && shipment.timeline.length > 0 ? (
                                                shipment.timeline.map((item, i) => (
                                                    <div key={i} className={`inv-tl-item ${i === 0 ? 'latest' : ''}`}>
                                                        <div className="tl-date">
                                                            {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}<br />
                                                            <small>{item.time || ''}</small>
                                                        </div>
                                                        <div className="tl-info">
                                                            <div className="tl-event">{item.event || ''}</div>
                                                            <div className="tl-loc">
                                                                {item.location && <><MapPin size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {item.location}</>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No timeline events yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="invoice-footer">
                                    <div>
                                        <span className="powered">Parkline Shipping</span> - Express Logistics & Freight Delivery
                                    </div>
                                    <button className="print-btn" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Printer size={16} /> Print Invoice
                                    </button>
                                </div>
                            </div>

                            {/* Google Maps Route */}
                            <div className="map-container">
                                <div className="map-header">
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapIcon size={18} /> Live <span>Route Map</span></h3>
                                    <div className="route-info">
                                        {shipment.origin} <ArrowRight size={14} style={{ verticalAlign: 'middle', margin: '0 8px' }} /> {shipment.destination}
                                    </div>
                                </div>
                                <div className="map-iframe-wrap">
                                    <div ref={mapRef} style={{ width: '100%', height: '450px' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="cta-box">
                            <h2>Need Help With Your Shipment?</h2>
                            <p>Our support team is available 24/7 to assist you with any questions about your delivery.</p>
                            <a href="/contact" className="btn btn-white" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                Contact Support <ArrowRight size={18} />
                            </a>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
