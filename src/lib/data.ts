// Placeholder data matching the reference screenshot until a real API is wired up.

export type Priority = "High" | "Medium" | "Low";
export type Status = "Open" | "Resolved";

export type Issue = {
  id: number;
  votes: number;
  title: string;
  comments: number;
  type: string | null;
  priority: Priority;
  status: Status;
  stage: string | null;
  reported: string;
};

export type AgentStatus = "Offline" | "Idle" | "Working";

export type Agent = {
  name: string;
  model: string;
  status: AgentStatus;
  activity: string;
  lastSeen: string;
};

export type PointsBar = { label: string; value: number; delta?: number };
export type PointsRange = "Daily" | "Weekly" | "Monthly" | "Yearly";

export const user = {
  firstName: "Shoyemi",
  fullName: "Shoyemi Maria",
  points: 563,
};

export const project = "Zedu";

export const stats = {
  points: { value: 563, toGo: 500, required: 500 },
  created: { value: 22, delta: 22 },
  assigned: { value: 5, highPriority: 0 },
  resolved: { value: 4, percent: 80 },
};

export const assignedIssues: Issue[] = [
  { id: 116, votes: 13, title: "[Bug] Validate country input in Edit Profile", comments: 1, type: "Fix", priority: "Medium", status: "Resolved", stage: null, reported: "Oct 17" },
  { id: 117, votes: 12, title: "[Bug] Upload photo and Remove photo buttons in Edit Profile do nothing", comments: 1, type: "Fix", priority: "Medium", status: "Open", stage: "Ready", reported: "Oct 17" },
  { id: 490, votes: 2, title: "[Design] Fix Decorative Background Image Alt Text on Landing Page", comments: 2, type: null, priority: "Low", status: "Resolved", stage: null, reported: "6 days ago" },
  { id: 489, votes: 2, title: "[Bug] Add Missing HTML Language Attribute to Document Root", comments: 2, type: null, priority: "Low", status: "Resolved", stage: null, reported: "6 days ago" },
  { id: 481, votes: 1, title: "[Bug] Add aria-current to Active Settings Navigation Links", comments: 2, type: null, priority: "Low", status: "Resolved", stage: null, reported: "6 days ago" },
];

export const pointsRequirement = 500;

export const pointsByRange: Record<PointsRange, { subtitle: string; bars: PointsBar[]; requirement?: number }> = {
  Daily: {
    subtitle: "Points earned each day, last 8 days",
    bars: [
      { label: "21 Oct", value: 0 },
      { label: "22 Oct", value: 0 },
      { label: "23 Oct", value: 0 },
      { label: "24 Oct", value: 0 },
      { label: "25 Oct", value: 0 },
      { label: "26 Oct", value: 0 },
      { label: "27 Oct", value: 0 },
      { label: "28 Oct", value: 0 },
    ],
  },
  Weekly: {
    subtitle: "Points earned each week, last 8 weeks · 500 pts required, more is welcome",
    requirement: pointsRequirement,
    bars: [
      { label: "7 Sept", value: 0 },
      { label: "14 Sept", value: 0 },
      { label: "21 Sept", value: 0 },
      { label: "28 Sept", value: 0 },
      { label: "5 Oct", value: 0 },
      { label: "12 Oct", value: 0 },
      { label: "19 Oct", value: 563, delta: 63 },
      { label: "26 Oct", value: 0 },
    ],
  },
  Monthly: {
    subtitle: "Points earned each month, last 6 months",
    bars: [
      { label: "May", value: 0 },
      { label: "Jun", value: 0 },
      { label: "Jul", value: 0 },
      { label: "Aug", value: 0 },
      { label: "Sept", value: 0 },
      { label: "Oct", value: 563 },
    ],
  },
  Yearly: {
    subtitle: "Points earned each year",
    bars: [
      { label: "2025", value: 0 },
      { label: "2026", value: 563 },
    ],
  },
};

export const agents: Agent[] = [
  { name: "Nike Agent", model: "Claudi", status: "Offline", activity: "No recent activity", lastSeen: "2 days ago" },
  { name: "Nike Agent", model: "GPT-6", status: "Idle", activity: "Standing by", lastSeen: "22 min ago" },
  { name: "Nike Agent", model: "GPT-6", status: "Idle", activity: "Standing by", lastSeen: "1 hr ago" },
];
