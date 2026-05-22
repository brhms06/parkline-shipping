'use client';

import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, CheckCircle, ClipboardCheck, Plane, Ship, Truck, Warehouse } from 'lucide-react';
import Link from 'next/link';

const services = [
    {
        icon: Plane,
        title: 'Air Freight & Express Cargo',
        caption: 'Priority and international',
        text: 'Fast air freight coordination for urgent cargo, with route notes and updates from booking through arrival.',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200',
        features: ['Flight-aware tracking', 'Door-to-door options', 'Sensitive cargo handling', 'Priority support']
    },
    {
        icon: Ship,
        title: 'Sea Freight Coordination',
        caption: 'Container and bulk movement',
        text: 'International sea freight planning for larger shipments, supported by documentation and milestone visibility.',
        image: 'https://images.unsplash.com/photo-1494412574021-746bbdb2483b?auto=format&fit=crop&q=80&w=1200',
        features: ['Container options', 'Customs guidance', 'Consolidation support', 'Port coordination']
    },
    {
        icon: Truck,
        title: 'Road Freight & Final Mile',
        caption: 'Local and regional delivery',
        text: 'Reliable road transport for parcels, pallets, and scheduled business deliveries with proof-of-delivery workflows.',
        image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=1200',
        features: ['Tracked fleet partners', 'Last-mile delivery', 'Scheduled collection', 'Regional hubs']
    },
    {
        icon: ClipboardCheck,
        title: 'Customs & Documentation',
        caption: 'Cross-border support',
        text: 'Practical paperwork support to reduce avoidable delays when goods move between countries.',
        image: 'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&q=80&w=1200',
        features: ['Document review', 'Classification support', 'Export notes', 'Warehouse coordination']
    },
];

export default function ServicesPage() {
    return (
        <>
            <section className="xpo-page-hero xpo-page-hero-services">
                <div className="container">
                    <div className="xpo-page-copy">
                        <span>Services</span>
                        <h1>Logistics options built around your deadline.</h1>
                        <p>Parkline Shipping keeps the same tracking and admin functionality while giving each shipment a clearer movement plan.</p>
                    </div>
                </div>
            </section>

            <section className="xpo-service-detail-section">
                <div className="container">
                    {services.map((service, index) => (
                        <ScrollReveal key={service.title} className="xpo-service-detail">
                            <div className="xpo-service-detail-image">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={service.image} alt={service.title} />
                                <span>{String(index + 1).padStart(2, '0')}</span>
                            </div>
                            <div className="xpo-service-detail-copy">
                                <div className="xpo-icon-chip"><service.icon size={20} /> {service.caption}</div>
                                <h2>{service.title}</h2>
                                <p>{service.text}</p>
                                <div className="xpo-feature-list">
                                    {service.features.map((feature) => (
                                        <span key={feature}><CheckCircle size={16} /> {feature}</span>
                                    ))}
                                </div>
                                <Link href="/contact" className="btn btn-primary">Book This Service <ArrowRight size={18} /></Link>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="xpo-process xpo-process-light">
                <div className="container">
                    <div className="xpo-centered-heading">
                        <div className="xpo-section-kicker">How It Works</div>
                        <h2>From quote request to confirmed delivery.</h2>
                    </div>
                    <div className="xpo-process-line">
                        {[
                            ['Request a Quote', 'Tell us your route, shipment size, and delivery window.'],
                            ['We Collect', 'A suitable carrier or courier is assigned to the shipment.'],
                            ['Track Progress', 'Follow active milestones through the tracking page.'],
                            ['Delivery Confirmed', 'The receiver gets the shipment and proof is recorded.'],
                        ].map(([title, text], index) => (
                            <ScrollReveal key={title} className="xpo-process-step">
                                <span>{index + 1}</span>
                                <h3>{title}</h3>
                                <p>{text}</p>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="xpo-cta-slab">
                <div className="container xpo-cta-inner">
                    <Warehouse size={34} />
                    <div>
                        <h2>Need a custom delivery plan?</h2>
                        <p>Talk to Parkline Shipping about parcel, pallet, freight, and urgent shipment routes.</p>
                    </div>
                    <Link href="/contact" className="btn btn-primary">Get a Free Quote</Link>
                </div>
            </section>
        </>
    );
}
