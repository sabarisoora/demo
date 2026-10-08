// From the workbook's "Tax Rate Reference" sheet. Starting-point planning estimates as of 2026,
// not tax advice. vat and reserve are percentages.
export type Country = {
  name: string;
  currency: string;
  symbol: string;
  vat: number;
  vatLabel: string;
  reserve: number;
};

const rows: [string, string, string, number, string, number][] = [
  ["United States", "USD", "$", 0, "Sales Tax (varies by state)", 27],
  ["Canada", "CAD", "$", 5, "GST (+ provincial varies)", 27],
  ["United Kingdom", "GBP", "£", 20, "VAT", 27],
  ["Ireland", "EUR", "€", 23, "VAT", 30],
  ["Germany", "EUR", "€", 19, "VAT", 33],
  ["France", "EUR", "€", 20, "VAT", 33],
  ["Italy", "EUR", "€", 22, "VAT", 33],
  ["Spain", "EUR", "€", 21, "VAT", 30],
  ["Netherlands", "EUR", "€", 21, "VAT", 30],
  ["Belgium", "EUR", "€", 21, "VAT", 35],
  ["Switzerland", "CHF", "Fr", 8.1, "VAT", 22],
  ["Austria", "EUR", "€", 20, "VAT", 33],
  ["Sweden", "SEK", "kr", 25, "VAT (Moms)", 30],
  ["Norway", "NOK", "kr", 25, "VAT (MVA)", 30],
  ["Denmark", "DKK", "kr", 25, "VAT (Moms)", 35],
  ["Finland", "EUR", "€", 25.5, "VAT (ALV)", 30],
  ["Poland", "PLN", "zł", 23, "VAT", 22],
  ["Portugal", "EUR", "€", 23, "VAT", 27],
  ["Greece", "EUR", "€", 24, "VAT", 27],
  ["Czech Republic", "CZK", "Kč", 21, "VAT", 20],
  ["Australia", "AUD", "$", 10, "GST", 27],
  ["New Zealand", "NZD", "$", 15, "GST", 27],
  ["Japan", "JPY", "¥", 10, "Consumption Tax", 25],
  ["South Korea", "KRW", "₩", 10, "VAT", 24],
  ["Singapore", "SGD", "$", 9, "GST", 17],
  ["India", "INR", "₹", 18, "GST", 27],
  ["China", "CNY", "¥", 13, "VAT", 25],
  ["Philippines", "PHP", "₱", 12, "VAT", 25],
  ["Malaysia", "MYR", "RM", 8, "SST", 24],
  ["Indonesia", "IDR", "Rp", 11, "VAT (PPN)", 25],
  ["Thailand", "THB", "฿", 7, "VAT", 20],
  ["Vietnam", "VND", "₫", 10, "VAT", 20],
  ["Hong Kong", "HKD", "$", 0, "No VAT/GST", 16.5],
  ["UAE", "AED", "AED", 5, "VAT", 9],
  ["Saudi Arabia", "SAR", "SAR", 15, "VAT", 20],
  ["Israel", "ILS", "₪", 17, "VAT", 30],
  ["South Africa", "ZAR", "R", 15, "VAT", 28],
  ["Nigeria", "NGN", "₦", 7.5, "VAT", 24],
  ["Kenya", "KES", "KSh", 16, "VAT", 30],
  ["Egypt", "EGP", "E£", 14, "VAT", 22.5],
  ["Brazil", "BRL", "R$", 17, "ICMS/VAT (varies)", 20],
  ["Argentina", "ARS", "$", 21, "VAT", 30],
  ["Chile", "CLP", "$", 19, "VAT", 25],
  ["Colombia", "COP", "$", 19, "VAT", 30],
  ["Mexico", "MXN", "$", 16, "VAT (IVA)", 30],
  ["Peru", "PEN", "S/", 18, "VAT (IGV)", 25],
  ["Pakistan", "PKR", "Rs", 18, "GST", 22],
  ["Bangladesh", "BDT", "৳", 15, "VAT", 20],
  ["Turkey", "TRY", "₺", 20, "VAT (KDV)", 25],
  ["Romania", "RON", "lei", 19, "VAT", 22],
  ["Other / Custom", "", "", 0, "VAT/GST", 25],
];

export const countries: Country[] = rows.map(([name, currency, symbol, vat, vatLabel, reserve]) => ({
  name,
  currency,
  symbol,
  vat,
  vatLabel,
  reserve,
}));

export function getCountry(name: string): Country {
  return countries.find((c) => c.name === name) ?? countries[countries.length - 1];
}
