type ArticleProps = {
  title: string;
  link?: string;
  description?: string;
  pubDate?: string;
  source?: string;
};

// Simple presentational article card used by News
export default function Article({
  title,
  link,
  description,
  pubDate,
  source,
}: ArticleProps) {
  return (
    <article className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold leading-snug">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 underline"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        {source && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 whitespace-nowrap">
            {source}
          </span>
        )}
      </div>

      {pubDate && (
        <div className="text-xs text-muted-foreground mt-1">
          {new Date(pubDate).toLocaleString()}
        </div>
      )}

      {description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
          {description}
        </p>
      )}
    </article>
  );
}
