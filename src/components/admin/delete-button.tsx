"use client";

import { Trash2 } from "lucide-react";

type Props = {
  id: number;
  action: (data: FormData) => Promise<void>;
  confirmText: string;
};

export function DeleteButton({ id, action, confirmText }: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Sil"
        className="rounded-full p-2 text-ink-300 transition hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}
