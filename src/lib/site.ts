// Business details shown on legal pages, emails and footers. Set them in Vercel env vars.
export const site = {
  name: "ProfitIQS",
  company: process.env.NEXT_PUBLIC_COMPANY_NAME || "ProfitIQS",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@profitiqs.com",
  url: (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, ""),
};
