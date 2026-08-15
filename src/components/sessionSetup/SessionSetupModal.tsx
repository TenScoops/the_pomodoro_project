import React, { useEffect, useState } from "react";
import Modal, { type Styles } from "react-modal";
import { HiPlay, HiXMark } from "react-icons/hi2";
import { clearPersistedTimer } from "../../lib/timerPersistence";
import { useSessionStore } from "../../store/sessionStore";
import SessionSetupFields from "./SessionSetupFields";
import { breakCountFromBlocks, draftFromStore, toStoreSessionHours, type SessionSetupDraft } from "./sessionSetupMath";
import "./SessionSetupModal.css";

type SessionSetupModalProps = {
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
    width: "min(820px, calc(100vw - 32px))",
    overflow: "hidden",
    outline: "none",
    zIndex: 10001,
  },
};

function readDraftFromStore(): SessionSetupDraft {
  const store = useSessionStore.getState();
  return draftFromStore({
    workMinutesHours: store.workMinutes,
    numOfBreaks: store.numOfBreaks,
    breakMinutes: store.breakMinutes,
    workType: store.workType,
  });
}

export default function SessionSetupModal({ isOpen, onRequestClose }: SessionSetupModalProps) {
  const applySessionSetup = useSessionStore((state) => state.applySessionSetup);
  const [draft, setDraft] = useState<SessionSetupDraft>(readDraftFromStore);

  useEffect(() => {
    if (isOpen) {
      setDraft(readDraftFromStore());
    }
  }, [isOpen]);

  useEffect(() => {
    const bodyClass = "session-setup-open";
    if (isOpen) {
      document.body.classList.add(bodyClass);
    } else {
      document.body.classList.remove(bodyClass);
    }
    return () => document.body.classList.remove(bodyClass);
  }, [isOpen]);

  const startSession = () => {
    clearPersistedTimer();
    applySessionSetup({
      workMinutesHours: toStoreSessionHours(draft),
      numOfBreaks: breakCountFromBlocks(draft.totalBlocks),
      breakMinutes: draft.breakMinutes,
      workType: draft.workType,
    });
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={modalStyles}
      contentLabel="Set up your focus session"
      shouldCloseOnOverlayClick
    >
      <div className="sessionSetup">
        <header className="sessionSetup__header">
          <div>
            <h2 className="sessionSetup__title">Set Up Your Focus Session</h2>
            <p className="sessionSetup__subtitle">Customize your session to match your workflow.</p>
          </div>
          <button type="button" className="sessionSetup__close" onClick={onRequestClose} aria-label="Close">
            <HiXMark aria-hidden />
          </button>
        </header>

        <div className="sessionSetup__body">
          <SessionSetupFields draft={draft} onChange={setDraft} />
        </div>

        <footer className="sessionSetup__footer">
          <button type="button" className="sessionSetup__cancel" onClick={onRequestClose}>
            Cancel
          </button>
          <button type="button" className="sessionSetup__start" onClick={startSession}>
            <HiPlay aria-hidden />
            Start Session
          </button>
        </footer>
      </div>
    </Modal>
  );
}
