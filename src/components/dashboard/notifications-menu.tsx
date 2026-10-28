"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import type { Priority } from "@/lib/data";
import {
  kindMeta,
  notifications as initialNotifications,
  URGENT_WITHIN_MIN,
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
  stalled: { icon: Bot, tone: "bg-[#fdecec] text-[#a4262c]" },
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
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

type Handled = { label: string };

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const [handled, setHandled] = useState<Record<string, Handled>>({});
  // Rows decided before this opening are dropped; rows decided while the menu
  // is open stay put so the list doesn't jump under the pointer.
  const [settled, setSettled] = useState<Set<string>>(new Set());
  const [loadedAt] = useState(() => Date.now());
  const [now, setNow] = useState(loadedAt);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const tick = setInterval(() => setNow(Date.now()), 15_000);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      clearInterval(tick);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const elapsedMin = Math.floor((now - loadedAt) / 60_000);
  const minutesLeft = (n: ZikiNotification) =>
    n.expiresInMin === undefined ? undefined : Math.max(0, n.expiresInMin - elapsedMin);

  const unread = items.filter((n) => !n.read).length;
  const decisions = items.filter((n) => kindMeta[n.kind].needsAction && !settled.has(n.id));
  const urgent = decisions
    .filter((n) => (minutesLeft(n) ?? Infinity) <= URGENT_WITHIN_MIN)
    .sort((a, b) => (a.expiresInMin ?? 0) - (b.expiresInMin ?? 0));
  const needsYou = decisions.filter((n) => !urgent.includes(n));
  const updates = items.filter((n) => !kindMeta[n.kind].needsAction);
  const waiting = decisions.filter((n) => !handled[n.id]);

  const markRead = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const resolve = (n: ZikiNotification, action: NotificationAction) => {
    markRead(n.id);
    if (action.href) return;
    setHandled((h) => ({ ...h, [n.id]: { label: action.done } }));
  };

  const undo = (id: string) =>
    setHandled((h) => {
      const next = { ...h };
      delete next[id];
      return next;
    });

  const openMenu = () => {
    setSettled(new Set(Object.keys(handled)));
    setNow(Date.now());
    setOpen(true);
  };

  const rowProps = (n: ZikiNotification) => ({
    n,
    minutesLeft: minutesLeft(n),
    handled: handled[n.id],
    onAction: (a: NotificationAction) => resolve(n, a),
    onUndo: () => undo(n.id),
    onOpen: () => markRead(n.id),
  });

  const urgentOpen = urgent.filter((n) => !handled[n.id]).length;

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
          className="fixed inset-x-2 top-[72px] z-40 flex max-h-[calc(100dvh-88px)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_40px_-12px_rgba(21,18,31,0.22)] sm:absolute sm:inset-x-auto sm:top-[calc(100%+10px)] sm:right-0 sm:max-h-[min(680px,calc(100dvh-96px))] sm:w-[440px]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 pt-3.5 pb-3">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
              <p className="mt-0.5 text-xs text-muted">
                {waiting.length === 0 ? (
                  "Nothing needs you right now."
                ) : (
                  <>
                    {urgentOpen > 0 && (
                      <span className="font-semibold text-[#a4262c]">{urgentOpen} urgent · </span>
                    )}
                    {waiting.length} waiting on you
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
              disabled={unread === 0}
              className="rounded-md px-1.5 py-1 text-xs font-semibold text-accent hover:bg-tint disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent"
            >
              Mark all read
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {urgent.length > 0 && (
              <Section title="Act now" hint="Ziki decides if you don't" tone="urgent">
                {urgent.map((n) => (
                  <DecisionRow key={n.id} {...rowProps(n)} />
                ))}
              </Section>
            )}
            {needsYou.length > 0 && (
              <Section title="Needs you">
                {needsYou.map((n) => (
                  <DecisionRow key={n.id} {...rowProps(n)} />
                ))}
              </Section>
            )}
            {decisions.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-ink">You&apos;re all caught up</p>
                <p className="mt-1 text-[13px] text-muted">No agent is waiting on you.</p>
              </div>
            )}
            {updates.length > 0 && (
              <Section title="Updates">
                {updates.map((n) => (
                  <UpdateRow key={n.id} n={n} onOpen={() => markRead(n.id)} />
                ))}
              </Section>
            )}
          </div>

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

function Section({
  title,
  hint,
  tone,
  children,
}: {
  title: string;
  hint?: string;
  tone?: "urgent";
  children: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h3
        className={cx(
          "sticky top-0 z-10 flex items-center gap-2 border-b border-divider bg-surface/95 px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase backdrop-blur",
          tone === "urgent" ? "text-[#a4262c]" : "text-muted",
        )}
      >
        {title}
        {hint && <span className="font-normal tracking-normal normal-case">· {hint}</span>}
      </h3>
      <ul className="divide-y divide-divider">{children}</ul>
    </section>
  );
}

function DecisionRow({
  n,
  minutesLeft,
  handled,
  onAction,
  onUndo,
  onOpen,
}: {
  n: ZikiNotification;
  minutesLeft?: number;
  handled?: Handled;
  onAction: (action: NotificationAction) => void;
  onUndo: () => void;
  onOpen: () => void;
}) {
  const { actions } = kindMeta[n.kind];
  const { icon: KindIcon, tone } = kindVisual[n.kind];
  const [composing, setComposing] = useState<NotificationAction | null>(null);
  const [note, setNote] = useState("");
  const critical = minutesLeft !== undefined && minutesLeft <= 5;

  const submitNote = () => {
    if (!composing || !note.trim()) return;
    onAction(composing);
    setComposing(null);
    setNote("");
  };

  return (
    <li className={cx("flex gap-3 px-4 py-3.5", !n.read && !handled && "bg-[#f7faff]")}>
      <span className={cx("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
        <KindIcon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          {n.agent ? (
            <span className="inline-flex min-w-0 items-center gap-1 truncate">
              <Bot className="size-3 shrink-0" />
              {n.agent}
            </span>
          ) : (
            <span>Ziki</span>
          )}
          <span aria-hidden>·</span>
          <span className="shrink-0">{timeAgo(n.minutesAgo)}</span>
          {n.repeats && n.repeats > 1 && (
            <span className="shrink-0 rounded-full bg-chip px-1.5 font-semibold" title={`Sent ${n.repeats} times`}>
              ×{n.repeats}
            </span>
          )}
          {!n.read && !handled && (
            <span className="ml-auto size-2 shrink-0 rounded-full bg-blue-500" aria-label="Unread" />
          )}
        </div>

        <a href="#" onClick={onOpen} className="mt-0.5 block text-sm leading-5 font-semibold text-ink hover:text-accent">
          {n.subject}
        </a>
        {n.issue && (
          <p className="truncate text-[13px] leading-[18px] text-ink-2" title={n.issue.title}>
            <span className="font-mono text-muted">#{n.issue.id}</span> {n.issue.title}
          </p>
        )}
        {n.why && <p className="mt-0.5 text-[13px] leading-[18px] text-muted">{n.why}</p>}

        {(n.issue?.severity || n.points || (minutesLeft !== undefined && !handled)) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {n.issue?.severity && (
              <Chip tone={severityTone[n.issue.severity]} className="!px-2 !py-0 !text-[11px]">
                {n.issue.severity}
              </Chip>
            )}
            {n.points && (
              <span className="inline-flex items-center gap-1 rounded-full bg-points-bg px-2 text-[11px] leading-4 font-semibold text-points-fg">
                <Trophy className="size-3" />
                {n.points} pts
              </span>
            )}
            {minutesLeft !== undefined && !handled && (
              <span
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-2 text-[11px] leading-4 font-semibold",
                  critical ? "bg-[#fdecec] text-[#a4262c]" : "bg-warn-bg text-warn-fg",
                )}
              >
                <Clock className="size-3" />
                <span>
                  {minutesLeft === 0 ? "Time's up" : `${minutesLeft}m left`}
                  {n.ifIgnored && <span className="font-normal">, then {n.ifIgnored}</span>}
                </span>
              </span>
            )}
          </div>
        )}

        {handled ? (
          <div
            className="mt-2.5 flex items-center gap-2 rounded-lg bg-ok-bg px-2.5 py-1.5 text-[13px] text-ok-fg"
            role="status"
          >
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
          <div className="mt-2.5 flex flex-wrap gap-2">
            {actions.map((a) => {
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
        )}
      </div>
    </li>
  );
}

function UpdateRow({ n, onOpen }: { n: ZikiNotification; onOpen: () => void }) {
  const { icon: KindIcon, tone } = kindVisual[n.kind];
  return (
    <li>
      <a href="#" onClick={onOpen} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg">
        <span className={cx("inline-flex size-6 shrink-0 items-center justify-center rounded-full", tone)}>
          <KindIcon className="size-3" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">
          <span className="font-semibold text-ink">{n.subject}</span>
          {n.issue && <span className="text-muted"> · {n.issue.title}</span>}
        </span>
        <span className="shrink-0 text-xs text-muted">{timeAgo(n.minutesAgo)}</span>
        {!n.read && <span className="size-2 shrink-0 rounded-full bg-blue-500" aria-label="Unread" />}
      </a>
    </li>
  );
}
