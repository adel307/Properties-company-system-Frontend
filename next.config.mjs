/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdfkit', 'pdfkit-table'],
};

export default nextConfig;
