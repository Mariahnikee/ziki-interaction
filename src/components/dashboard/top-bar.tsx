"use client";

import { useState } from "react";
import { project, user, agents } from "@/lib/data";
import { Dropdown, DropdownItem } from "../dropdown";
import {
  Bell,
  Bot,
  ChevronDown,
  Close,
  InfoCircle,
  Megaphone,
  Menu,
  Shield,
  Trophy,
  ZikiLogo,
} from "../icons";
import { StatusDot } from "../ui";

const navLinks = [
  { label: "Product", icon: InfoCircle },
  { label: "Marketing", icon: Megaphone },
  { label: "Security", icon: Shield },
];

function Avatar() {
  return (
    <span
      aria-hidden
      className="relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_30%,#5b6b8f,#1d2333)] text-[11px] font-semibold text-white"
    >
      SM
    </span>
  );
}

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-[68px] max-w-[1136px] items-center gap-3 px-4">
        <a href="#" className="flex items-center gap-2" aria-label="Ziki home">
          <ZikiLogo />
          <span className="text-[15px] font-semibold tracking-tight text-ink">ziki</span>
        </a>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />

        <Dropdown
          label={`Project: ${project}`}
          triggerClassName="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-medium text-ink hover:bg-bg"
          trigger={
            <>
              {project}
              <ChevronDown className="size-3.5 text-muted" />
            </>
          }
        >
          <DropdownItem>{project}</DropdownItem>
        </Dropdown>

        <nav aria-label="Primary" className="ml-6 hidden items-center gap-6 lg:flex">
          {navLinks.map(({ label, icon: Icon }) => (
            <a
              key={label}
              href="#"
              className="flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              <Icon className="size-3.5" />
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <div className="hidden md:block">
            <Dropdown
              label="Agents"
              align="right"
              triggerClassName="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-bg"
              trigger={
                <>
                  <Bot className="size-3.5 text-accent" />
                  Agents
                  <ChevronDown className="size-3.5 text-muted" />
                </>
              }
            >
              {agents.map((a, i) => (
                <DropdownItem key={i}>
                  <StatusDot status={a.status} />
                  {a.name}
                  <span className="text-xs text-muted">{a.model}</span>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          <Dropdown
            label="Account menu"
            align="right"
            triggerClassName="flex h-10 items-center gap-2.5 rounded-full border border-line bg-surface p-1 hover:bg-bg sm:pr-4"
            trigger={
              <>
                <Avatar />
                <span className="hidden text-sm font-medium text-ink sm:inline">{user.fullName}</span>
                <ChevronDown className="hidden size-3.5 text-muted sm:block" />
              </>
            }
          >
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownItem>Sign out</DropdownItem>
          </Dropdown>

          <span className="hidden h-8 items-center gap-1.5 rounded-full bg-points-bg px-3 text-sm font-semibold text-points-fg sm:inline-flex">
            <Trophy className="size-3.5" />
            {user.points} pts
          </span>

          <button
            type="button"
            aria-label={`Notifications, ${user.notifications} unread`}
            className="relative ml-1 inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-bg"
          >
            <Bell className="size-[18px]" />
            <span className="absolute top-0 right-0 rounded-full bg-blue-500 px-1.5 text-[11px] leading-4 font-semibold text-white ring-2 ring-surface">
              {user.notifications}
            </span>
          </button>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-bg lg:hidden"
          >
            {menuOpen ? <Close className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label="Mobile" className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          <ul className="mx-auto flex max-w-[1104px] flex-col gap-1">
            {navLinks.map(({ label, icon: Icon }) => (
              <li key={label}>
                <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 hover:bg-bg">
                  <Icon className="size-4" />
                  {label}
                </a>
              </li>
            ))}
            <li className="md:hidden">
              <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 hover:bg-bg">
                <Bot className="size-4" />
                Agents
              </a>
            </li>
            <li className="sm:hidden">
              <span className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-full bg-points-bg px-3 text-sm font-semibold text-points-fg">
                <Trophy className="size-3.5" />
                {user.points} pts
              </span>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
