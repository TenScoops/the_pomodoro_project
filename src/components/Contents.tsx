import React from "react";
import { AiOutlineArrowRight, AiOutlineQuestionCircle } from "react-icons/ai";
import { clearPersistedTimer } from "../lib/timerPersistence";
import { useSessionStore } from "../store/sessionStore";

const Contents = () => {
  const setSynopsis = useSessionStore((s) => s.setSynopsis);
  const setShowSetterPage = useSessionStore((s) => s.setShowSetterPage);
  const setShowParagraph = useSessionStore((s) => s.setShowParagraph);
  // const setOpenMoodInput = useSessionStore((s) => s.setOpenMoodInput);
  // const moodSelection = useSessionStore((s) => s.moodSelection);

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
              aria-label="Start a session"
              onClick={() => {
                clearPersistedTimer();
                setShowSetterPage(true);
                setShowParagraph(false);
              }}
            >
              Start
              <AiOutlineArrowRight className="startSession-button-arrowIcon" aria-hidden />
            </button>
            {/* Mood picker removed from nav — keep store fields for a future return if needed.
            <button
              className="mood-input-button"
              type="button"
              onClick={() => setOpenMoodInput(true)}
            >
              Input your mood
            </button>
            */}
          </div>
          {/* {moodSelection ? (
            <p className="mood-selection-summary">Mood: {moodSelection}</p>
          ) : null} */}
        </div>
      </div>
    </div>
  );
};

export default Contents;
