'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headphones } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.getElementById('hamburger');
            if (navLinks && hamburger && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const isActive = (path) => pathname === path;

    return (
        <nav id="navbar" className={`navbar${scrolled ? ' scrolled' : ''}`}>
            <div className="container nav-row">
                <Link href="/" className="nav-logo">
                    <div className="logo-box" style={{ fontFamily: "'Archivo', sans-serif", fontStyle: 'italic', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1px' }}>P</div>
                    <div className="logo-text">Parkline<span> Shipping</span></div>
                </Link>

                <div id="navLinks" className={`nav-links${menuOpen ? ' open' : ''}`}>
                    <Link href="/" className={isActive('/') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link href="/about" className={isActive('/about') ? 'active' : ''} onClick={() => setMenuOpen(false)}>About</Link>
                    <Link href="/services" className={isActive('/services') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Services</Link>
                    <Link href="/contact" className={isActive('/contact') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Contact</Link>
                    <a className="nav-phone" onClick={(e) => { e.preventDefault(); setMenuOpen(false); window.Tawk_API && window.Tawk_API.maximize(); }} style={{ cursor: 'pointer' }}><Headphones size={15} /> Live Support</a>                    <Link href="/track" className={`btn btn-primary nav-cta${isActive('/track') ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
                        Track Shipment
                    </Link>
                </div>

                <div
                    id="hamburger"
                    className={`hamburger${menuOpen ? ' active' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    );
}
