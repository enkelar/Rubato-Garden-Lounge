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
  if (!open) return null;

  return (
    <div
      className="rg-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="rg-modal rg-modal-sm">
        <div className="rg-modal-head">
          <h2>{title}</h2>
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