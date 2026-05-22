'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setHidden(true), 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div id="preloader" className={`preloader${hidden ? ' hidden' : ''}`}>
            <div className="preloader-spinner"></div>
        </div>
    );
}
