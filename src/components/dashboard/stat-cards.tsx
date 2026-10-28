import type { ReactNode } from "react";
import { stats } from "@/lib/data";
import { ArrowUpRight } from "../icons";
import { Card, Chip, IconButton } from "../ui";

function StatCard({
  title,
  value,
  chip,
  caption,
}: {
  title: string;
  value: number;
  chip: ReactNode;
  caption: string;
}) {
  return (
    <Card className="flex flex-col px-[22px] pt-[22px] pb-[17px]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <IconButton aria-label={`Open ${title}`}>
          <ArrowUpRight className="size-3.5" />
        </IconButton>
      </div>
      <p className="mt-3 text-[30px] leading-10 font-bold tracking-tight text-ink">{value}</p>
      <div className="mt-4 flex items-center gap-2.5 text-[13px] leading-5 text-muted">
        {chip}
        <span>{caption}</span>
      </div>
    </Card>
  );
}

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
      <StatCard
        title="Points"
        value={stats.points.value}
        chip={<Chip tone="info">{stats.points.toGo} to go</Chip>}
        caption={`${stats.points.required} required this week`}
      />
      <StatCard
        title="Created by me"
        value={stats.created.value}
        chip={<Chip tone="ok">+{stats.created.delta}</Chip>}
        caption="in the last 30 days"
      />
      <StatCard
        title="Assigned to me"
        value={stats.assigned.value}
        chip={<Chip>{stats.assigned.highPriority}</Chip>}
        caption="high priority"
      />
      <StatCard
        title="Resolved issues"
        value={stats.resolved.value}
        chip={<Chip>{stats.resolved.percent}%</Chip>}
        caption="of issues assigned to me"
      />
    </div>
  );
}
