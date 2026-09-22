import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  onClear?: () => void;
}

export default function Input({
  icon,
  error,
  onClear,
  value,
  className = "",
  ...rest
}: InputProps) {
  const hasClear = Boolean(onClear) && Boolean(value);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-gray-400">
            {icon}
          </span>
        )}
        <input
          value={value}
          className={`h-10 w-full rounded-md border text-body outline-none transition-colors ${
            icon ? "pl-10" : "pl-3"
          } ${hasClear ? "pr-10" : "pr-3"} ${
            error
              ? "border-error text-gray-900 focus:border-error dark:text-gray-100"
              : "border-gray-200 text-gray-900 focus:border-primary-500 dark:border-gray-700 dark:text-gray-100"
          } bg-white placeholder:text-gray-400 dark:bg-gray-900 dark:placeholder:text-gray-500 ${className}`}
          {...rest}
        />
        {hasClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear"
          >
            ×
          </button>
        )}
      </div>
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  );
}
