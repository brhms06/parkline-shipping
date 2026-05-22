'use client';

import { useEffect } from 'react';

export default function SmartsuppChat() {
    useEffect(() => {
        var Tawk_API = window.Tawk_API || {};
        var Tawk_LoadStart = new Date();
        window.Tawk_API = Tawk_API;
        (function() {
            var s1 = document.createElement('script');
            var s0 = document.getElementsByTagName('script')[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/6a0f34ccade0d71c323938eb/1jp5mcg15';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    }, []);

    return null;
}
