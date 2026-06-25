"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteItemButton({
  label,
  confirmMessage,
  errorMessage,
  onDelete,
}: {
  label: string;
  confirmMessage: string;
  errorMessage?: string;
  onDelete: () => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    setFailed(false);
    try {
      const ok = await onDelete();
      if (!ok) setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={label}
        title={label}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted-fg)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {failed && errorMessage && (
        <span className="mt-1 max-w-[8rem] text-center text-[10px] text-red-600">{errorMessage}</span>
      )}
    </div>
  );
}