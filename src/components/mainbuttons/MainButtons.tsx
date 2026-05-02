import React from "react";
import type { User } from "@supabase/supabase-js";
import { BsBoxArrowInRight, BsDoorOpen } from "react-icons/bs";
import { AiOutlineArrowRight, AiOutlineQuestionCircle } from "react-icons/ai";
import { clearPersistedTimer } from "../../lib/timerPersistence";
import { signOut } from "../../lib/auth";
import { useSessionStore } from "../../store/sessionStore";
import "./MainButtons.css";

type CenterFocus = "session" | "data" | "theme" | "rating" | "account";

const dataIcon = (
  <svg
    className="centerQuad__iconSvg centerQuad__iconSvg--wire"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const themeIcon = (
  <svg
    className="centerQuad__iconSvg centerQuad__iconSvg--wire"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);

type MainHubHeaderProps = {
  user: User | null;
};

/** First name / given name → username metadata → email local part → full email → Guest. */
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

/** Top bar: help (?) far left; display name + avatar on the right. Not mounted while the timer is visible. */
export function MainHubHeader({ user }: MainHubHeaderProps) {
  const setSynopsis = useSessionStore((s) => s.setSynopsis);
  const setCenterFocus = useSessionStore((s) => s.setCenterFocus);

  const label = hubDisplayLabel(user);
  const initial = label[0]?.toLocaleUpperCase() ?? "?";
  const avatarTitle = user?.email?.trim() || (user ? label : "Not signed in");

  return (
    <header className="mainHubHeader">
      <div className="mainHubHeader__user">
        <button
          type="button"
          className="mainHubHeader__helpMark"
          aria-label="Synopsis"
          onClick={() => {
            setCenterFocus("rating");
            setSynopsis(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </button>
        <div className="mainHubHeader__userEnd">
          <span className="mainHubHeader__label">{label}</span>
          <div className="mainHubHeader__avatar" title={avatarTitle}>
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}

type CenterQuadStageProps = {
  user: User | null;
  onOpenSignIn: () => void;
  isAuthModalOpen?: boolean;
};

/** Icon-only Theme + My data — shown to the left of the timer while a session is running. */
export function TimerHubIconBar() {
  const centerFocus = useSessionStore((s) => s.centerFocus);
  const setCenterFocus = useSessionStore((s) => s.setCenterFocus);
  const setData = useSessionStore((s) => s.setData);
  const setOpenThemePage = useSessionStore((s) => s.setOpenThemePage);

  const btnClass = (panel: "theme" | "data") =>
    `timerHubIconBtn${centerFocus === panel ? " timerHubIconBtn--focused" : ""}`;

  const themeShortcutButton = (
    <button
      type="button"
      className={btnClass("theme")}
      aria-label="Theme"
      onClick={() => {
        setCenterFocus("theme");
        setOpenThemePage(true);
      }}
    >
      {themeIcon}
    </button>
  );

  const dataShortcutButton = (
    <button
      type="button"
      className={btnClass("data")}
      aria-label="My data"
      onClick={() => {
        setCenterFocus("data");
        setData(true);
      }}
    >
      {dataIcon}
    </button>
  );

  return (
    <div className="timerHubIconBar" role="navigation" aria-label="Session shortcuts">
      {dataShortcutButton}
      {themeShortcutButton}
    </div>
  );
}

export function CenterQuadStage({ user, onOpenSignIn, isAuthModalOpen = false }: CenterQuadStageProps) {
  const centerFocus = useSessionStore((s) => s.centerFocus);
  const setCenterFocus = useSessionStore((s) => s.setCenterFocus);
  const setData = useSessionStore((s) => s.setData);
  const setOpenThemePage = useSessionStore((s) => s.setOpenThemePage);
  const setShowSetterPage = useSessionStore((s) => s.setShowSetterPage);
  const setShowParagraph = useSessionStore((s) => s.setShowParagraph);

  const handleStartTileActivate = () => {
    clearPersistedTimer();
    setCenterFocus(null);
    setShowSetterPage(true);
    setShowParagraph(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error(error);
    }
  };

  const quadClass = (panel: CenterFocus) =>
    `centerQuad centerQuad--wireframe centerQuad--${panel}${centerFocus === panel ? " centerQuad--focused" : ""}`;

  const themeButton = (
    <button
      type="button"
      className={quadClass("theme")}
      onClick={() => {
        setCenterFocus("theme");
        setOpenThemePage(true);
      }}
    >
      {themeIcon}
      <span className="centerQuad__title centerQuad__title--wire">Theme</span>
    </button>
  );

  const dataButton = (
    <button
      type="button"
      className={quadClass("data")}
      onClick={() => {
        setCenterFocus("data");
        setData(true);
      }}
    >
      {dataIcon}
      <span className="centerQuad__title centerQuad__title--wire">My data</span>
    </button>
  );

  return (
    <div className="centerQuadGrid centerQuadGrid--wireframe" role="navigation" aria-label="Main hub">
      {dataButton}

      <div
        className={quadClass("session")}
        role="button"
        tabIndex={0}
        aria-label="Start a session"
        onClick={handleStartTileActivate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleStartTileActivate();
          }
        }}
      >
        <div className="centerQuad__wireframeStartRow">
          <AiOutlineArrowRight className="centerQuad__startArrowIcon" aria-hidden />
          <span className="centerQuad__title centerQuad__title--wire">Start</span>
        </div>
      </div>

      {themeButton}

      {user ? (
        <button
          type="button"
          className={quadClass("account")}
          onClick={() => {
            setCenterFocus("account");
            void handleLogout();
          }}
        >
          <BsDoorOpen className="centerQuad__glyph" aria-hidden />
          <span className="centerQuad__title centerQuad__title--wire">Logout</span>
        </button>
      ) : isAuthModalOpen ? (
        <div className={`${quadClass("account")} centerQuad--signingIn`} aria-live="polite">
          <BsBoxArrowInRight className="centerQuad__glyph" aria-hidden />
          <span className="centerQuad__title centerQuad__title--wire">Signing in…</span>
        </div>
      ) : (
        <button
          type="button"
          className={quadClass("account")}
          onClick={() => {
            setCenterFocus("account");
            onOpenSignIn();
          }}
        >
          <BsBoxArrowInRight className="centerQuad__glyph" aria-hidden />
          <span className="centerQuad__title centerQuad__title--wire">Sign in</span>
        </button>
      )}
    </div>
  );
}
