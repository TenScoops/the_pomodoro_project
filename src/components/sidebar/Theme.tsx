import React, { useState } from "react";
import Modal from "react-modal";
import { THEME_CASTLE as castle, THEME_PLAINS as plains, THEME_STREETS as streets } from "../../theme/backgrounds";
import { useSessionStore } from "../../store/sessionStore";
import "./Theme.css";

const Theme = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const theme = useSessionStore((s) => s.theme);
  const setTheme = useSessionStore((s) => s.setTheme);
  const setOpenThemePage = useSessionStore((s) => s.setOpenThemePage);

  const customStyles = {
    overlay: {
      backgroundColor: "#08080b97",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#181a24",
      height: "40vh",
      width: "70vmin",
      borderRadius: "10px",
      padding: "0",
      border: "solid 2px black",
    },
  };

  const closeModal = () => {
    setModalOpen(false);
    setOpenThemePage(false);
  };

  const closeButton = () => {
    return (
      <button type="button" onClick={() => closeModal()} className="close">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path
            fillRule="evenodd"
            d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  };

  return (
    <Modal isOpen={modalOpen} onRequestClose={() => closeModal()} style={customStyles}>
      <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
        {closeButton()}
        <h3 style={{ marginBottom: "15px", marginTop: "30px" }}>Select a theme</h3>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <hr style={{ margin: "0", width: "70px" }} />

          <div
            className={theme === plains ? "theme + extracss" : "theme"}
            onClick={() => setTheme(plains)}
            onKeyDown={(event) => event.key === "Enter" && setTheme(plains)}
            role="button"
            tabIndex={0}
          >
            The Great Plains
          </div>
          <div
            className={theme === castle ? "theme + extracss" : "theme"}
            onClick={() => setTheme(castle)}
            onKeyDown={(event) => event.key === "Enter" && setTheme(castle)}
            role="button"
            tabIndex={0}
          >
            Howl&apos;s Moving Castle
          </div>
          <div
            className={theme === streets ? "theme + extracss" : "theme"}
            onClick={() => setTheme(streets)}
            onKeyDown={(event) => event.key === "Enter" && setTheme(streets)}
            role="button"
            tabIndex={0}
          >
            Streets
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Theme;
