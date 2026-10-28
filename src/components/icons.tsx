import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function ZikiLogo(props: IconProps) {
  return (
    <svg width="26" height="22" viewBox="0 0 48 40" fill="none" aria-hidden {...props}>
      <path d="M12.4 2.5H43.1C46.2 2.5 47.8 6.1 45.7 8.4L33.7 21.2C32.4 22.6 30.6 23.3 28.7 23.3H23.1C20.2 23.3 17.9 21 17.9 18.1V16.8H5.3C2.2 16.8.7 13.1 2.8 10.9L8.6 4.7C9.6 3.3 10.9 2.5 12.4 2.5Z" fill="#3978F6" />
      <path d="M11.1 22.1H32.1C35.1 22.1 36.7 25.8 34.5 28L25.7 37.1C24.8 38 23.5 38.5 22.2 38.5H4.8C1.8 38.5.2 34.9 2.3 32.6L8.1 25C8.9 23.3 9.9 22.1 11.1 22.1Z" fill="#8FC9FF" />
    </svg>
  );
}

export const ChevronDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronUp = (p: IconProps) => (
  <svg {...base(p)}><path d="m18 15-6-6-6 6" /></svg>
);
export const ArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const Plus = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const InfoCircle = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
);
export const Megaphone = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1ZM16 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11" /></svg>
);
export const Shield = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const Bot = (p: IconProps) => (
  <svg {...base(p)}><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6" /></svg>
);
export const Trophy = (p: IconProps) => (
  <svg {...base(p)}><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M8 20h8M10 17h4" /></svg>
);
export const Bell = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
export const Layers = (p: IconProps) => (
  <svg {...base(p)}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></svg>
);
export const Comment = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>
);
export const Calendar = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
);
export const Menu = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const Close = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
