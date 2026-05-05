import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer', 'puppeteer-core', 'jszip', 'docx', 'libreoffice-convert'],
};

export default nextConfig;
