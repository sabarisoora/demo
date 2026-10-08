"use client";

import { clearData, loadSample } from "../actions";

export function DataTools() {
  return (
    <div className="flex flex-wrap gap-3">
      <form
        action={loadSample}
        onSubmit={(e) => {
          if (!confirm("Replace ALL your entries with sample data?")) e.preventDefault();
        }}
      >
        <button className="btn btn-ghost">Load sample data</button>
      </form>
      <form
        action={clearData}
        onSubmit={(e) => {
          if (!confirm("Delete ALL entries and expenses? This can't be undone.")) e.preventDefault();
        }}
      >
        <button className="btn btn-danger">Delete all entries</button>
      </form>
    </div>
  );
}
