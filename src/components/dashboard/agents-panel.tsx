"use client";

import { useState } from "react";
import { agents, type AgentStatus } from "@/lib/data";
import { ChevronDown, ChevronUp } from "../icons";
import { Card, StatusDot, cx } from "../ui";

const statusText: Record<AgentStatus, string> = {
  Offline: "text-ink-2",
  Idle: "text-ok-fg",
  Working: "text-accent",
};

const cols = "grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_96px] lg:grid-cols-[356px_183px_minmax(0,1fr)_96px] items-center whitespace-nowrap gap-x-4";

export function AgentsPanel() {
  const [open, setOpen] = useState(true);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Your agents</h2>
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-accent">
            {agents.length}
          </span>
        </div>
        <button
          type="button"
          aria-label={open ? "Collapse agents" : "Expand agents"}
          aria-expanded={open}
          aria-controls="agents-table"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-bg"
        >
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {open && (
        <div id="agents-table" role="table" aria-label="Your agents">
          <div
            role="row"
            className={`${cols} h-[41px] bg-tint px-4 text-xs font-semibold tracking-wider text-blue-600 uppercase sm:px-5`}
          >
            <span role="columnheader">Agent</span>
            <span role="columnheader" className="hidden md:block">Status</span>
            <span role="columnheader" className="hidden md:block">Current activity</span>
            <span role="columnheader" className="text-right">Last seen</span>
          </div>
          {agents.map((agent, i) => (
            <div
              role="row"
              key={i}
              className={`${cols} min-h-[49px] border-b border-divider px-4 py-2 last:border-b-0 sm:px-5`}
            >
              <span role="cell" className="flex min-w-0 items-center gap-2">
                <StatusDot status={agent.status} />
                <span className="text-sm font-semibold text-ink">{agent.name}</span>
                <span className="truncate text-xs text-muted">{agent.model}</span>
                <span className={cx("text-xs md:hidden", statusText[agent.status])}>· {agent.status}</span>
              </span>
              <span role="cell" className={cx("hidden text-sm md:block", statusText[agent.status])}>
                {agent.status}
              </span>
              <span role="cell" className="hidden truncate text-sm text-ink-2 md:block">
                {agent.activity}
              </span>
              <span role="cell" className="text-right font-mono text-xs whitespace-nowrap text-muted">
                {agent.lastSeen}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
