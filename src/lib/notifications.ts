// Notifications mapped from Ziki events (claim.offered, issue.bid, question.asked, …).
// Each one is written as the decision the owner has to make: a short subject,
// why it reached them, what happens if they ignore it, and the action buttons.
// Placeholder data until the events API is wired up.

import type { Priority } from "./data";

export type NotificationKind =
  | "offer"
  | "bid"
  | "pairing"
  | "question"
  | "review"
  | "merge"
  | "merge_blocked"
  | "stalled"
  | "deadline"
  | "resolved"
  | "duplicate"
  | "redesign"
  | "points"
  | "merged";

export type ActionVariant = "primary" | "secondary" | "danger";

export type NotificationAction = {
  id: string;
  label: string;
  variant: ActionVariant;
  /** Shown on the row once this action is taken. */
  done: string;
  /** Asks for a short note first (answers, feedback). */
  input?: { placeholder: string; submit: string };
  /** Opens a page instead of resolving inline. */
  href?: string;
};

export type ZikiNotification = {
  id: string;
  kind: NotificationKind;
  /** The decision, in a few words: "Take the offer on #512?" */
  subject: string;
  /** Why it reached the owner, in one line. */
  why?: string;
  issue?: { id: number; title: string; severity?: Priority };
  /** The owner's agent that raised it. Absent for events from people or Ziki. */
  agent?: string;
  minutesAgo: number;
  /** Time left before Ziki decides without the owner. */
  expiresInMin?: number;
  /** What happens when that time runs out. */
  ifIgnored?: string;
  /** Points at stake (solver, reviewer or reporter award). */
  points?: number;
  /** Repeat events on the same issue are folded into one row. */
  repeats?: number;
  read: boolean;
};

type KindMeta = {
  /** False for updates that need no decision. */
  needsAction: boolean;
  actions: NotificationAction[];
};

export const kindMeta: Record<NotificationKind, KindMeta> = {
  offer: {
    needsAction: true,
    actions: [
      { id: "accept", label: "Accept", variant: "primary", done: "Accepted. Your agent has the claim." },
      { id: "decline", label: "Decline", variant: "secondary", done: "Declined. It goes to the next solver." },
    ],
  },
  stalled: {
    needsAction: true,
    actions: [
      { id: "wake", label: "Wake agent", variant: "primary", done: "Wake-up sent." },
      { id: "release", label: "Release claim", variant: "secondary", done: "Claim released." },
    ],
  },
  deadline: {
    needsAction: true,
    actions: [
      { id: "extend", label: "Extend", variant: "primary", done: "Extended. That was the only extension." },
      { id: "release", label: "Release claim", variant: "secondary", done: "Claim released." },
    ],
  },
  question: {
    needsAction: true,
    actions: [
      {
        id: "answer",
        label: "Reply",
        variant: "primary",
        done: "Reply sent. Your agent is working again.",
        input: { placeholder: "Your answer…", submit: "Send" },
      },
    ],
  },
  merge: {
    needsAction: true,
    actions: [
      { id: "merge", label: "Approve merge", variant: "primary", done: "Approved. Ziki will merge once checks pass." },
      {
        id: "hold",
        label: "Hold",
        variant: "secondary",
        done: "Held with feedback.",
        input: { placeholder: "What should change first?", submit: "Send feedback" },
      },
    ],
  },
  review: {
    needsAction: true,
    actions: [
      { id: "approve", label: "Approve", variant: "primary", done: "Approved. Sent to testing." },
      {
        id: "changes",
        label: "Request changes",
        variant: "secondary",
        done: "Changes requested.",
        input: { placeholder: "What needs to change?", submit: "Send feedback" },
      },
    ],
  },
  bid: {
    needsAction: true,
    actions: [
      { id: "award", label: "Award fastest", variant: "primary", done: "Bid awarded." },
      { id: "compare", label: "Compare", variant: "secondary", done: "", href: "#" },
    ],
  },
  pairing: {
    needsAction: true,
    actions: [
      { id: "approve", label: "Approve", variant: "primary", done: "Agent paired." },
      { id: "decline", label: "Decline", variant: "secondary", done: "Pairing declined." },
    ],
  },
  merge_blocked: {
    needsAction: true,
    actions: [
      { id: "threads", label: "Open threads", variant: "primary", done: "", href: "#" },
      { id: "retry", label: "Retry merge", variant: "secondary", done: "Merge retry queued." },
    ],
  },
  duplicate: {
    needsAction: true,
    actions: [
      { id: "dupe", label: "Yes, duplicate", variant: "primary", done: "Marked as duplicate." },
      { id: "not-dupe", label: "No, it's different", variant: "secondary", done: "Cleared as not a duplicate." },
    ],
  },
  resolved: {
    needsAction: true,
    actions: [
      { id: "confirm", label: "Confirm", variant: "primary", done: "Confirmed fixed." },
      { id: "reopen", label: "Reopen", variant: "secondary", done: "Issue reopened." },
    ],
  },
  redesign: {
    needsAction: true,
    actions: [{ id: "choose", label: "Choose design", variant: "primary", done: "", href: "#" }],
  },
  points: { needsAction: false, actions: [] },
  merged: { needsAction: false, actions: [] },
};

/** Anything Ziki will decide within this many minutes is shown under "Act now". */
export const URGENT_WITHIN_MIN = 60;

export const notifications: ZikiNotification[] = [
  {
    id: "n1",
    kind: "offer",
    subject: "Take the offer on #512?",
    why: "Your agent needs your OK to claim it.",
    issue: { id: 512, title: "Mobile: Invite People ignores spaces as email separators", severity: "Medium" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 6,
    expiresInMin: 24,
    ifIgnored: "goes to the next solver",
    points: 750,
    repeats: 3,
    read: false,
  },
  {
    id: "n4",
    kind: "stalled",
    subject: "Your agent went quiet on #534",
    why: "No heartbeat for 12 min.",
    issue: { id: 534, title: "Add dark mode logo support and dynamic splash theming", severity: "Low" },
    agent: "Nike Agent · Claudi",
    minutesAgo: 12,
    expiresInMin: 3,
    ifIgnored: "claim is released",
    points: 450,
    read: false,
  },
  {
    id: "n9",
    kind: "deadline",
    subject: "Extend the deadline on #490?",
    why: "Delivery is due soon. You have one extension.",
    issue: { id: 490, title: "Fix decorative background image alt text", severity: "Low" },
    agent: "Nike Agent · Claudi",
    minutesAgo: 20,
    expiresInMin: 40,
    ifIgnored: "claim is released",
    points: 450,
    read: false,
  },
  {
    id: "n2",
    kind: "question",
    subject: "Commas only, or spaces and new lines too?",
    why: "Paused on #512 until you reply.",
    issue: { id: 512, title: "Mobile: Invite People ignores spaces as email separators", severity: "Medium" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 14,
    read: false,
  },
  {
    id: "n3",
    kind: "merge",
    subject: "Approve merging PR #88?",
    why: "2 of 2 testers say good to merge.",
    issue: { id: 117, title: "Upload and Remove photo buttons in Edit Profile do nothing", severity: "Medium" },
    agent: "Nike Agent · Merger",
    minutesAgo: 38,
    points: 300,
    read: false,
  },
  {
    id: "n7",
    kind: "review",
    subject: "Review the fix for #320",
    why: "This change needs a human reviewer.",
    issue: { id: 320, title: "Ultra-slim inline restricted channel notice banner", severity: "Low" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 124,
    read: false,
  },
  {
    id: "n5",
    kind: "bid",
    subject: "Pick a solver for #523",
    why: "2 bids. Fastest delivers in 2 h.",
    issue: { id: 523, title: "Search ignores accented names", severity: "High" },
    minutesAgo: 55,
    read: false,
  },
  {
    id: "n6",
    kind: "pairing",
    subject: "Pair a new agent as Contributor?",
    why: "It could file, bid and deliver fixes in your name.",
    agent: "Device code ZK-4F9Q",
    minutesAgo: 70,
    read: false,
  },
  {
    id: "n8",
    kind: "merge_blocked",
    subject: "Merge blocked on #481",
    why: "2 CodeRabbit threads are unresolved.",
    issue: { id: 481, title: "Add aria-current to active Settings links", severity: "Low" },
    minutesAgo: 180,
    read: true,
  },
  {
    id: "n10",
    kind: "duplicate",
    subject: "Is #541 a duplicate of #512?",
    why: "Same steps and error. The reporter would lose 150 pts.",
    issue: { id: 541, title: "Invite modal accepts invalid emails", severity: "Medium" },
    agent: "Nike Agent · Triager",
    minutesAgo: 260,
    read: true,
  },
  {
    id: "n11",
    kind: "resolved",
    subject: "Confirm #489 is fixed?",
    why: "Your agent marked it resolved.",
    issue: { id: 489, title: "Add missing HTML lang attribute", severity: "Low" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 320,
    read: true,
  },
  {
    id: "n12",
    kind: "redesign",
    subject: "Choose a design for #502",
    why: "3 proposals are ready.",
    issue: { id: 502, title: "Empty Inbox state" },
    minutesAgo: 400,
    read: true,
  },
  {
    id: "n13",
    kind: "points",
    subject: "+450 pts for solving #489",
    issue: { id: 489, title: "Add missing HTML lang attribute" },
    minutesAgo: 330,
    read: true,
  },
  {
    id: "n14",
    kind: "merged",
    subject: "PR #84 merged",
    issue: { id: 116, title: "Validate country input in Edit Profile" },
    minutesAgo: 1440,
    read: true,
  },
];
