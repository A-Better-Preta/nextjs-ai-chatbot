/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  // This tells Next.js to be very standard and avoid the experimental features
  // that are clashing with your dynamic routes.

};

export default nextConfig;