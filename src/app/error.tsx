"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-2xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-ink-2">
        Sorry, that didn't work. Your data is safe. Try again, and if it keeps happening, email support with the code below.
      </p>
      {error.digest && <p className="num mt-3 text-xs text-muted">Error code: {error.digest}</p>}
      <div className="mt-6 flex gap-3">
        <button onClick={() => retry()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/app" className="btn btn-ghost">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
