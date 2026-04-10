type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  showLogo?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, showLogo = false, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm border overflow-hidden" style={{ borderColor: "var(--border)" }}>

        {showLogo && (
          <div className="flex justify-center pt-5 pb-2">
            <img src="/uploads/logo.png" alt="Uncle Brew" style={{ height: "36px", width: "auto", objectFit: "contain", display: "block" }} />
          </div>
        )}

        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="font-semibold text-sm text-center" style={{ color: "var(--text-primary)" }}>{title}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>{message}</p>
        </div>
        <div className="px-5 py-4 border-t flex justify-center gap-2" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-xs font-semibold border transition-colors hover:bg-slate-50"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-xs font-semibold text-white transition-colors"
            style={{ background: danger ? "var(--error)" : "var(--brand)" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
