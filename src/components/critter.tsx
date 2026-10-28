import { cx } from "./ui";

/**
 * A tiny robot that stands in for an agent (or Ziki itself) in notifications.
 * Its face says what it needs: asleep when it missed a heartbeat, a tilted
 * head when it has a question, sweating at a deadline, and so on.
 */
export type CritterMood =
  | "eager"
  | "sleepy"
  | "curious"
  | "worried"
  | "proud"
  | "inspect"
  | "stuck"
  | "happy"
  | "hello"
  | "twins"
  | "starry";

const INK = "#15121f";

function Eyes({ mood }: { mood: CritterMood }) {
  switch (mood) {
    case "sleepy":
      return (
        <g stroke={INK} strokeWidth="1.4" strokeLinecap="round" fill="none">
          <path d="M14.2 21.6q1.8 1.4 3.6 0M22.2 21.6q1.8 1.4 3.6 0" />
        </g>
      );
    case "happy":
    case "proud":
      return (
        <g stroke={INK} strokeWidth="1.5" strokeLinecap="round" fill="none">
          <path d="M14.4 22.4q1.6-2.4 3.2 0M22.4 22.4q1.6-2.4 3.2 0" />
        </g>
      );
    case "stuck":
      return (
        <g stroke={INK} strokeWidth="1.3" strokeLinecap="round">
          <path d="M14.8 20.4l2.4 2.4M17.2 20.4l-2.4 2.4M22.8 20.4l2.4 2.4M25.2 20.4l-2.4 2.4" />
        </g>
      );
    case "starry":
      return (
        <g fill="#f5b400">
          <path d="M16 19.2l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2Z" />
          <path d="M24 19.2l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2Z" />
        </g>
      );
    default: {
      const r = mood === "eager" ? 2.2 : 1.8;
      return (
        <g className="critter-eyes">
          <circle cx="16" cy="21.6" r={r} fill={INK} />
          <circle cx="24" cy="21.6" r={r} fill={INK} />
          {mood === "eager" && (
            <g fill="#fff">
              <circle cx="16.8" cy="20.8" r=".7" />
              <circle cx="24.8" cy="20.8" r=".7" />
            </g>
          )}
          {mood === "worried" && (
            <path d="M13.8 18.6l3.4-1M26.2 18.6l-3.4-1" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
          )}
        </g>
      );
    }
  }
}

function Mouth({ mood }: { mood: CritterMood }) {
  const common = { stroke: INK, strokeWidth: 1.3, strokeLinecap: "round" as const, fill: "none" };
  switch (mood) {
    case "curious":
    case "hello":
      return <circle cx="20" cy="26" r="1.1" fill={INK} />;
    case "sleepy":
    case "inspect":
      return <path d="M18.4 26.2h3.2" {...common} />;
    case "worried":
    case "stuck":
      return <path d="M17.4 27q2.6-2.2 5.2 0" {...common} />;
    default:
      return <path d="M17 25.4q3 2.8 6 0" {...common} />;
  }
}

function Body({ color, screen, mood, dashed }: { color: string; screen: string; mood: CritterMood; dashed?: boolean }) {
  return (
    <>
      {/* antenna */}
      <path d="M20 12V6.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle
        className={cx(mood === "eager" || mood === "worried" ? "critter-blink-bulb" : undefined)}
        cx="20"
        cy="5.2"
        r="2.4"
        fill={mood === "stuck" ? "#e5484d" : mood === "sleepy" ? "#c3c8d4" : "#ffcf3f"}
      />
      <rect
        x="6"
        y="12"
        width="28"
        height="22"
        rx="9"
        fill={color}
        stroke={dashed ? "#5f6577" : "none"}
        strokeDasharray={dashed ? "2.5 2" : undefined}
      />
      <rect x="9.5" y="15.5" width="21" height="14" rx="5.5" fill={screen} />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {(mood === "happy" || mood === "hello" || mood === "starry") && (
        <g fill="#ff8fa3" opacity=".7">
          <circle cx="12.6" cy="25.4" r="1.3" />
          <circle cx="27.4" cy="25.4" r="1.3" />
        </g>
      )}
    </>
  );
}

export function Critter({
  mood,
  color,
  screen = "#fff",
  size = 32,
  dashed,
  className,
}: {
  mood: CritterMood;
  color: string;
  screen?: string;
  size?: number;
  dashed?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      className={cx("critter overflow-visible", `critter-${mood}`, className)}
    >
      {mood === "twins" ? (
        <>
          <g transform="translate(-5 3) scale(.8)" opacity=".75">
            <Body color={color} screen={screen} mood="curious" />
          </g>
          <g transform="translate(9 3) scale(.8)">
            <Body color={color} screen={screen} mood="curious" />
          </g>
        </>
      ) : (
        <g className={cx(mood === "curious" && "critter-tilt")}>
          <Body color={color} screen={screen} mood={mood} dashed={dashed} />
        </g>
      )}

      {mood === "sleepy" && (
        <g fill="#5f6577" fontSize="7" fontWeight="700" fontFamily="var(--font-sans)">
          <text className="critter-zzz" x="31" y="11">z</text>
          <text className="critter-zzz critter-zzz-2" x="35" y="6" fontSize="5">z</text>
        </g>
      )}
      {mood === "curious" && (
        <text x="31" y="11" fill="#1f5fd9" fontSize="10" fontWeight="800" fontFamily="var(--font-sans)" className="critter-pop">
          ?
        </text>
      )}
      {mood === "worried" && (
        <path className="critter-sweat" d="M33.5 14.5q2 3 0 4.2q-2-1.2 0-4.2Z" fill="#7cc4ff" />
      )}
      {mood === "proud" && (
        <g>
          <path d="M35 34V14" stroke="#5f6577" strokeWidth="1.2" strokeLinecap="round" />
          <path className="critter-flag" d="M35 14h6.5l-2 2.6 2 2.6H35Z" fill="#22a06b" />
        </g>
      )}
      {mood === "inspect" && (
        <g stroke={INK} strokeWidth="1.1" fill="#ffffff55">
          <circle cx="16" cy="21.6" r="3" />
          <circle cx="24" cy="21.6" r="3" />
          <path d="M19 21.6h2" fill="none" />
        </g>
      )}
      {mood === "hello" && (
        <path className="critter-wave" d="M34 22q4-2 4.5-7" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      )}
      {(mood === "eager" || mood === "starry") && (
        <g fill="#ffcf3f" className="critter-sparkle">
          <path d="M3 9l.8 1.8L5.6 11.6 3.8 12.4 3 14.2 2.2 12.4.4 11.6 2.2 10.8Z" />
          <path d="M36 26l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6Z" />
        </g>
      )}
    </svg>
  );
}
