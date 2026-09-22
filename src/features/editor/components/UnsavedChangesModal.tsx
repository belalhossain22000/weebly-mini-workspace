import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

function WarningIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    </div>
  );
}

export default function UnsavedChangesModal({
  isOpen,
  onCancel,
  onDiscard,
  onSave,
}: UnsavedChangesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      icon={<WarningIcon />}
      title="Unsaved Changes"
      description="You have unsaved changes. Do you want to save before leaving?"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDiscard}>
            Discard
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </>
      }
    />
  );
}
