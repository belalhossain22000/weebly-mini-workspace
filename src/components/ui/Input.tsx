import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  onClear?: () => void;
  rightElement?: ReactNode;
  variant?: "default" | "filled";
}

export default function Input({
  icon,
  error,
  onClear,
  rightElement,
  variant = "default",
  value,
  className = "",
  ...rest
}: InputProps) {
  const hasClear = Boolean(onClear) && Boolean(value);
  const hasRightContent = hasClear || Boolean(rightElement);

  const variantClasses =
    variant === "filled"
      ? "border-transparent bg-gray-100 focus:border-primary-500 focus:bg-white dark:bg-gray-800 dark:focus:bg-gray-900"
      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 focus:border-primary-500";

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
          } ${hasRightContent ? "pr-12" : "pr-3"} ${
            error
              ? "border-error text-gray-900 focus:border-error dark:text-gray-100"
              : `${variantClasses} text-gray-900 dark:text-gray-100`
          } placeholder:text-gray-400 dark:placeholder:text-gray-500 ${className}`}
          {...rest}
        />
        {hasClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear"
          >
            ×
          </button>
        ) : (
          rightElement && (
            <span className="pointer-events-none absolute right-3 flex items-center">
              {rightElement}
            </span>
          )
        )}
      </div>
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  );
}
