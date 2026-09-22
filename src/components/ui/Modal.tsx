import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-lg sm:rounded-lg sm:max-h-[90vh] dark:bg-gray-900">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-200 sm:hidden dark:bg-gray-700" />
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex flex-1 flex-col items-center gap-3 text-center">
            {icon && <div>{icon}</div>}
            <div className="flex flex-col gap-1">
              <h2 className="text-heading-4 text-gray-900 dark:text-gray-50">
                {title}
              </h2>
              {description && (
                <p className="text-body-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        {children && <div className="px-6 pb-6">{children}</div>}

        {footer && (
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
