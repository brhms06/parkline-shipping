'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toast, setToast] = useState({ message: '', type: 'success', show: false });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, show: true });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div id="toast" className={`toast ${toast.type}${toast.show ? ' show' : ''}`}>
                {toast.message}
            </div>
        </ToastContext.Provider>
    );
}
