"use client";

import { useState } from "react";
import { playbookRules, type PlaybookRule, type RuleStatus } from "@/lib/data";
import { Comment } from "../icons";
import { Card, Chip, PillButton, cx } from "../ui";

type Filter = "Suggested" | "Approved" | "Dismissed";

const filters: Filter[] = ["Suggested", "Approved", "Dismissed"];

const filterStatuses: Record<Filter, RuleStatus[]> = {
  Suggested: ["pending"],
  Approved: ["accepted", "edited"],
  Dismissed: ["dismissed"],
};

const emptyText: Record<Filter, string> = {
  Suggested: "No suggestions waiting. New ones appear when human feedback repeats a pattern.",
  Approved: "No approved guidance yet. Accept a suggestion to add it here.",
  Dismissed: "Nothing dismissed.",
};

const TODAY = "Oct 28";

function StatusChip({ rule }: { rule: PlaybookRule }) {
  switch (rule.status) {
    case "pending":
      return <Chip tone="warn">Proposed · not shared with agents</Chip>;
    case "accepted":
      return <Chip tone="ok" dot>Approved guidance</Chip>;
    case "edited":
      return <Chip tone="ok" dot>Approved · edited</Chip>;
    case "dismissed":
      return <Chip>Dismissed</Chip>;
  }
}

function Evidence({ rule }: { rule: PlaybookRule }) {
  const count = rule.evidence.length;
  return (
    <details open={rule.status === "pending"} className="group mt-3">
      <summary className="cursor-pointer list-none text-[13px] font-semibold text-accent marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Show</span>
        <span className="hidden group-open:inline">Hide</span> the {count} piece{count === 1 ? "" : "s"} of feedback it came from
      </summary>
      <ul className="mt-2 flex flex-col gap-2">
        {rule.evidence.map((e, i) => (
          <li key={i} className="rounded-xl border-l-2 border-blue-300 bg-bg px-3 py-2">
            <p className="text-[13px] text-ink-2">&ldquo;{e.quote}&rdquo;</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
              <Comment className="size-3" />
              <span className="font-semibold text-ink-2">#{e.issueId}</span>
              <span>· {e.kind} by {e.author} · {e.date}</span>
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}

function RuleCard({
  rule,
  editing,
  onAccept,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDismiss,
  onRestore,
}: {
  rule: PlaybookRule;
  editing: boolean;
  onAccept: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (text: string) => void;
  onDismiss: () => void;
  onRestore: () => void;
}) {
  const [draft, setDraft] = useState(rule.rule);
  const pending = rule.status === "pending";
  const approved = rule.status === "accepted" || rule.status === "edited";
  const fieldId = `rule-edit-${rule.id}`;

  return (
    <li
      className={cx(
        "rounded-2xl border p-4 sm:p-5",
        pending && "border-dashed border-blue-300 bg-blue-50/50",
        approved && "border-line bg-surface",
        rule.status === "dismissed" && "border-line bg-bg",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip rule={rule} />
        <Chip tone="blue">{rule.scope}</Chip>
        <span className="text-xs text-muted">For {rule.appliesTo.join(" and ")} agents</span>
        {rule.decidedOn && !pending && (
          <span className="ml-auto text-xs text-muted">
            {rule.status === "dismissed" ? "Dismissed" : "Approved"} {rule.decidedOn}
          </span>
        )}
      </div>

      {editing ? (
        <div className="mt-3">
          <label htmlFor={fieldId} className="text-[13px] font-semibold text-ink">
            Edit rule
          </label>
          <textarea
            id={fieldId}
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-1.5 w-full resize-y rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-accent"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <PillButton
              variant="primary"
              className="h-9 px-4 text-[13px]"
              disabled={!draft.trim()}
              onClick={() => onSaveEdit(draft.trim())}
            >
              Approve edited rule
            </PillButton>
            <PillButton
              variant="ghost"
              className="h-9 px-4 text-[13px]"
              onClick={() => {
                setDraft(rule.rule);
                onCancelEdit();
              }}
            >
              Cancel
            </PillButton>
          </div>
        </div>
      ) : (
        <p
          className={cx(
            "mt-3 text-[15px] leading-6 font-semibold",
            rule.status === "dismissed" ? "text-muted line-through decoration-muted/50" : "text-ink",
          )}
        >
          {rule.rule}
        </p>
      )}

      {rule.status === "edited" && (
        <p className="mt-1.5 text-xs text-muted">
          Original suggestion: <span className="italic">{rule.originalRule}</span>
        </p>
      )}

      <p className="mt-2 text-[13px] text-muted">
        <span className="font-semibold text-ink-2">Why suggested: </span>
        {rule.reason}
      </p>

      <Evidence rule={rule} />

      {pending && !editing && (
        <div className="mt-4 flex flex-wrap gap-2">
          <PillButton variant="primary" className="h-9 px-4 text-[13px]" onClick={onAccept}>
            Accept
          </PillButton>
          <PillButton className="h-9 px-4 text-[13px]" onClick={onEdit}>
            Edit
          </PillButton>
          <PillButton variant="ghost" className="h-9 px-4 text-[13px]" onClick={onDismiss}>
            Dismiss
          </PillButton>
        </div>
      )}
      {rule.status === "dismissed" && (
        <div className="mt-4">
          <PillButton className="h-9 px-4 text-[13px]" onClick={onRestore}>
            Restore to suggestions
          </PillButton>
        </div>
      )}
    </li>
  );
}

export function PlaybookPanel() {
  const [rules, setRules] = useState(playbookRules);
  const [filter, setFilter] = useState<Filter>("Suggested");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const update = (id: string, patch: Partial<PlaybookRule>, message: string) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setEditingId(null);
    setAnnouncement(message);
  };

  const count = (f: Filter) => rules.filter((r) => filterStatuses[f].includes(r.status)).length;
  const visible = rules.filter((r) => filterStatuses[filter].includes(r.status));

  return (
    <Card className="px-4 pt-5 pb-5 sm:px-5" aria-labelledby="playbook-title">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 id="playbook-title" className="text-lg font-semibold tracking-tight text-ink">
              Project playbook
            </h2>
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-accent">
              {count("Suggested")}
            </span>
          </div>
          <p className="mt-1 max-w-xl text-[13px] text-muted">
            Rules suggested from repeated human feedback. A suggestion only becomes guidance for agents after a person accepts or edits it.
          </p>
        </div>

        <div role="group" aria-label="Filter playbook rules" className="flex self-start rounded-full bg-seg p-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={f === filter}
              onClick={() => {
                setFilter(f);
                setAnnouncement("");
              }}
              className={cx(
                "h-8 rounded-full px-3 text-[13px] whitespace-nowrap transition-colors sm:px-3.5",
                f === filter
                  ? "bg-surface font-semibold text-ink shadow-[0_1px_2px_rgba(21,18,31,0.08)]"
                  : "text-ink-2 hover:text-ink",
              )}
            >
              {f} <span className="text-muted">{count(f)}</span>
            </button>
          ))}
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-[13px] font-semibold text-ok-fg">
        {announcement}
      </p>

      {visible.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-[13px] text-muted">
          {emptyText[filter]}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-3">
          {visible.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              editing={editingId === rule.id}
              onAccept={() =>
                update(rule.id, { status: "accepted", decidedOn: TODAY }, "Rule accepted. It now appears under Approved.")
              }
              onEdit={() => setEditingId(rule.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaveEdit={(text) =>
                update(
                  rule.id,
                  { rule: text, status: text === rule.originalRule ? "accepted" : "edited", decidedOn: TODAY },
                  "Edited rule approved. It now appears under Approved.",
                )
              }
              onDismiss={() =>
                update(rule.id, { status: "dismissed", decidedOn: TODAY }, "Suggestion dismissed. You can restore it from Dismissed.")
              }
              onRestore={() =>
                update(rule.id, { status: "pending", decidedOn: undefined }, "Suggestion restored to Suggested.")
              }
            />
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-muted">
        Prototype: decisions are kept in this page only and are not sent to any agent.
      </p>
    </Card>
  );
}
