interface FileFolderCardProps {
  name: string;
  type: "folder" | "file";
  meta: string;
  isSelected?: boolean;
  isStarred?: boolean;
  onClick?: () => void;
  onOpenMenu?: () => void;
}

function FolderIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#2563EB">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B">
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
    </svg>
  );
}

export default function FileFolderCard({
  name,
  type,
  meta,
  isSelected = false,
  isStarred = false,
  onClick,
  onOpenMenu,
}: FileFolderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
        isSelected
          ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
      }`}
    >
      {isStarred && (
        <span className="absolute right-3 top-3">
          <StarIcon />
        </span>
      )}

      {onOpenMenu && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onOpenMenu();
          }}
          className="absolute right-3 top-3 hidden text-gray-400 hover:text-gray-600 group-hover:block dark:hover:text-gray-200"
        >
          ⋮
        </span>
      )}

      {type === "folder" ? <FolderIcon /> : <FileIcon />}

      <div className="flex flex-col gap-0.5">
        <span className="text-body-sm font-medium text-gray-900 dark:text-gray-50">
          {name}
        </span>
        <span className="text-caption text-gray-500 dark:text-gray-400">
          {meta}
        </span>
      </div>
    </button>
  );
}
