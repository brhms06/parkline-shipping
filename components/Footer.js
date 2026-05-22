import Link from 'next/link';

const Facebook = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const Twitter = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const Linkedin = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const Instagram = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* About */}
                    <div className="footer-about">
                        <Link href="/" className="nav-logo">
                            <div className="logo-box" style={{ fontFamily: "'Archivo', sans-serif", fontStyle: 'italic', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1px' }}>P</div>
                            <div className="logo-text">Parkline<span> Shipping</span></div>
                        </Link>
                        <p>Parkline Shipping moves parcels, freight, and urgent cargo with clear tracking, careful handling, and dependable support from pickup to final mile.</p>
                        <div className="footer-social-row">
                            <a href="#" className="f-social-btn" aria-label="Facebook"><Facebook size={18} /></a>
                            <a href="#" className="f-social-btn" aria-label="Twitter"><Twitter size={18} /></a>
                            <a href="#" className="f-social-btn" aria-label="LinkedIn"><Linkedin size={18} /></a>
                            <a href="#" className="f-social-btn" aria-label="Instagram"><Instagram size={18} /></a>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div className="f-links">
                        <h4>Company</h4>
                        <ul>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/services">Our Services</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                            <li><Link href="/track">Track Shipment</Link></li>
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div className="f-links">
                        <h4>Services</h4>
                        <ul>
                            <li><Link href="/services">Express Courier</Link></li>
                            <li><Link href="/services">Road Freight</Link></li>
                            <li><Link href="/services">Air Freight</Link></li>
                            <li><Link href="/services">Customs Support</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="f-newsletter">
                        <h4>Stay Updated</h4>
                        <p>Get practical delivery updates and service alerts from our operations desk.</p>
                        <div className="newsletter-field">
                            <input type="email" placeholder="Enter your email" />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Subscribe</button>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Parkline Shipping. All rights reserved.</p>
                    <div className="f-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
