import React, { useEffect, useId, useState } from "react";
import Modal, { type Styles } from "react-modal";
import { HiChatBubbleLeftRight, HiXMark } from "react-icons/hi2";
import { persistFocusNoteForToday } from "../../../services/pomoprogressService";
import { useSessionStore } from "../../../store/sessionStore";
import "./AddNoteModal.css";

const NOTE_MAX_LENGTH = 500;

interface AddNoteModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
};

const modalStyles: Styles = {
  overlay: {
    backgroundColor: "rgba(8, 8, 11, 0.82)",
    zIndex: 10000,
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    padding: 0,
    maxHeight: "90vh",
    width: "min(440px, calc(100vw - 32px))",
    overflow: "hidden",
    outline: "none",
    zIndex: 10001,
  },
};

export default function AddNoteModal({ isOpen, onRequestClose }: AddNoteModalProps) {
  const focusNote = useSessionStore((state) => state.focusNote);
  const setFocusNote = useSessionStore((state) => state.setFocusNote);
  const [draft, setDraft] = useState(focusNote);
  const titleId = useId();
  const fieldId = useId();

  useEffect(() => {
    if (isOpen) {
      setDraft(focusNote);
    }
  }, [isOpen, focusNote]);

  const saveNote = () => {
    const nextNote = draft.trim();
    const previousNote = focusNote;
    setFocusNote(nextNote);
    onRequestClose();

    void (async () => {
      const { error } = await persistFocusNoteForToday(nextNote);
      if (error) {
        setFocusNote(previousNote);
        return;
      }
      useSessionStore.getState().bumpChartDataRevision();
    })();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={modalStyles}
      contentLabel="Add note"
      aria={{ labelledby: titleId }}
      shouldCloseOnOverlayClick
    >
      <div className="addNoteModal">
        <header className="addNoteModal__header">
          <div className="addNoteModal__heading">
            <span className="addNoteModal__icon" aria-hidden>
              <HiChatBubbleLeftRight />
            </span>
            <h2 id={titleId} className="addNoteModal__title">
              Add Note
            </h2>
          </div>
          <button type="button" className="addNoteModal__close" onClick={onRequestClose} aria-label="Close">
            <HiXMark aria-hidden />
          </button>
        </header>

        <p className="addNoteModal__subtitle">
          Capture any thoughts or context for <span>today</span>.
        </p>

        <div className="addNoteModal__field">
          <label className="addNoteModal__srOnly" htmlFor={fieldId}>
            Note
          </label>
          <textarea
            id={fieldId}
            className="addNoteModal__textarea"
            value={draft}
            maxLength={NOTE_MAX_LENGTH}
            placeholder="What's on your mind?"
            rows={6}
            onChange={(event) => setDraft(event.target.value)}
          />
          <span className="addNoteModal__counter">
            {draft.length} / {NOTE_MAX_LENGTH}
          </span>
        </div>

        <footer className="addNoteModal__footer">
          <button type="button" className="addNoteModal__cancel" onClick={onRequestClose}>
            Cancel
          </button>
          <button type="button" className="addNoteModal__save" onClick={saveNote}>
            Save Note
          </button>
        </footer>
      </div>
    </Modal>
  );
}
