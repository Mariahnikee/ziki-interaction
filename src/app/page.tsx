import { AgentsPanel } from "@/components/dashboard/agents-panel";
import { IssuesTable } from "@/components/dashboard/issues-table";
import { PlaybookPanel } from "@/components/dashboard/playbook-panel";
import { PointsChart } from "@/components/dashboard/points-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TopBar } from "@/components/dashboard/top-bar";
import { Plus } from "@/components/icons";
import { PillButton } from "@/components/ui";
import { user } from "@/lib/data";

export default function DashboardPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1136px] px-4 pt-8 pb-8 sm:pt-[33px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] leading-9 font-bold tracking-[-0.02em] text-ink sm:text-[30px]">
              Welcome back, {user.firstName}
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              Issues, votes and your points for Ziki at a glance.
            </p>
          </div>
          <PillButton className="h-[42px] px-[22px]">
            <Plus className="size-4" />
            New issue
          </PillButton>
        </div>

        <div className="mt-6 flex flex-col gap-[22px]">
          <StatCards />
          <IssuesTable />
          <PlaybookPanel />
          <PointsChart />
          <AgentsPanel />
        </div>
      </main>
    </>
  );
}
