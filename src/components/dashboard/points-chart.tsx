"use client";

import { useState } from "react";
import { pointsByRange, pointsRequirement, type PointsRange } from "@/lib/data";
import { Dropdown, DropdownItem } from "../dropdown";
import { Calendar, ChevronDown } from "../icons";
import { Card, cx } from "../ui";

const ranges: PointsRange[] = ["Daily", "Weekly", "Monthly", "Yearly"];
const TRACK_HEIGHT = 176;

export function PointsChart() {
  const [range, setRange] = useState<PointsRange>("Weekly");
  const { subtitle, bars, requirement } = pointsByRange[range];
  const total = bars.reduce((sum, b) => sum + b.value, 0);
  // Leave headroom so the requirement line sits just below the top of the track.
  const max = Math.max(...bars.map((b) => b.value), (requirement ?? 0) * 1.13, 1);

  return (
    <Card className="px-4 pt-5 pb-6 sm:px-[22px]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Your points</h2>
          <p className="mt-1 text-[13px] text-muted">{subtitle}</p>
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-2">
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500" aria-hidden />
              {pointsRequirement} reached
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-300" aria-hidden />
              Below {pointsRequirement}
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-muted" aria-hidden />
              Weekly requirement · {pointsRequirement} pts
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            label="Date range"
            triggerClassName="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink hover:bg-bg"
            trigger={
              <>
                <Calendar className="size-3.5" />
                All dates
                <ChevronDown className="size-3.5 text-muted" />
              </>
            }
          >
            <DropdownItem>All dates</DropdownItem>
            <DropdownItem>Last 30 days</DropdownItem>
            <DropdownItem>Last 90 days</DropdownItem>
          </Dropdown>

          <div role="tablist" aria-label="Points interval" className="flex rounded-full bg-seg p-1">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={r === range}
                onClick={() => setRange(r)}
                className={cx(
                  "h-8 rounded-full px-3 text-[13px] transition-colors sm:px-3.5",
                  r === range
                    ? "bg-surface font-semibold text-ink shadow-[0_1px_2px_rgba(21,18,31,0.08)]"
                    : "text-ink-2 hover:text-ink",
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="ml-auto text-right lg:ml-2">
            <p className="text-[26px] leading-7 font-bold tracking-tight text-ink">{total}</p>
            <p className="text-xs text-muted">pts in this range</p>
          </div>
        </div>
      </div>

      <div className="-mx-1 mt-[22px] overflow-x-auto px-1">
        <div
          className="grid min-w-[300px] items-end"
          style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}
        >
          {bars.map((bar) => {
            const reached = requirement ? bar.value >= requirement : bar.value > 0;
            return (
              <div key={bar.label} className="flex flex-col items-center">
                <div className="flex h-10 flex-col items-center justify-end gap-0.5">
                  {bar.delta !== undefined && (
                    <span className="rounded-full bg-ok-bg px-1.5 text-[11px] leading-4 font-semibold text-ok-fg">
                      +{bar.delta}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-ink-2">{bar.value}</span>
                </div>
                <div
                  className="relative mt-1.5 w-7 overflow-hidden rounded-full bg-blue-50 sm:w-12"
                  style={{ height: TRACK_HEIGHT }}
                  role="img"
                  aria-label={`${bar.label}: ${bar.value} points`}
                >
                  <div
                    className={cx(
                      "absolute inset-x-0 bottom-0 rounded-full",
                      reached ? "bg-blue-500" : "bg-blue-300",
                    )}
                    style={{ height: `${(bar.value / max) * 100}%` }}
                  />
                  {requirement && (
                    <div
                      className="absolute inset-x-1 z-10 border-t-2 border-dashed border-ink-2/80"
                      style={{ bottom: `${(requirement / max) * 100}%` }}
                      aria-hidden
                    />
                  )}
                </div>
                <span className="mt-2.5 text-[10px] whitespace-nowrap text-muted sm:text-xs">{bar.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
