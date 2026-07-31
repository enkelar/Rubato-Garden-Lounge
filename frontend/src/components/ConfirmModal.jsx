import { useEffect, useRef } from "react";
import "./ConfirmModal.css";

export function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  busy = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement;
    modalRef.current?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape" && !busy) onCancel();
      if (e.key === "Tab") trapFocus(e);
    }

    function trapFocus(e) {
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="rg-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        className="rg-modal rg-modal-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rg-confirm-title"
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="rg-modal-head">
          <h2 id="rg-confirm-title">{title}</h2>
          <button
            className="rg-modal-close"
            onClick={onCancel}
            aria-label="Close"
            disabled={busy}
          >
            ×
          </button>
        </div>

        {message && <p className="rg-confirm-message">{message}</p>}

        {error && <p className="rg-auth-error">{error}</p>}

        <div className="rg-form-actions">
          <button
            type="button"
            className="rg-btn rg-btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`rg-btn ${danger ? "rg-btn-danger" : "rg-btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;