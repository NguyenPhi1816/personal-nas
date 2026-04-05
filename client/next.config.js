/** @type {import('next').NextConfig} */
const apiProxyTarget =
  process.env.API_PROXY_TARGET || "http://localhost:3000/api";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    proxyClientMaxBodySize: "200mb",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
