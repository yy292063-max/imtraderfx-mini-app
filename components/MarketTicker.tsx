"use client";

import { useEffect, useState } from "react";

type Market = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
};

export default function MarketTicker() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarkets() {
      try {
        const res = await fetch("/api/market", {
          cache: "no-store",
        });

        const json = await res.json();

        if (json.success) {
          setMarkets(json.data ?? []);
        }
      } catch (e) {
        console.error("Market data error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadMarkets();

    // 每 5 分钟更新一次
    const timer = setInterval(loadMarkets, 300000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="border-b border-[#16263a] bg-[#071321]">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Live Markets
          </h2>

          <span className="text-xs text-green-400">
            ● Live Data
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-10 text-center text-gray-400">
            Loading market data...
          </div>
        ) : markets.length === 0 ? (
          
          /* Empty */
          <div className="py-10 text-center text-red-400">
            Unable to load market data.
          </div>
        ) : (
          
          /* Market Cards */
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {markets.map((market) => {
              const isPositive = market.percent_change >= 0;

              return (
                <div
                  key={market.symbol}
                  className="group rounded-xl border border-[#18314b] bg-[#0b1827] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
                >
                  
                  {/* Symbol + Live */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {market.symbol}
                      </div>

                      <div className="mt-1 text-[11px] text-gray-500">
                        {market.name}
                      </div>
                    </div>

                    <span className="text-xs text-green-400">
                      ●
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-5">
                    <div className="text-[28px] font-bold tracking-tight text-white">
                      {market.price !== undefined
                        ? market.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 5,
                          })
                        : "--"}
                    </div>
                  </div>

                  {/* Change */}
                  <div
                    className={`mt-2 text-sm font-semibold ${
                      isPositive
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {market.change !== undefined
                      ? market.change.toFixed(5)
                      : "0.00000"}

                    <span className="ml-2">
                      ({isPositive ? "+" : ""}
                      {market.percent_change.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}