"use client";

import Link from "next/link";
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

function normalizeSymbol(value: string) {
  return decodeURIComponent(value)
    .trim()
    .replace(/-/g, "/")
    .toUpperCase();
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

function getMarketIcon(symbol: string) {
  const value = symbol.toUpperCase();

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

function getSparklinePoints(index: number) {
  const patterns = [
    "0,32 20,29 40,31 60,24 80,27 100,18 120,21 140,12 160,15 180,7 200,10 220,4",
    "0,9 20,14 40,11 60,19 80,16 100,27 120,22 140,31 160,25 180,34 200,29 220,36",
    "0,27 20,21 40,24 60,16 80,20 100,11 120,14 140,7 160,12 180,5 200,8 220,3",
    "0,31 20,24 40,27 60,20 80,23 100,16 120,20 140,12 160,16 180,9 200,13 220,7",
  ];

  return patterns[index % patterns.length];
}

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const [symbolParam, setSymbolParam] = useState("");

  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    let mounted = true;

    params.then((value) => {
      if (mounted) {
        setSymbolParam(value.symbol);
      }
    });

    return () => {
      mounted = false;
    };
  }, [params]);

  const symbol = useMemo(() => {
    if (!symbolParam) {
      return "";
    }

    return normalizeSymbol(symbolParam);
  }, [symbolParam]);

  async function loadMarketData(
    isManualRefresh = false
  ) {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
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
      console.error("Market detail error:", err);

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
    if (!symbol) {
      return;
    }

    loadMarketData();

    const interval = setInterval(() => {
      loadMarketData();
    }, 30000);

    return () => clearInterval(interval);
  }, [symbol]);

  const market = useMemo(() => {
    if (!symbol) {
      return undefined;
    }

    const target = symbol.replace(/\s/g, "").toUpperCase();

    return marketData.find((item) => {
      const current = (item.symbol || "")
        .replace(/\s/g, "")
        .toUpperCase();

      return current === target;
    });
  }, [marketData, symbol]);

  const price = market?.price ?? market?.close;

  const changeClass = getChangeClass(
    market?.percent_change ?? market?.change
  );

  return (
    <main className="detail-page">

      <div className="background-grid"></div>

      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      {/* NAVIGATION */}

      <nav className="top-nav">
        <div className="nav-inner">

          <Link href="/" className="brand">

            <div className="brand-mark">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="brand-text">
              <strong>IMTRADER</strong>
              <span>FX</span>
            </div>

          </Link>

          <div className="nav-links">

            <Link
              href="/"
              className="nav-link"
            >
              Home
            </Link>

            <Link
              href="/market"
              className="nav-link active"
            >
              Markets
            </Link>

            <Link
              href="/signals"
              className="nav-link"
            >
              Signals
            </Link>

            <Link
              href="/news"
              className="nav-link"
            >
              News
            </Link>

          </div>

          <div className="nav-right">

            <div className="nav-live">
              <span></span>
              LIVE
            </div>

            <button
              className="refresh-button"
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
                    ? "refresh-icon spinning"
                    : "refresh-icon"
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

      {/* PAGE */}

      <section className="detail-container">

        <div className="breadcrumb">

          <Link href="/market">
            Markets
          </Link>

          <span>›</span>

          <span>
            {symbol || "Market"}
          </span>

        </div>

        {loading && !market ? (

          <div className="loading-box">

            <div className="loading-ring"></div>

            <h2>
              Loading market data
            </h2>

            <p>
              Connecting to live market intelligence...
            </p>

          </div>

        ) : error ? (

          <div className="error-box">

            <div className="error-icon">
              !
            </div>

            <h2>
              Unable to load market data
            </h2>

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

        ) : !market ? (

          <div className="error-box">

            <div className="error-icon">
              ?
            </div>

            <h2>
              Market not found
            </h2>

            <p>
              No live data is currently available
              for {symbol || "this instrument"}.
            </p>

            <Link
              href="/market"
              className="back-button"
            >
              Back to Markets
            </Link>

          </div>

        ) : (

          <>

            {/* HEADER */}

            <div className="detail-header">

              <div className="header-left">

                <Link
                  href="/market"
                  className="back-link"
                >
                  ← Markets
                </Link>

                <div className="instrument">

                  <div className="instrument-icon">
                    {getMarketIcon(
                      market.symbol
                    )}
                  </div>

                  <div>

                    <div className="instrument-title">

                      <h1>
                        {market.symbol}
                      </h1>

                      <span className="live-badge">
                        <i></i>
                        LIVE
                      </span>

                    </div>

                    <p>
                      {market.name ||
                        market.symbol}
                    </p>

                  </div>

                </div>

              </div>

              <div className="header-status">

                <span className="status-dot"></span>

                <div>
                  <strong>
                    LIVE MARKET
                  </strong>

                  <small>
                    {lastUpdated
                      ? `Updated ${lastUpdated}`
                      : "Connected"}
                  </small>
                </div>

              </div>

            </div>

            {/* PRICE */}

            <div className="price-panel">

              <div className="price-main">

                <span className="label">
                  CURRENT PRICE
                </span>

                <strong>
                  {formatPrice(price)}
                </strong>

                <div
                  className={`price-change ${changeClass}`}
                >

                  <span>
                    {market.change !==
                      undefined &&
                    market.change !== null
                      ? market.change > 0
                        ? "↑"
                        : market.change < 0
                        ? "↓"
                        : "—"
                      : "—"}
                  </span>

                  {formatChange(
                    market.change
                  )}

                  <b>
                    {formatPercent(
                      market.percent_change
                    )}
                  </b>

                </div>

              </div>

              <div className="price-side">

                <div>
                  <span>
                    MARKET TYPE
                  </span>

                  <strong>
                    {market.type ||
                      "MARKET"}
                  </strong>
                </div>

                <div>
                  <span>
                    DATA STATUS
                  </span>

                  <strong className="green">
                    OPERATIONAL
                  </strong>
                </div>

              </div>

            </div>

            {/* CHART */}

            <div className="chart-card">

              <div className="chart-header">

                <div>

                  <span>
                    PRICE ACTIVITY
                  </span>

                  <h2>
                    Market Movement
                  </h2>

                </div>

                <div className="chart-live">
                  <span></span>
                  REAL-TIME
                </div>

              </div>

              <div className="large-chart">

                <div className="chart-grid">

                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>

                </div>

                <svg
                  viewBox="0 0 900 300"
                  preserveAspectRatio="none"
                >

                  <defs>

                    <linearGradient
                      id="detailChartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopOpacity="0.28"
                      />

                      <stop
                        offset="100%"
                        stopOpacity="0"
                      />

                    </linearGradient>

                  </defs>

                  <path
                    d="M0 230 L60 218 L120 225 L180 192 L240 202 L300 155 L360 168 L420 122 L480 138 L540 92 L600 108 L660 65 L720 80 L780 42 L840 58 L900 30 L900 300 L0 300 Z"
                    fill="url(#detailChartFill)"
                  />

                  <polyline
                    points="0,230 60,218 120,225 180,192 240,202 300,155 360,168 420,122 480,138 540,92 600,108 660,65 720,80 780,42 840,58 900,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />

                  <circle
                    cx="900"
                    cy="30"
                    r="6"
                    fill="currentColor"
                  />

                </svg>

                <div className="chart-end-value">
                  {formatPrice(price)}
                </div>

              </div>

              <div className="chart-footer">

                <span>
                  24H MARKET VIEW
                </span>

                <span>
                  DATA STREAM ACTIVE
                </span>

                <span>
                  AUTO REFRESH 30s
                </span>

              </div>

            </div>

            {/* METRICS */}

            <div className="metrics-grid">

              <div className="metric-card">

                <span>
                  LAST PRICE
                </span>

                <strong>
                  {formatPrice(price)}
                </strong>

                <small>
                  Current market quote
                </small>

              </div>

              <div className="metric-card">

                <span>
                  ABSOLUTE CHANGE
                </span>

                <strong
                  className={changeClass}
                >
                  {formatChange(
                    market.change
                  )}
                </strong>

                <small>
                  Session movement
                </small>

              </div>

              <div className="metric-card">

                <span>
                  PERCENT CHANGE
                </span>

                <strong
                  className={changeClass}
                >
                  {formatPercent(
                    market.percent_change
                  )}
                </strong>

                <small>
                  Market performance
                </small>

              </div>

              <div className="metric-card">

                <span>
                  STATUS
                </span>

                <strong className="green">
                  LIVE
                </strong>

                <small>
                  Data connection active
                </small>

              </div>

            </div>

            {/* INFORMATION */}

            <div className="bottom-grid">

              <div className="info-card">

                <div className="info-heading">
                  <span>
                    INSTRUMENT
                  </span>

                  <div className="mini-line"></div>
                </div>

                <div className="info-row">

                  <span>
                    Symbol
                  </span>

                  <strong>
                    {market.symbol}
                  </strong>

                </div>

                <div className="info-row">

                  <span>
                    Name
                  </span>

                  <strong>
                    {market.name ||
                      market.symbol}
                  </strong>

                </div>

                <div className="info-row">

                  <span>
                    Market Type
                  </span>

                  <strong>
                    {market.type ||
                      "MARKET"}
                  </strong>

                </div>

              </div>

              <div className="info-card">

                <div className="info-heading">
                  <span>
                    DATA CONNECTION
                  </span>

                  <div className="mini-line"></div>
                </div>

                <div className="connection-main">

                  <span className="connection-icon">
                    ◉
                  </span>

                  <div>

                    <strong>
                      Live Connection
                    </strong>

                    <p>
                      Market data is being
                      refreshed automatically.
                    </p>

                  </div>

                </div>

                <div className="connection-time">

                  <span>
                    LAST UPDATE
                  </span>

                  <strong>
                    {lastUpdated ||
                      "Connecting..."}
                  </strong>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="detail-footer">

              <Link href="/market">
                ← Back to Market Overview
              </Link>

              <span>
                IMTRADERFX MARKET INTELLIGENCE
              </span>

              <span>
                AUTO REFRESH 30s
              </span>

            </div>

          </>

        )}

      </section>

      <style jsx>{`

        .detail-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding-bottom: 80px;
          background:
            radial-gradient(
              circle at 15% 5%,
              rgba(37,99,235,.14),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 30%,
              rgba(14,165,233,.08),
              transparent 28%
            ),
            #020711;
          color: #fff;
        }

        .background-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .045;
          background-image:
            linear-gradient(
              rgba(96,165,250,.35) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(96,165,250,.35) 1px,
              transparent 1px
            );
          background-size: 70px 70px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 80%
            );
        }

        .ambient {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(110px);
        }

        .ambient-one {
          width: 400px;
          height: 400px;
          left: -250px;
          top: 300px;
          background: rgba(37,99,235,.1);
        }

        .ambient-two {
          width: 420px;
          height: 420px;
          right: -270px;
          top: 700px;
          background: rgba(14,165,233,.07);
        }

        .top-nav {
          position: relative;
          z-index: 20;
          border-bottom:
            1px solid
            rgba(255,255,255,.06);
          background:
            rgba(2,7,17,.84);
          backdrop-filter: blur(18px);
        }

        .nav-inner {
          max-width: 1400px;
          min-height: 70px;
          margin: 0 auto;
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
          color: #fff;
          text-decoration: none;
        }

        .brand-mark {
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
            rgba(59,130,246,.5);
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
          transition: color .2s ease;
        }

        .nav-link:hover {
          color: #dbeafe;
        }

        .nav-link.active {
          color: #fff;
        }

        .nav-link.active::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
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

        .refresh-button {
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

        .refresh-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .refresh-icon {
          font-size: 15px;
        }

        .detail-container {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 35px 24px 0;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 28px;
          color: #46566d;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .breadcrumb a {
          color: #6c9ee8;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          color: #a8caff;
        }

        .detail-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 25px;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .back-link {
          width: fit-content;
          color: #53657d;
          text-decoration: none;
          font-size: 9px;
          font-weight: 700;
        }

        .back-link:hover {
          color: #9ec5ff;
        }

        .instrument {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .instrument-icon {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          border:
            1px solid
            rgba(96,165,250,.2);
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              rgba(37,99,235,.18),
              rgba(15,23,42,.72)
            );
          color: #69a8ff;
          font-size: 14px;
          font-weight: 900;
          box-shadow:
            0 15px 35px
            rgba(0,0,0,.25),
            inset 0 1px 0
            rgba(255,255,255,.04);
        }

        .instrument-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .instrument-title h1 {
          margin: 0;
          color: #f0f6ff;
          font-size: clamp(30px,4vw,48px);
          line-height: 1;
          font-weight: 850;
          letter-spacing: -1.8px;
        }

        .instrument p {
          margin: 7px 0 0;
          color: #5c6c82;
          font-size: 10px;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 7px;
          border:
            1px solid
            rgba(34,197,94,.14);
          border-radius: 4px;
          color: #4ade80;
          background:
            rgba(34,197,94,.04);
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .8px;
        }

        .live-badge i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 7px
            rgba(34,197,94,.8);
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 12px
            rgba(34,197,94,.8);
        }

        .header-status strong {
          display: block;
          color: #536176;
          font-size: 8px;
          letter-spacing: 1.3px;
        }

        .header-status small {
          display: block;
          margin-top: 4px;
          color: #334155;
          font-size: 8px;
        }

        .price-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding: 27px;
          border:
            1px solid
            rgba(96,165,250,.13);
          border-radius: 15px;
          background:
            linear-gradient(
              145deg,
              rgba(9,22,39,.9),
              rgba(4,11,21,.96)
            );
          box-shadow:
            0 25px 70px
            rgba(0,0,0,.28);
        }

        .label,
        .price-side span {
          display: block;
          color: #46566c;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .price-main > strong {
          display: block;
          margin-top: 8px;
          color: #edf5ff;
          font-size: clamp(32px,4vw,52px);
          line-height: 1;
          font-weight: 850;
          font-variant-numeric: tabular-nums;
          letter-spacing: -1.5px;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 11px;
          font-size: 11px;
          font-weight: 750;
          font-variant-numeric: tabular-nums;
        }

        .price-change b {
          font-weight: 800;
        }

        .price-side {
          display: grid;
          grid-template-columns: repeat(2,150px);
          gap: 25px;
        }

        .price-side strong {
          display: block;
          margin-top: 7px;
          color: #9caec5;
          font-size: 11px;
        }

        .green {
          color: #4ade80 !important;
        }

        .positive {
          color: #22c55e;
        }

        .negative {
          color: #f05252;
        }

        .neutral {
          color: #8492a7;
        }

        .chart-card {
          margin-top: 13px;
          padding: 25px;
          border:
            1px solid
            rgba(255,255,255,.065);
          border-radius: 15px;
          background:
            linear-gradient(
              180deg,
              rgba(8,18,32,.95),
              rgba(4,11,21,.97)
            );
          box-shadow:
            0 25px 70px
            rgba(0,0,0,.25);
        }

        .chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .chart-header span:first-child {
          color: #46566c;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.5px;
        }

        .chart-header h2 {
          margin: 6px 0 0;
          color: #dbe7f5;
          font-size: 17px;
        }

        .chart-live {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border:
            1px solid
            rgba(34,197,94,.12);
          border-radius: 5px;
          color: #4ade80;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .8px;
        }

        .chart-live span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow:
            0 0 7px
            rgba(34,197,94,.8);
        }

        .large-chart {
          position: relative;
          height: 330px;
          margin-top: 22px;
          overflow: hidden;
          border-top:
            1px solid
            rgba(255,255,255,.035);
          border-bottom:
            1px solid
            rgba(255,255,255,.035);
        }

        .chart-grid {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }

        .chart-grid span {
          height: 1px;
          width: 100%;
          background:
            rgba(255,255,255,.035);
        }

        .large-chart svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          color: #4d9aff;
          filter:
            drop-shadow(
              0 0 10px
              rgba(59,130,246,.45)
            );
        }

        .chart-end-value {
          position: absolute;
          top: 18px;
          right: 20px;
          color: #4ade80;
          font-size: 11px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .chart-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 13px;
          color: #334155;
          font-size: 7px;
          font-weight: 750;
          letter-spacing: 1px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 12px;
          margin-top: 13px;
        }

        .metric-card {
          min-height: 115px;
          padding: 19px;
          border:
            1px solid
            rgba(255,255,255,.055);
          border-radius: 12px;
          background:
            rgba(7,16,29,.82);
        }

        .metric-card span {
          display: block;
          color: #43536a;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.3px;
        }

        .metric-card strong {
          display: block;
          margin-top: 15px;
          color: #d9e5f3;
          font-size: 18px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .metric-card small {
          display: block;
          margin-top: 6px;
          color: #3b4a5f;
          font-size: 8px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
          margin-top: 13px;
        }

        .info-card {
          padding: 22px;
          border:
            1px solid
            rgba(255,255,255,.055);
          border-radius: 12px;
          background:
            rgba(7,16,29,.78);
        }

        .info-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #46566c;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: 1.3px;
        }

        .mini-line {
          flex: 1;
          height: 1px;
          background:
            rgba(255,255,255,.04);
        }

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 15px 0;
          border-bottom:
            1px solid
            rgba(255,255,255,.04);
        }

        .info-row:first-of-type {
          margin-top: 10px;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row span {
          color: #4d5d73;
          font-size: 9px;
        }

        .info-row strong {
          color: #aabbd0;
          font-size: 9px;
          text-align: right;
        }

        .connection-main {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 18px;
          padding: 15px;
          border:
            1px solid
            rgba(34,197,94,.08);
          border-radius: 9px;
          background:
            rgba(34,197,94,.025);
        }

        .connection-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background:
            rgba(34,197,94,.07);
          color: #4ade80;
          font-size: 13px;
        }

        .connection-main strong {
          color: #b8c9dc;
          font-size: 10px;
        }

        .connection-main p {
          margin: 4px 0 0;
          color: #45556a;
          font-size: 8px;
        }

        .connection-time {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }

        .connection-time span {
          color: #3d4d62;
          font-size: 7px;
          letter-spacing: 1px;
        }

        .connection-time strong {
          color: #61748d;
          font-size: 8px;
        }

        .detail-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 17px;
          color: #2e3b4f;
          font-size: 7px;
          letter-spacing: .8px;
        }

        .detail-footer a {
          color: #5e85b8;
          text-decoration: none;
          font-weight: 750;
        }

        .loading-box,
        .error-box {
          min-height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
          border:
            1px solid
            rgba(255,255,255,.06);
          border-radius: 15px;
          background:
            rgba(7,16,29,.78);
        }

        .loading-ring {
          width: 55px;
          height: 55px;
          margin-bottom: 22px;
          border:
            1px solid
            rgba(96,165,250,.12);
          border-top-color: #60a5fa;
          border-radius: 50%;
          animation:
            spin 1s linear infinite;
          box-shadow:
            0 0 25px
            rgba(59,130,246,.08);
        }

        .loading-box h2,
        .error-box h2 {
          margin: 0;
          color: #dce6f2;
          font-size: 17px;
        }

        .loading-box p,
        .error-box p {
          max-width: 450px;
          margin: 9px 0 0;
          color: #526176;
          font-size: 10px;
          line-height: 1.7;
        }

        .error-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border:
            1px solid
            rgba(239,68,68,.18);
          border-radius: 50%;
          background:
            rgba(239,68,68,.06);
          color: #ef4444;
          font-size: 18px;
          font-weight: 850;
        }

        .retry-button,
        .back-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          padding: 10px 17px;
          border:
            1px solid
            rgba(96,165,250,.22);
          border-radius: 7px;
          background:
            rgba(37,99,235,.08);
          color: #a8c7ef;
          text-decoration: none;
          font-size: 9px;
          font-weight: 750;
          cursor: pointer;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .spinning {
          animation:
            spin .8s linear infinite;
        }

        @media (max-width: 900px) {

          .metrics-grid {
            grid-template-columns:
              repeat(2,1fr);
          }

          .price-side {
            grid-template-columns:
              repeat(2,130px);
          }

        }

        @media (max-width: 760px) {

          .nav-inner {
            min-height: 62px;
            padding: 0 16px;
          }

          .nav-links,
          .nav-live {
            display: none;
          }

          .detail-container {
            padding:
              25px 15px 0;
          }

          .detail-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-status {
            display: none;
          }

          .instrument-icon {
            width: 48px;
            height: 48px;
          }

          .instrument-title h1 {
            font-size: 31px;
          }

          .price-panel {
            align-items: flex-start;
            flex-direction: column;
            padding: 21px;
          }

          .price-side {
            width: 100%;
            grid-template-columns:
              repeat(2,1fr);
            gap: 15px;
          }

          .chart-card {
            padding: 18px;
          }

          .large-chart {
            height: 240px;
          }

          .chart-footer span:nth-child(2) {
            display: none;
          }

          .metrics-grid {
            grid-template-columns:
              repeat(2,1fr);
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .detail-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
          }

        }

        @media (max-width: 430px) {

          .brand-text {
            font-size: 12px;
          }

          .refresh-button {
            padding: 7px 9px;
          }

          .breadcrumb {
            margin-bottom: 20px;
          }

          .instrument {
            gap: 11px;
          }

          .instrument-icon {
            width: 43px;
            height: 43px;
            border-radius: 10px;
            font-size: 11px;
          }

          .instrument-title {
            gap: 7px;
          }

          .instrument-title h1 {
            font-size: 25px;
          }

          .live-badge {
            font-size: 6px;
            padding: 3px 5px;
          }

          .instrument p {
            font-size: 8px;
          }

          .price-main > strong {
            font-size: 34px;
          }

          .price-change {
            font-size: 9px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .metric-card {
            min-height: 100px;
          }

          .large-chart {
            height: 190px;
          }

          .chart-header h2 {
            font-size: 15px;
          }

        }

      `}</style>

    </main>
  );
}