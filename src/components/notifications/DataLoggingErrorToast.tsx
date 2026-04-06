import React from "react";
import { createPortal } from "react-dom";
import { FaTimesCircle } from "react-icons/fa";
import "./DataLoggingErrorToast.css";
import { clearDataLoggingAlert } from "../../lib/dataLoggingAlerts";

export type DataLoggingErrorToastProps = {
  title: string;
  body: string;
  show: boolean;
};

/**
 * Persistent failure notice — dismiss only via the close control (no auto timer).
 * Same stacking/portal idea as BlockCompleteToast; styled for errors.
 */
const DataLoggingErrorToast = ({ title, body, show }: DataLoggingErrorToastProps) => {
  if (!show || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="data-logging-error-overlay"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="data-logging-error-card">
        <div className="data-logging-error-icon-wrap" aria-hidden>
          <FaTimesCircle className="data-logging-error-x" />
        </div>
        <div className="data-logging-error-text-wrap">
          <p className="data-logging-error-title">{title}</p>
          <p className="data-logging-error-body">{body}</p>
        </div>
        <button
          type="button"
          className="data-logging-error-dismiss"
          onClick={() => clearDataLoggingAlert()}
          aria-label="Dismiss error"
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default DataLoggingErrorToast;
