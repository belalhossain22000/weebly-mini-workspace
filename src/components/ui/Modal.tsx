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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-gray-900">
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
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        {children && <div className="px-6 pb-6">{children}</div>}

        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
