import React from "react";
import { createPortal } from "react-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./HighProductivityToast.css";

export type HighProductivityToastProps = {
  show: boolean;
  onDismiss: () => void;
};

const HighProductivityToast = ({ show, onDismiss }: HighProductivityToastProps) => {
  if (!show || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="high-productivity-toast-overlay" role="status" aria-live="polite" aria-atomic="true">
      <div className="high-productivity-toast-card">
        <div className="high-productivity-toast-icon-wrap" aria-hidden>
          <FaCheckCircle className="high-productivity-toast-check" />
        </div>
        <div className="high-productivity-toast-text-wrap">
          <p className="high-productivity-toast-title">You're doing great work! Keep it up!</p>
        </div>
        <button
          type="button"
          className="high-productivity-toast-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default HighProductivityToast;
