import Link from "next/link";

export const PAGE_SIZE = 50;

export function Pager({ page, total, base }: { page: number; total: number; base: string }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const href = (p: number) => (p === 1 ? base : `${base}?page=${p}`);
  return (
    <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted">
        Page {page} of {pages} · {total.toLocaleString("en-US")} rows
      </span>
      <span className="flex gap-2">
        {page > 1 && (
          <Link className="btn btn-ghost" href={href(page - 1)}>
            ← Newer
          </Link>
        )}
        {page < pages && (
          <Link className="btn btn-ghost" href={href(page + 1)}>
            Older →
          </Link>
        )}
      </span>
    </nav>
  );
}

export function parsePage(v: string | undefined) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
