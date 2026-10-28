// Drop genuine ProfitIQS footage into public/ and point these at it (e.g. "product/workbook-demo.mp4").
// While a slot is null, the scene uses a neutral illustration and is labelled "Illustrative visual".
export const ASSETS: {
  productDemo: string | null; // screen recording of a real workbook: data entry, tracking sheets, summaries
  websiteDemo: string | null; // screen recording of profitiqs.com: niche directory → niche page → edition comparison
  editionCovers: { essential: string | null; elite: string | null; complete: string | null }; // workbook cover images
} = {
  productDemo: null,
  websiteDemo: null,
  editionCovers: { essential: null, elite: null, complete: null },
};
