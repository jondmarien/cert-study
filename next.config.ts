import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev resources are origin-checked. Allow the loopback name Chrome and curl use.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
