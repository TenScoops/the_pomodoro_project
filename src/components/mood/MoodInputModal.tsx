import React, { useState } from "react";
import Modal from "react-modal";
import { MOOD_OPTIONS } from "../../constants/moodOptions";
import { useSessionStore } from "../../store/sessionStore";
import "./MoodInputModal.css";

const MoodInputModal = () => {
  const setOpenMoodInput = useSessionStore((s) => s.setOpenMoodInput);
  const setMoodSelection = useSessionStore((s) => s.setMoodSelection);
  const [modalOpen, setModalOpen] = useState(true);

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
      width: "min(520px, 92vw)",
      maxHeight: "85vh",
      overflow: "auto",
      borderRadius: "12px",
      padding: "0",
      border: "solid 2px black",
    },
  };

  const closeModal = () => {
    setModalOpen(false);
    setOpenMoodInput(false);
  };

  const chooseMood = (label: string) => {
    setMoodSelection(label);
    closeModal();
  };

  return (
    <Modal isOpen={modalOpen} onRequestClose={closeModal} style={customStyles} shouldCloseOnOverlayClick={true}>
      <div className="mood-input-modal">
        <button type="button" onClick={closeModal} className="mood-input-modal__close" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <h2 className="mood-input-modal__title">How are you feeling?</h2>
        <p className="mood-input-modal__hint">Tap a mood to save it for this session.</p>

        <div className="mood-input-modal__grid" role="group" aria-label="Mood options">
          {MOOD_OPTIONS.map((option) => {
            const Icon = option.Icon;
            return (
              <button
                key={option.id}
                type="button"
                className="mood-card"
                onClick={() => chooseMood(option.label)}
              >
                <span className="mood-card__face" aria-hidden>
                  <Icon className="mood-card__icon" />
                </span>
                <span className="mood-card__label">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default MoodInputModal;
