import React from "react";
import "./Navbar.css";
import { useSessionStore } from "../../store/sessionStore";
import { IoIosArrowForward } from "react-icons/io";

const Navbar = () => {
  const hideButton = useSessionStore((s) => s.hideButton);
  const setSideBar = useSessionStore((s) => s.setSideBar);
  const setHideButton = useSessionStore((s) => s.setHideButton);
  return (
    <div className="nav">
      <div className="barsdiv">
        {hideButton ? null : (
          <button
            type="button"
            onClick={() => {
              setSideBar(true);
              setHideButton(true);
            }}
            className="bars2"
          >
            <IoIosArrowForward style={{ fontSize: "20px" }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
