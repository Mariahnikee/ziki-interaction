"use client";

import { useEffect, useId, useState } from "react";
import { Critter } from "./critter";
import { ArrowUpRight, Bell, Check, ChevronDown } from "./icons";
import { cx } from "./ui";

const REPO = "https://github.com/Mariahnikee/ziki-interaction";
const BELL = 'button[aria-label^="Notifications,"]';
const PANEL = '[role=dialog][aria-label="Notifications"]';

const flow = ["Tap the notification bell", "Expand a request", "Answer it", "Watch the agent react"];

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

  const opened = done[0];

  // Ring the bell until the reviewer has opened it once.
  useEffect(() => {
    const bell = document.querySelector(BELL);
    if (!bell) return;
    bell.classList.toggle("review-ring", !opened);
    return () => bell.classList.remove("review-ring");
  }, [opened]);

  return (
    <section
      aria-label="How to review this prototype"
      className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/70"
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface shadow-[0_1px_2px_rgba(21,18,31,0.06)]">
            <Critter mood={done.every(Boolean) ? "happy" : "hello"} color="#3978f6" size={32} />
          </span>
          <p className="text-[13px] leading-5 text-ink-2">
            <span className="font-bold text-ink">Try it: </span>
            {flow.map((label, i) => (
              <span key={label}>
                {i > 0 && <span aria-hidden className="text-muted"> · </span>}
                <span className={cx(done[i] && "text-ok-fg")}>
                  {done[i] ? <Check className="mr-0.5 inline size-3 align-[-1px]" strokeWidth={3} /> : `${i + 1}. `}
                  {i === 0 ? (
                    <>
                      <span className="font-bold text-ink">Tap the notification bell</span> (top right)
                    </>
                  ) : (
                    label
                  )}
                  {done[i] && <span className="sr-only"> (done)</span>}
                </span>
              </span>
            ))}
            <button
              type="button"
              aria-expanded={showWhy}
              aria-controls={whyId}
              onClick={() => setShowWhy((v) => !v)}
              className="ml-2 inline-flex items-center gap-0.5 font-semibold text-accent hover:underline"
            >
              What changed
              <ChevronDown className={cx("size-3 transition-transform", showWhy && "rotate-180")} />
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={startAtBell}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-blue-500 px-4 text-[13px] font-bold whitespace-nowrap text-white transition-[background-color,transform] hover:bg-blue-600 active:scale-[0.97]"
        >
          <Bell className="size-3.5" />
          {opened ? "Open the bell again" : "Tap the notification bell"}
        </button>
      </div>

      {showWhy && (
        <div id={whyId} className="row-open border-t border-dashed border-blue-300 px-4 py-4">
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
              "You can undo demo choices; live actions are not connected yet.",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-ok-fg" />
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>Built around Ziki&apos;s offer, heartbeat, and merge rules. Demo data only.</span>
            <a href={`${REPO}/pull/1`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-accent hover:underline">
              PR #1: Notifications <ArrowUpRight className="size-3" />
            </a>
            <a href={`${REPO}/pull/2`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-accent hover:underline">
              PR #2: Agent critters <ArrowUpRight className="size-3" />
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
