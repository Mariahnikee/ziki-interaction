"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Priority } from "@/lib/data";
import {
  kindMeta,
  notifications as initialNotifications,
  URGENT_WITHIN_MIN,
  type NotificationAction,
  type NotificationKind,
  type ZikiNotification,
} from "@/lib/notifications";
import { Critter, type CritterMood } from "../critter";
import { Bell, Check, ChevronDown, Clock, RotateCcw, Trophy } from "../icons";
import { Chip, cx } from "../ui";

/** How the agent looks while it waits on this kind of decision. */
const kindMood: Record<NotificationKind, CritterMood> = {
  offer: "eager",
  bid: "eager",
  pairing: "hello",
  question: "curious",
  review: "inspect",
  merge: "proud",
  merge_blocked: "stuck",
  stalled: "sleepy",
  deadline: "worried",
  resolved: "happy",
  duplicate: "twins",
  redesign: "eager",
  points: "starry",
  merged: "proud",
};

/** Each agent keeps one colour so owners learn to recognise it; Ziki itself is navy. */
function critterColors(agent?: string): { color: string; screen: string; dashed?: boolean } {
  if (!agent) return { color: "#1d2b4f", screen: "#dff0ff" };
  if (agent.startsWith("Device code")) return { color: "#d9dee8", screen: "#fff", dashed: true };
  if (agent.includes("Claudi")) return { color: "#f2994a", screen: "#fff" };
  if (agent.includes("Merger")) return { color: "#2fb37a", screen: "#fff" };
  if (agent.includes("Triager")) return { color: "#8b6cf6", screen: "#fff" };
  return { color: "#3978f6", screen: "#fff" };
}

const BURST = [
  ["-14px", "-12px", "#3978f6"],
  ["14px", "-14px", "#ffcf3f"],
  ["18px", "4px", "#2fb37a"],
  ["-18px", "6px", "#ff8fa3"],
  ["0px", "-19px", "#8fc9ff"],
  ["6px", "16px", "#8b6cf6"],
] as const;

const RING = 2 * Math.PI * 22.5;

/** The agent as a critter, ringed by the time left before Ziki decides for you. */
function CritterAvatar({
  n,
  minutesLeft,
  cheering,
  done,
  size = 40,
}: {
  n: ZikiNotification;
  minutesLeft?: number;
  cheering?: boolean;
  /** The owner already answered, so the agent is happy, not waiting. */
  done?: boolean;
  size?: number;
}) {
  const { color, screen, dashed } = critterColors(n.agent);
  const windowMin = n.windowMin;
  const showRing = minutesLeft !== undefined && windowMin !== undefined && !cheering;
  const left = showRing ? Math.min(1, minutesLeft / windowMin) : 0;
  const critical = minutesLeft !== undefined && minutesLeft <= 5;
  return (
    <span className="relative inline-flex size-12 shrink-0 items-center justify-center">
      {showRing && (
        <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r="22.5" fill="none" stroke="var(--zk-divider)" strokeWidth="2" />
          <circle
            cx="24"
            cy="24"
            r="22.5"
            fill="none"
            stroke={critical ? "#e5484d" : "#f0a92e"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - left)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
      )}
      <span className={cx("inline-flex", cheering && "critter-cheer")}>
        <Critter
          mood={cheering || done ? "happy" : kindMood[n.kind]}
          color={color}
          screen={screen}
          dashed={dashed}
          size={size}
        />
      </span>
      {cheering &&
        BURST.map(([dx, dy, bg], i) => (
          <span
            key={i}
            aria-hidden
            className="burst-dot absolute top-1/2 left-1/2 size-1.5 rounded-full"
            style={{ background: bg, ["--dx" as string]: dx, ["--dy" as string]: dy }}
          />
        ))}
    </span>
  );
}

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

type Handled = { label: string };
type Tab = "needs" | "updates";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("needs");
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
  const urgentOpen = urgent.filter((n) => !handled[n.id]).length;
  const unreadUpdates = updates.filter((n) => !n.read).length;

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
    setExpandedId(null);
    setOpen(true);
  };

  const toggleRow = (n: ZikiNotification) => {
    markRead(n.id);
    setExpandedId((id) => (id === n.id ? null : n.id));
  };

  const rowProps = (n: ZikiNotification) => ({
    n,
    minutesLeft: minutesLeft(n),
    handled: handled[n.id],
    expanded: expandedId === n.id,
    onToggle: () => toggleRow(n),
    onAction: (a: NotificationAction) => resolve(n, a),
    onUndo: () => undo(n.id),
  });

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
        <Bell className={cx("size-[18px]", urgentOpen > 0 && !open && "bell-ring")} />
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
          className="panel-pop fixed inset-x-2 top-[72px] z-40 flex max-h-[min(520px,calc(100dvh-88px))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_16px_40px_-12px_rgba(21,18,31,0.22)] sm:absolute sm:inset-x-auto sm:top-[calc(100%+10px)] sm:right-0 sm:max-h-[min(480px,calc(100dvh-96px))] sm:w-[380px]"
        >
          <div className="border-b border-line px-3.5 pt-3 pb-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
                <p className="truncate text-xs text-muted">
                  {waiting.length === 0
                    ? "All quiet. Your crew is heads-down working."
                    : `Your crew is waiting on ${waiting.length} ${waiting.length === 1 ? "answer" : "answers"}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
                disabled={unread === 0}
                className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-accent hover:bg-tint disabled:cursor-default disabled:text-muted disabled:hover:bg-transparent"
              >
                Mark all read
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div role="group" aria-label="Show" className="flex rounded-full bg-seg p-0.5">
                {(
                  [
                    ["needs", "Needs you", waiting.length],
                    ["updates", "Updates", unreadUpdates],
                  ] as const
                ).map(([id, label, count]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={tab === id}
                    onClick={() => setTab(id)}
                    className={cx(
                      "h-7 rounded-full px-3 text-xs transition-colors",
                      tab === id
                        ? "bg-surface font-semibold text-ink shadow-[0_1px_2px_rgba(21,18,31,0.08)]"
                        : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {label}
                    {count > 0 && <span className="ml-1 text-muted">{count}</span>}
                  </button>
                ))}
              </div>
              <span className="flex items-center gap-2">
                {urgentOpen > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#a4262c]">
                    <Clock className="size-3" />
                    {urgentOpen} urgent
                  </span>
                )}
                <Crew agents={waiting.map((n) => n.agent)} />
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {tab === "needs" ? (
              <>
                {urgent.length > 0 && (
                  <Section title="Act now" hint="Ziki decides if you don't" tone="urgent">
                    {urgent.map((n) => (
                      <DecisionRow key={n.id} {...rowProps(n)} />
                    ))}
                  </Section>
                )}
                {needsYou.length > 0 && (
                  <Section title="Waiting on you">
                    {needsYou.map((n) => (
                      <DecisionRow key={n.id} {...rowProps(n)} />
                    ))}
                  </Section>
                )}
                {decisions.length === 0 && (
                  <Empty title="You're all caught up" body="No agent is waiting on you." />
                )}
              </>
            ) : updates.length > 0 ? (
              <ul className="divide-y divide-divider">
                {updates.map((n) => (
                  <UpdateRow key={n.id} n={n} onOpen={() => markRead(n.id)} />
                ))}
              </ul>
            ) : (
              <Empty title="No updates" body="Merges and points will show up here." />
            )}
          </div>

          <a
            href="#"
            className="border-t border-line px-4 py-2.5 text-center text-[13px] font-semibold text-accent hover:bg-bg"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}

/** Who is waiting on you (agents and Ziki), as a little overlapping lineup. */
function Crew({ agents }: { agents: (string | undefined)[] }) {
  const unique = [...new Set(agents)].slice(0, 4);
  if (unique.length === 0) return null;
  return (
    <span className="flex -space-x-1.5" aria-hidden>
      {unique.map((a) => {
        const { color, screen, dashed } = critterColors(a);
        return (
          <span key={a ?? "ziki"} className="inline-flex rounded-full bg-surface ring-2 ring-surface" title={a ?? "Ziki"}>
            <Critter mood="happy" color={color} screen={screen} dashed={dashed} size={20} className="!animate-none" />
          </span>
        );
      })}
    </span>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      <Critter mood="sleepy" color="#3978f6" size={56} className="mb-2" />
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] text-muted">{body}</p>
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
          "sticky top-0 z-10 flex items-center gap-2 border-b border-divider bg-surface/95 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase backdrop-blur",
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

/** The agent's model or role, e.g. "GPT-6" from "Nike Agent · GPT-6". */
function agentTag(agent?: string) {
  return agent?.split(" · ")[1] ?? agent;
}

function DecisionRow({
  n,
  minutesLeft,
  handled,
  expanded,
  onToggle,
  onAction,
  onUndo,
}: {
  n: ZikiNotification;
  minutesLeft?: number;
  handled?: Handled;
  expanded: boolean;
  onToggle: () => void;
  onAction: (action: NotificationAction) => void;
  onUndo: () => void;
}) {
  const { actions } = kindMeta[n.kind];
  const [composing, setComposing] = useState<NotificationAction | null>(null);
  const [note, setNote] = useState("");
  const [cheering, setCheering] = useState(false);
  const detailId = useId();

  useEffect(() => {
    if (!cheering) return;
    const t = setTimeout(() => setCheering(false), 900);
    return () => clearTimeout(t);
  }, [cheering]);

  const act = (a: NotificationAction) => {
    onAction(a);
    if (!a.href) setCheering(true);
  };

  const submitNote = () => {
    if (!composing || !note.trim()) return;
    act(composing);
    setComposing(null);
    setNote("");
  };

  return (
    <li className={cx("group", expanded && "bg-[#f7faff]")}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailId}
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-bg"
      >
        <CritterAvatar n={n} minutesLeft={handled ? undefined : minutesLeft} cheering={cheering} done={!!handled} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            {!n.read && !handled && (
              <>
                <span className="size-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
                <span className="sr-only">Unread:</span>
              </>
            )}
            <span
              className={cx(
                "truncate text-[13px] leading-[18px] font-semibold",
                handled ? "text-muted" : "text-ink",
              )}
            >
              {n.subject}
            </span>
          </span>
          {handled ? (
            <span className="flex items-center gap-1 truncate text-xs leading-4 text-ok-fg">
              <Check className="size-3 shrink-0" />
              <span className="truncate">{handled.label}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 truncate text-xs leading-4 text-muted">
              <span className="truncate">{n.agent ? `${agentTag(n.agent)} asks` : "Ziki"}</span>
              {n.issue && <span className="shrink-0">· #{n.issue.id}</span>}
              {minutesLeft !== undefined ? (
                <span
                  className={cx(
                    "shrink-0 font-semibold",
                    minutesLeft <= 5 ? "text-[#c4282d]" : "text-warn-fg",
                  )}
                >
                  · {minutesLeft === 0 ? "time's up" : `${minutesLeft}m left`}
                </span>
              ) : (
                <span className="shrink-0">· {timeAgo(n.minutesAgo)}</span>
              )}
              {n.repeats && n.repeats > 1 && (
                <span className="shrink-0" title={`Sent ${n.repeats} times`}>· ×{n.repeats}</span>
              )}
            </span>
          )}
        </span>
        <ChevronDown
          className={cx("size-3.5 shrink-0 text-muted transition-transform", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div id={detailId} className="row-open pr-3.5 pb-3 pl-[70px]">
          {n.issue && (
            <a
              href="#"
              className="block truncate text-[13px] leading-[18px] text-ink-2 hover:text-accent"
              title={n.issue.title}
            >
              <span className="font-mono text-muted">#{n.issue.id}</span> {n.issue.title}
            </a>
          )}
          {n.why && <p className="mt-0.5 text-[13px] leading-[18px] text-muted">{n.why}</p>}

          {(n.issue?.severity || n.points || (n.ifIgnored && !handled)) && (
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
              {n.ifIgnored && !handled && (
                <span className="text-[11px] text-muted">If ignored, {n.ifIgnored}</span>
              )}
            </div>
          )}

          {handled ? (
            <button
              type="button"
              onClick={onUndo}
              className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-accent hover:bg-tint"
            >
              <RotateCcw className="size-3" />
              Undo
            </button>
          ) : composing?.input ? (
            <form
              className="mt-2"
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
                  className="h-7 rounded-full px-3 text-xs font-semibold text-ink-2 hover:bg-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!note.trim()}
                  className={cx(
                    "h-7 rounded-full px-3 text-xs font-semibold disabled:opacity-50",
                    actionStyles[composing.variant === "danger" ? "danger" : "primary"],
                  )}
                >
                  {composing.input.submit}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {actions.map((a) => {
                const className = cx(
                  "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition-[background-color,transform] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
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
                    onClick={() => (a.input ? setComposing(a) : act(a))}
                    className={className}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function UpdateRow({ n, onOpen }: { n: ZikiNotification; onOpen: () => void }) {
  return (
    <li className="group">
      <a href="#" onClick={onOpen} className="flex items-center gap-2.5 px-3 py-2 hover:bg-bg">
        <CritterAvatar n={n} size={34} />
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-2">
          <span className="font-semibold text-ink">{n.subject}</span>
          {n.issue && <span className="text-muted"> · {n.issue.title}</span>}
        </span>
        <span className="shrink-0 text-xs text-muted">{timeAgo(n.minutesAgo)}</span>
        {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-blue-500" aria-label="Unread" />}
      </a>
    </li>
  );
}
