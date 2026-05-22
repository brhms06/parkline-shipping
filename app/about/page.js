'use client';

import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, BadgeCheck, Globe2, Headphones, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

const team = [
    { image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=700', name: 'Marcus Hale', role: 'Operations Lead' },
    { image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=700', name: 'Amara Foster', role: 'Customer Success Lead' },
    { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=700', name: 'Daniel Okafor', role: 'Tracking Systems Lead' },
    { image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=700', name: 'Elena Rodriguez', role: 'Freight Coordinator' },
];

export default function AboutPage() {
    return (
        <>
            <section className="xpo-page-hero xpo-page-hero-about">
                <div className="container">
                    <div className="xpo-page-copy">
                        <span>About Parkline Shipping</span>
                        <h1>Built for urgent movement and steady trust.</h1>
                        <p>We help people and businesses move goods with clearer routing, responsive support, and practical delivery planning.</p>
                    </div>
                </div>
            </section>

            <section className="xpo-story-section">
                <div className="container xpo-story-grid">
                    <ScrollReveal className="xpo-story-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1200" alt="Parkline Shipping operations team" />
                    </ScrollReveal>
                    <ScrollReveal direction="right" className="xpo-story-copy">
                        <div className="xpo-section-kicker">Our Story</div>
                        <h2>Every shipment is someone&apos;s promise.</h2>
                        <p>Parkline Shipping was created for customers who need a delivery partner that communicates clearly, moves quickly, and keeps shipments visible from pickup to final handoff.</p>
                        <div className="xpo-check-stack">
                            <span><BadgeCheck size={18} /> Express delivery and freight coordination</span>
                            <span><BadgeCheck size={18} /> International route support</span>
                            <span><BadgeCheck size={18} /> Parcel, pallet, air, and road freight handling</span>
                            <span style={{ cursor: 'pointer' }} onClick={() => window.Tawk_API && window.Tawk_API.maximize()}>
                                <BadgeCheck size={18} /> 24/7 Live Chat Support
                            </span>                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <section className="xpo-values-band">
                <div className="container xpo-values-grid">
                    {[
                        [ShieldCheck, 'Integrity', 'Clear quotes, honest routing, and simple communication.'],
                        [Truck, 'Speed', 'Fast dispatch decisions for urgent movement.'],
                        [Headphones, 'Support', 'A reachable team when shipment plans change.'],
                        [Globe2, 'Reach', 'Local, national, and global shipment options.'],
                    ].map(([Icon, title, text]) => (
                        <ScrollReveal key={title} className="xpo-value-card">
                            <Icon size={26} />
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="xpo-team-section">
                <div className="container">
                    <div className="xpo-split-heading">
                        <div>
                            <div className="xpo-section-kicker">Team</div>
                            <h2>Meet the people behind the routes.</h2>
                        </div>
                        <p>The admin and tracking tools remain the same, but the customer-facing experience now feels fully Parkline Shipping.</p>
                    </div>
                    <div className="xpo-team-grid">
                        {team.map((member) => (
                            <ScrollReveal key={member.name} className="xpo-team-card">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={member.image} alt={member.name} />
                                <div>
                                    <h3>{member.name}</h3>
                                    <p>{member.role}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="xpo-cta-slab">
                <div className="container xpo-cta-inner">
                    <Truck size={34} />
                    <div>
                        <h2>Partner with Parkline Shipping.</h2>
                        <p>Let our team plan your next parcel, pallet, or urgent freight movement.</p>
                    </div>
                    <Link href="/contact" className="btn btn-primary">Contact Us <ArrowRight size={18} /></Link>
                </div>
            </section>
        </>
    );
}
