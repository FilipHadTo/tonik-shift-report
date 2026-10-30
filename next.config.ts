import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Lets a phone on the same Wi-Fi load the dev server by LAN IP (QR from the desktop).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
