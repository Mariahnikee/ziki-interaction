// Notifications mapped from Ziki events (claim.offered, issue.bid, question.asked, …).
// Each kind has a short subject and the action the owner is expected to take.
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
  /** Asks for a short note first (answers, rejection feedback). */
  input?: { placeholder: string; submit: string };
  /** Opens a page instead of resolving inline. */
  href?: string;
};

export type ZikiNotification = {
  id: string;
  kind: NotificationKind;
  subject: string;
  /** One line of context: the agent's question, the PR, the checks that failed. */
  detail?: string;
  issue?: { id: number; severity?: Priority };
  agent?: string;
  minutesAgo: number;
  /** Offers live 30 minutes; claims lapse without a heartbeat. */
  expiresInMin?: number;
  /** Repeat events on the same issue are folded into one row. */
  repeats?: number;
  points?: number;
  read: boolean;
};

type KindMeta = {
  category: string;
  /** False for updates that need no decision. */
  needsAction: boolean;
  actions: NotificationAction[];
};

export const kindMeta: Record<NotificationKind, KindMeta> = {
  offer: {
    category: "Offer",
    needsAction: true,
    actions: [
      { id: "accept", label: "Accept", variant: "primary", done: "Accepted. Your agent has the claim." },
      { id: "decline", label: "Decline", variant: "secondary", done: "Declined. The offer goes to the next solver." },
    ],
  },
  bid: {
    category: "Bid",
    needsAction: true,
    actions: [
      { id: "award", label: "Award bid", variant: "primary", done: "Bid awarded." },
      { id: "view", label: "Compare bids", variant: "secondary", done: "", href: "#" },
    ],
  },
  pairing: {
    category: "Pairing request",
    needsAction: true,
    actions: [
      { id: "approve", label: "Approve", variant: "primary", done: "Agent paired." },
      { id: "decline", label: "Decline", variant: "secondary", done: "Pairing declined." },
    ],
  },
  question: {
    category: "Question",
    needsAction: true,
    actions: [
      {
        id: "answer",
        label: "Answer",
        variant: "primary",
        done: "Answer sent. Your agent will resume.",
        input: { placeholder: "Type your answer…", submit: "Send answer" },
      },
    ],
  },
  review: {
    category: "Review",
    needsAction: true,
    actions: [
      { id: "approve", label: "Approve fix", variant: "primary", done: "Approved. Sent to testing." },
      {
        id: "changes",
        label: "Request changes",
        variant: "secondary",
        done: "Changes requested.",
        input: { placeholder: "What needs to change?", submit: "Send feedback" },
      },
    ],
  },
  merge: {
    category: "Ready to merge",
    needsAction: true,
    actions: [
      { id: "merge", label: "Merge", variant: "primary", done: "Merge queued. Ziki is checking the PR." },
      {
        id: "reject",
        label: "Reject",
        variant: "danger",
        done: "Rejected with feedback.",
        input: { placeholder: "Why is this not ready?", submit: "Reject" },
      },
    ],
  },
  merge_blocked: {
    category: "Merge blocked",
    needsAction: true,
    actions: [
      { id: "checks", label: "View checks", variant: "primary", done: "", href: "#" },
      { id: "retry", label: "Retry merge", variant: "secondary", done: "Merge retry queued." },
    ],
  },
  stalled: {
    category: "Agent silent",
    needsAction: true,
    actions: [
      { id: "wake", label: "Wake agent", variant: "primary", done: "Wake-up sent." },
      { id: "release", label: "Release claim", variant: "secondary", done: "Claim released." },
    ],
  },
  deadline: {
    category: "Deadline",
    needsAction: true,
    actions: [
      { id: "extend", label: "Extend once", variant: "primary", done: "Deadline extended. No more extensions left." },
      { id: "release", label: "Release claim", variant: "secondary", done: "Claim released." },
    ],
  },
  resolved: {
    category: "Resolved by agent",
    needsAction: true,
    actions: [
      { id: "confirm", label: "Confirm", variant: "primary", done: "Resolution confirmed." },
      { id: "reopen", label: "Reopen", variant: "secondary", done: "Issue reopened." },
    ],
  },
  duplicate: {
    category: "Possible duplicate",
    needsAction: true,
    actions: [
      { id: "dupe", label: "Mark duplicate", variant: "primary", done: "Marked as duplicate." },
      { id: "not-dupe", label: "Not a duplicate", variant: "secondary", done: "Cleared as not a duplicate." },
    ],
  },
  redesign: {
    category: "Redesign",
    needsAction: true,
    actions: [{ id: "pick", label: "Pick a winner", variant: "primary", done: "", href: "#" }],
  },
  points: { category: "Points", needsAction: false, actions: [] },
  merged: { category: "Merged", needsAction: false, actions: [] },
};

export const notifications: ZikiNotification[] = [
  {
    id: "n1",
    kind: "offer",
    subject: "Mobile: Invite People ignores spaces as email separators",
    issue: { id: 512, severity: "Medium" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 6,
    expiresInMin: 24,
    repeats: 3,
    read: false,
  },
  {
    id: "n2",
    kind: "question",
    subject: "Which email separators should Invite People accept?",
    detail: "Commas only, or commas, spaces and new lines?",
    issue: { id: 512, severity: "Medium" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 14,
    read: false,
  },
  {
    id: "n3",
    kind: "merge",
    subject: "Upload and Remove photo buttons in Edit Profile",
    detail: "PR #88 · 2 of 2 testers say good to merge",
    issue: { id: 117, severity: "Medium" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 38,
    read: false,
  },
  {
    id: "n4",
    kind: "stalled",
    subject: "Add dark mode logo support and dynamic splash theming",
    detail: "No heartbeat for 12 min. The claim lapses at 15.",
    issue: { id: 534, severity: "Low" },
    agent: "Nike Agent · Claudi",
    minutesAgo: 12,
    expiresInMin: 3,
    read: false,
  },
  {
    id: "n5",
    kind: "bid",
    subject: "2 bids on your issue: Search ignores accented names",
    detail: "Fastest delivery: 2 h",
    issue: { id: 523, severity: "High" },
    minutesAgo: 55,
    read: false,
  },
  {
    id: "n6",
    kind: "pairing",
    subject: "New agent wants to pair as Contributor",
    detail: "Device code ZK-4F9Q · project Zedu",
    agent: "Nike Agent · GPT-6",
    minutesAgo: 70,
    read: false,
  },
  {
    id: "n7",
    kind: "review",
    subject: "Ultra-slim inline restricted channel notice banner",
    detail: "PR #320 linked · awaiting human review",
    issue: { id: 320, severity: "Low" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 124,
    read: false,
  },
  {
    id: "n8",
    kind: "merge_blocked",
    subject: "Add aria-current to active Settings links",
    detail: "2 CodeRabbit threads unresolved",
    issue: { id: 481, severity: "Low" },
    minutesAgo: 180,
    read: false,
  },
  {
    id: "n9",
    kind: "deadline",
    subject: "Fix decorative background image alt text",
    detail: "Delivery due in 40 min",
    issue: { id: 490, severity: "Low" },
    agent: "Nike Agent · Claudi",
    minutesAgo: 200,
    read: true,
  },
  {
    id: "n10",
    kind: "duplicate",
    subject: "Invite modal accepts invalid emails",
    detail: "Looks like #512",
    issue: { id: 541, severity: "Medium" },
    minutesAgo: 260,
    read: true,
  },
  {
    id: "n11",
    kind: "resolved",
    subject: "Add missing HTML lang attribute",
    issue: { id: 489, severity: "Low" },
    agent: "Nike Agent · GPT-6",
    minutesAgo: 320,
    read: true,
  },
  {
    id: "n12",
    kind: "redesign",
    subject: "3 proposals for the empty Inbox state",
    issue: { id: 502 },
    minutesAgo: 400,
    read: true,
  },
  {
    id: "n13",
    kind: "points",
    subject: "+450 pts for solving #489",
    issue: { id: 489 },
    points: 450,
    minutesAgo: 330,
    read: true,
  },
  {
    id: "n14",
    kind: "merged",
    subject: "Validate country input in Edit Profile",
    detail: "PR #84 merged by Ziki",
    issue: { id: 116 },
    minutesAgo: 1440,
    read: true,
  },
];
