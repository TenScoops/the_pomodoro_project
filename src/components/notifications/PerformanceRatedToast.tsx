import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./BlockCompleteToast.css";

export type PerformanceRatedToastProps = {
  show: boolean;
  blockNumber: number;
  onDismiss: () => void;
};

/**
 * Brief confirmation after the user submits a block rating — same pattern as BlockCompleteToast.
 */
const PerformanceRatedToast = ({ show, blockNumber, onDismiss }: PerformanceRatedToastProps) => {
  useEffect(() => {
    if (!show) {
      return;
    }
    const durationMs = 3600;
    const timerId = window.setTimeout(() => {
      onDismiss();
    }, durationMs);
    return () => window.clearTimeout(timerId);
  }, [show, onDismiss]);

  if (!show || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="block-complete-toast-overlay" role="status" aria-live="polite" aria-atomic="true">
      <div className="block-complete-toast-card">
        <div className="block-complete-toast-icon-wrap" aria-hidden>
          <FaCheckCircle className="block-complete-toast-check" />
        </div>
        <div>
          <p className="block-complete-toast-text">Performance rated!</p>
          <p className="block-complete-toast-sub">Block #{blockNumber} saved — nice work</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PerformanceRatedToast;
