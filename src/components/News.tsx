import axios from "axios";
import { useEffect, useState } from "react";
import Article from "@/components/Article";

type Article = {
  title: string;
  link: string;
  description?: string;
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
      const items: Article[] = Array.isArray(data?.articles)
        ? data.articles.map((item: Article) => ({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
            source: (item as any).source,
          }))
        : [];
      setArticles(items);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch news.");
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
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          placeholder="Enter location (optional)"
          className="border rounded-md px-3 py-2 flex-1 min-w-0"
        />
        <button
          onClick={() => loadNews()}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Refresh News
        </button>
      </div>

      {loading && articles.length === 0 && (
        <div className="text-sm text-muted-foreground">Loading news…</div>
      )}

      {error && !loading && <div className="text-sm text-red-500">{error}</div>}

      {!loading && articles.length === 0 && !error && (
        <div className="text-sm text-muted-foreground">No articles found.</div>
      )}

      <div className="grid gap-3">
        {articles.map((article, idx) => (
          <Article
            key={`${article.link || article.title}-${idx}`}
            title={article.title}
            link={article.link}
            description={article.description}
            pubDate={article.pubDate}
            source={article.source}
          />
        ))}
      </div>
    </div>
  );
}
