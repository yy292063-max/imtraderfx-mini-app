import { MarketItem } from "@/types/market";

const API_KEY = process.env.TWELVE_DATA_API_KEY;

type TwelveDataQuote = {
  symbol?: string;
  name?: string;
  close?: string;
  change?: string;
  percent_change?: string;
  status?: string;
  code?: number;
  message?: string;
};

type Category = "forex" | "metals" | "indices" | "crypto";

type MarketSymbol = {
  symbol: string;
  category: Category;
};

const SYMBOLS: MarketSymbol[] = [
  {
    symbol: "EUR/USD",
    category: "forex",
  },
  {
    symbol: "GBP/USD",
    category: "forex",
  },
  {
    symbol: "USD/JPY",
    category: "forex",
  },
  {
    symbol: "AUD/USD",
    category: "forex",
  },
  {
    symbol: "XAU/USD",
    category: "metals",
  },
  {
    symbol: "XAG/USD",
    category: "metals",
  },
  {
    symbol: "SPX",
    category: "indices",
  },
  {
    symbol: "NDX",
    category: "indices",
  },
  {
    symbol: "BTC/USD",
    category: "crypto",
  },
  {
    symbol: "ETH/USD",
    category: "crypto",
  },
];

/*
 * ============================================================
 * CACHE
 * ============================================================
 */

const CACHE_DURATION = 30 * 1000;

let marketCache: {
  data: MarketItem[];
  timestamp: number;
} | null = null;

let activeRequest: Promise<MarketItem[]> | null = null;

/*
 * ============================================================
 * TEST ONE SYMBOL
 * ============================================================
 */

async function fetchQuote(
  item: MarketSymbol
): Promise<MarketItem | null> {
  const { symbol, category } = item;

  try {
    const url =
      "https://api.twelvedata.com/quote?" +
      `symbol=${encodeURIComponent(symbol)}` +
      `&apikey=${API_KEY}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    /*
     * ========================================================
     * IMPORTANT DEBUG
     * ========================================================
     */

    const rawText = await response.text();

    let data: TwelveDataQuote;

    try {
      data = JSON.parse(rawText);
    } catch {
      console.error(
        `Twelve Data returned invalid JSON for ${symbol}:`,
        rawText
      );

      return null;
    }

    /*
     * 显示 HTTP 错误
     */

    if (!response.ok) {
      console.error(
        `Twelve Data HTTP ERROR for ${symbol}:`,
        {
          status: response.status,
          data,
        }
      );

      return null;
    }

    /*
     * ========================================================
     * 显示 API 本身返回的错误
     * ========================================================
     */

    if (
      data.status === "error" ||
      !data.close
    ) {
      console.error(
        `Twelve Data API ERROR for ${symbol}:`,
        {
          status: data.status,
          code: data.code,
          message: data.message,
          response: data,
        }
      );

      return null;
    }

    const price = Number(data.close);
    const change = Number(data.change);
    const percentChange = Number(
      data.percent_change
    );

    if (!Number.isFinite(price)) {
      console.error(
        `Invalid price returned for ${symbol}:`,
        data
      );

      return null;
    }

    console.log(
      `Twelve Data SUCCESS: ${symbol} = ${price}`
    );

    return {
      symbol: data.symbol || symbol,
      name: data.name || symbol,
      price,
      change: Number.isFinite(change)
        ? change
        : 0,
      percent_change: Number.isFinite(
        percentChange
      )
        ? percentChange
        : 0,
      type: category,
    } as MarketItem;
  } catch (error) {
    console.error(
      `Twelve Data request exception for ${symbol}:`,
      error
    );

    return null;
  }
}

/*
 * ============================================================
 * FETCH MARKET DATA
 * ============================================================
 */

async function fetchFreshMarketData(): Promise<
  MarketItem[]
> {
  const results: MarketItem[] = [];

  /*
   * 先只测试 3 个。
   *
   * 目的不是最终版本。
   *
   * 先确认 Twelve Data API Key 和账户状态正常。
   */

  const testSymbols = SYMBOLS.slice(0, 3);

  for (const item of testSymbols) {
    const result = await fetchQuote(item);

    if (result) {
      results.push(result);
    }

    /*
     * 稍微间隔一下
     */

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );
  }

  return results;
}

/*
 * ============================================================
 * GET MARKET DATA
 * ============================================================
 */

export async function getMarketData(): Promise<
  MarketItem[]
> {
  /*
   * API KEY 检查
   */

  if (!API_KEY) {
    console.error(
      "Twelve Data API KEY is missing."
    );

    throw new Error(
      "TWELVE_DATA_API_KEY is not configured"
    );
  }

  /*
   * 注意：
   * 这里只打印是否存在。
   * 不打印真正的 API Key。
   */

  console.log(
    "Twelve Data API Key loaded:",
    API_KEY.length > 0
  );

  /*
   * CACHE
   */

  const now = Date.now();

  if (
    marketCache &&
    now - marketCache.timestamp <
      CACHE_DURATION
  ) {
    console.log(
      "Returning market data from cache."
    );

    return marketCache.data;
  }

  /*
   * 防止重复请求
   */

  if (activeRequest) {
    console.log(
      "Waiting for existing market request..."
    );

    return activeRequest;
  }

  /*
   * 开始请求
   */

  activeRequest =
    fetchFreshMarketData();

  try {
    const data = await activeRequest;

    marketCache = {
      data,
      timestamp: Date.now(),
    };

    console.log(
      `Market data loaded: ${data.length} symbols`
    );

    return data;
  } finally {
    activeRequest = null;
  }
}