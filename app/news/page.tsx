"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type NewsCategory =
  | "Markets"
  | "Forex"
  | "Commodities"
  | "Crypto";

type FilterCategory = "All" | NewsCategory;

type MarketBias =
  | "Bullish"
  | "Bearish"
  | "Neutral";

type NewsItem = {
  id: string;
  category: NewsCategory;
  source: string;
  sourceShort: string;
  title: string;
  summary: string;
  time: string;
  impact: "High" | "Medium" | "Low";
  bias: MarketBias;
  image: string;
  symbol?: string;

  /*
   * 真实新闻原文地址
   *
   * 来自 /api/news
   * 不再使用 Google News 搜索
   */
  url: string;

  publishedAt?: string;
  sourceUrl?: string;
};

type MarketTicker = {
  symbol: string;
  price: number;
  change: number;
  percent: number;
};

type ApiMarketItem = {
  symbol: string;
  name?: string;
  price?: number;
  close?: number;
  change?: number;
  percent_change?: number;
  type?: string;
};

const categories: {
  key: FilterCategory;
  label: string;
}[] = [
  {
    key: "All",
    label: "All News",
  },
  {
    key: "Markets",
    label: "Markets",
  },
  {
    key: "Forex",
    label: "Forex",
  },
  {
    key: "Commodities",
    label: "Commodities",
  },
  {
    key: "Crypto",
    label: "Crypto",
  },
];

const fallbackTicker: MarketTicker[] = [
  {
    symbol: "EUR/USD",
    price: 1.1668,
    change: -0.0007,
    percent: -0.06,
  },
  {
    symbol: "GBP/USD",
    price: 1.3626,
    change: -0.0024,
    percent: -0.17,
  },
  {
    symbol: "USD/JPY",
    price: 148.22,
    change: 0.18,
    percent: 0.12,
  },
  {
    symbol: "XAU/USD",
    price: 3421.8,
    change: 12.6,
    percent: 0.37,
  },
  {
    symbol: "BTC/USD",
    price: 118420,
    change: 620,
    percent: 0.53,
  },
];

function formatPrice(
  symbol: string,
  price: number
) {
  if (symbol === "BTC/USD") {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  if (symbol === "XAU/USD") {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  if (symbol === "USD/JPY") {
    return price.toFixed(2);
  }

  return price.toFixed(4);
}

function formatChange(
  symbol: string,
  change: number
) {
  if (symbol === "BTC/USD") {
    return `${change >= 0 ? "+" : ""}${change.toFixed(
      0
    )}`;
  }

  if (symbol === "XAU/USD") {
    return `${change >= 0 ? "+" : ""}${change.toFixed(
      1
    )}`;
  }

  if (symbol === "USD/JPY") {
    return `${change >= 0 ? "+" : ""}${change.toFixed(
      2
    )}`;
  }

  return `${change >= 0 ? "+" : ""}${change.toFixed(
    4
  )}`;
}

function getBiasClass(
  bias: MarketBias
) {
  if (bias === "Bullish") {
    return "bullish";
  }

  if (bias === "Bearish") {
    return "bearish";
  }

  return "neutral";
}

function getImpactClass(
  impact: NewsItem["impact"]
) {
  if (impact === "High") {
    return "high";
  }

  if (impact === "Medium") {
    return "medium";
  }

  return "low";
}

export default function NewsPage() {
  const router = useRouter();

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<FilterCategory>("All");

  const [showAll, setShowAll] =
    useState(false);

  const [ticker, setTicker] =
    useState<MarketTicker[]>(
      fallbackTicker
    );

  const [liveIndex, setLiveIndex] =
    useState(0);

  const [
    isLivePaused,
    setIsLivePaused,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [
    marketLoading,
    setMarketLoading,
  ] = useState(true);

  /*
   * ================================
   * REAL NEWS DATA
   * ================================
   *
   * 从我们刚刚建立的：
   *
   * /api/news
   *
   * 获取真实新闻。
   *
   * 每条新闻里面已经包含：
   *
   * item.url
   *
   * 这个 URL 就是 Reuters / Forbes /
   * Barchart 等新闻网站的真实文章地址。
   */
  const [news, setNews] =
    useState<NewsItem[]>([]);

  const [newsLoading, setNewsLoading] =
    useState(true);

  const [newsError, setNewsError] =
    useState("");

  /*
   * ================================
   * LOAD REAL NEWS
   * ================================
   */
  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setNewsLoading(true);
        setNewsError("");

        const response = await fetch(
          "/api/news",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "News API request failed"
          );
        }

        const json =
          await response.json();

        const items =
          Array.isArray(json?.data)
            ? json.data
            : [];

        /*
         * 只接受真正有 URL 的新闻。
         *
         * 没有 url 的新闻不会显示，
         * 避免再次出现 Google 搜索页面。
         */
        const validNews: NewsItem[] =
          items.filter(
            (item: NewsItem) =>
              item &&
              typeof item.title ===
                "string" &&
              typeof item.url ===
                "string" &&
              item.url.startsWith("http")
          );

        if (!cancelled) {
          setNews(validNews);
        }
      } catch (error) {
        console.error(
          "News loading error:",
          error
        );

        if (!cancelled) {
          setNewsError(
            "Unable to load live news."
          );
        }
      } finally {
        if (!cancelled) {
          setNewsLoading(false);
        }
      }
    }

    loadNews();

    /*
     * 新闻每 10 分钟更新一次。
     *
     * 不要像行情一样 60 秒请求，
     * 避免浪费新闻 API 配额。
     */
    const interval = setInterval(
      loadNews,
      10 * 60 * 1000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /*
   * ================================
   * LOAD MARKET DATA
   * ================================
   */
  useEffect(() => {
    let cancelled = false;

    async function loadMarket() {
      try {
        setMarketLoading(true);

        const response = await fetch(
          "/api/market",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Market API failed"
          );
        }

        const json =
          await response.json();

        const items: ApiMarketItem[] =
          Array.isArray(json?.data)
            ? json.data
            : [];

        if (!items.length) {
          return;
        }

        const wantedSymbols = [
          "EUR/USD",
          "GBP/USD",
          "USD/JPY",
          "XAU/USD",
          "BTC/USD",
        ];

        const mapped: MarketTicker[] =
          wantedSymbols
            .map((symbol) => {
              const item =
                items.find(
                  (market) =>
                    market.symbol
                      ?.toUpperCase() ===
                    symbol.toUpperCase()
                );

              if (!item) {
                return null;
              }

              const price =
                typeof item.price ===
                "number"
                  ? item.price
                  : typeof item.close ===
                    "number"
                  ? item.close
                  : 0;

              const change =
                typeof item.change ===
                "number"
                  ? item.change
                  : 0;

              const percent =
                typeof item.percent_change ===
                "number"
                  ? item.percent_change
                  : 0;

              return {
                symbol,
                price,
                change,
                percent,
              };
            })
            .filter(Boolean) as MarketTicker[];

        if (
          !cancelled &&
          mapped.length > 0
        ) {
          setTicker(mapped);
        }
      } catch (error) {
        console.error(
          "News market data error:",
          error
        );
      } finally {
        if (!cancelled) {
          setMarketLoading(false);
        }
      }
    }

    loadMarket();

    /*
     * Twelve Data 免费版：
     * 60 秒更新一次。
     */
    const interval = setInterval(
      loadMarket,
      60 * 1000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  /*
   * ================================
   * LIVE MARKET ROTATION
   * ================================
   */
  useEffect(() => {
    if (!ticker.length) {
      return;
    }

    const timer = setInterval(() => {
      if (isLivePaused) {
        return;
      }

      setLiveIndex(
        (index) =>
          (index + 1) % ticker.length
      );
    }, 7000);

    return () => {
      clearInterval(timer);
    };
  }, [
    isLivePaused,
    ticker.length,
  ]);

  /*
   * ================================
   * FILTER NEWS
   * ================================
   */
  const filteredNews = useMemo(() => {
    let result = [...news];

    if (activeCategory !== "All") {
      result = result.filter(
        (item) =>
          item.category ===
          activeCategory
      );
    }

    if (search.trim()) {
      const keyword =
        search.toLowerCase();

      result = result.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(keyword) ||
          item.summary
            .toLowerCase()
            .includes(keyword) ||
          item.source
            .toLowerCase()
            .includes(keyword) ||
          item.category
            .toLowerCase()
            .includes(keyword)
      );
    }

    return result;
  }, [
    news,
    activeCategory,
    search,
  ]);

  /*
   * 默认只显示 4 条。
   */
  const visibleNews = showAll
    ? filteredNews
    : filteredNews.slice(0, 4);

  const activeTicker =
    ticker[liveIndex] ??
    ticker[0];

  /*
   * ================================
   * CATEGORY
   * ================================
   */
  function handleCategory(
    category: FilterCategory
  ) {
    setActiveCategory(category);
    setShowAll(false);
  }

  /*
   * ================================
   * MARKET
   * ================================
   */
  function openMarket(
    symbol?: string
  ) {
    if (!symbol) {
      router.push("/market");
      return;
    }

    router.push(
      `/market?symbol=${encodeURIComponent(
        symbol
      )}`
    );
  }

  /*
   * ================================
   * OPEN REAL NEWS
   * ================================
   *
   * 这里是这次最重要的修改。
   *
   * 不再：
   *
   * Google News search
   *
   * 而是：
   *
   * article.url
   *
   * 直接打开真实新闻文章。
   */
  function openNews(url: string) {
    if (!url) {
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="news-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #05070b;
          color: #f5f7fb;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        .news-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 5%,
              rgba(
                40,
                116,
                255,
                0.13
              ),
              transparent 28%
            ),
            radial-gradient(
              circle at 15% 30%,
              rgba(
                0,
                196,
                255,
                0.055
              ),
              transparent 25%
            ),
            #05070b;
          padding-bottom: 70px;
        }

        .page-shell {
          width: min(
            1380px,
            calc(100% - 36px)
          );
          margin: 0 auto;
        }

        /* ============================
           LIVE MARKET
        ============================ */

        .live-market {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
          background: rgba(
            5,
            7,
            11,
            0.94
          );
          backdrop-filter: blur(
            18px
          );
        }

        .live-inner {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 18px;
          overflow: hidden;
        }

        .live-label {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.13em;
          color: #aeb7c7;
          text-transform: uppercase;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #36e58c;
          box-shadow: 0 0 12px
            rgba(
              54,
              229,
              140,
              0.8
            );
          animation: pulse 1.8s
            infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.35;
          }
        }

        .ticker-track {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }

        .ticker-card {
          min-width: 205px;
          height: 34px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
          background: rgba(
            255,
            255,
            255,
            0.025
          );
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .ticker-card:hover {
          border-color: rgba(
            80,
            150,
            255,
            0.3
          );
          background: rgba(
            80,
            150,
            255,
            0.07
          );
        }

        .ticker-symbol {
          color: #cbd3df;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .ticker-price {
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        .ticker-change {
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .positive {
          color: #3ee394;
        }

        .negative {
          color: #ff6678;
        }

        .live-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .live-button {
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          background: rgba(
            255,
            255,
            255,
            0.035
          );
          color: #8f9bad;
          width: 30px;
          height: 28px;
          border-radius: 7px;
          cursor: pointer;
        }

        /* ============================
           HERO
        ============================ */

        .hero {
          padding: 72px 0 48px;
          display: grid;
          grid-template-columns:
            minmax(0, 1.5fr)
            minmax(350px, 0.75fr);
          gap: 48px;
          align-items: center;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 11px;
          border: 1px solid
            rgba(
              86,
              148,
              255,
              0.2
            );
          border-radius: 999px;
          background: rgba(
            52,
            116,
            255,
            0.07
          );
          color: #82aefc;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .eyebrow-line {
          width: 18px;
          height: 1px;
          background: #4e8cff;
        }

        .hero h1 {
          margin: 20px 0 16px;
          max-width: 850px;
          font-size: clamp(
            38px,
            5vw,
            72px
          );
          line-height: 0.98;
          letter-spacing: -0.055em;
          font-weight: 900;
        }

        .hero h1 span {
          color: #668fff;
        }

        .hero-description {
          max-width: 680px;
          margin: 0;
          color: #8994a6;
          font-size: 16px;
          line-height: 1.8;
        }

        /* ============================
           RIGHT QUOTE
        ============================ */

        .hero-side {
          position: relative;
          min-height: 270px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
          border-radius: 18px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              rgba(
                30,
                80,
                180,
                0.1
              ),
              rgba(
                255,
                255,
                255,
                0.02
              )
            );
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          opacity: 0.25;
          background-image:
            linear-gradient(
              rgba(
                255,
                255,
                255,
                0.08
              )
                1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(
                255,
                255,
                255,
                0.08
              )
                1px,
              transparent 1px
            );
          background-size: 38px 38px;
        }

        .quote-panel {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          z-index: 3;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .quote-label {
          color: #69758a;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .quote-symbol {
          color: #fff;
          font-size: 19px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .quote-price {
          color: #fff;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -0.04em;
          text-align: right;
        }

        .quote-change {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 800;
          text-align: right;
        }

        .quote-loading {
          color: #677386;
          font-size: 10px;
          text-align: right;
        }

        .hero-chart {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: 25px;
          height: 120px;
        }

        .hero-chart svg {
          width: 100%;
          height: 100%;
        }

        .quote-footer {
          position: absolute;
          z-index: 4;
          left: 20px;
          right: 20px;
          bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #536073;
          font-size: 8px;
        }

        .quote-live {
          color: #36e58c;
          font-weight: 800;
        }

        /* ============================
           TOOLBAR
        ============================ */

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 17px 0;
          margin-bottom: 28px;
          border-top: 1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
          border-bottom: 1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
        }

        .category-tabs {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .category-button {
          padding: 9px 14px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #7e899b;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .category-button:hover {
          color: #fff;
          background: rgba(
            255,
            255,
            255,
            0.04
          );
        }

        .category-button.active {
          color: #fff;
          border-color: rgba(
            88,
            143,
            255,
            0.22
          );
          background: rgba(
            72,
            127,
            255,
            0.12
          );
        }

        .search-box {
          position: relative;
          width: 230px;
        }

        .search-box input {
          width: 100%;
          height: 36px;
          padding: 0 12px 0 35px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          border-radius: 8px;
          outline: none;
          background: rgba(
            255,
            255,
            255,
            0.025
          );
          color: #fff;
          font-size: 12px;
        }

        .search-box input::placeholder {
          color: #626d7d;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(
            -50%
          );
          color: #657184;
          font-size: 13px;
        }

        /* ============================
           SECTION
        ============================ */

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .section-title {
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          margin: 4px 0 0;
          color: #677386;
          font-size: 11px;
        }

        /* ============================
           FEATURED
        ============================ */

        .featured {
          display: grid;
          grid-template-columns:
            1.25fr 0.75fr;
          gap: 14px;
          margin-bottom: 48px;
        }

        .featured-main {
          position: relative;
          min-height: 390px;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
          cursor: pointer;
          background: #0a0d13;
        }

        .featured-main::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to top,
              rgba(
                4,
                6,
                10,
                0.97
              )
                0%,
              rgba(
                4,
                6,
                10,
                0.55
              )
                44%,
              rgba(
                4,
                6,
                10,
                0.04
              )
                100%
            );
        }

        .featured-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform
            0.6s ease;
          opacity: 0.78;
        }

        .featured-main:hover
          .featured-image {
          transform: scale(1.045);
        }

        .featured-content {
          position: absolute;
          z-index: 2;
          left: 28px;
          right: 28px;
          bottom: 26px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 0 8px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .category-badge {
          background: rgba(
            78,
            137,
            255,
            0.16
          );
          color: #82adff;
          border: 1px solid
            rgba(
              78,
              137,
              255,
              0.18
            );
        }

        .impact-high {
          background: rgba(
            255,
            79,
            102,
            0.12
          );
          color: #ff7d8c;
          border: 1px solid
            rgba(
              255,
              79,
              102,
              0.14
            );
        }

        .impact-medium {
          background: rgba(
            245,
            181,
            65,
            0.1
          );
          color: #e9b85d;
          border: 1px solid
            rgba(
              245,
              181,
              65,
              0.14
            );
        }

        .impact-low {
          background: rgba(
            255,
            255,
            255,
            0.05
          );
          color: #8c97a8;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
        }

        .featured-content h2 {
          max-width: 850px;
          margin: 0 0 11px;
          font-size: clamp(
            24px,
            3vw,
            38px
          );
          line-height: 1.08;
          letter-spacing: -0.035em;
        }

        .featured-content p {
          max-width: 720px;
          margin: 0;
          color: #a4adbb;
          font-size: 13px;
          line-height: 1.65;
        }

        .featured-time {
          margin-top: 13px;
          color: #6f7b8e;
          font-size: 10px;
        }

        .featured-side {
          display: grid;
          gap: 14px;
        }

        .mini-feature {
          position: relative;
          overflow: hidden;
          min-height: 188px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
          border-radius: 16px;
          cursor: pointer;
          background: #090c11;
        }

        .mini-feature img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.52;
          transition: transform
            0.5s ease;
        }

        .mini-feature:hover img {
          transform: scale(1.06);
        }

        .mini-feature::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to top,
              rgba(
                5,
                7,
                11,
                0.97
              ),
              rgba(
                5,
                7,
                11,
                0.15
              )
            );
        }

        .mini-content {
          position: absolute;
          z-index: 2;
          left: 18px;
          right: 18px;
          bottom: 17px;
        }

        .mini-content h3 {
          margin: 9px 0 5px;
          font-size: 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .mini-content span {
          color: #687487;
          font-size: 9px;
        }

        /* ============================
           NEWS CARDS
        ============================ */

        .news-grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 14px;
        }

        .news-card {
          display: grid;
          grid-template-columns:
            190px minmax(0, 1fr);
          min-height: 170px;
          overflow: hidden;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.065
            );
          border-radius: 13px;
          background: rgba(
            255,
            255,
            255,
            0.018
          );
          cursor: pointer;
          transition:
            border-color
              0.25s ease,
            background 0.25s ease,
            transform
              0.25s ease;
        }

        .news-card:hover {
          transform: translateY(
            -2px
          );
          border-color: rgba(
            88,
            142,
            255,
            0.22
          );
          background: rgba(
            80,
            130,
            255,
            0.035
          );
        }

        .news-image-wrap {
          overflow: hidden;
          background: #0a0d12;
        }

        .news-image {
          width: 100%;
          height: 100%;
          min-height: 170px;
          object-fit: cover;
          opacity: 0.68;
          transition: transform
            0.45s ease;
        }

        .news-card:hover
          .news-image {
          transform: scale(1.05);
        }

        .news-body {
          padding: 18px;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .news-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .news-source {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #748094;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .source-dot {
          width: 17px;
          height: 17px;
          display: grid;
          place-items: center;
          border-radius: 5px;
          background: rgba(
            75,
            132,
            255,
            0.12
          );
          color: #7ea7ff;
          font-size: 7px;
          font-weight: 900;
        }

        .news-body h3 {
          margin: 0 0 8px;
          font-size: 17px;
          line-height: 1.23;
          letter-spacing: -0.025em;
        }

        .news-summary {
          margin: 0;
          color: #707c8f;
          font-size: 11px;
          line-height: 1.6;
        }

        .news-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
          padding-top: 13px;
        }

        .news-time {
          color: #586476;
          font-size: 9px;
        }

        .bias {
          font-size: 9px;
          font-weight: 800;
        }

        .bullish {
          color: #3ddd91;
        }

        .bearish {
          color: #ff6c7c;
        }

        .neutral {
          color: #a5afbe;
        }

        .read-news {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #729dff;
          font-size: 9px;
          font-weight: 800;
          margin-top: 10px;
        }

        /* ============================
           LOADING
        ============================ */

        .news-loading {
          display: grid;
          place-items: center;
          min-height: 260px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
          border-radius: 14px;
          background: rgba(
            255,
            255,
            255,
            0.015
          );
          color: #69758a;
          font-size: 12px;
        }

        .news-loading-dot {
          width: 8px;
          height: 8px;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #4e8cff;
          box-shadow: 0 0 16px
            rgba(
              78,
              140,
              255,
              0.8
            );
          animation: pulse 1.3s
            infinite;
        }

        .news-error {
          padding: 30px;
          text-align: center;
          border: 1px solid
            rgba(
              255,
              100,
              120,
              0.12
            );
          border-radius: 14px;
          color: #a77b85;
          background: rgba(
            255,
            80,
            100,
            0.025
          );
          font-size: 12px;
        }

        /* ============================
           MORE BUTTON
        ============================ */

        .load-more-wrap {
          display: flex;
          justify-content: center;
          padding-top: 28px;
        }

        .load-more {
          min-width: 190px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid
            rgba(
              83,
              139,
              255,
              0.25
            );
          background: rgba(
            72,
            126,
            255,
            0.08
          );
          color: #9bb9ff;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .empty-state {
          padding: 70px 20px;
          text-align: center;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
          border-radius: 14px;
          color: #667285;
        }

        .empty-state strong {
          display: block;
          margin-bottom: 7px;
          color: #a5afbe;
        }

        /* ============================
           RESPONSIVE
        ============================ */

        @media (max-width: 1050px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .hero-side {
            min-height: 250px;
          }

          .featured {
            grid-template-columns: 1fr;
          }

          .featured-side {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .news-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .page-shell {
            width: min(
              calc(100% - 24px),
              1380px
            );
          }

          .live-inner {
            gap: 10px;
          }

          .live-label {
            display: none;
          }

          .ticker-track {
            overflow: hidden;
          }

          .ticker-card {
            min-width: 185px;
          }

          .hero {
            padding: 46px 0 32px;
          }

          .hero h1 {
            font-size: 42px;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .featured-main {
            min-height: 350px;
          }

          .featured-side {
            grid-template-columns: 1fr;
          }

          .news-card {
            grid-template-columns:
              125px minmax(
                0,
                1fr
              );
          }

          .news-body {
            padding: 14px;
          }

          .news-body h3 {
            font-size: 14px;
          }

          .news-summary {
            display: none;
          }
        }

        @media (max-width: 500px) {
          .category-tabs {
            display: grid;
            grid-template-columns:
              repeat(2, 1fr);
          }

          .category-button {
            width: 100%;
          }

          .news-card {
            grid-template-columns: 1fr;
          }

          .news-image {
            height: 150px;
            min-height: 150px;
          }

          .featured-content {
            left: 18px;
            right: 18px;
            bottom: 18px;
          }

          .featured-content h2 {
            font-size: 23px;
          }

          .quote-price {
            font-size: 23px;
          }
        }
      `}</style>

      {/* =====================================================
          LIVE MARKET TOP BAR
      ===================================================== */}

      <div className="live-market">
        <div className="page-shell">
          <div className="live-inner">
            <div className="live-label">
              <span className="live-dot" />
              Live Market
            </div>

            <div className="ticker-track">
              {ticker.map(
                (item) => (
                  <button
                    key={
                      item.symbol
                    }
                    className="ticker-card"
                    onClick={() =>
                      openMarket(
                        item.symbol
                      )
                    }
                  >
                    <span className="ticker-symbol">
                      {
                        item.symbol
                      }
                    </span>

                    <span className="ticker-price">
                      {formatPrice(
                        item.symbol,
                        item.price
                      )}
                    </span>

                    <span
                      className={`ticker-change ${
                        item.percent >=
                        0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {item.percent >=
                      0
                        ? "+"
                        : ""}
                      {item.percent.toFixed(
                        2
                      )}
                      %
                    </span>
                  </button>
                )
              )}
            </div>

            <div className="live-controls">
              <button
                className="live-button"
                onClick={() =>
                  setIsLivePaused(
                    (value) =>
                      !value
                  )
                }
                aria-label={
                  isLivePaused
                    ? "Play live market"
                    : "Pause live market"
                }
              >
                {isLivePaused
                  ? "▶"
                  : "Ⅱ"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="hero">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              IMTraderFX Intelligence
            </div>

            <h1>
              Market News.
              <br />
              <span>
                Sharper Decisions.
              </span>
            </h1>

            <p className="hero-description">
              Stay ahead with focused
              market intelligence
              across global markets,
              foreign exchange,
              commodities and digital
              assets.
            </p>
          </div>

          {/* =================================================
              REAL MARKET QUOTE
          ================================================= */}

          <div className="hero-side">
            <div className="hero-grid" />

            <div className="quote-panel">
              <div>
                <div className="quote-label">
                  Live Market
                </div>

                <div className="quote-symbol">
                  {activeTicker?.symbol ??
                    "BTC/USD"}
                </div>
              </div>

              <div>
                {marketLoading ? (
                  <div className="quote-loading">
                    Updating...
                  </div>
                ) : (
                  <>
                    <div className="quote-price">
                      {formatPrice(
                        activeTicker?.symbol ??
                          "BTC/USD",
                        activeTicker?.price ??
                          0
                      )}
                    </div>

                    <div
                      className={`quote-change ${
                        (activeTicker?.percent ??
                          0) >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {(activeTicker?.change ??
                        0) >= 0
                        ? "+"
                        : ""}
                      {formatChange(
                        activeTicker?.symbol ??
                          "BTC/USD",
                        activeTicker?.change ??
                          0
                      )}{" "}
                      (
                      {(activeTicker?.percent ??
                        0) >= 0
                        ? "+"
                        : ""}
                      {(
                        activeTicker?.percent ??
                        0
                      ).toFixed(
                        2
                      )}
                      %)
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="hero-chart">
              <svg
                viewBox="0 0 600 150"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 125 C45 120 50 88 92 95 C125 101 132 62 168 72 C205 84 212 45 248 60 C286 75 294 28 335 48 C375 67 390 20 424 40 C455 58 478 18 515 30 C550 42 560 15 600 20"
                  fill="none"
                  stroke="rgba(95,145,255,0.9)"
                  strokeWidth="2"
                />

                <path
                  d="M0 125 C45 120 50 88 92 95 C125 101 132 62 168 72 C205 84 212 45 248 60 C286 75 294 28 335 48 C375 67 390 20 424 40 C455 58 478 18 515 30 C550 42 560 15 600 20 L600 150 L0 150 Z"
                  fill="rgba(80,130,255,0.08)"
                  stroke="none"
                />
              </svg>
            </div>

            <div className="quote-footer">
              <span className="quote-live">
                ● LIVE QUOTE
              </span>

              <span>
                Twelve Data ·
                60s refresh
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            FILTER
        ===================================================== */}

        <div className="toolbar">
          <div className="category-tabs">
            {categories.map(
              (category) => (
                <button
                  key={
                    category.key
                  }
                  className={`category-button ${
                    activeCategory ===
                    category.key
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleCategory(
                      category.key
                    )
                  }
                >
                  {
                    category.label
                  }
                </button>
              )
            )}
          </div>

          <div className="search-box">
            <span className="search-icon">
              ⌕
            </span>

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search market news..."
            />
          </div>
        </div>

        {/* =====================================================
            MARKET INTELLIGENCE
        ===================================================== */}

        <div className="section-heading">
          <div>
            <h2 className="section-title">
              Market Intelligence
            </h2>

            <p className="section-subtitle">
              Key developments
              worth watching
            </p>
          </div>
        </div>

        {newsLoading ? (
          <div className="news-loading">
            <div>
              <div className="news-loading-dot" />

              Loading real market
              intelligence...
            </div>
          </div>
        ) : newsError ? (
          <div className="news-error">
            {newsError}
          </div>
        ) : filteredNews.length >
          0 ? (
          <>
            <section className="featured">
              {/* =========================
                  FEATURED MAIN
              ========================= */}

              <article
                className="featured-main"
                onClick={() =>
                  openNews(
                    filteredNews[0]
                      .url
                  )
                }
              >
                <img
                  className="featured-image"
                  src={
                    filteredNews[0]
                      .image
                  }
                  alt={
                    filteredNews[0]
                      .title
                  }
                />

                <div className="featured-content">
                  <div className="meta-row">
                    <span className="badge category-badge">
                      {
                        filteredNews[0]
                          .category
                      }
                    </span>

                    <span
                      className={`badge impact-${getImpactClass(
                        filteredNews[0]
                          .impact
                      )}`}
                    >
                      {
                        filteredNews[0]
                          .impact
                      }{" "}
                      Impact
                    </span>
                  </div>

                  <h2>
                    {
                      filteredNews[0]
                        .title
                    }
                  </h2>

                  <p>
                    {
                      filteredNews[0]
                        .summary
                    }
                  </p>

                  <div className="featured-time">
                    {
                      filteredNews[0]
                        .source
                    }{" "}
                    ·{" "}
                    {
                      filteredNews[0]
                        .time
                    }{" "}
                    · View original
                    article ↗
                  </div>
                </div>
              </article>

              {/* =========================
                  FEATURED SIDE
              ========================= */}

              <div className="featured-side">
                {filteredNews
                  .slice(1, 3)
                  .map(
                    (item) => (
                      <article
                        key={
                          item.id
                        }
                        className="mini-feature"
                        onClick={() =>
                          openNews(
                            item.url
                          )
                        }
                      >
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.title
                          }
                        />

                        <div className="mini-content">
                          <span>
                            {
                              item.category
                            }{" "}
                            ·{" "}
                            {
                              item.time
                            }
                          </span>

                          <h3>
                            {
                              item.title
                            }
                          </h3>

                          <span>
                            {
                              item.source
                            }{" "}
                            · Original
                            article
                            ↗
                          </span>
                        </div>
                      </article>
                    )
                  )}
              </div>
            </section>
          </>
        ) : (
          <div className="empty-state">
            <strong>
              No market news found
            </strong>

            Try another category
            or search keyword.
          </div>
        )}

        {/* =====================================================
            LATEST NEWS
        ===================================================== */}

        <div
          className="section-heading"
          style={{
            marginTop: 10,
          }}
        >
          <div>
            <h2 className="section-title">
              Latest Market News
            </h2>

            <p className="section-subtitle">
              Curated updates across
              major asset classes
            </p>
          </div>
        </div>

        {newsLoading ? (
          <div className="news-loading">
            <div>
              <div className="news-loading-dot" />

              Loading latest news...
            </div>
          </div>
        ) : filteredNews.length >
          0 ? (
          <>
            <section className="news-grid">
              {visibleNews.map(
                (item) => (
                  <article
                    key={
                      item.id
                    }
                    className="news-card"
                    onClick={() =>
                      openNews(
                        item.url
                      )
                    }
                    title="Open original news article"
                  >
                    <div className="news-image-wrap">
                      <img
                        className="news-image"
                        src={
                          item.image
                        }
                        alt={
                          item.title
                        }
                      />
                    </div>

                    <div className="news-body">
                      <div className="news-topline">
                        <div className="news-source">
                          <span className="source-dot">
                            {
                              item.sourceShort
                            }
                          </span>

                          {
                            item.source
                          }
                        </div>

                        <span
                          className={`badge impact-${getImpactClass(
                            item.impact
                          )}`}
                        >
                          {
                            item.impact
                          }
                        </span>
                      </div>

                      <h3>
                        {
                          item.title
                        }
                      </h3>

                      <p className="news-summary">
                        {
                          item.summary
                        }
                      </p>

                      <div className="news-footer">
                        <span className="news-time">
                          {
                            item.time
                          }
                        </span>

                        <span
                          className={`bias ${getBiasClass(
                            item.bias
                          )}`}
                        >
                          {
                            item.bias
                          }
                        </span>
                      </div>

                      <div className="read-news">
                        ↗ Read original
                        article
                      </div>
                    </div>
                  </article>
                )
              )}
            </section>

            {filteredNews.length >
              4 && (
              <div className="load-more-wrap">
                <button
                  className="load-more"
                  onClick={() =>
                    setShowAll(
                      (value) =>
                        !value
                    )
                  }
                >
                  {showAll
                    ? "Show Less"
                    : `View More News · ${
                        filteredNews.length -
                        4
                      }`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <strong>
              No market news found
            </strong>

            Try another category
            or search keyword.
          </div>
        )}
      </div>
    </main>
  );
}