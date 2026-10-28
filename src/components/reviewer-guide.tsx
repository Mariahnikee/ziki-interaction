"use client";

import { useEffect, useId, useState } from "react";
import { Critter } from "./critter";
import { ArrowUpRight, Check, ChevronDown } from "./icons";
import { cx } from "./ui";

const REPO = "https://github.com/Mariahnikee/ziki-interaction";
const BELL = 'button[aria-label^="Notifications,"]';
const PANEL = '[role=dialog][aria-label="Notifications"]';

const flow = ["Open the bell", "Expand a request", "Answer it", "See the agent react"];

/** Which flow steps the reviewer has done, read from the page. The notification code is never touched. */
function readFlow(): boolean[] {
  const opened = document.querySelector(BELL)?.getAttribute("aria-expanded") === "true";
  const expanded = !!document.querySelector(`${PANEL} li > button[aria-expanded=true]`);
  const reacted = !!document.querySelector(`.critter-cheer, ${PANEL} li .text-ok-fg`);
  return [opened, expanded || reacted, reacted, reacted];
}

/**
 * The reviewer's guide, written the way the prototype writes notifications:
 * an agent (Zik) asks one short question and offers the button to answer it.
 */
export function ReviewerGuide() {
  const [done, setDone] = useState<boolean[]>(flow.map(() => false));
  const [showWhy, setShowWhy] = useState(false);
  const whyId = useId();

  useEffect(() => {
    const check = () =>
      setDone((d) => {
        const now = readFlow();
        const next = d.map((v, i) => v || now[i]);
        return next.every((v, i) => v === d[i]) ? d : next;
      });
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-expanded", "class"],
    });
    return () => observer.disconnect();
  }, []);

  const startAtBell = () => {
    const bell = document.querySelector<HTMLButtonElement>(BELL);
    if (!bell) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (bell.getAttribute("aria-expanded") !== "true") bell.click();
  };

  const allDone = done.every(Boolean);

  return (
    <section
      aria-labelledby="guide-title"
      className="relative overflow-hidden rounded-[20px] border border-line bg-surface shadow-[0_1px_2px_rgba(21,18,31,0.04)]"
    >
      {/* A thin accent on the left, like an unread notification. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#3978f6,#8fc9ff)]" />

      <div className="flex flex-col gap-4 py-4 pr-4 pl-5 sm:flex-row sm:items-center sm:gap-5 sm:pr-5">
        <div className="flex min-w-0 flex-1 gap-3.5">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <Critter mood={allDone ? "happy" : "hello"} color="#3978f6" size={40} />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="font-semibold text-ink-2">Zik asks</span>
              <span aria-hidden>·</span>
              <span>prototype guide</span>
              {!allDone && <span className="size-1.5 rounded-full bg-blue-500" aria-hidden />}
            </p>
            <h2 id="guide-title" className="mt-0.5 text-[15px] leading-5 font-semibold text-ink">
              {allDone ? "That's it. Thanks for reviewing!" : "Review the new notification bell?"}
            </h2>
            <p className="mt-0.5 text-[13px] leading-[18px] text-ink-2">
              Agents now ask you for a decision instead of telling you a story. It all happens in the bell, top right.
            </p>

            <ol aria-label="What to try" className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-xs sm:gap-x-0">
              {flow.map((label, i) => (
                <li key={label} className="flex items-center">
                  <span
                    className={cx(
                      "inline-flex items-center gap-1 rounded-full py-0.5 pr-2 pl-1 font-medium transition-colors",
                      done[i] ? "bg-ok-bg text-ok-fg" : "bg-chip text-ink-2",
                    )}
                  >
                    <span
                      className={cx(
                        "inline-flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                        done[i] ? "bg-ok-fg text-white" : "bg-surface text-accent",
                      )}
                      aria-hidden
                    >
                      {done[i] ? <Check className="size-2.5" strokeWidth={3} /> : i + 1}
                    </span>
                    {label}
                    {done[i] && <span className="sr-only"> (done)</span>}
                  </span>
                  {i < flow.length - 1 && (
                    <span aria-hidden className="mx-1 hidden h-px w-4 bg-line sm:block" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 sm:flex-col">
          <button
            type="button"
            onClick={startAtBell}
            className="h-9 flex-1 sm:flex-none rounded-full bg-blue-500 px-4 text-[13px] font-semibold whitespace-nowrap text-white transition-[background-color,transform] hover:bg-blue-600 active:scale-[0.97]"
          >
            {done[0] ? "Open the bell again" : "Start at the bell"}
          </button>
          <button
            type="button"
            aria-expanded={showWhy}
            aria-controls={whyId}
            onClick={() => setShowWhy((v) => !v)}
            className="inline-flex h-9 flex-1 sm:flex-none items-center justify-center gap-1 rounded-full border border-line px-4 whitespace-nowrap text-[13px] font-semibold text-ink transition-colors hover:bg-bg"
          >
            What changed
            <ChevronDown className={cx("size-3.5 text-muted transition-transform", showWhy && "rotate-180")} />
          </button>
        </div>
      </div>

      {showWhy && (
        <div id={whyId} className="row-open border-t border-divider bg-bg/60 py-4 pr-4 pl-5 sm:pr-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">Before</p>
              <p className="mt-1 text-[13px] leading-[18px] text-ink-2">
                &ldquo;You&apos;ve been offered &lsquo;Mobile: Invite People ignores spaces as email separators&rsquo;&rdquo;
              </p>
              <p className="mt-1 text-xs text-muted">The same line three times. No button, no deadline.</p>
            </div>
            <span aria-hidden className="hidden items-center justify-center text-muted md:flex">
              →
            </span>
            <div className="rounded-xl border border-blue-200 bg-surface p-3">
              <p className="text-[11px] font-semibold tracking-wide text-accent uppercase">Now</p>
              <div className="mt-1 flex items-center gap-2">
                <Critter mood="eager" color="#3978f6" size={28} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">Take the offer on #512?</p>
                  <p className="text-xs text-muted">
                    GPT-6 asks · <span className="font-semibold text-warn-fg">24m left</span> · ×3 folded into one
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] leading-[18px] text-ink-2 sm:grid-cols-2">
            {[
              "Each agent is a robot whose face shows what it needs.",
              "A ring counts down until Ziki decides without you.",
              "Urgent requests come first; points and merges wait under Updates.",
              "Every answer can be undone.",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-ok-fg" />
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>Built on Ziki&apos;s rules: 30-minute offers, heartbeats, two-verdict merges. Sample data.</span>
            <a href={`${REPO}/pull/1`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-accent hover:underline">
              PR #1 <ArrowUpRight className="size-3" />
            </a>
            <a href={`${REPO}/pull/2`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-accent hover:underline">
              PR #2 <ArrowUpRight className="size-3" />
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
