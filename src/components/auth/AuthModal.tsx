import React from "react";
import Modal, { type Styles } from "react-modal";
import AuthForm from "./AuthForm";
import "./AuthModal.css";

export type AuthModalProps = {
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
    /* Solid fill avoids a strip of white `body` showing through (overflow/rounding gaps) */
    backgroundColor: "#1e212d",
    border: "none",
    borderRadius: "16px",
    padding: 0,
    maxHeight: "90vh",
    overflow: "hidden",
    outline: "none",
    zIndex: 10001,
  },
};

const AuthModal = ({ isOpen, onRequestClose }: AuthModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={modalStyles}
      contentLabel="Sign in or sign up"
      shouldCloseOnOverlayClick
    >
      <div className="auth-modal-inner">
        <button type="button" className="auth-modal-close" onClick={onRequestClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="auth-modal-close-icon">
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <AuthForm onAuthSuccess={onRequestClose} />
      </div>
    </Modal>
  );
};

export default AuthModal;
