import type { NextConfig } from "next";

const securityHeaders = [
  // The app is never meant to be framed (clickjacking protection).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // The postgres driver is server-only; keep it out of bundling.
  serverExternalPackages: ["postgres", "exceljs"],
  // CSV and Excel workbook uploads go through server actions; Vercel caps requests at 4.5 MB.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
