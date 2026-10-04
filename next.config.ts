import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/n/:slug", destination: "/nfc/:slug", permanent: true }];
  },
  /* config options here */
};

export default nextConfig;
