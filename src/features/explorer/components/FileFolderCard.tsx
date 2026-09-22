interface FileFolderCardProps {
  name: string;
  type: "folder" | "file";
  meta: string;
  isSelected?: boolean;
  isStarred?: boolean;
  layout?: "grid" | "list";
  isMenuOpen?: boolean;
  onClick?: () => void;
  onOpenMenu?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

function FolderIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#2563EB">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function FileIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
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

function MenuDotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function DropdownMenu({
  onRename,
  onDelete,
}: {
  onRename?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRename?.();
        }}
        className="block w-full px-3 py-2 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Rename
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        className="block w-full px-3 py-2 text-left text-body-sm text-error hover:bg-red-50 dark:hover:bg-red-950"
      >
        Delete
      </button>
    </div>
  );
}

export default function FileFolderCard({
  name,
  type,
  meta,
  isSelected = false,
  isStarred = false,
  layout = "grid",
  isMenuOpen = false,
  onClick,
  onOpenMenu,
  onRename,
  onDelete,
}: FileFolderCardProps) {
  const borderClass = isSelected
    ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
    : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800";

  if (layout === "list") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={onClick}
          className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${borderClass}`}
        >
          {type === "folder" ? <FolderIcon size={20} /> : <FileIcon size={20} />}
          <span className="flex-1 truncate text-body-sm font-medium text-gray-900 dark:text-gray-50">
            {name}
          </span>
          {isStarred && <StarIcon />}
          <span className="text-caption text-gray-500 dark:text-gray-400">
            {meta}
          </span>
          {onOpenMenu && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onOpenMenu();
              }}
              className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <MenuDotsIcon />
            </span>
          )}
        </button>
        {isMenuOpen && <DropdownMenu onRename={onRename} onDelete={onDelete} />}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`group relative flex w-full cursor-pointer flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors ${borderClass}`}
      >
        <div className="flex w-full items-start justify-between">
          {type === "folder" ? <FolderIcon /> : <FileIcon />}
          <div className="flex items-center gap-1">
            {isStarred && <StarIcon />}
            {onOpenMenu && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMenu();
                }}
                className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <MenuDotsIcon />
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="truncate text-body-sm font-medium text-gray-900 dark:text-gray-50">
            {name}
          </span>
          <span className="truncate text-caption text-gray-500 dark:text-gray-400">
            {meta}
          </span>
        </div>
      </button>
      {isMenuOpen && <DropdownMenu onRename={onRename} onDelete={onDelete} />}
    </div>
  );
}
