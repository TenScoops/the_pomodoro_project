import React, { useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  HiOutlineBolt,
  HiOutlineChartBar,
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineCpuChip,
} from "react-icons/hi2";
import { useSessionStore } from "../../store/sessionStore";
import "./Sidebar.css";

export type SidebarItemId = "focus" | "stats" | "energy" | "ai" | "settings";

type SidebarProps = {
  user: User | null;
  activeItem?: SidebarItemId;
  onNavigate?: (item: SidebarItemId) => void;
  onOpenSignIn?: () => void;
};

function hubDisplayLabel(user: User | null): string {
  if (!user) return "Guest";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const readMetaString = (key: string) => {
    const value = meta[key];
    return typeof value === "string" && value.trim() ? value.trim() : "";
  };
  const first = readMetaString("first_name") || readMetaString("given_name");
  if (first) return first;
  const full = readMetaString("full_name") || readMetaString("name");
  if (full) {
    const token = full.split(/\s+/)[0];
    if (token) return token;
  }
  const handle =
    readMetaString("preferred_username") || readMetaString("user_name") || readMetaString("username");
  if (handle) return handle;
  const email = user.email?.trim();
  if (email) {
    const at = email.indexOf("@");
    return at > 0 ? email.slice(0, at) : email;
  }
  return "Guest";
}

function hubAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const avatar = meta.avatar_url ?? meta.picture;
  return typeof avatar === "string" && avatar.trim() ? avatar.trim() : null;
}

type NavItem = {
  id: SidebarItemId;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const focusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { id: "focus", label: "Focus", icon: focusIcon },
  { id: "stats", label: "Stats", icon: <HiOutlineChartBar aria-hidden /> },
  { id: "energy", label: "Energy", icon: <HiOutlineBolt aria-hidden /> },
  { id: "ai", label: "AI (TBA)", icon: <HiOutlineCpuChip aria-hidden />, disabled: true },
];

export default function Sidebar({
  user,
  activeItem = "focus",
  onNavigate,
  onOpenSignIn,
}: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const setLogout = useSessionStore((s) => s.setLogout);

  const label = hubDisplayLabel(user);
  const initial = label[0]?.toLocaleUpperCase() ?? "?";
  const avatarUrl = hubAvatarUrl(user);

  const handleNavClick = (item: NavItem) => {
    if (item.disabled) return;
    onNavigate?.(item.id);
  };

  return (
    <aside className="appSidebar" aria-label="Main navigation">
      <div className="appSidebar__brand">
        <HiOutlineClock className="appSidebar__brandIcon" aria-hidden />
      </div>

      <nav className="appSidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`appSidebar__navItem${isActive ? " appSidebar__navItem--active" : ""}${
                item.disabled ? " appSidebar__navItem--disabled" : ""
              }`}
              aria-current={isActive ? "page" : undefined}
              disabled={item.disabled}
              onClick={() => handleNavClick(item)}
            >
              <span className="appSidebar__navIcon">{item.icon}</span>
              <span className="appSidebar__navLabel">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="appSidebar__footer">
        <button
          type="button"
          className={`appSidebar__navItem${activeItem === "settings" ? " appSidebar__navItem--active" : ""}`}
          aria-current={activeItem === "settings" ? "page" : undefined}
          onClick={() => onNavigate?.("settings")}
        >
          <span className="appSidebar__navIcon">
            <HiOutlineCog6Tooth aria-hidden />
          </span>
          <span className="appSidebar__navLabel">Settings</span>
        </button>

        <div className="appSidebar__profileWrap">
          <button
            type="button"
            className="appSidebar__profile"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => setProfileOpen((open) => !open)}
          >
            <span className="appSidebar__avatar" aria-hidden>
              {avatarUrl ? (
                <img className="appSidebar__avatarImg" src={avatarUrl} alt="" />
              ) : (
                <span className="appSidebar__avatarInitial">{initial}</span>
              )}
            </span>
            <span className="appSidebar__profileName">{label}</span>
            <HiOutlineChevronDown
              className={`appSidebar__profileChevron${profileOpen ? " appSidebar__profileChevron--open" : ""}`}
              aria-hidden
            />
          </button>

          {profileOpen && (
            <div className="appSidebar__profileMenu" role="menu">
              {user ? (
                <button
                  type="button"
                  className="appSidebar__profileMenuItem"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    setLogout(true);
                  }}
                >
                  Log out
                </button>
              ) : (
                <button
                  type="button"
                  className="appSidebar__profileMenuItem"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenSignIn?.();
                  }}
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
