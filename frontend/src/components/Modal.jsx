export function Modal({ title, onClose, children }) {
  return (
    <div
      className="rg-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rg-modal">
        <div className="rg-modal-head">
          <h2>{title}</h2>
          <button className="rg-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;