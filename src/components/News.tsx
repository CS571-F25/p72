import axios from "axios";
import { useEffect, useState } from "react";
import Article from "@/components/Article";

type Article = {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
};

export default function News() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loc, setLoc] = useState<string>("");

  const API_URL = import.meta.env.VITE_WEATHER_API_BASE_URL || "";

  const loadNews = async (locOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const location = (locOverride ?? loc).trim();
      const params = new URLSearchParams();
      if (location) params.set("loc", location);

      const endpoint = API_URL
        ? `${API_URL}/api/news${
            params.toString() ? `?${params.toString()}` : ""
          }`
        : `/api/news${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await axios.get(endpoint);
      const data = response.data;
      const items: Article[] = Array.isArray(data)
        ? data.map((item: Article) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: item.source,
          }))
        : [];
      // Sort by most recent first
      items.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
      });
      setArticles(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch news.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="atmo-flat-page atmo-reveal">
      <div className="atmo-flat-inner">
        <header className="mb-7 atmo-reveal atmo-reveal-delay-1">
          <p className="atmo-kicker">Weather Briefing</p>
          <h1 className="atmo-title">Forecast Headlines</h1>
          <p className="mt-3 text-sm atmo-muted-copy max-w-2xl">
            Regional weather coverage in the same atmospheric style as your live
            dashboard.
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadNews();
          }}
          className="atmo-flat-controls mb-5 grid gap-3 lg:grid-cols-[1fr_auto] items-end"
        >
          <div>
            <label htmlFor="location" className="atmo-kicker">
              Location, optional
            </label>
            <input
              id="location"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="Search a city or region"
              className="atmo-min-input mt-2"
            />
          </div>
          <button type="submit" className="atmo-plain-link h-11 px-5">
            Refresh edition
          </button>
        </form>

        {loading && articles.length === 0 && (
          <div className="atmo-flat-note">Compiling the latest edition...</div>
        )}

        {error && !loading && (
          <div className="atmo-flat-note">News unavailable: {error}</div>
        )}

        {!loading && articles.length === 0 && !error && (
          <div className="atmo-flat-note">No articles found.</div>
        )}

        {articles.length > 0 && (
          <div className="grid gap-3 xl:grid-cols-[1.08fr_0.92fr] atmo-reveal atmo-reveal-delay-2">
            <div className="grid gap-4">
              <Article
                title={articles[0].title}
                link={articles[0].link}
                pubDate={articles[0].pubDate}
                source={articles[0].source}
                featured={true}
              />
            </div>

            <div className="grid gap-4 content-start">
              {articles.slice(1).map((article, idx) => (
                <Article
                  key={`${article.link || article.title}-${idx}`}
                  title={article.title}
                  link={article.link}
                  pubDate={article.pubDate}
                  source={article.source}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
