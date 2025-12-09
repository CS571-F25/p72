import axios from "axios";
import { useEffect, useState } from "react";
import Article from "@/components/Article";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
            source: (item as any).source,
          }))
        : [];
      // Sort by most recent first
      items.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
      });
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
        <Input
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          placeholder="Enter location (optional)"
          className="flex-1"
        />
        <Button onClick={() => loadNews()}>Refresh News</Button>
      </div>

      {loading && articles.length === 0 && (
        <Alert>
          <AlertDescription>Loading news…</AlertDescription>
        </Alert>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && articles.length === 0 && !error && (
        <Alert>
          <AlertDescription>No articles found.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        {articles.map((article, idx) => (
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
  );
}
