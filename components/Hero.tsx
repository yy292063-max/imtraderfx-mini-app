"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#16263a] bg-[#030b16]">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col items-center px-6 py-24 text-center">

        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs text-blue-300">
          AI Powered Trading Platform
        </span>

        <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl">
          Trade Smarter
          <br />
          With Artificial Intelligence
        </h1>

        <p className="mt-6 max-w-2xl text-gray-400">
          Professional market analysis, AI trading signals,
          live financial news and economic calendar —
          all in one platform.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/markets"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Start Trading
          </Link>

          <Link
            href="/news"
            className="rounded-lg border border-[#294462] px-8 py-3 font-semibold text-gray-300 transition hover:border-blue-500 hover:text-white"
          >
            Latest News
          </Link>
        </div>

      </div>
    </section>
  );
}