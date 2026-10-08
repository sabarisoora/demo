export type SampleData = {
  orders: {
    ref: string;
    date: string;
    category: string;
    customer: string;
    revenueA: number;
    costA: number;
    revenueB: number;
    costB: number;
  }[];
  expenses: { ref: string; date: string; category: string; vendor: string; amount: number }[];
};

/**
 * Everything that differs between niches lives here. The engine (entries, tax, dashboard,
 * health score, leak detector) is shared, so adding a niche means adding one of these files.
 */
export type Niche = {
  slug: string;
  /** "Auto Repair Shop" */
  name: string;
  /** Short noun for the business: "shop", "salon", "clinic" */
  businessNoun: string;
  job: {
    singular: string; // "Repair Order"
    plural: string; // "Repair Orders"
    short: string; // "RO"
    refPrefix: string; // "RO-"
    customerLabel: string; // "Customer"
  };
  /** The two revenue/cost streams on every job, e.g. Parts + Labor. */
  streams: { a: string; b: string };
  jobCategories: string[];
  expenseCategories: string[];
  /** Planning thresholds used by insights, health score and leak detector. */
  thresholds: {
    /** Net margin below this triggers a margin warning. */
    netMargin: number;
    /** A job with gross margin below this counts as a "low-margin job". */
    jobGrossMargin: number;
    /** Stream A (e.g. parts) margin below this is flagged. */
    streamAMargin: number;
    /** Stream B (e.g. labor) margin below this is flagged. */
    streamBMargin: number;
    /** Overhead above this share of revenue is flagged. */
    overheadShare: number;
  };
  /** Lifetime-revenue thresholds for customer segments (VIP ≥ vip, Core ≥ core). */
  segments: { vip: number; core: number };
  /** Industry reference points for the Benchmarks report. */
  benchmarks: {
    avgTicket: number;
    grossMargin: number;
    netMargin: number;
    /** Stream A revenue ÷ stream B revenue (e.g. parts-to-labor). */
    streamRatio: number;
    source: string;
  };
  /** Starting goals for the KPI Scorecard (the owner can edit them). */
  defaultGoals: Goals;
  copy: {
    /** Tip shown when net margin is low. */
    lowMarginTip: string;
    heroTitle: string;
    heroSubtitle: string;
    pains: { title: string; body: string }[];
  };
  sample: SampleData;
};

/** Annual goals for the KPI Scorecard. Margins are fractions (0.55 = 55%). */
export type Goals = {
  revenue: number;
  netProfit: number;
  avgTicket: number;
  jobCount: number;
  grossMargin: number;
  netMargin: number;
};
