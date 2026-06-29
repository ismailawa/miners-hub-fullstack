import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        API_KEY: process.env.GEMINI_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
};

export default nextConfig;
