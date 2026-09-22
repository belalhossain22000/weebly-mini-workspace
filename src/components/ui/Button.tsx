import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-100 disabled:text-primary-500",
  secondary:
    "bg-primary-50 text-primary-600 hover:bg-primary-100 active:bg-primary-100 disabled:bg-gray-50 disabled:text-gray-300",
  ghost:
    "bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-300 disabled:border-gray-100 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800",
  danger:
    "bg-error text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-100 disabled:text-error",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-body-sm gap-1.5",
  md: "h-10 px-4 text-body gap-2",
  lg: "h-12 px-5 text-body-lg gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
