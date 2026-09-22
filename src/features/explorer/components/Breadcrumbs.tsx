export interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  rootId: string;
  items: BreadcrumbItem[];
  onNavigate: (id: string) => void;
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

export default function Breadcrumbs({ rootId, items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-body-sm text-gray-500 dark:text-gray-400">
      <button
        type="button"
        onClick={() => onNavigate(rootId)}
        className="flex items-center hover:text-gray-700 dark:hover:text-gray-200"
        aria-label="Home"
      >
        <HomeIcon />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-gray-300 dark:text-gray-600">/</span>
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-gray-50">
                {item.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className="hover:text-gray-700 dark:hover:text-gray-200"
              >
                {item.name}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
