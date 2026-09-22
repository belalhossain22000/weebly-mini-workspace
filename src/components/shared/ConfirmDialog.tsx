import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

function TrashIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-error dark:bg-red-950">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: "folder" | "file";
  itemPath: string;
  nestedCount?: { folders: number; files: number };
  isDeleting?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  itemPath,
  nestedCount,
  isDeleting = false,
}: ConfirmDialogProps) {
  const isFolder = itemType === "folder";
  const title = isFolder ? "Delete Folder?" : "Delete File?";

  const totalNested = nestedCount ? nestedCount.folders + nestedCount.files : 0;
  const description =
    isFolder && nestedCount && totalNested > 0
      ? `Are you sure you want to delete this folder? This folder contains ${totalNested} items (${nestedCount.folders} folders, ${nestedCount.files} files). All contents will be permanently deleted.`
      : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={<TrashIcon />}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
        <div className="text-gray-400">
          {isFolder ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <path d="M14 2v6h6" />
            </svg>
          )}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-body-sm font-medium text-gray-900 dark:text-gray-100">
            {itemName}
          </span>
          <span className="text-caption text-gray-500 dark:text-gray-400">
            {itemPath}
          </span>
        </div>
      </div>
    </Modal>
  );
}
