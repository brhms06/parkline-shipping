import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { ToastProvider } from '@/components/Toast';
import SmartsuppChat from '@/components/SmartsuppChat';

export const metadata = {
    title: {
        default: 'Parkline Shipping - Express Logistics & Freight Delivery',
        template: '%s | Parkline Shipping',
    },
    description: 'Parkline Shipping provides express parcel delivery, freight forwarding, live shipment tracking, and responsive logistics support.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js" defer></script>
            </head>
            <body>
                <ToastProvider>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </ToastProvider>
                <SmartsuppChat />
            </body>
        </html>
    );
}
