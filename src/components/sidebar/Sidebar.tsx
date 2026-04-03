import React from "react";
import type { User } from "@supabase/supabase-js";
import { BsBoxArrowInRight, BsDoorOpen } from "react-icons/bs";
import { ImStatsBars } from "react-icons/im";
import { IoIosArrowBack } from "react-icons/io";
import { supabase } from "../../lib/supabaseClient";
import { useSessionStore } from "../../store/sessionStore";
import "./Sidebar.css";

type SidebarProps = {
  user: User | null;
  onOpenSignIn: () => void;
  /** When true and guest, the sign-in row shows a muted "Signing in…" state. */
  isAuthModalOpen?: boolean;
};

const Sidebar = ({ user, onOpenSignIn, isAuthModalOpen = false }: SidebarProps) => {
  const sideBar = useSessionStore((s) => s.sideBar);
  const setSideBar = useSessionStore((s) => s.setSideBar);
  const setHideButton = useSessionStore((s) => s.setHideButton);
  const setData = useSessionStore((s) => s.setData);
  const setOpenThemePage = useSessionStore((s) => s.setOpenThemePage);
  const setSynopsis = useSessionStore((s) => s.setSynopsis);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebarcontent">
        <div className="sidebarbutton">
          <button
            type="button"
            onClick={() => {
              setSideBar(!sideBar);
              setHideButton(false);
            }}
            className="bars1"
          >
            <IoIosArrowBack style={{ fontSize: "20px" }} />
          </button>
        </div>
        <div>
          <h2 style={{ margin: "0" }}>
            The Progress <ImStatsBars />{" "}
          </h2>
          <h1> Pomodoro</h1>
        </div>
        <p className="sidebar-user-email" title={user?.email ?? undefined}>
          {user?.email ?? "Not signed in"}
        </p>
        <h3 className="text" onClick={() => setData(true)}>
          <svg
            className="lesvg"
            style={{
              width: "60px",
              height: "35px",
              alignItems: "center",
              justifyContent: "center",
              display: "inline-flex",
              flexDirection: "row",
              paddingTop: "5px",
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <label> My Data </label>
        </h3>

        <h3 className="text" onClick={() => setOpenThemePage(true)}>
          <svg
            className="lesvg"
            style={{
              width: "60px",
              height: "35px",
              alignItems: "center",
              justifyContent: "center",
              display: "inline-flex",
              flexDirection: "row",
              paddingTop: "6px",
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <label> Theme </label>
        </h3>

        <h3 className="text" onClick={() => setSynopsis(true)}>
          <svg
            className="lesvg"
            style={{
              width: "60px",
              height: "35px",
              alignItems: "center",
              justifyContent: "center",
              display: "inline-flex",
              flexDirection: "row",
              paddingTop: "5px",
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
            />
          </svg>
          <label> Rating System </label>
        </h3>

        {user ? (
          <h3 className="text" onClick={() => void handleLogout()}>
            <BsDoorOpen style={{ fontSize: "30px", width: "60px", paddingTop: "5px" }} />
            <label> Logout </label>
          </h3>
        ) : isAuthModalOpen ? (
          <h3 className="text sidebar-signin-row--modal-open" aria-live="polite">
            <BsBoxArrowInRight style={{ fontSize: "30px", width: "60px", paddingTop: "5px" }} />
            <label> Signing in… </label>
          </h3>
        ) : (
          <h3 className="text" onClick={() => onOpenSignIn()}>
            <BsBoxArrowInRight style={{ fontSize: "30px", width: "60px", paddingTop: "5px" }} />
            <label> Sign in </label>
          </h3>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
