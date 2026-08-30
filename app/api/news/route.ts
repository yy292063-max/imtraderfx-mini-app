import { NextResponse } from "next/server";

type GNewsArticle = {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  lang?: string;
  source?: {
    id?: string;
    name?: string;
    url?: string;
    country?: string;
  };
};

type GNewsResponse = {
  totalArticles?: number;
  articles?: GNewsArticle[];
  information?: {
    realTimeArticles?: {
      message?: string;
    };
  };
};

type NewsCategory =
  | "Markets"
  | "Forex"
  | "Commodities"
  | "Crypto";

function detectCategory(
  article: GNewsArticle
): NewsCategory {
  const text = `
    ${article.title ?? ""}
    ${article.description ?? ""}
  `.toLowerCase();

  // Crypto
  if (
    /bitcoin|btc|ethereum|eth|crypto|cryptocurrency|blockchain|digital asset|solana|xrp/.test(
      text
    )
  ) {
    return "Crypto";
  }

  // Commodities
  if (
    /gold|xau|silver|oil|crude|wti|brent|commodity|commodities|copper|natural gas|energy/.test(
      text
    )
  ) {
    return "Commodities";
  }

  // Forex
  if (
    /forex|foreign exchange|currency|usd|eur|gbp|jpy|aud|cad|chf|nzd|dollar|euro|pound|yen|fx /.test(
      text
    )
  ) {
    return "Forex";
  }

  // 默认 Markets
  return "Markets";
}

function detectBias(
  article: GNewsArticle
): "Bullish" | "Bearish" | "Neutral" {
  const text = `
    ${article.title ?? ""}
    ${article.description ?? ""}
  `.toLowerCase();

  const bullishWords = [
    "rise",
    "rises",
    "rising",
    "gain",
    "gains",
    "surge",
    "surges",
    "higher",
    "boost",
    "boosted",
    "strong",
    "strength",
    "support",
    "bullish",
    "positive",
    "increase",
    "increased",
    "inflows",
    "rebound",
    "recovery",
  ];

  const bearishWords = [
    "fall",
    "falls",
    "falling",
    "drop",
    "drops",
    "lower",
    "decline",
    "declines",
    "weak",
    "weakness",
    "bearish",
    "negative",
    "outflow",
    "selloff",
    "selling",
    "loss",
    "losses",
    "risk",
    "uncertainty",
  ];

  const bullishScore = bullishWords.filter(
    (word) => text.includes(word)
  ).length;

  const bearishScore = bearishWords.filter(
    (word) => text.includes(word)
  ).length;

  if (bullishScore > bearishScore) {
    return "Bullish";
  }

  if (bearishScore > bullishScore) {
    return "Bearish";
  }

  return "Neutral";
}

function detectImpact(
  article: GNewsArticle
): "High" | "Medium" | "Low" {
  const text = `
    ${article.title ?? ""}
    ${article.description ?? ""}
  `.toLowerCase();

  const highImpactWords = [
    "federal reserve",
    "fed",
    "ecb",
    "bank of england",
    "boe",
    "bank of japan",
    "boj",
    "interest rate",
    "rate decision",
    "inflation",
    "cpi",
    "employment",
    "jobs",
    "nonfarm payroll",
    "nfp",
    "central bank",
    "monetary policy",
    "war",
    "sanctions",
    "tariff",
    "geopolitical",
    "oil",
    "gold",
    "bitcoin",
  ];

  const mediumImpactWords = [
    "forex",
    "currency",
    "stocks",
    "equity",
    "market",
    "trading",
    "investors",
    "earnings",
    "economic data",
    "dollar",
    "euro",
  ];

  if (
    highImpactWords.some((word) =>
      text.includes(word)
    )
  ) {
    return "High";
  }

  if (
    mediumImpactWords.some((word) =>
      text.includes(word)
    )
  ) {
    return "Medium";
  }

  return "Low";
}

function formatTime(
  publishedAt?: string
): string {
  if (!publishedAt) {
    return "Recently";
  }

  const published = new Date(
    publishedAt
  ).getTime();

  if (Number.isNaN(published)) {
    return "Recently";
  }

  const now = Date.now();

  const diff = Math.max(
    0,
    now - published
  );

  const minutes = Math.floor(
    diff / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "1 day ago";
  }

  return `${days} days ago`;
}

function getSourceShort(
  sourceName: string
): string {
  const cleaned = sourceName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();

  if (!cleaned) {
    return "NEWS";
  }

  const words = cleaned
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  return cleaned
    .slice(0, 3)
    .toUpperCase();
}

function getSymbol(
  category: NewsCategory,
  article: GNewsArticle
): string | undefined {
  const text = `
    ${article.title ?? ""}
    ${article.description ?? ""}
  `.toLowerCase();

  if (category === "Crypto") {
    if (text.includes("ethereum") || text.includes("eth")) {
      return "ETH/USD";
    }

    return "BTC/USD";
  }

  if (category === "Commodities") {
    if (
      text.includes("oil") ||
      text.includes("crude") ||
      text.includes("wti")
    ) {
      return "WTI";
    }

    if (text.includes("silver")) {
      return "XAG/USD";
    }

    return "XAU/USD";
  }

  if (category === "Forex") {
    if (
      text.includes("euro") ||
      text.includes("eur/usd")
    ) {
      return "EUR/USD";
    }

    if (
      text.includes("pound") ||
      text.includes("gbp")
    ) {
      return "GBP/USD";
    }

    if (
      text.includes("yen") ||
      text.includes("jpy")
    ) {
      return "USD/JPY";
    }

    if (
      text.includes("dollar") ||
      text.includes("usd")
    ) {
      return "DXY";
    }
  }

  if (category === "Markets") {
    if (
      text.includes("nasdaq") ||
      text.includes("technology stocks")
    ) {
      return "NASDAQ";
    }

    if (
      text.includes("s&p") ||
      text.includes("spx")
    ) {
      return "SPX";
    }
  }

  return undefined;
}

export async function GET() {
  try {
    const apiKey =
      process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          count: 0,
          data: [],
          error:
            "GNEWS_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * GNews 免费版：
     * real-timeArticles 不可用，
     * 但是普通 articles 可以正常返回。
     *
     * 因此这里不要使用 real-time endpoint。
     */

    const queries = [
      "forex OR currency OR dollar",
      "gold OR oil OR commodities",
      "stock market OR financial markets",
      "bitcoin OR cryptocurrency",
    ];

    const responses = await Promise.all(
      queries.map(async (query) => {
        const url =
          `https://gnews.io/api/v4/search` +
          `?q=${encodeURIComponent(query)}` +
          `&lang=en` +
          `&country=us` +
          `&max=10` +
          `&sortby=publishedAt` +
          `&apikey=${apiKey}`;

        const response = await fetch(
          url,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error(
            "GNews request failed:",
            response.status,
            await response.text()
          );

          return null;
        }

        return (await response.json()) as GNewsResponse;
      })
    );

    const allArticles: GNewsArticle[] =
      responses.flatMap((response) =>
        response?.articles ?? []
      );

    /*
     * 去重
     */
    const uniqueArticles =
      Array.from(
        new Map(
          allArticles
            .filter(
              (article) =>
                article.url &&
                article.title
            )
            .map((article) => [
              article.url,
              article,
            ])
        ).values()
      );

    /*
     * 按发布时间排序
     */
    uniqueArticles.sort((a, b) => {
      const timeA = new Date(
        a.publishedAt ?? 0
      ).getTime();

      const timeB = new Date(
        b.publishedAt ?? 0
      ).getTime();

      return timeB - timeA;
    });

    /*
     * 转换成你的 NewsItem 结构
     */
    const data = uniqueArticles
      .slice(0, 16)
      .map((article, index) => {
        const category =
          detectCategory(article);

        const source =
          article.source?.name ??
          "News";

        return {
          id:
            article.id ??
            `${index}-${Date.now()}`,

          category,

          source,

          sourceShort:
            getSourceShort(source),

          title:
            article.title ??
            "Market News",

          summary:
            article.description ??
            article.content ??
            "",

          time:
            formatTime(
              article.publishedAt
            ),

          impact:
            detectImpact(article),

          bias:
            detectBias(article),

          image:
            article.image ??
            "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",

          symbol:
            getSymbol(
              category,
              article
            ),

          /*
           * 最关键：
           * 这里直接保存 GNews 返回的真实新闻 URL
           *
           * 不再生成 Google News 搜索链接
           */
          url: article.url,

          publishedAt:
            article.publishedAt,

          sourceUrl:
            article.source?.url,

          googleQuery: "",
        };
      });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
      updatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "News API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        count: 0,
        data: [],
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
        updatedAt:
          new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}