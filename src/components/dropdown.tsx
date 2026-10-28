"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cx } from "./ui";

/** Minimal disclosure menu: toggles on click, closes on outside click or Escape. */
export function Dropdown({
  trigger,
  triggerClassName,
  label,
  align = "left",
  children,
}: {
  trigger: ReactNode;
  triggerClassName?: string;
  label: string;
  align?: "left" | "right";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          className={cx(
            "absolute top-[calc(100%+8px)] z-20 min-w-48 rounded-2xl border border-line bg-surface p-1.5 shadow-[0_12px_32px_-12px_rgba(21,18,31,0.18)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink-2 hover:bg-bg"
    >
      {children}
    </button>
  );
}
