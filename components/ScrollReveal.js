'use client';

import { useEffect, useRef } from 'react';

export default function ScrollReveal({ children, className = '', direction = 'up' }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const dirClass =
        direction === 'left' ? 'reveal-left' :
        direction === 'right' ? 'reveal-right' :
        'reveal';

    return (
        <div ref={ref} className={`${dirClass} ${className}`}>
            {children}
        </div>
    );
}
