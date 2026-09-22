import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center text-gray-300 dark:text-gray-600">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-heading-4 text-gray-900 dark:text-gray-50">
          {title}
        </h3>
        <p className="max-w-sm text-body-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
