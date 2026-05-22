'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import Preloader from './Preloader';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Preloader />
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    );
}
