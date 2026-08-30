"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NewsItem = {
  id: string;
  title: string;
  source: string;
  category: string;
  date: string;
  url: string;
};

export default function NewsPreview() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/news", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          setNews(data.data.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  return (
    <section className="bg-[#071321] border-b border-[#16263a]">
      <div className="mx-auto max-w-[1400px] px-6 py-10">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Latest News
          </h2>

          <Link
            href="/news"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">
            Loading news...
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-[#18314b] bg-[#0b1827] p-5 transition hover:border-blue-500"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-300">
                    {item.category}
                  </span>

                  <span className="text-xs text-gray-500">
                    {item.source}
                  </span>
                </div>

                <h3 className="line-clamp-3 text-white font-semibold">
                  {item.title}
                </h3>

                <p className="mt-4 text-xs text-blue-400">
                  Read Full Story →
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}