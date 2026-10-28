import type { ComponentProps, ReactNode } from "react";

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export { cx };

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cx("rounded-[20px] border border-line bg-surface", className)}
      {...props}
    />
  );
}

const pillVariants = {
  outline: "border border-line bg-surface text-ink hover:bg-bg",
  "outline-accent": "border border-line bg-surface text-accent hover:bg-bg",
  primary: "border border-transparent bg-blue-500 text-white hover:bg-blue-600",
  ghost: "border border-transparent text-ink-2 hover:bg-bg hover:text-ink",
};

export function PillButton({
  className,
  variant = "outline",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof pillVariants }) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
        pillVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex size-[38px] shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    />
  );
}

type ChipTone = "neutral" | "ok" | "warn" | "info" | "blue";

const chipTones: Record<ChipTone, string> = {
  neutral: "bg-chip text-ink-2",
  ok: "bg-ok-bg text-ok-fg",
  warn: "bg-warn-bg text-warn-fg ring-1 ring-inset ring-warn-bd",
  info: "bg-info-bg text-info-fg",
  blue: "bg-blue-50 text-accent",
};

export function Chip({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: ChipTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-xs font-semibold leading-4 whitespace-nowrap",
        chipTones[tone],
        className,
      )}
    >
      {dot && <span className="size-1 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

const dotColors = {
  Offline: "bg-[#6b7280]",
  Idle: "bg-[#22704a]",
  Working: "bg-accent",
} as const;

export function StatusDot({ status }: { status: keyof typeof dotColors }) {
  return <span className={cx("inline-block size-2 shrink-0 rounded-full", dotColors[status])} aria-hidden />;
}
