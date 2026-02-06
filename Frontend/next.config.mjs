/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure strict mode is on for better debugging
    reactStrictMode: true,
    // Use SWC for minification (faster builds, better compatibility with Vercel)
    // Images configuration if using external images
    images: {
        domains: [], // Add domains if you load images from external URLs
    },
    // Optimize for production builds
    productionBrowserSourceMaps: false,
    // Ensure compatibility with Vercel Edge Runtime
    experimental: {
        optimizePackageImports: ['@radix-ui/*'],
    },
};

export default nextConfig;
