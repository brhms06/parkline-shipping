'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle,
    Globe2,
    Headphones,
    MapPin,
    Plane,
    Ship,
    Truck,
    Warehouse
} from 'lucide-react';

const services = [
    {
        icon: Plane,
        title: 'Air Freight',
        text: 'Urgent international cargo, flight-aware routing, and careful handover updates.',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=900'
    },
    {
        icon: Truck,
        title: 'Road Delivery',
        text: 'Same-day, scheduled, and final-mile transport for parcels and palletised freight.',
        image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=900'
    },
    {
        icon: Ship,
        title: 'Sea Freight',
        text: 'Container coordination, documentation checks, and milestone visibility.',
        image: 'https://images.unsplash.com/photo-1494412574021-746bbdb2483b?auto=format&fit=crop&q=80&w=900'
    },
    {
        icon: Warehouse,
        title: 'Storage Support',
        text: 'Temporary holding, consolidation, and dispatch planning for business cargo.',
        image: 'https://images.unsplash.com/photo-1586528116493-a029325540fa?auto=format&fit=crop&q=80&w=900'
    },
];

const process = [
    { title: 'Initial Consultation', text: 'Share pickup, destination, cargo details, and deadline.' },
    { title: 'Inventory Management', text: 'We confirm handling needs, documents, and service class.' },
    { title: 'Packaging & Distribution', text: 'Cargo is routed through the right courier or freight lane.' },
    { title: 'Transportation Process', text: 'Track progress until delivery confirmation is complete.' },
];

const reviews = [
    { name: 'Alicia Reed', role: 'Retail Operations', text: 'Parkline Shipping feels organised. We get quick answers and cleaner shipment updates.' },
    { name: 'Mason Clark', role: 'Importer', text: 'The quote process is direct, and the team explains the route without overcomplicating it.' },
    { name: 'Priya Shah', role: 'E-commerce Founder', text: 'The final-mile support has been reliable, especially when customers need delivery clarity.' },
];

export default function HomePage() {
    return (
        <>
            <section className="xpo-hero">
                <div className="xpo-hero-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=2200" alt="Parkline Shipping freight trucks" fetchPriority="high" decoding="async" />
                </div>
                <div className="container xpo-hero-grid">
                    <ScrollReveal className="xpo-hero-copy">
                        <div className="xpo-eyebrow"><span></span>Delivering smarter logistics solutions</div>
                        <h1>Moving made easy, wherever your cargo goes.</h1>
                        <p>Parkline Shipping coordinates express parcels, road freight, air cargo, and international shipments with clear tracking and human support.</p>
                        <div className="xpo-hero-actions">
                            <Link href="/track" className="btn btn-primary">Track Shipment <ArrowRight size={18} /></Link>
                            <Link href="/contact" className="btn btn-white">Request Quote</Link>
                        </div>
                        <div className="xpo-trust-row">
                            <div className="xpo-avatar-stack">
                                <span>AR</span><span>MC</span><span>PS</span>
                            </div>
                            <strong>2,400+ satisfied customers</strong>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal direction="right" className="xpo-hero-card">
                        <div className="xpo-card-label">Global shipment</div>
                        <h3>Route control without the noise.</h3>
                        <p><MapPin size={15} /> Dispatch desk</p>
                        <div className="xpo-mini-route">
                            <span></span>
                            <div></div>
                            <span></span>
                        </div>
                        <small>Live updates, route notes, and proof of delivery support.</small>
                    </ScrollReveal>
                </div>
            </section>

            <section className="xpo-intro">
                <div className="container xpo-intro-grid">
                    <ScrollReveal className="xpo-intro-copy">
                        <div className="xpo-section-kicker">About Us</div>
                        <h2>Driven by trust, powered by experience.</h2>
                        <p>We move more than packages. We protect promises between businesses, families, suppliers, and customers. Every shipment is planned with practical care and clear communication.</p>
                        <div className="xpo-proof-grid">
                            <div><Globe2 size={22} /><strong>Worldwide Service</strong><span>International routing support</span></div>
                            <div style={{ cursor: 'pointer' }} onClick={() => window.Tawk_API && window.Tawk_API.maximize()}>
                                <Headphones size={22} /><strong>24/7 Online Support</strong><span>Open Live Chat</span>
                            </div>                        </div>
                        <Link href="/about" className="xpo-text-link">Read More <ArrowRight size={16} /></Link>
                    </ScrollReveal>
                    <ScrollReveal direction="right" className="xpo-intro-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80&w=1200" alt="Courier loading Parkline Shipping van" loading="lazy" decoding="async" />
                        <div className="xpo-gauge">
                            <strong>98%</strong>
                            <span>Route clarity score</span>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <section className="xpo-services">
                <div className="container">
                    <div className="xpo-split-heading">
                        <div>
                            <div className="xpo-section-kicker">Services</div>
                            <h2>Our trusted logistics services</h2>
                        </div>
                        <p>Choose the right movement method without changing how tracking, support, and admin workflows operate.</p>
                    </div>
                    <div className="xpo-service-grid">
                        {services.map((service) => (
                            <ScrollReveal key={service.title} className="xpo-service-card">
                                <div className="xpo-service-image">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={service.image} alt={service.title} loading="lazy" decoding="async" />
                                </div>
                                <div className="xpo-service-body">
                                    <service.icon size={24} />
                                    <h3>{service.title}</h3>
                                    <p>{service.text}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="xpo-skills">
                <div className="container xpo-skills-grid">
                    <ScrollReveal className="xpo-skill-copy">
                        <div className="xpo-section-kicker">Our Skills</div>
                        <h2>Skills that keep your business moving.</h2>
                        <p>From quote requests to delivery status, Parkline Shipping keeps the operational experience simple for customers and admins.</p>
                        {[
                            ['Real-time tracking systems', '94%'],
                            ['Secure warehousing', '88%'],
                            ['Customer-centered support', '97%'],
                        ].map(([label, value]) => (
                            <div className="xpo-progress" key={label}>
                                <div><span>{label}</span><strong>{value}</strong></div>
                                <i style={{ width: value }}></i>
                            </div>
                        ))}
                    </ScrollReveal>
                    <ScrollReveal direction="right" className="xpo-truck-stage">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&q=80&w=1200" alt="Parkline Shipping freight truck" loading="lazy" decoding="async" />
                    </ScrollReveal>
                </div>
            </section>

            <section className="xpo-process">
                <div className="container">
                    <div className="xpo-centered-heading">
                        <div className="xpo-section-kicker">Moving Process</div>
                        <h2>Our seamless moving process.</h2>
                    </div>
                    <div className="xpo-process-line">
                        {process.map((item, index) => (
                            <ScrollReveal key={item.title} className="xpo-process-step">
                                <span>{index + 1}</span>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="xpo-testimonials">
                <div className="container xpo-testimonial-grid">
                    <div>
                        <div className="xpo-section-kicker">Testimonials</div>
                        <h2>Hear from our happy clients.</h2>
                    </div>
                    {reviews.map((review) => (
                        <ScrollReveal key={review.name} className="xpo-quote-card">
                            <BadgeCheck size={22} />
                            <p>&ldquo;{review.text}&rdquo;</p>
                            <strong>{review.name}</strong>
                            <span>{review.role}</span>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="xpo-quote-band">
                <div className="container xpo-quote-grid">
                    <ScrollReveal className="xpo-courier">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=900" alt="Courier holding parcel" loading="lazy" decoding="async" />
                    </ScrollReveal>
                    <ScrollReveal direction="right" className="xpo-quote-panel">
                        <div className="xpo-section-kicker">Request Quote</div>
                        <h2>Ready to move it?</h2>
                        <p>Send the route and cargo details. We will help choose the right delivery option.</p>
                        <div className="xpo-quick-form">
                            <input placeholder="Pickup city" />
                            <input placeholder="Destination" />
                            <select defaultValue="Express Courier">
                                <option>Express Courier</option>
                                <option>Road Freight</option>
                                <option>Air Freight</option>
                                <option>Sea Freight</option>
                            </select>
                            <Link href="/contact" className="btn btn-primary">Continue Quote <ArrowRight size={18} /></Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
