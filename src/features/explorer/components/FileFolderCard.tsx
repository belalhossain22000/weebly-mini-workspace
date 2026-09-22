import { FolderIcon, FileIcon } from "@/components/ui/FileFolderIcon";

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
  onToggleStar?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}


function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#F59E0B" : "none"}
      stroke={filled ? "#F59E0B" : "currentColor"}
      strokeWidth="1.8"
    >
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
  isStarred,
  onToggleStar,
  onRename,
  onDelete,
}: {
  isStarred?: boolean;
  onToggleStar?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      {onToggleStar && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <StarIcon filled={isStarred} />
          {isStarred ? "Unstar" : "Star"}
        </button>
      )}
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
  onToggleStar,
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
          className={`group relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${borderClass}`}
        >
          {type === "folder" ? <FolderIcon size={26} /> : <FileIcon size={26} />}
          <span className="flex-1 truncate text-body-sm font-medium text-gray-900 dark:text-gray-50">
            {name}
          </span>
          {isStarred && <StarIcon />}
          <span className="hidden shrink-0 text-caption text-gray-500 sm:inline dark:text-gray-400">
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
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <MenuDotsIcon />
            </span>
          )}
        </button>
        {isMenuOpen && (
          <DropdownMenu
            isStarred={isStarred}
            onToggleStar={onToggleStar}
            onRename={onRename}
            onDelete={onDelete}
          />
        )}
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
          {type === "folder" ? <FolderIcon size={48} /> : <FileIcon size={46} />}
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
                className="flex h-8 w-8 -m-1 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
      {isMenuOpen && (
        <DropdownMenu
          isStarred={isStarred}
          onToggleStar={onToggleStar}
          onRename={onRename}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
