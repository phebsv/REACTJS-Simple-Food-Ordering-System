import "./AdminModal.css";
interface AdminModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
}

export default function AdminModal({
  isOpen,
  title,
  onClose,
  children,
  size = "medium",
}: AdminModalProps) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className={`admin-modal admin-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h2>{title}</h2>
          <button className="admin-modal-close" onClick={onClose}>
            X
          </button>
        </div>
        <div className="admin-modal-content">{children}</div>
      </div>
    </div>
  );
}
