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

type SignalType = "BUY" | "SELL" | "NEUTRAL";

type SignalItem = MarketItem & {
  signal: SignalType;
  strength: number;
  bias: string;
};

export default function SignalsPage() {
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  async function loadMarketData(isManualRefresh = false) {
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
        throw new Error(`Request failed: ${response.status}`);
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

      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err) {
      console.error("Signals data error:", err);

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

  const signals = useMemo<SignalItem[]>(() => {
    return marketData.map((item) => {
      const percent =
        item.percent_change ?? 0;

      let signal: SignalType = "NEUTRAL";
      let strength = 50;
      let bias = "Balanced";

      if (percent > 0.15) {
        signal = "BUY";
        strength = Math.min(
          95,
          Math.round(65 + percent * 30)
        );
        bias = "Bullish momentum";
      } else if (percent < -0.15) {
        signal = "SELL";
        strength = Math.min(
          95,
          Math.round(65 + Math.abs(percent) * 30)
        );
        bias = "Bearish momentum";
      } else if (percent > 0) {
        signal = "BUY";
        strength = 58;
        bias = "Slight bullish bias";
      } else if (percent < 0) {
        signal = "SELL";
        strength = 58;
        bias = "Slight bearish bias";
      }

      return {
        ...item,
        signal,
        strength,
        bias,
      };
    });
  }, [marketData]);

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

  function formatPercent(value?: number) {
    if (value === undefined || value === null) {
      return "--";
    }

    const sign = value > 0 ? "+" : "";

    return `${sign}${value.toFixed(2)}%`;
  }

  function getSignalClass(signal: SignalType) {
    if (signal === "BUY") {
      return "buy";
    }

    if (signal === "SELL") {
      return "sell";
    }

    return "neutral";
  }

  return (
    <main className="signals-page">
      {/* =========================
          HEADER
      ========================= */}
      <section className="signals-header">
        <div className="header-content">
          <div>
            <div className="live-label">
              <span className="live-dot"></span>
              MARKET SIGNALS
            </div>

            <h1>Trading Signals</h1>

            <p>
              Real-time market direction based on current
              price momentum
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={() => loadMarketData(true)}
            disabled={loading || refreshing}
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

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================= */}
      <section className="signals-container">

        {/* INFO BAR */}
        <div className="signal-info">
          <div>
            <span className="info-label">
              Active instruments
            </span>

            <strong>
              {signals.length}
            </strong>
          </div>

          <div className="info-status">
            <span className="status-dot"></span>
            Signal engine active
          </div>
        </div>

        {/* =========================
            LOADING
        ========================= */}
        {loading && marketData.length === 0 ? (
          <div className="state-box">
            <div className="loading-spinner"></div>

            <h2>Loading market signals...</h2>

            <p>
              Connecting to live market data
            </p>
          </div>
        ) : error ? (

          /* =========================
             ERROR
          ========================= */
          <div className="state-box">
            <div className="error-icon">
              !
            </div>

            <h2>
              Unable to load signals
            </h2>

            <p>{error}</p>

            <button
              className="retry-button"
              onClick={() =>
                loadMarketData(true)
              }
            >
              Try Again
            </button>
          </div>
        ) : signals.length === 0 ? (

          /* =========================
             EMPTY
          ========================= */
          <div className="state-box">
            <div className="empty-icon">
              📊
            </div>

            <h2>
              No signals available
            </h2>

            <p>
              Market data is currently unavailable.
            </p>
          </div>
        ) : (

          /* =========================
             SIGNAL GRID
          ========================= */
          <div className="signals-grid">
            {signals.map((item, index) => {
              const signalClass =
                getSignalClass(item.signal);

              return (
                <article
                  className="signal-card"
                  key={`${item.symbol}-${index}`}
                >
                  {/* CARD TOP */}
                  <div className="card-top">
                    <div>
                      <div className="symbol">
                        {item.symbol}
                      </div>

                      <div className="name">
                        {item.name ||
                          item.symbol}
                      </div>
                    </div>

                    <span
                      className={`signal-badge ${signalClass}`}
                    >
                      {item.signal}
                    </span>
                  </div>

                  {/* PRICE */}
                  <div className="price-section">
                    <div className="price">
                      {formatPrice(
                        item.price ??
                          item.close
                      )}
                    </div>

                    <div
                      className={`change ${
                        item.percent_change &&
                        item.percent_change > 0
                          ? "positive"
                          : item.percent_change &&
                              item.percent_change < 0
                            ? "negative"
                            : "neutral"
                      }`}
                    >
                      {formatPercent(
                        item.percent_change
                      )}
                    </div>
                  </div>

                  {/* SIGNAL */}
                  <div className="signal-section">
                    <div className="signal-heading">
                      <span>
                        Signal Strength
                      </span>

                      <strong>
                        {item.strength}%
                      </strong>
                    </div>

                    <div className="strength-bar">
                      <div
                        className={`strength-fill ${signalClass}`}
                        style={{
                          width: `${item.strength}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* BIAS */}
                  <div className="bias-row">
                    <span>Technical Bias</span>

                    <strong>
                      {item.bias}
                    </strong>
                  </div>

                  {/* FOOTER */}
                  <div className="card-footer">
                    <span>
                      Based on current market
                      momentum
                    </span>

                    <span className="mini-live">
                      LIVE
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =========================
            DISCLAIMER
        ========================= */}
        <div className="signals-disclaimer">
          <div className="disclaimer-icon">
            i
          </div>

          <div>
            <strong>
              Market information only
            </strong>

            <p>
              These signals are generated from
              current market price movement and
              are provided for informational and
              educational purposes only. They are
              not financial advice or a guarantee
              of future market performance.
            </p>
          </div>
        </div>

        {/* =========================
            FOOTER
        ========================= */}
        <div className="signals-footer">
          <span>
            {lastUpdated
              ? `Last updated ${lastUpdated}`
              : "Waiting for market data"}
          </span>

          <span>
            Updates automatically every 30 seconds
            ↻
          </span>
        </div>
      </section>

      <style jsx>{`
        /* =========================
           PAGE
        ========================= */

        .signals-page {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(37, 99, 235, 0.14),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 20%,
              rgba(14, 165, 233, 0.06),
              transparent 28%
            ),
            #050b16;

          color: #ffffff;

          padding-bottom: 70px;
        }

        /* =========================
           HEADER
        ========================= */

        .signals-header {
          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.08);

          background:
            linear-gradient(
              180deg,
              rgba(7, 18, 33, 0.96),
              rgba(5, 11, 22, 0.92)
            );

          backdrop-filter: blur(14px);
        }

        .header-content {
          max-width: 1400px;

          margin: 0 auto;

          padding:
            52px 24px 42px;

          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 30px;
        }

        .live-label {
          display: flex;

          align-items: center;

          gap: 9px;

          color: #60a5fa;

          font-size: 12px;

          font-weight: 700;

          letter-spacing: 2px;

          margin-bottom: 15px;
        }

        .live-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 12px
            rgba(34, 197, 94, 0.8);
        }

        .signals-header h1 {
          margin: 0;

          font-size:
            clamp(34px, 5vw, 54px);

          line-height: 1.05;

          font-weight: 800;

          letter-spacing: -1.7px;
        }

        .signals-header p {
          margin:
            15px 0 0;

          color: #94a3b8;

          font-size: 15px;

          line-height: 1.6;
        }

        /* =========================
           REFRESH
        ========================= */

        .refresh-button {
          flex-shrink: 0;

          border:
            1px solid
            rgba(96, 165, 250, 0.3);

          background:
            rgba(37, 99, 235, 0.12);

          color: #bfdbfe;

          border-radius: 10px;

          padding:
            11px 18px;

          font-size: 14px;

          font-weight: 600;

          cursor: pointer;

          display: flex;

          align-items: center;

          gap: 8px;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background:
            rgba(37, 99, 235, 0.22);

          border-color:
            rgba(96, 165, 250, 0.55);

          transform:
            translateY(-1px);
        }

        .refresh-button:disabled {
          opacity: 0.65;

          cursor: not-allowed;
        }

        .refresh-icon {
          display: inline-block;

          font-size: 20px;

          line-height: 1;
        }

        .spinning {
          animation:
            spin 0.9s linear infinite;
        }

        /* =========================
           CONTAINER
        ========================= */

        .signals-container {
          max-width: 1400px;

          margin: 0 auto;

          padding:
            28px 24px 0;
        }

        /* =========================
           INFO
        ========================= */

        .signal-info {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 18px;

          color: #64748b;

          font-size: 12px;
        }

        .signal-info > div:first-child {
          display: flex;

          align-items: center;

          gap: 8px;
        }

        .info-label {
          color: #64748b;
        }

        .signal-info strong {
          color: #cbd5e1;

          font-size: 13px;
        }

        .info-status {
          display: flex;

          align-items: center;

          gap: 7px;
        }

        .status-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 8px
            rgba(34, 197, 94, 0.6);
        }

        /* =========================
           GRID
        ========================= */

        .signals-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 16px;
        }

        /* =========================
           CARD
        ========================= */

        .signal-card {
          border:
            1px solid
            rgba(255, 255, 255, 0.08);

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              rgba(14, 26, 44, 0.9),
              rgba(8, 16, 28, 0.9)
            );

          padding: 20px;

          box-shadow:
            0 18px 50px
            rgba(0, 0, 0, 0.2);

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .signal-card:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(96, 165, 250, 0.22);

          background:
            linear-gradient(
              145deg,
              rgba(17, 32, 53, 0.94),
              rgba(8, 16, 28, 0.94)
            );
        }

        /* =========================
           TOP
        ========================= */

        .card-top {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 15px;
        }

        .symbol {
          color: #ffffff;

          font-size: 17px;

          font-weight: 800;

          letter-spacing: 0.2px;
        }

        .name {
          margin-top: 5px;

          color: #64748b;

          font-size: 11px;

          line-height: 1.4;
        }

        .signal-badge {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          min-width: 68px;

          padding:
            6px 10px;

          border-radius: 7px;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.8px;
        }

        .signal-badge.buy {
          color: #4ade80;

          background:
            rgba(34, 197, 94, 0.1);

          border:
            1px solid
            rgba(34, 197, 94, 0.2);
        }

        .signal-badge.sell {
          color: #f87171;

          background:
            rgba(239, 68, 68, 0.1);

          border:
            1px solid
            rgba(239, 68, 68, 0.2);
        }

        .signal-badge.neutral {
          color: #94a3b8;

          background:
            rgba(148, 163, 184, 0.08);

          border:
            1px solid
            rgba(148, 163, 184, 0.15);
        }

        /* =========================
           PRICE
        ========================= */

        .price-section {
          display: flex;

          align-items: baseline;

          justify-content: space-between;

          gap: 10px;

          margin-top: 26px;
        }

        .price {
          color: #f8fafc;

          font-size: 25px;

          font-weight: 800;

          font-variant-numeric:
            tabular-nums;
        }

        .change {
          font-size: 13px;

          font-weight: 700;

          font-variant-numeric:
            tabular-nums;
        }

        .positive {
          color: #22c55e;
        }

        .negative {
          color: #ef4444;
        }

        .neutral {
          color: #94a3b8;
        }

        /* =========================
           SIGNAL STRENGTH
        ========================= */

        .signal-section {
          margin-top: 24px;
        }

        .signal-heading {
          display: flex;

          align-items: center;

          justify-content: space-between;

          color: #64748b;

          font-size: 11px;
        }

        .signal-heading strong {
          color: #cbd5e1;

          font-size: 12px;
        }

        .strength-bar {
          height: 5px;

          margin-top: 9px;

          overflow: hidden;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.06);
        }

        .strength-fill {
          height: 100%;

          border-radius: 999px;

          transition:
            width 0.5s ease;
        }

        .strength-fill.buy {
          background: #22c55e;
        }

        .strength-fill.sell {
          background: #ef4444;
        }

        .strength-fill.neutral {
          background: #64748b;
        }

        /* =========================
           BIAS
        ========================= */

        .bias-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          margin-top: 20px;

          padding-top: 16px;

          border-top:
            1px solid
            rgba(255, 255, 255, 0.06);

          color: #64748b;

          font-size: 11px;
        }

        .bias-row strong {
          color: #cbd5e1;

          font-size: 11px;

          text-align: right;
        }

        /* =========================
           CARD FOOTER
        ========================= */

        .card-footer {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          margin-top: 15px;

          color: #475569;

          font-size: 10px;
        }

        .mini-live {
          color: #4ade80;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 0.7px;
        }

        /* =========================
           STATE
        ========================= */

        .state-box {
          min-height: 360px;

          border:
            1px solid
            rgba(255, 255, 255, 0.08);

          border-radius: 16px;

          background:
            rgba(10, 18, 32, 0.7);

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          padding: 40px 24px;
        }

        .state-box h2 {
          margin: 0;

          font-size: 20px;
        }

        .state-box p {
          max-width: 520px;

          margin:
            10px 0 20px;

          color: #94a3b8;

          font-size: 14px;

          line-height: 1.6;
        }

        .loading-spinner {
          width: 34px;
          height: 34px;

          border:
            3px solid
            rgba(255, 255, 255, 0.1);

          border-top-color:
            #60a5fa;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;

          margin-bottom: 20px;
        }

        .error-icon {
          width: 46px;
          height: 46px;

          border-radius: 50%;

          background:
            rgba(239, 68, 68, 0.12);

          color: #ef4444;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 24px;

          font-weight: 800;

          margin-bottom: 16px;
        }

        .empty-icon {
          font-size: 42px;

          margin-bottom: 16px;

          opacity: 0.7;
        }

        .retry-button {
          border: none;

          background: #2563eb;

          color: #ffffff;

          border-radius: 9px;

          padding:
            10px 18px;

          font-size: 14px;

          font-weight: 600;

          cursor: pointer;
        }

        .retry-button:hover {
          background: #1d4ed8;
        }

        /* =========================
           DISCLAIMER
        ========================= */

        .signals-disclaimer {
          display: flex;

          align-items: flex-start;

          gap: 12px;

          margin-top: 20px;

          padding:
            16px 18px;

          border:
            1px solid
            rgba(255, 255, 255, 0.06);

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.025);
        }

        .disclaimer-icon {
          width: 22px;
          height: 22px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border:
            1px solid
            rgba(148, 163, 184, 0.25);

          border-radius: 50%;

          color: #94a3b8;

          font-size: 12px;

          font-weight: 700;
        }

        .signals-disclaimer strong {
          color: #94a3b8;

          font-size: 11px;
        }

        .signals-disclaimer p {
          margin:
            5px 0 0;

          color: #475569;

          font-size: 10px;

          line-height: 1.6;
        }

        /* =========================
           FOOTER
        ========================= */

        .signals-footer {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          margin-top: 16px;

          color: #475569;

          font-size: 11px;
        }

        /* =========================
           ANIMATION
        ========================= */

        @keyframes spin {
          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 1000px) {
          .signals-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 700px) {
          .header-content {
            align-items: flex-start;

            flex-direction: column;

            padding:
              36px 18px 30px;
          }

          .refresh-button {
            width: 100%;

            justify-content: center;
          }

          .signals-container {
            padding:
              20px 14px 0;
          }

          .signals-header h1 {
            font-size: 36px;
          }

          .signals-header p {
            font-size: 13px;
          }

          .signals-grid {
            grid-template-columns:
              1fr;
          }

          .signal-info {
            align-items: flex-start;

            flex-direction: column;

            gap: 10px;
          }

          .signals-footer {
            align-items: flex-start;

            flex-direction: column;
          }
        }

        /* =========================
           SMALL MOBILE
        ========================= */

        @media (max-width: 420px) {
          .signal-card {
            padding: 17px;
          }

          .price {
            font-size: 22px;
          }

          .signals-disclaimer {
            padding: 14px;
          }
        }
      `}</style>
    </main>
  );
}