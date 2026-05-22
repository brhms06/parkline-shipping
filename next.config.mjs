/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'maps.gstatic.com' },
            { protocol: 'https', hostname: 'maps.google.com' },
        ],
    },
};

export default nextConfig;
