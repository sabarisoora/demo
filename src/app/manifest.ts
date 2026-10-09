import type { MetadataRoute } from "next";

// Lets owners "install" ProfitIQS on a phone or desktop like an app (Add to Home Screen).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ProfitIQS",
    short_name: "ProfitIQS",
    description: "Repair orders, invoices, customers and true profit for your shop.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#f4f1e9",
    theme_color: "#1d4d3a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New repair order", url: "/app/jobs/new" },
      { name: "Customers", url: "/app/customers" },
    ],
  };
}
