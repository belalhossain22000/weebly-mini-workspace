interface LoadingStateProps {
  title: string;
  description?: string;
}

export default function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500 dark:border-gray-700 dark:border-t-primary-500" />
      <div className="flex flex-col gap-1">
        <h3 className="text-heading-4 text-gray-900 dark:text-gray-50">{title}</h3>
        {description && (
          <p className="max-w-sm text-body-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
