/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/BuddySQLServer",
  assetPrefix: "/BuddySQLServer/",
};

module.exports = nextConfig;
