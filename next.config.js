/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Optimize for production
    poweredByHeader: false,
    // Compress responses
    compress: true,
};

module.exports = nextConfig;
