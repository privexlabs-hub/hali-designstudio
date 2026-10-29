/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: process.env.DIST_DIR || '.next',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default nextConfig;
