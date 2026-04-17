type ArticleProps = {
  title: string;
  link?: string;
  pubDate?: string;
  source?: string;
  featured?: boolean;
};

// Simple presentational article card used by News
export default function Article({
  title,
  link,
  pubDate,
  source,
  featured = false,
}: ArticleProps) {
  return (
    <article className={`atmo-news-item ${featured ? "is-featured" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`leading-snug text-slate-50 ${featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
        >
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="hover:underline underline-offset-4 decoration-current"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        {source && (
          <span className="atmo-kicker whitespace-nowrap">{source}</span>
        )}
      </div>

      {pubDate && (
        <div className="mt-3 atmo-kicker opacity-80">
          {new Date(pubDate).toLocaleString()}
        </div>
      )}

      {featured && (
        <p className="mt-4 text-sm sm:text-base leading-relaxed atmo-muted-copy">
          A lead dispatch from the latest weather desk update.
        </p>
      )}
    </article>
  );
}
