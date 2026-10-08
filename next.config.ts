import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // bcryptjs and postgres are server-only; keep them out of client bundles.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
