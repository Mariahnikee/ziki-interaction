import { assignedIssues, type Issue, type Priority, type Status } from "@/lib/data";
import { ChevronUp, Comment, Layers } from "../icons";
import { Card, Chip, PillButton } from "../ui";

const priorityTone: Record<Priority, "warn" | "neutral" | "info"> = {
  High: "warn",
  Medium: "warn",
  Low: "neutral",
};

const statusTone: Record<Status, "info" | "neutral"> = {
  Open: "info",
  Resolved: "neutral",
};

// Shared column template so header and rows line up.
const cols =
  "grid grid-cols-[68px_minmax(0,1fr)_108px_112px_92px_120px_100px] items-center";

const Dash = () => <span className="text-muted">—</span>;

function VotePill({ votes }: { votes: number }) {
  return (
    <button
      type="button"
      aria-label={`${votes} votes, upvote`}
      className="inline-flex h-[34px] min-w-[52px] items-center justify-center gap-1 rounded-full bg-blue-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
    >
      <ChevronUp className="size-3" strokeWidth={2.5} />
      {votes}
    </button>
  );
}

function IssueTitle({ issue }: { issue: Issue }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-tint text-accent">
        <Layers className="size-4" />
      </span>
      <div className="min-w-0">
        <a href="#" className="block truncate text-sm font-semibold text-ink hover:text-accent">
          {issue.title}
        </a>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          #{issue.id}
          <span className="inline-flex items-center gap-1">
            <Comment className="size-3" />
            {issue.comments} {issue.comments === 1 ? "comment" : "comments"}
          </span>
        </p>
      </div>
    </div>
  );
}

function PriorityChip({ priority }: { priority: Priority }) {
  return <Chip tone={priorityTone[priority]}>{priority}</Chip>;
}

function StatusChip({ status }: { status: Status }) {
  return <Chip tone={statusTone[status]} dot>{status}</Chip>;
}

function StageCell({ stage }: { stage: string | null }) {
  return stage ? <Chip tone="ok" dot>{stage}</Chip> : <Dash />;
}

export function IssuesTable() {
  return (
    <Card className="px-4 pt-5 pb-[17px] sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Issues assigned to me</h2>
          <p className="text-[13px] text-muted">
            {assignedIssues.length} issues · sorted by top votes
          </p>
        </div>
        <PillButton variant="outline-accent" className="h-9 px-4 text-[13px]">View all issues</PillButton>
      </div>

      {/* Desktop / tablet: full table */}
      <div className="mt-[13px] hidden md:block">
        <div className="-mx-1 overflow-x-auto px-1">
          <div role="table" aria-label="Issues assigned to me" className="min-w-[860px]">
            <div
              role="row"
              className={`${cols} h-11 rounded-2xl bg-tint px-4 text-xs font-semibold tracking-wider text-blue-600 uppercase`}
            >
              <span role="columnheader">Votes</span>
              <span role="columnheader">Issue</span>
              <span role="columnheader">Type</span>
              <span role="columnheader">Priority</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Stage</span>
              <span role="columnheader">Reported</span>
            </div>
            {assignedIssues.map((issue) => (
              <div
                role="row"
                key={issue.id}
                className={`${cols} h-[66px] border-b border-divider px-4 last:border-b-0`}
              >
                <span role="cell"><VotePill votes={issue.votes} /></span>
                <span role="cell" className="pr-4"><IssueTitle issue={issue} /></span>
                <span role="cell" className="text-[13px] text-ink-2">{issue.type ?? <Dash />}</span>
                <span role="cell"><PriorityChip priority={issue.priority} /></span>
                <span role="cell"><StatusChip status={issue.status} /></span>
                <span role="cell"><StageCell stage={issue.stage} /></span>
                <span role="cell" className="text-sm text-ink-2">{issue.reported}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: stacked rows */}
      <ul className="mt-4 divide-y divide-divider md:hidden">
        {assignedIssues.map((issue) => (
          <li key={issue.id} className="flex gap-3 py-3.5">
            <VotePill votes={issue.votes} />
            <div className="min-w-0 flex-1">
              <a href="#" className="line-clamp-2 text-sm font-semibold text-ink">
                {issue.title}
              </a>
              <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                #{issue.id}
                <span className="inline-flex items-center gap-1">
                  <Comment className="size-3" />
                  {issue.comments}
                </span>
                <span>· {issue.reported}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <PriorityChip priority={issue.priority} />
                <StatusChip status={issue.status} />
                {issue.stage && <StageCell stage={issue.stage} />}
                {issue.type && <Chip>{issue.type}</Chip>}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[13px] text-muted">Showing {assignedIssues.length} issues</p>
    </Card>
  );
}
