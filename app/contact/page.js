'use client';

import { useEffect, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, Clock, Mail, MapPin, Headphones } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function ContactPage() {
    const showToast = useToast();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.emailjs) {
            window.emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const templateParams = {
            name: formData.get('name'),
            email: formData.get('email'),
            title: formData.get('subject'),
            message: formData.get('message')
        };

        try {
            const response = await window.emailjs.send(
                process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
                process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
                templateParams
            );
            if (response.status === 200) {
                showToast('Message sent successfully! We will get back to you shortly.', 'success');
                e.target.reset();
            }
        } catch (error) {
            console.error('FAILED...', error);
            showToast('Failed to send message. Please try again later.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="xpo-page-hero xpo-page-hero-contact">
                <div className="container">
                    <div className="xpo-page-copy">
                        <span>Contact Parkline Shipping</span>
                        <h1>Tell us what needs to move.</h1>
                        <p>Need a quote, delivery update, or shipment advice? Our operations desk is ready to help.</p>
                    </div>
                </div>
            </section>

            <section className="xpo-contact-section">
                <div className="container xpo-contact-grid">
                    <ScrollReveal className="xpo-contact-panel">
                        <div className="xpo-section-kicker">Contact Details</div>
                        <h2>Fast answers from a real delivery desk.</h2>
                        <p>Share the route, timing, cargo type, and any handling requirements. We will help you understand the best way to move it.</p>
                        <div className="xpo-contact-cards">
                            <a href="mailto:office@xpodelivery.com"><Mail size={20} /><span>Email</span><strong>office@xpodelivery.com</strong></a>
                            <div style={{ cursor: 'pointer' }} onClick={() => window.Tawk_API && window.Tawk_API.maximize()}><Headphones size={20} /><span>Live Support</span><strong>Open Chat Window</strong></div>
                            <div><Clock size={20} /><span>Hours</span><strong>Mon - Sat, 8AM - 8PM</strong></div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal direction="right" className="xpo-contact-form">
                        <form id="contactForm" onSubmit={handleSubmit}>
                            <div className="xpo-form-head">
                                <span>Message Form</span>
                                <h2>Request support</h2>
                            </div>
                            <div className="xpo-form-row">
                                <label htmlFor="contactName">Full Name *</label>
                                <input type="text" name="name" id="contactName" placeholder="Your name" required />
                            </div>
                            <div className="xpo-form-row">
                                <label htmlFor="contactEmail">Email Address *</label>
                                <input type="email" name="email" id="contactEmail" placeholder="you@example.com" required />
                            </div>

                            <div className="xpo-form-row">
                                <label htmlFor="contactSubject">Subject *</label>
                                <select name="subject" id="contactSubject" required>
                                    <option value="">Select a subject</option>
                                    <option value="quote">Request a Quote</option>
                                    <option value="tracking">Tracking Issue</option>
                                    <option value="shipping">Shipping Inquiry</option>
                                    <option value="partnership">Business Partnership</option>
                                    <option value="complaint">File a Complaint</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="xpo-form-row">
                                <label htmlFor="contactMessage">Your Message *</label>
                                <textarea name="message" id="contactMessage" placeholder="Tell us how we can help you..." required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'} {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
