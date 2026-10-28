"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type SVGProps } from "react";
import type { Priority } from "@/lib/data";
import {
  kindMeta,
  notifications as initialNotifications,
  type NotificationAction,
  type NotificationKind,
  type ZikiNotification,
} from "@/lib/notifications";
import {
  AlertTriangle,
  Bell,
  Bot,
  Check,
  Clock,
  Copy,
  Gavel,
  GitMerge,
  GitPullRequest,
  HelpBubble,
  Key,
  Palette,
  RotateCcw,
  Trophy,
  Zap,
} from "../icons";
import { Chip, cx } from "../ui";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const kindVisual: Record<NotificationKind, { icon: Icon; tone: string }> = {
  offer: { icon: Zap, tone: "bg-blue-50 text-accent" },
  bid: { icon: Gavel, tone: "bg-blue-50 text-accent" },
  pairing: { icon: Key, tone: "bg-chip text-ink-2" },
  question: { icon: HelpBubble, tone: "bg-warn-bg text-warn-fg" },
  review: { icon: GitPullRequest, tone: "bg-info-bg text-info-fg" },
  merge: { icon: GitMerge, tone: "bg-ok-bg text-ok-fg" },
  merge_blocked: { icon: AlertTriangle, tone: "bg-[#fdecec] text-[#a4262c]" },
  stalled: { icon: Bot, tone: "bg-warn-bg text-warn-fg" },
  deadline: { icon: Clock, tone: "bg-warn-bg text-warn-fg" },
  resolved: { icon: Check, tone: "bg-ok-bg text-ok-fg" },
  duplicate: { icon: Copy, tone: "bg-chip text-ink-2" },
  redesign: { icon: Palette, tone: "bg-info-bg text-info-fg" },
  points: { icon: Trophy, tone: "bg-points-bg text-points-fg" },
  merged: { icon: GitMerge, tone: "bg-ok-bg text-ok-fg" },
};

const severityTone: Record<Priority, "warn" | "info" | "neutral"> = {
  High: "warn",
  Medium: "info",
  Low: "neutral",
};

const actionStyles: Record<NotificationAction["variant"], string> = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "border border-line bg-surface text-ink hover:bg-bg",
  danger: "border border-line bg-surface text-[#a4262c] hover:bg-[#fdecec]",
};

function timeAgo(minutes: number) {
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

type Handled = { label: string; actionLabel: string };
type Tab = "action" | "all";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("action");
  const [items, setItems] = useState(initialNotifications);
  const [handled, setHandled] = useState<Record<string, Handled>>({});
  // Rows decided before this opening. They leave "Needs you"; rows decided while
  // the menu is open stay put so the list doesn't jump under the pointer.
  const [settled, setSettled] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

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

  const unread = items.filter((n) => !n.read).length;
  const pending = items.filter((n) => kindMeta[n.kind].needsAction && !handled[n.id]);
  const visible = tab === "action" ? items.filter((n) => kindMeta[n.kind].needsAction && !settled.has(n.id)) : items;

  const markRead = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const resolve = (n: ZikiNotification, action: NotificationAction) => {
    markRead(n.id);
    if (action.href) return;
    setHandled((h) => ({ ...h, [n.id]: { label: action.done, actionLabel: action.label } }));
  };

  const undo = (id: string) =>
    setHandled((h) => {
      const next = { ...h };
      delete next[id];
      return next;
    });

  const openMenu = () => {
    setSettled(new Set(Object.keys(handled)));
    setTab("action");
    setOpen(true);
  };

  return (
    <div ref={ref} className="relative ml-1">
      <button
        type="button"
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={cx(
          "relative inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-bg",
          open && "bg-bg",
        )}
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 rounded-full bg-blue-500 px-1.5 text-[11px] leading-4 font-semibold text-white ring-2 ring-surface">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-2 top-[72px] z-40 flex max-h-[calc(100dvh-88px)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_40px_-12px_rgba(21,18,31,0.22)] sm:absolute sm:inset-x-auto sm:top-[calc(100%+10px)] sm:right-0 sm:max-h-[min(640px,calc(100dvh-96px))] sm:w-[440px]"
        >
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
            <button
              type="button"
              onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
              disabled={unread === 0}
              className="rounded-md px-1.5 py-1 text-xs font-semibold text-accent hover:bg-tint disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent"
            >
              Mark all read
            </button>
          </div>

          <div role="tablist" aria-label="Filter notifications" className="flex gap-1 border-b border-line px-3">
            {(
              [
                ["action", "Needs you", pending.length],
                ["all", "All", items.length],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cx(
                  "-mb-px flex items-center gap-1.5 border-b-2 px-2 pt-1 pb-2 text-[13px] font-medium",
                  tab === value ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {label}
                <span
                  className={cx(
                    "rounded-full px-1.5 text-[11px] leading-4 font-semibold",
                    tab === value ? "bg-blue-50 text-accent" : "bg-chip text-muted",
                  )}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          <ul className="min-h-0 flex-1 divide-y divide-divider overflow-y-auto overscroll-contain">
            {visible.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-ink">You&apos;re all caught up</p>
                <p className="mt-1 text-[13px] text-muted">No agent is waiting on you.</p>
              </li>
            ) : (
              visible.map((n) => (
                <NotificationRow
                  key={n.id}
                  n={n}
                  handled={handled[n.id]}
                  onAction={(a) => resolve(n, a)}
                  onUndo={() => undo(n.id)}
                  onOpen={() => markRead(n.id)}
                />
              ))
            )}
          </ul>

          <a
            href="#"
            className="border-t border-line px-4 py-3 text-center text-[13px] font-semibold text-accent hover:bg-bg"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  n,
  handled,
  onAction,
  onUndo,
  onOpen,
}: {
  n: ZikiNotification;
  handled?: Handled;
  onAction: (action: NotificationAction) => void;
  onUndo: () => void;
  onOpen: () => void;
}) {
  const meta = kindMeta[n.kind];
  const { icon: KindIcon, tone } = kindVisual[n.kind];
  const [composing, setComposing] = useState<NotificationAction | null>(null);
  const [note, setNote] = useState("");
  const urgent = n.expiresInMin !== undefined && n.expiresInMin <= 5;

  const submitNote = () => {
    if (!composing || !note.trim()) return;
    onAction(composing);
    setComposing(null);
    setNote("");
  };

  return (
    <li className={cx("relative flex gap-3 px-4 py-3.5", !n.read && !handled && "bg-[#f7faff]")}>
      <span className={cx("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
        <KindIcon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-ink-2">{meta.category}</span>
          {n.repeats && n.repeats > 1 && (
            <span className="rounded-full bg-chip px-1.5 font-semibold text-muted">×{n.repeats}</span>
          )}
          <span className="text-muted" aria-label={`${n.minutesAgo} minutes ago`}>
            · {timeAgo(n.minutesAgo)}
          </span>
          {!n.read && !handled && (
            <span className="ml-auto size-2 shrink-0 rounded-full bg-blue-500" aria-label="Unread" />
          )}
        </div>

        <a
          href="#"
          onClick={onOpen}
          className="mt-0.5 line-clamp-2 text-sm leading-5 font-semibold text-ink hover:text-accent"
        >
          {n.points ? <span className="text-points-fg">{n.subject}</span> : n.subject}
        </a>

        {n.detail && <p className="mt-0.5 line-clamp-2 text-[13px] leading-[18px] text-ink-2">{n.detail}</p>}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          {n.issue && <span className="font-mono">#{n.issue.id}</span>}
          {n.issue?.severity && (
            <Chip tone={severityTone[n.issue.severity]} className="!px-2 !py-0 !text-[11px]">
              {n.issue.severity}
            </Chip>
          )}
          {n.agent && (
            <span className="inline-flex items-center gap-1">
              <Bot className="size-3" />
              {n.agent}
            </span>
          )}
          {n.expiresInMin !== undefined && !handled && (
            <span
              className={cx(
                "inline-flex items-center gap-1 rounded-full px-1.5 font-semibold",
                urgent ? "bg-[#fdecec] text-[#a4262c]" : "bg-warn-bg text-warn-fg",
              )}
            >
              <Clock className="size-3" />
              {n.expiresInMin}m left
            </span>
          )}
        </div>

        {handled ? (
          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-ok-bg px-2.5 py-1.5 text-[13px] text-ok-fg" role="status">
            <Check className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1">{handled.label}</span>
            <button
              type="button"
              onClick={onUndo}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold hover:bg-white/60"
            >
              <RotateCcw className="size-3" />
              Undo
            </button>
          </div>
        ) : composing?.input ? (
          <form
            className="mt-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              submitNote();
            }}
          >
            <textarea
              autoFocus
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitNote();
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setComposing(null);
                }
              }}
              placeholder={composing.input.placeholder}
              aria-label={composing.input.placeholder}
              className="w-full resize-none rounded-lg border border-line bg-surface px-2.5 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-blue-100"
            />
            <div className="mt-1.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setComposing(null)}
                className="h-8 rounded-full px-3 text-[13px] font-semibold text-ink-2 hover:bg-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!note.trim()}
                className={cx(
                  "h-8 rounded-full px-3.5 text-[13px] font-semibold disabled:opacity-50",
                  actionStyles[composing.variant === "danger" ? "danger" : "primary"],
                )}
              >
                {composing.input.submit}
              </button>
            </div>
          </form>
        ) : (
          meta.actions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {meta.actions.map((a) => {
                const className = cx(
                  "inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  actionStyles[a.variant],
                );
                return a.href ? (
                  <a key={a.id} href={a.href} onClick={() => onAction(a)} className={className}>
                    {a.label}
                  </a>
                ) : (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => (a.input ? setComposing(a) : onAction(a))}
                    className={className}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
    </li>
  );
}
