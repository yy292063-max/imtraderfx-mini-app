"use client";

import { useEffect, useMemo, useState } from "react";

type MarketItem = {
  symbol: string;
  name?: string;
  price?: number;
  close?: number;
  change?: number;
  percent_change?: number;
  type?: string;
};

type Category =
  | "all"
  | "forex"
  | "metals"
  | "indices"
  | "crypto";

const categories: {
  key: Category;
  label: string;
  icon: string;
}[] = [
  { key: "all", label: "All Markets", icon: "◉" },
  { key: "forex", label: "Forex", icon: "◌" },
  { key: "metals", label: "Metals", icon: "◇" },
  { key: "indices", label: "Indices", icon: "▥" },
  { key: "crypto", label: "Crypto", icon: "₿" },
];

const DEFAULT_VISIBLE = 6;

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<Category>("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [showAll, setShowAll] = useState(false);

  async function loadMarketData(
    isManualRefresh = false
  ) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else if (marketData.length === 0) {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/market", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Unable to load market data"
        );
      }

      const data = Array.isArray(result.data)
        ? result.data
        : [];

      setMarketData(data);

      const updatedAt = result.updatedAt
        ? new Date(result.updatedAt)
        : new Date();

      setLastUpdated(
        updatedAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err) {
      console.error("Market data error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load market data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadMarketData();

    const interval = setInterval(() => {
      loadMarketData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    return marketData.filter((item) => {
      if (activeCategory === "all") {
        return true;
      }

      const symbol = (item.symbol || "").toUpperCase();
      const type = (item.type || "").toLowerCase();
      const name = (item.name || "").toLowerCase();

      if (activeCategory === "forex") {
        return (
          type.includes("forex") ||
          type.includes("currency") ||
          name.includes("dollar") ||
          name.includes("pound") ||
          name.includes("euro") ||
          name.includes("yen") ||
          name.includes("franc") ||
          name.includes("australian") ||
          name.includes("canadian") ||
          name.includes("new zealand") ||
          symbol.includes("/USD") ||
          symbol.includes("USD/") ||
          symbol.includes("EUR/") ||
          symbol.includes("GBP/") ||
          symbol.includes("AUD/") ||
          symbol.includes("NZD/") ||
          symbol.includes("USDJPY") ||
          symbol.includes("EURUSD") ||
          symbol.includes("GBPUSD")
        );
      }

      if (activeCategory === "metals") {
        return (
          type.includes("metal") ||
          symbol.includes("XAU") ||
          symbol.includes("XAG") ||
          symbol.includes("GOLD") ||
          symbol.includes("SILVER") ||
          name.includes("gold") ||
          name.includes("silver")
        );
      }

      if (activeCategory === "indices") {
        return (
          type.includes("index") ||
          type.includes("indices") ||
          name.includes("index") ||
          name.includes("nasdaq") ||
          name.includes("dow") ||
          name.includes("s&p") ||
          name.includes("nikkei") ||
          name.includes("dax")
        );
      }

      if (activeCategory === "crypto") {
        return (
          type.includes("crypto") ||
          type.includes("digital") ||
          symbol.includes("BTC") ||
          symbol.includes("ETH") ||
          symbol.includes("SOL") ||
          symbol.includes("XRP") ||
          symbol.includes("DOGE") ||
          symbol.includes("ADA") ||
          name.includes("bitcoin") ||
          name.includes("ethereum") ||
          name.includes("crypto")
        );
      }

      return true;
    });
  }, [marketData, activeCategory]);

  const visibleData = showAll
    ? filteredData
    : filteredData.slice(0, DEFAULT_VISIBLE);

  const hasMore =
    filteredData.length > DEFAULT_VISIBLE;

  const tickerData =
    marketData.length > 0
      ? [...marketData, ...marketData, ...marketData]
      : [];

  function handleCategoryChange(
    category: Category
  ) {
    setActiveCategory(category);
    setShowAll(false);
  }

  function formatPrice(value?: number) {
    if (value === undefined || value === null) {
      return "--";
    }

    if (value >= 1000) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (value >= 100) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 3,
      });
    }

    if (value >= 10) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
    }

    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    });
  }

  function formatChange(value?: number) {
    if (value === undefined || value === null) {
      return "--";
    }

    const sign = value > 0 ? "+" : "";

    return `${sign}${value.toFixed(5)}`;
  }

  function formatPercent(value?: number) {
    if (value === undefined || value === null) {
      return "--";
    }

    const sign = value > 0 ? "+" : "";

    return `${sign}${value.toFixed(2)}%`;
  }

  function getChangeClass(value?: number) {
    if (value === undefined || value === null) {
      return "neutral";
    }

    if (value > 0) {
      return "positive";
    }

    if (value < 0) {
      return "negative";
    }

    return "neutral";
  }

  function getMarketIcon(symbol?: string) {
    const value = (symbol || "").toUpperCase();

    if (
      value.includes("BTC") ||
      value.includes("ETH") ||
      value.includes("SOL") ||
      value.includes("XRP") ||
      value.includes("DOGE") ||
      value.includes("ADA")
    ) {
      return "₿";
    }

    if (
      value.includes("XAU") ||
      value.includes("GOLD")
    ) {
      return "Au";
    }

    if (
      value.includes("XAG") ||
      value.includes("SILVER")
    ) {
      return "Ag";
    }

    if (
      value.includes("USD") ||
      value.includes("EUR") ||
      value.includes("GBP") ||
      value.includes("JPY") ||
      value.includes("AUD") ||
      value.includes("NZD") ||
      value.includes("CAD") ||
      value.includes("CHF")
    ) {
      return "FX";
    }

    return "MK";
  }

  function getGoogleMarketUrl(symbol: string) {
    const cleanSymbol = symbol.trim();

    return `https://www.google.com/search?q=${encodeURIComponent(
      `${cleanSymbol} price`
    )}`;
  }

  function getSparklinePoints(index: number) {
    const patterns = [
      "0,30 12,27 24,31 36,20 48,23 60,15 72,18 84,8 96,12 108,4",
      "0,8 12,14 24,11 36,20 48,16 60,27 72,22 84,31 96,25 108,34",
      "0,24 12,18 24,21 36,13 48,18 60,9 72,12 84,7 96,11 108,5",
      "0,28 12,21 24,25 36,17 48,20 60,14 72,18 84,10 96,14 108,8",
    ];

    return patterns[index % patterns.length];
  }

  return (
    <main className="market-page">

      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>
      <div className="ambient ambient-three"></div>

      <div className="background-grid"></div>

      {/* NAVIGATION */}

      <nav className="top-nav">
        <div className="nav-inner">

          <a href="/" className="brand">

            <div className="brand-mark">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="brand-text">
              <strong>IMTRADER</strong>
              <span>FX</span>
            </div>

          </a>

          <div className="nav-links">

            <a
              href="/"
              className="nav-link"
            >
              Home
            </a>

            <a
              href="/market"
              className="nav-link active"
            >
              Markets
            </a>

            <a
              href="/signals"
              className="nav-link"
            >
              Signals
            </a>

            <a
              href="/news"
              className="nav-link"
            >
              News
            </a>

          </div>

          <div className="nav-right">

            <div className="nav-live">
              <span></span>
              LIVE
            </div>

            <button
              className="nav-refresh"
              onClick={() =>
                loadMarketData(true)
              }
              disabled={
                loading || refreshing
              }
            >

              <span
                className={
                  loading || refreshing
                    ? "nav-refresh-icon spinning"
                    : "nav-refresh-icon"
                }
              >
                ↻
              </span>

              {refreshing
                ? "Syncing"
                : "Refresh"}

            </button>

          </div>

        </div>
      </nav>

      {/* TICKER */}

      <div className="ticker-wrapper">

        <div className="ticker-label">
          <span className="ticker-live-dot"></span>
          LIVE
        </div>

        <div className="ticker-window">

          <div className="ticker-track">

            {tickerData.length > 0 ? (
              tickerData.map(
                (item, index) => {

                  const changeClass =
                    getChangeClass(
                      item.percent_change ??
                        item.change
                    );

                  return (
                    <div
                      className="ticker-item"
                      key={`${item.symbol}-${index}`}
                    >

                      <span className="ticker-symbol">
                        {item.symbol}
                      </span>

                      <span className="ticker-price">
                        {formatPrice(
                          item.price ??
                            item.close
                        )}
                      </span>

                      <span
                        className={`ticker-change ${changeClass}`}
                      >
                        {formatPercent(
                          item.percent_change
                        )}
                      </span>

                    </div>
                  );
                }
              )
            ) : (
              <div className="ticker-loading">
                Connecting to global markets...
              </div>
            )}

          </div>

        </div>

      </div>

      {/* HERO */}

      <section className="market-hero">

        <div className="hero-inner">

          <div className="hero-copy">

            <div className="hero-eyebrow">

              <span className="eyebrow-dot"></span>

              <span>
                LIVE MARKET
              </span>

              <span className="eyebrow-divider"></span>

              <span className="eyebrow-muted">
                REAL-TIME MARKET INTELLIGENCE
              </span>

            </div>

            <h1>
              Global
              <span> Markets</span>
            </h1>

            <p>
              Track global financial markets
              with real-time pricing, market
              movement and live trading
              intelligence.
            </p>

            <div className="hero-actions">

              <a
                href="#market-overview"
                className="hero-primary"
              >
                Explore Markets
                <span>↓</span>
              </a>

              <div className="hero-status">

                <span className="hero-status-dot"></span>

                <div>
                  <strong>
                    MARKETS ONLINE
                  </strong>

                  <small>
                    Data updates every 30 seconds
                  </small>
                </div>

              </div>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="hero-visual">

            <div className="visual-glow"></div>

            <div className="visual-card">

              <div className="visual-header">

                <div>

                  <span className="visual-label">
                    MARKET PULSE
                  </span>

                  <strong>
                    Global Liquidity
                  </strong>

                </div>

                <div className="visual-live">
                  <span></span>
                  LIVE
                </div>

              </div>

              <div className="visual-chart">

                <div className="chart-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <svg
                  viewBox="0 0 420 180"
                  preserveAspectRatio="none"
                  className="chart-svg"
                >

                  <defs>

                    <linearGradient
                      id="chartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopOpacity="0.35"
                      />

                      <stop
                        offset="100%"
                        stopOpacity="0"
                      />

                    </linearGradient>

                  </defs>

                  <path
                    d="M0 145 L30 132 L60 138 L90 110 L120 119 L150 83 L180 92 L210 62 L240 72 L270 48 L300 60 L330 28 L360 40 L390 15 L420 25 L420 180 L0 180 Z"
                    fill="url(#chartFill)"
                  />

                  <polyline
                    points="0,145 30,132 60,138 90,110 120,119 150,83 180,92 210,62 240,72 270,48 300,60 330,28 360,40 390,15 420,25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle
                    cx="390"
                    cy="15"
                    r="4"
                    fill="currentColor"
                  />

                </svg>

                <div className="chart-value">
                  +8.42%
                </div>

              </div>

              <div className="visual-bottom">

                <div>
                  <span>VOLUME</span>
                  <strong>84.6B</strong>
                </div>

                <div>
                  <span>VOLATILITY</span>
                  <strong>LOW</strong>
                </div>

                <div>
                  <span>STATUS</span>
                  <strong className="green">
                    ACTIVE
                  </strong>
                </div>

              </div>

            </div>

            <div className="floating-data floating-one">

              <span>
                EUR/USD
              </span>

              <strong>
                1.15819
              </strong>

              <small className="negative">
                -0.01%
              </small>

            </div>

            <div className="floating-data floating-two">

              <span>
                BTC/USD
              </span>

              <strong>
                77,674
              </strong>

              <small className="negative">
                -0.22%
              </small>

            </div>

          </div>

        </div>

      </section>

      {/* MARKET OVERVIEW */}

      <section
        className="market-container"
        id="market-overview"
      >

        <div className="section-heading">

          <div>

            <span className="section-kicker">
              MARKETS
            </span>

            <h2>
              Market Overview
            </h2>

            <p>
              Real-time pricing across major
              global financial instruments.
            </p>

          </div>

          <div className="connection-status">

            <span className="connection-pulse"></span>

            <div>

              <strong>
                LIVE CONNECTION
              </strong>

              <small>
                {lastUpdated
                  ? `Updated ${lastUpdated}`
                  : "Connecting..."}
              </small>

            </div>

          </div>

        </div>

        {/* CATEGORY */}

        <div className="category-bar">

          {categories.map((category) => {

            const isActive =
              activeCategory ===
              category.key;

            return (
              <button
                key={category.key}
                className={`category-button ${
                  isActive
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleCategoryChange(
                    category.key
                  )
                }
              >

                <span className="category-icon">
                  {category.icon}
                </span>

                <span>
                  {category.label}
                </span>

                {isActive && (
                  <span className="active-indicator"></span>
                )}

              </button>
            );
          })}

        </div>

        {/* SUMMARY */}

        <div className="market-summary">

          <div className="summary-left">

            <span>
              SHOWING
            </span>

            <strong>
              {visibleData.length}
            </strong>

            <span>
              OF
            </span>

            <strong>
              {filteredData.length}
            </strong>

            <span>
              INSTRUMENTS
            </span>

          </div>

          <div className="summary-right">

            <span className="summary-dot"></span>

            Market data live

          </div>

        </div>

        {/* CONTENT */}

        {loading &&
        marketData.length === 0 ? (

          <div className="loading-box">

            <div className="loading-visual">

              <div className="loading-ring"></div>

              <div className="loading-ring-two"></div>

              <div className="loading-core"></div>

            </div>

            <h3>
              Connecting to markets
            </h3>

            <p>
              Loading real-time market
              intelligence...
            </p>

          </div>

        ) : error ? (

          <div className="error-box">

            <div className="error-icon">
              !
            </div>

            <h3>
              Unable to load market data
            </h3>

            <p>
              {error}
            </p>

            <button
              className="retry-button"
              onClick={() =>
                loadMarketData(true)
              }
            >
              Try Again
            </button>

          </div>

        ) : filteredData.length ===
          0 ? (

          <div className="empty-box">

            <div className="empty-icon">
              ◌
            </div>

            <h3>
              No market data
            </h3>

            <p>
              There are currently no
              instruments available in
              this category.
            </p>

          </div>

        ) : (

          <div className="market-card">

            <div className="card-top-line"></div>

            {/* TABLE HEADER */}

            <div className="table-header">

              <div></div>

              <div>
                Instrument
              </div>

              <div>
                Market
              </div>

              <div>
                Price
              </div>

              <div>
                Change
              </div>

              <div>
                Change %
              </div>

              <div>
                Trend
              </div>

            </div>

            {/* TABLE BODY */}

            <div className="table-body">

              {visibleData.map(
                (item, index) => {

                  const changeClass =
                    getChangeClass(
                      item.percent_change ??
                        item.change
                    );

                  const price =
                    item.price ??
                    item.close;

                  return (
                    <div
                      className="market-row"
                      key={`${item.symbol}-${index}`}
                    >

                      {/* NUMBER */}

                      <div className="row-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      {/* SYMBOL */}

                      <div className="symbol-cell">

                        <a
                          href={getGoogleMarketUrl(
                            item.symbol
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="symbol-icon"
                          aria-label={`Search ${item.symbol} on Google`}
                          title={`View ${item.symbol} on Google`}
                        >
                          {getMarketIcon(
                            item.symbol
                          )}
                        </a>

                        <div className="symbol-content">

                          <div className="symbol-main">

                            <div className="symbol-name">
                              {item.symbol}
                            </div>

                            <span className="live-mini">
                              LIVE
                            </span>

                          </div>

                          <div className="symbol-type">
                            {item.type ||
                              "MARKET"}
                          </div>

                        </div>

                      </div>

                      {/* NAME */}

                      <div className="name-cell">

                        <span>
                          {item.name ||
                            item.symbol}
                        </span>

                      </div>

                      {/* PRICE */}

                      <div className="price-cell">
                        {formatPrice(price)}
                      </div>

                      {/* CHANGE */}

                      <div
                        className={`change-cell ${changeClass}`}
                      >

                        <span className="change-arrow">

                          {item.change !==
                            undefined &&
                          item.change !== null
                            ? item.change >
                              0
                              ? "↑"
                              : item.change <
                                0
                              ? "↓"
                              : "—"
                            : "—"}

                        </span>

                        {formatChange(
                          item.change
                        )}

                      </div>

                      {/* PERCENT */}

                      <div
                        className={`percent-cell ${changeClass}`}
                      >
                        {formatPercent(
                          item.percent_change
                        )}
                      </div>

                      {/* SPARKLINE */}

                      <div className="trend-cell">

                        <svg
                          viewBox="0 0 108 40"
                          preserveAspectRatio="none"
                        >

                          <polyline
                            points={getSparklinePoints(
                              index
                            )}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />

                        </svg>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* VIEW MORE */}

            {hasMore && (

              <div className="view-more-container">

                <button
                  className="view-more-button"
                  onClick={() =>
                    setShowAll(
                      (value) => !value
                    )
                  }
                >

                  <span>
                    {showAll
                      ? "Show Less"
                      : "View All Markets"}
                  </span>

                  <span
                    className={
                      showAll
                        ? "view-arrow rotated"
                        : "view-arrow"
                    }
                  >
                    ↓
                  </span>

                </button>

                {!showAll && (
                  <span className="remaining-count">
                    +
                    {filteredData.length -
                      DEFAULT_VISIBLE}{" "}
                    more instruments
                  </span>
                )}

              </div>

            )}

          </div>

        )}

        {/* BOTTOM CARDS */}

        {!loading &&
          !error &&
          marketData.length > 0 && (

            <div className="market-insight-grid">

              <div className="insight-card">

                <div className="insight-top">

                  <span className="insight-icon">
                    ◈
                  </span>

                  <span>
                    MARKET ACTIVITY
                  </span>

                </div>

                <strong>
                  Global Markets
                </strong>

                <p>
                  Monitoring major currency,
                  commodity and digital
                  markets.
                </p>

                <div className="insight-line">
                  <span></span>
                </div>

              </div>

              <div className="insight-card">

                <div className="insight-top">

                  <span className="insight-icon">
                    ◫
                  </span>

                  <span>
                    DATA STREAM
                  </span>

                </div>

                <strong>
                  Real-Time Quotes
                </strong>

                <p>
                  Market prices are automatically
                  refreshed every 30 seconds.
                </p>

                <div className="insight-line">
                  <span></span>
                </div>

              </div>

              <div className="insight-card">

                <div className="insight-top">

                  <span className="insight-icon">
                    ◎
                  </span>

                  <span>
                    SYSTEM STATUS
                  </span>

                </div>

                <strong className="green-text">
                  Operational
                </strong>

                <p>
                  Live market connection is
                  currently active.
                </p>

                <div className="status-bar">

                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            </div>

          )}

        {/* FOOTER */}

        <div className="market-footer">

          <div className="update-status">

            <span className="status-dot"></span>

            <span>
              {lastUpdated
                ? `Last updated ${lastUpdated}`
                : "Waiting for market data"}
            </span>

          </div>

          <div className="auto-refresh">

            <span>
              AUTO REFRESH
            </span>

            <strong>
              30s
            </strong>

            <span className="refresh-small">
              ↻
            </span>

          </div>

        </div>

      </section>

      {/* CSS */}

      <style jsx>{`

        .market-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 15% 8%,
              rgba(37, 99, 235, 0.15),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 28%,
              rgba(14, 165, 233, 0.08),
              transparent 27%
            ),
            #020711;
          color: #ffffff;
          padding-bottom: 90px;
        }

        .background-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.055;
          background-image:
            linear-gradient(
              rgba(96,165,250,0.35) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(96,165,250,0.35) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 75%
            );
        }

        .ambient {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(100px);
        }

        .ambient-one {
          width: 360px;
          height: 360px;
          top: 180px;
          left: -220px;
          background: rgba(37,99,235,0.13);
        }

        .ambient-two {
          width: 420px;
          height: 420px;
          top: 650px;
          right: -260px;
          background: rgba(14,165,233,0.08);
        }

        .ambient-three {
          width: 260px;
          height: 260px;
          top: 1050px;
          left: 35%;
          background: rgba(59,130,246,0.055);
        }

        .top-nav {
          position: relative;
          z-index: 20;
          border-bottom:
            1px solid
            rgba(255,255,255,0.06);
          background:
            rgba(2,7,17,0.82);
          backdrop-filter: blur(18px);
        }

        .nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          min-height: 70px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #ffffff;
          text-decoration: none;
        }

        .brand-mark {
          position: relative;
          width: 27px;
          height: 27px;
          display: flex;
          align-items: flex-end;
          gap: 3px;
        }

        .brand-mark span {
          width: 5px;
          border-radius: 2px;
          background: #3b82f6;
          box-shadow:
            0 0 14px
            rgba(59,130,246,0.5);
        }

        .brand-mark span:nth-child(1) {
          height: 11px;
        }

        .brand-mark span:nth-child(2) {
          height: 19px;
        }

        .brand-mark span:nth-child(3) {
          height: 26px;
        }

        .brand-text {
          display: flex;
          align-items: baseline;
          gap: 3px;
          letter-spacing: 1px;
          font-size: 14px;
        }

        .brand-text strong {
          font-weight: 850;
        }

        .brand-text span {
          color: #60a5fa;
          font-weight: 850;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .nav-link {
          position: relative;
          padding: 25px 15px;
          color: #68778d;
          text-decoration: none;
          font-size: 12px;
          font-weight: 650;
          transition: all .2s ease;
        }

        .nav-link:hover {
          color: #dbeafe;
        }

        .nav-link.active {
          color: #ffffff;
        }

        .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 22px;
          height: 2px;
          transform: translateX(-50%);
          border-radius: 10px;
          background: #3b82f6;
          box-shadow:
            0 0 12px
            rgba(59,130,246,.75);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .nav-live {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #5e7088;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .nav-live span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 9px
            rgba(34,197,94,.8);
        }

        .nav-refresh {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border:
            1px solid
            rgba(96,165,250,.18);
          border-radius: 7px;
          background:
            rgba(37,99,235,.06);
          color: #8fb8ec;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .nav-refresh:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .nav-refresh-icon {
          font-size: 15px;
        }

        .spinning {
          animation:
            spin 1s linear infinite;
        }

        .ticker-wrapper {
          position: relative;
          z-index: 10;
          height: 39px;
          display: flex;
          align-items: center;
          border-bottom:
            1px solid
            rgba(255,255,255,.045);
          background:
            rgba(5,12,23,.82);
        }

        .ticker-label {
          z-index: 2;
          height: 100%;
          padding: 0 17px 0 24px;
          display: flex;
          align-items: center;
          gap: 7px;
          background:
            linear-gradient(
              90deg,
              #050c17 82%,
              transparent
            );
          color: #5f7188;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.4px;
        }

        .ticker-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 8px
            rgba(34,197,94,.8);
        }

        .ticker-window {
          flex: 1;
          overflow: hidden;
        }

        .ticker-track {
          width: max-content;
          display: flex;
          align-items: center;
          animation:
            tickerMove 38s linear infinite;
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 185px;
          padding: 0 22px;
          border-right:
            1px solid
            rgba(255,255,255,.04);
        }

        .ticker-symbol {
          color: #aebbd0;
          font-size: 9px;
          font-weight: 800;
        }

        .ticker-price {
          color: #64748b;
          font-size: 9px;
          font-variant-numeric: tabular-nums;
        }

        .ticker-change {
          font-size: 8px;
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }

        .ticker-loading {
          color: #536176;
          padding-left: 30px;
          font-size: 9px;
        }

        .market-hero {
          position: relative;
          overflow: hidden;
          border-bottom:
            1px solid
            rgba(255,255,255,.055);
          background:
            linear-gradient(
              180deg,
              rgba(6,15,28,.72),
              rgba(2,7,17,.2)
            );
        }

        .hero-inner {
          max-width: 1400px;
          min-height: 505px;
          margin: 0 auto;
          padding: 65px 24px 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 70px;
        }

        .hero-copy {
          position: relative;
          z-index: 2;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          color: #60a5fa;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 2px;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 12px
            rgba(34,197,94,.8);
        }

        .eyebrow-divider {
          width: 30px;
          height: 1px;
          background:
            rgba(96,165,250,.35);
        }

        .eyebrow-muted {
          color: #3f5067;
          font-size: 8px;
          letter-spacing: 1.2px;
        }

        .hero-copy h1 {
          margin: 0;
          font-size:
            clamp(55px, 6vw, 82px);
          line-height: .95;
          font-weight: 850;
          letter-spacing: -4px;
        }

        .hero-copy h1 span {
          color: #4d9aff;
          text-shadow:
            0 0 50px
            rgba(37,99,235,.27);
        }

        .hero-copy p {
          max-width: 600px;
          margin: 24px 0 0;
          color: #718096;
          font-size: 14px;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-top: 31px;
        }

        .hero-primary {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 12px 17px 12px 19px;
          border:
            1px solid
            rgba(59,130,246,.32);
          border-radius: 8px;
          background:
            linear-gradient(
              135deg,
              rgba(37,99,235,.18),
              rgba(37,99,235,.06)
            );
          color: #c8ddfb;
          text-decoration: none;
          font-size: 11px;
          font-weight: 750;
          transition: all .25s ease;
        }

        .hero-primary:hover {
          transform: translateY(-2px);
          border-color:
            rgba(96,165,250,.55);
          box-shadow:
            0 12px 35px
            rgba(37,99,235,.13);
        }

        .hero-primary span {
          color: #60a5fa;
          font-size: 15px;
        }

        .hero-status {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .hero-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 12px
            rgba(34,197,94,.7);
        }

        .hero-status strong {
          display: block;
          color: #718096;
          font-size: 8px;
          letter-spacing: 1.2px;
        }

        .hero-status small {
          display: block;
          margin-top: 4px;
          color: #364559;
          font-size: 8px;
        }

        .hero-visual {
          position: relative;
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-glow {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(37,99,235,.2),
              transparent 65%
            );
          filter: blur(25px);
        }

        .visual-card {
          position: relative;
          z-index: 2;
          width: min(100%, 500px);
          padding: 23px;
          border:
            1px solid
            rgba(96,165,250,.16);
          border-radius: 17px;
          background:
            linear-gradient(
              145deg,
              rgba(10,24,43,.88),
              rgba(4,11,21,.92)
            );
          box-shadow:
            0 35px 80px
            rgba(0,0,0,.38),
            inset 0 1px 0
            rgba(255,255,255,.045);
          transform:
            perspective(1000px)
            rotateY(-4deg)
            rotateX(2deg);
        }

        .visual-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .visual-label {
          display: block;
          color: #4c6280;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .visual-header strong {
          display: block;
          margin-top: 5px;
          color: #dbeafe;
          font-size: 15px;
        }

        .visual-live {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border:
            1px solid
            rgba(34,197,94,.13);
          border-radius: 5px;
          color: #4ade80;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .visual-live span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 8px
            rgba(34,197,94,.8);
        }

        .visual-chart {
          position: relative;
          height: 180px;
          margin-top: 20px;
          overflow: hidden;
          border-top:
            1px solid
            rgba(255,255,255,.04);
          border-bottom:
            1px solid
            rgba(255,255,255,.04);
        }

        .chart-lines {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }

        .chart-lines span {
          width: 100%;
          height: 1px;
          background:
            rgba(255,255,255,.035);
        }

        .chart-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          color: #4d9aff;
          filter:
            drop-shadow(
              0 0 8px
              rgba(59,130,246,.45)
            );
        }

        .chart-value {
          position: absolute;
          top: 15px;
          right: 14px;
          color: #4ade80;
          font-size: 11px;
          font-weight: 800;
        }

        .visual-bottom {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 15px;
          margin-top: 19px;
        }

        .visual-bottom span {
          display: block;
          color: #3f5067;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .visual-bottom strong {
          display: block;
          margin-top: 5px;
          color: #b6c5d8;
          font-size: 11px;
        }

        .green {
          color: #4ade80 !important;
        }

        .floating-data {
          position: absolute;
          z-index: 4;
          min-width: 125px;
          padding: 11px 13px;
          border:
            1px solid
            rgba(96,165,250,.13);
          border-radius: 8px;
          background:
            rgba(4,11,21,.85);
          backdrop-filter: blur(14px);
          box-shadow:
            0 20px 40px
            rgba(0,0,0,.3);
        }

        .floating-data span {
          display: block;
          color: #536176;
          font-size: 7px;
          letter-spacing: 1px;
        }

        .floating-data strong {
          display: block;
          margin-top: 4px;
          color: #dbeafe;
          font-size: 12px;
        }

        .floating-data small {
          display: block;
          margin-top: 2px;
          font-size: 8px;
          font-weight: 700;
        }

        .floating-one {
          top: 25px;
          left: -12px;
          animation:
            floatOne 5s ease-in-out infinite;
        }

        .floating-two {
          right: -10px;
          bottom: 22px;
          animation:
            floatTwo 5.5s ease-in-out infinite;
        }

        .market-container {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          padding: 65px 24px 0;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 25px;
        }

        .section-kicker {
          display: block;
          margin-bottom: 7px;
          color: #3b82f6;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 2px;
        }

        .section-heading h2 {
          margin: 0;
          color: #e2e8f0;
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -.7px;
        }

        .section-heading p {
          margin: 7px 0 0;
          color: #526176;
          font-size: 11px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 9px;
          padding-bottom: 2px;
        }

        .connection-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 11px
            rgba(34,197,94,.7);
        }

        .connection-status strong {
          display: block;
          color: #536176;
          font-size: 8px;
          letter-spacing: 1.2px;
        }

        .connection-status small {
          display: block;
          margin-top: 3px;
          color: #334155;
          font-size: 8px;
        }

        .category-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .category-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 43px;
          padding: 0 16px;
          border:
            1px solid
            rgba(255,255,255,.065);
          border-radius: 8px;
          background:
            rgba(255,255,255,.018);
          color: #6f7e93;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all .25s ease;
        }

        .category-button:hover {
          color: #dbeafe;
          border-color:
            rgba(96,165,250,.2);
          background:
            rgba(255,255,255,.04);
        }

        .category-button.active {
          color: #ffffff;
          border-color:
            rgba(59,130,246,.38);
          background:
            linear-gradient(
              135deg,
              rgba(37,99,235,.18),
              rgba(30,64,175,.06)
            );
          box-shadow:
            0 10px 30px
            rgba(37,99,235,.08);
        }

        .category-icon {
          color: #51647d;
          font-size: 13px;
        }

        .category-button.active
          .category-icon {
          color: #60a5fa;
        }

        .active-indicator {
          position: absolute;
          left: 50%;
          bottom: -1px;
          width: 18px;
          height: 2px;
          transform: translateX(-50%);
          border-radius: 10px;
          background: #3b82f6;
          box-shadow:
            0 0 10px
            rgba(59,130,246,.8);
        }

        .market-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 19px 3px 12px;
          color: #4a596e;
          font-size: 8px;
          letter-spacing: 1px;
        }

        .summary-left {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .summary-left strong {
          color: #8998ad;
          font-size: 10px;
        }

        .summary-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .summary-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 7px
            rgba(34,197,94,.65);
        }

        .market-card {
          position: relative;
          overflow: hidden;
          border:
            1px solid
            rgba(255,255,255,.07);
          border-radius: 15px;
          background:
            linear-gradient(
              180deg,
              rgba(9,19,33,.95),
              rgba(4,11,21,.96)
            );
          box-shadow:
            0 35px 90px
            rgba(0,0,0,.3),
            inset 0 1px 0
            rgba(255,255,255,.025);
        }

        .card-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(59,130,246,.6),
              transparent
            );
        }

        .table-header,
        .market-row {
          display: grid;
          grid-template-columns:
            38px
            minmax(190px,1.25fr)
            minmax(210px,1.7fr)
            minmax(140px,1fr)
            minmax(140px,1fr)
            minmax(115px,.8fr)
            minmax(140px,1fr);
          align-items: center;
        }

        .table-header {
          min-height: 50px;
          padding: 0 22px;
          color: #46556b;
          background:
            rgba(255,255,255,.017);
          border-bottom:
            1px solid
            rgba(255,255,255,.055);
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .market-row {
          position: relative;
          min-height: 79px;
          padding: 0 22px;
          border-bottom:
            1px solid
            rgba(255,255,255,.042);
          transition:
            background .25s ease;
        }

        .market-row:last-child {
          border-bottom: none;
        }

        .market-row:hover {
          background:
            linear-gradient(
              90deg,
              rgba(37,99,235,.055),
              rgba(255,255,255,.012),
              rgba(37,99,235,.025)
            );
        }

        .row-number {
          color: #263448;
          font-size: 8px;
          font-weight: 800;
        }

        .symbol-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .symbol-icon {
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border:
            1px solid
            rgba(96,165,250,.15);
          border-radius: 8px;
          background:
            linear-gradient(
              135deg,
              rgba(37,99,235,.14),
              rgba(15,23,42,.65)
            );
          color: #60a5fa;
          font-size: 9px;
          font-weight: 850;
          text-decoration: none;
          cursor: pointer;
          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.04);
          transition:
            transform .2s ease,
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .symbol-icon:hover {
          transform: translateY(-2px);
          border-color:
            rgba(96,165,250,.55);
          box-shadow:
            0 0 18px
            rgba(37,99,235,.18),
            inset 0 1px 0
            rgba(255,255,255,.06);
        }

        .symbol-content {
          min-width: 0;
        }

        .symbol-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .symbol-name {
          overflow: hidden;
          color: #edf4fc;
          font-size: 13px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .live-mini {
          display: inline-flex;
          align-items: center;
          padding: 2px 5px;
          border:
            1px solid
            rgba(34,197,94,.12);
          border-radius: 3px;
          background:
            rgba(34,197,94,.05);
          color: #4ade80;
          font-size: 6px;
          font-weight: 850;
          letter-spacing: .8px;
        }

        .symbol-type {
          margin-top: 4px;
          color: #47576d;
          font-size: 7px;
          font-weight: 750;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .name-cell {
          overflow: hidden;
          padding-right: 25px;
          color: #687890;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .price-cell {
          color: #dce6f2;
          font-size: 13px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .change-cell,
        .percent-cell {
          font-size: 10px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .change-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .change-arrow {
          font-size: 10px;
        }

        .positive {
          color: #22c55e;
          text-shadow:
            0 0 18px
            rgba(34,197,94,.12);
        }

        .negative {
          color: #f05252;
          text-shadow:
            0 0 18px
            rgba(239,68,68,.1);
        }

        .neutral {
          color: #8492a7;
        }

        .trend-cell {
          width: 100px;
          height: 35px;
          color: #3b82f6;
          opacity: .8;
        }

        .trend-cell svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .view-more-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          padding: 20px;
          border-top:
            1px solid
            rgba(255,255,255,.04);
          background:
            rgba(255,255,255,.012);
        }

        .view-more-button {
          display: flex;
          align-items: center;
          gap: 10px;
          border: none;
          background: transparent;
          color: #76a6e8;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .view-more-button:hover {
          color: #c4ddff;
        }

        .view-arrow {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border:
            1px solid
            rgba(96,165,250,.22);
          border-radius: 50%;
          transition: transform .25s ease;
        }

        .view-arrow.rotated {
          transform: rotate(180deg);
        }

        .remaining-count {
          color: #3c4a5f;
          font-size: 8px;
        }

        .market-insight-grid {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 12px;
          margin-top: 13px;
        }

        .insight-card {
          position: relative;
          overflow: hidden;
          min-height: 155px;
          padding: 20px;
          border:
            1px solid
            rgba(255,255,255,.055);
          border-radius: 12px;
          background:
            linear-gradient(
              145deg,
              rgba(9,19,33,.7),
              rgba(4,11,21,.75)
            );
        }

        .insight-top {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #48586e;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.4px;
        }

        .insight-icon {
          color: #4c8fe8;
          font-size: 12px;
        }

        .insight-card strong {
          display: block;
          margin-top: 17px;
          color: #d5e0ee;
          font-size: 14px;
        }

        .insight-card p {
          max-width: 300px;
          margin: 7px 0 0;
          color: #4f5f74;
          font-size: 9px;
          line-height: 1.6;
        }

        .green-text {
          color: #4ade80 !important;
        }

        .insight-line {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 18px;
          height: 1px;
          background:
            rgba(255,255,255,.04);
        }

        .insight-line span {
          display: block;
          width: 38%;
          height: 1px;
          background: #3b82f6;
          box-shadow:
            0 0 10px
            rgba(59,130,246,.65);
        }

        .status-bar {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 18px;
          display: flex;
          gap: 4px;
        }

        .status-bar span {
          flex: 1;
          height: 2px;
          border-radius: 3px;
          background: #22c55e;
          opacity: .55;
        }

        .loading-box,
        .error-box,
        .empty-box {
          min-height: 390px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
          border:
            1px solid
            rgba(255,255,255,.065);
          border-radius: 14px;
          background:
            rgba(7,15,27,.75);
        }

        .loading-visual {
          position: relative;
          width: 65px;
          height: 65px;
          margin-bottom: 23px;
        }

        .loading-ring,
        .loading-ring-two {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border:
            1px solid
            rgba(96,165,250,.1);
        }

        .loading-ring {
          border-top-color: #60a5fa;
          animation:
            spin 1s linear infinite;
        }

        .loading-ring-two {
          inset: 9px;
          border-right-color:
            rgba(59,130,246,.5);
          animation:
            spinReverse 1.4s linear infinite;
        }

        .loading-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 7px;
          height: 7px;
          transform:
            translate(-50%,-50%);
          border-radius: 50%;
          background: #3b82f6;
          box-shadow:
            0 0 18px
            rgba(59,130,246,.8);
        }

        .loading-box h3,
        .error-box h3,
        .empty-box h3 {
          margin: 0;
          color: #dce6f2;
          font-size: 16px;
        }

        .loading-box p,
        .error-box p,
        .empty-box p {
          margin: 9px 0 0;
          color: #536176;
          font-size: 10px;
        }

        .error-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 17px;
          border:
            1px solid
            rgba(239,68,68,.18);
          border-radius: 50%;
          background:
            rgba(239,68,68,.07);
          color: #ef4444;
          font-size: 19px;
          font-weight: 850;
        }

        .retry-button {
          margin-top: 19px;
          padding: 9px 17px;
          border:
            1px solid
            rgba(96,165,250,.24);
          border-radius: 7px;
          background:
            rgba(37,99,235,.1);
          color: #a9c8f3;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }

        .empty-icon {
          width: 47px;
          height: 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          border:
            1px solid
            rgba(96,165,250,.1);
          border-radius: 50%;
          color: #56677e;
          font-size: 25px;
        }

        .market-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 15px;
          color: #344257;
          font-size: 8px;
          letter-spacing: .5px;
        }

        .update-status,
        .auto-refresh {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 7px
            rgba(34,197,94,.65);
        }

        .auto-refresh strong {
          color: #5d6d82;
        }

        .refresh-small {
          color: #526176;
          font-size: 13px;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes tickerMove {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-33.333%);
          }
        }

        @keyframes floatOne {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes floatTwo {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(8px);
          }
        }

        @media (max-width: 1100px) {

          .hero-inner {
            gap: 35px;
          }

          .hero-copy h1 {
            font-size: 65px;
          }

          .table-header,
          .market-row {
            grid-template-columns:
              30px
              minmax(160px,1.2fr)
              minmax(160px,1.4fr)
              minmax(120px,1fr)
              minmax(110px,1fr)
              minmax(100px,.8fr)
              minmax(100px,.8fr);
          }

          .trend-cell {
            width: 75px;
          }
        }

        @media (max-width: 760px) {

          .nav-inner {
            min-height: 62px;
            padding: 0 16px;
          }

          .nav-links {
            display: none;
          }

          .nav-live {
            display: none;
          }

          .nav-refresh {
            padding: 7px 10px;
          }

          .ticker-label {
            padding-left: 16px;
          }

          .ticker-item {
            min-width: 165px;
            padding: 0 16px;
          }

          .hero-inner {
            min-height: auto;
            grid-template-columns: 1fr;
            padding:
              48px 18px
              42px;
            gap: 35px;
          }

          .hero-copy h1 {
            font-size: 53px;
            letter-spacing: -3px;
          }

          .hero-copy p {
            font-size: 12px;
          }

          .hero-actions {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .hero-visual {
            min-height: 280px;
          }

          .visual-card {
            width: 94%;
            transform: none;
          }

          .floating-one {
            left: -4px;
            top: 4px;
          }

          .floating-two {
            right: -4px;
            bottom: 4px;
          }

          .market-container {
            padding:
              45px 14px 0;
          }

          .section-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .connection-status {
            display: none;
          }

          .category-bar {
            display: grid;
            grid-template-columns:
              repeat(2,1fr);
            gap: 7px;
          }

          .category-button {
            width: 100%;
            justify-content: center;
          }

          .category-button:first-child {
            grid-column: span 2;
          }

          .market-summary {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }

          .summary-right {
            display: none;
          }

          .table-header {
            display: none;
          }

          .market-row {
            grid-template-columns:
              28px
              1fr
              1fr;
            gap: 8px 9px;
            min-height: auto;
            padding: 17px 13px;
          }

          .row-number {
            align-self: start;
            padding-top: 8px;
          }

          .symbol-cell {
            grid-column: 2 / 4;
          }

          .name-cell {
            grid-column: 2 / 4;
            padding-right: 0;
            font-size: 9px;
          }

          .price-cell {
            grid-column: 2 / 3;
            font-size: 13px;
          }

          .change-cell {
            grid-column: 3 / 4;
            justify-content: flex-end;
          }

          .percent-cell {
            display: none;
          }

          .trend-cell {
            display: none;
          }

          .market-insight-grid {
            grid-template-columns: 1fr;
          }

          .market-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
          }

          .auto-refresh {
            display: none;
          }
        }

        @media (max-width: 430px) {

          .brand-text {
            font-size: 12px;
          }

          .ticker-wrapper {
            height: 36px;
          }

          .hero-copy h1 {
            font-size: 43px;
          }

          .eyebrow-muted,
          .eyebrow-divider {
            display: none;
          }

          .visual-card {
            padding: 17px;
          }

          .visual-chart {
            height: 145px;
          }

          .floating-data {
            min-width: 105px;
            padding: 8px 9px;
          }

          .floating-data strong {
            font-size: 10px;
          }

          .floating-two {
            right: -7px;
          }

          .floating-one {
            left: -7px;
          }

          .category-button {
            min-height: 40px;
            padding: 0 8px;
            font-size: 10px;
          }

          .symbol-icon {
            width: 31px;
            height: 31px;
          }

          .symbol-name {
            font-size: 12px;
          }

          .live-mini {
            display: none;
          }

          .view-more-container {
            padding:
              17px 15px 19px;
          }
        }

      `}</style>

    </main>
  );
}