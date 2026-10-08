import type { Niche, SampleData } from "./types";
import sample from "./samples/auto-repair.json";

export const autoRepair: Niche = {
  slug: "auto-repair",
  name: "Auto Repair Shop",
  businessNoun: "shop",
  job: {
    singular: "Repair Order",
    plural: "Repair Orders",
    short: "RO",
    refPrefix: "RO-",
    customerLabel: "Customer",
  },
  streams: { a: "Parts", b: "Labor" },
  details: {
    technician: "Technician",
    technicianPlural: "Technicians",
    hours: "Labor hours",
    comeback: "Comeback",
    comebackHint: "Repeat repair of earlier work (warranty redo)",
  },
  jobCategories: [
    "Oil Change / Maintenance",
    "Brake Service",
    "Diagnostic",
    "Engine Repair",
    "Transmission",
    "Tire Service",
  ],
  expenseCategories: [
    "Shop Rent",
    "Equipment (capital purchase)",
    "Insurance",
    "Marketing",
    "Office",
    "Admin Payroll",
    "Shop Supplies",
    "Software (shop management)",
    "Continuing Education / Certifications",
    "Other",
  ],
  thresholds: {
    netMargin: 0.15,
    jobGrossMargin: 0.4,
    streamAMargin: 0.4,
    streamBMargin: 0.5,
    overheadShare: 0.3,
  },
  segments: { vip: 1500, core: 600 },
  benchmarks: {
    avgTicket: 450,
    grossMargin: 0.52,
    netMargin: 0.12,
    streamRatio: 1.1,
    comebackRate: 0.03,
    source: "General independent auto-repair reference ranges compiled from common industry sources (planning guide, not a guarantee).",
  },
  defaultGoals: { revenue: 400000, netProfit: 60000, avgTicket: 500, jobCount: 300, grossMargin: 0.55, netMargin: 0.15 },
  copy: {
    lowMarginTip: "Review the parts cost ratio on Engine and Transmission repair orders.",
    heroTitle: "Know exactly what your shop made — and what to set aside for tax.",
    heroSubtitle:
      "Log repair orders and expenses (or import a CSV from your shop software). ProfitIQS turns them into true profit per RO, a tax reserve, and a plain-English health check.",
    pains: [
      {
        title: "Busy bays, thin bank account",
        body: "Car count looks great but cash doesn't. See net profit after parts, labor and overhead — not just sales.",
      },
      {
        title: "Tax bill surprises",
        body: "A recommended tax reserve for your country, how much you've funded, and your VAT/GST position.",
      },
      {
        title: "Which jobs actually pay",
        body: "Profit per repair order and per service type, so you know whether brakes or transmissions carry the shop.",
      },
    ],
  },
  sample: sample as SampleData,
};
