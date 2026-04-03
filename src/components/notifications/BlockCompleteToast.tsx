import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./BlockCompleteToast.css";

export type BlockCompleteToastProps = {
  /** When true, the toast is shown and auto-dismisses after a short delay */
  show: boolean;
  /** Which work block just finished (matches session “Block #N”) */
  blockNumber: number;
  totalBlocks: number;
  /** Called after the visible duration so the parent can clear `show` */
  onDismiss: () => void;
};

/**
 * Lightweight “notification” when a work block ends and the user enters break / rating.
 * Rendered in a portal so it isn’t clipped by overflow or stacking contexts.
 */
const BlockCompleteToast = ({ show, blockNumber, totalBlocks, onDismiss }: BlockCompleteToastProps) => {
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
          <p className="block-complete-toast-text">Block complete!</p>
          <p className="block-complete-toast-sub">
            Block {blockNumber} of {totalBlocks} complete! Time for a break
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BlockCompleteToast;
