import React from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { clearPersistedTimer } from "../lib/timerPersistence";
import { useSessionStore } from "../store/sessionStore";

const Contents = () => {
  const setSynopsis = useSessionStore((s) => s.setSynopsis);
  const setShowSetterPage = useSessionStore((s) => s.setShowSetterPage);
  const setShowParagraph = useSessionStore((s) => s.setShowParagraph);

  const questionMark = () => {
    return (
      <button className="questionMark" type="button" onClick={() => setSynopsis(true)}>
        <AiOutlineQuestionCircle />
      </button>
    );
  };

  return (
    <div>
      <div className="Content">
        <div className="the-content-text">
          <div className="divsession-buttons">
            {questionMark()}
            <button
              className="startSession-button"
              type="button"
              onClick={() => {
                clearPersistedTimer();
                setShowSetterPage(true);
                setShowParagraph(false);
              }}
            >
              Start a session{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contents;
