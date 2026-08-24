"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [risk, setRisk] = useState(1);
  const [balance, setBalance] = useState(10000);
  const [stopLoss, setStopLoss] = useState(50);

  const riskAmount = (balance * risk) / 100;
  const estimatedLot = stopLoss > 0 ? riskAmount / (stopLoss * 10) : 0;

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
              IM
            </div>

            <div>
              <div className="text-lg font-bold tracking-wide">
                IMTraderFX
              </div>

              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Trading Evaluation
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-8 md:flex">

            <button
              onClick={() => scrollToSection("evaluation")}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Evaluation
            </button>

            <button
              onClick={() => scrollToSection("calculator")}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Risk Calculator
            </button>

            <button
              onClick={() => scrollToSection("academy")}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Academy
            </button>

            <button
              onClick={() => scrollToSection("markets")}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Market Brief
            </button>

          </nav>

          <button
            onClick={() => scrollToSection("evaluation")}
            className="hidden rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500 md:block"
          >
            Start Evaluation
          </button>

          {/* Mobile Menu */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 px-3 py-2 md:hidden"
          >
            ☰
          </button>

        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0b1120] px-5 py-5 md:hidden">

            <div className="flex flex-col gap-4">

              <button
                onClick={() => scrollToSection("evaluation")}
                className="text-left text-slate-300"
              >
                Evaluation
              </button>

              <button
                onClick={() => scrollToSection("calculator")}
                className="text-left text-slate-300"
              >
                Risk Calculator
              </button>

              <button
                onClick={() => scrollToSection("academy")}
                className="text-left text-slate-300"
              >
                Trading Academy
              </button>

              <button
                onClick={() => scrollToSection("markets")}
                className="text-left text-slate-300"
              >
                Market Brief
              </button>

            </div>

          </div>
        )}

      </header>


      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">

        <div className="absolute left-1/2 top-20 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">

          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs text-blue-300">

              <span className="h-2 w-2 rounded-full bg-blue-400" />

              PROFESSIONAL TRADING ENVIRONMENT

            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">

              Trade With
              <span className="block text-blue-500">
                Discipline.
              </span>

              Build With
              <span className="block text-slate-300">
                Consistency.
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 md:text-lg">

              A structured trading evaluation environment
              designed for traders who value risk management,
              consistency and disciplined decision-making.

            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={() => scrollToSection("evaluation")}
                className="rounded-xl bg-blue-600 px-7 py-4 font-semibold transition hover:bg-blue-500"
              >
                Start Evaluation →
              </button>

              <button
                onClick={() => scrollToSection("calculator")}
                className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Risk Calculator
              </button>

            </div>

          </div>


          {/* Trading Terminal Visual */}

          <div className="relative">

            <div className="rounded-2xl border border-white/10 bg-[#0d1422] p-5 shadow-2xl">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <div className="text-xs text-slate-500">
                    MARKET OVERVIEW
                  </div>

                  <div className="mt-1 text-lg font-semibold">
                    XAU / USD
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                  MARKET OPEN
                </div>

              </div>


              <div className="flex h-64 items-end gap-2 border-b border-white/10">

                {[35, 48, 40, 62, 55, 70, 58, 75, 68, 83, 76, 92, 86, 97, 90, 100].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t bg-blue-500/70"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  )
                )}

              </div>


              <div className="mt-5 grid grid-cols-3 gap-3">

                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] text-slate-500">
                    RISK
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    Controlled
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] text-slate-500">
                    STYLE
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    Disciplined
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] text-slate-500">
                    FOCUS
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    Consistency
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= STATS ================= */}

      <section className="border-y border-white/10 bg-[#0a101c]">

        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 md:grid-cols-4">

          <div className="p-6 text-center">
            <div className="text-2xl font-bold">
              24/7
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Platform Access
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="text-2xl font-bold">
              Risk
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Focused Environment
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="text-2xl font-bold">
              Multi
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Market Coverage
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="text-2xl font-bold">
              Structured
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Evaluation Process
            </div>
          </div>

        </div>

      </section>


      {/* ================= EVALUATION ================= */}

      <section
        id="evaluation"
        className="mx-auto max-w-7xl px-5 py-20 md:py-28"
      >

        <div className="max-w-2xl">

          <div className="text-sm font-semibold uppercase tracking-widest text-blue-500">
            Evaluation
          </div>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            A Structured Approach to Trading Evaluation
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            Build a trading process around consistency,
            risk awareness and disciplined decision-making.
          </p>

        </div>


        <div className="mt-12 grid gap-5 md:grid-cols-3">

          <FeatureCard
            number="01"
            title="Risk Management"
            text="Understand position sizing and maintain disciplined exposure throughout the evaluation."
          />

          <FeatureCard
            number="02"
            title="Consistency"
            text="Focus on repeatable trading decisions instead of short-term outcomes."
          />

          <FeatureCard
            number="03"
            title="Discipline"
            text="Develop a structured approach to entries, exits and risk control."
          />

        </div>


        <button
          onClick={() =>
            window.open(
              "https://imtraderfx-mini-app.vercel.app",
              "_blank"
            )
          }
          className="mt-10 rounded-xl bg-blue-600 px-7 py-4 font-semibold hover:bg-blue-500"
        >
          Open Evaluation Hub →
        </button>

      </section>


      {/* ================= RISK CALCULATOR ================= */}

      <section
        id="calculator"
        className="border-y border-white/10 bg-[#0a101c]"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 md:py-28">

          <div className="max-w-2xl">

            <div className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              Risk Calculator
            </div>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Plan Your Risk Before You Trade
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Use a simple position-sizing framework to understand
              how much capital is being placed at risk.
            </p>

          </div>


          <div className="mt-12 grid gap-8 md:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-[#0d1422] p-6">

              <div className="space-y-6">

                <InputField
                  label="Account Balance"
                  value={balance}
                  onChange={setBalance}
                />

                <InputField
                  label="Risk Per Trade (%)"
                  value={risk}
                  onChange={setRisk}
                />

                <InputField
                  label="Stop Loss (Pips)"
                  value={stopLoss}
                  onChange={setStopLoss}
                />

              </div>

            </div>


            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8">

              <div className="text-sm text-slate-500">
                ESTIMATED RISK
              </div>

              <div className="mt-3 text-4xl font-bold">
                ${riskAmount.toFixed(2)}
              </div>

              <div className="mt-8 text-sm text-slate-500">
                ESTIMATED POSITION SIZE
              </div>

              <div className="mt-3 text-3xl font-bold text-blue-400">
                {estimatedLot.toFixed(2)} LOT
              </div>

              <p className="mt-6 text-xs leading-5 text-slate-500">
                This calculator is for educational and informational
                purposes only. Actual position sizing depends on
                instrument specifications and trading conditions.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= ACADEMY ================= */}

      <section
        id="academy"
        className="mx-auto max-w-7xl px-5 py-20 md:py-28"
      >

        <div className="text-sm font-semibold uppercase tracking-widest text-blue-500">
          Trading Academy
        </div>

        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
          Build Better Trading Habits
        </h2>

        <p className="mt-5 max-w-2xl leading-7 text-slate-400">
          Educational resources focused on the principles
          behind disciplined trading.
        </p>


        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <AcademyCard
            icon="◈"
            title="Risk Management"
            text="Position sizing, exposure and risk control."
          />

          <AcademyCard
            icon="◎"
            title="Trading Psychology"
            text="Decision-making and emotional discipline."
          />

          <AcademyCard
            icon="⌁"
            title="Market Structure"
            text="Understand price behavior and market context."
          />

          <AcademyCard
            icon="◇"
            title="Trading Strategy"
            text="Develop repeatable and structured processes."
          />

        </div>

      </section>


      {/* ================= MARKET BRIEF ================= */}

      <section
        id="markets"
        className="border-y border-white/10 bg-[#0a101c]"
      >

        <div className="mx-auto max-w-7xl px-5 py-20 md:py-28">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <div className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                Market Brief
              </div>

              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Markets In Focus
              </h2>

            </div>

            <div className="text-xs text-slate-500">
              Educational market overview
            </div>

          </div>


          <div className="mt-12 grid gap-4 md:grid-cols-4">

            <MarketCard symbol="EUR/USD" />
            <MarketCard symbol="GBP/USD" />
            <MarketCard symbol="XAU/USD" />
            <MarketCard symbol="USD INDEX" />

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="mx-auto max-w-5xl px-5 py-24 text-center">

        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-10 md:p-16">

          <div className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            IMTraderFX
          </div>

          <h2 className="mt-4 text-3xl font-bold md:text-5xl">
            Trade With Structure.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
            Develop a disciplined process and approach
            the market with greater structure and awareness.
          </p>

          <button
            onClick={() => scrollToSection("evaluation")}
            className="mt-8 rounded-xl bg-blue-600 px-8 py-4 font-semibold hover:bg-blue-500"
          >
            Explore Evaluation →
          </button>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10 bg-[#050810]">

        <div className="mx-auto max-w-7xl px-5 py-10">

          <div className="flex flex-col justify-between gap-6 md:flex-row">

            <div>

              <div className="text-lg font-bold">
                IMTraderFX
              </div>

              <div className="mt-2 text-xs text-slate-500">
                Trading Evaluation Environment
              </div>

            </div>

            <div className="text-xs text-slate-600">
              © {new Date().getFullYear()} IMTraderFX. All rights reserved.
            </div>

          </div>

          <div className="mt-8 border-t border-white/5 pt-6 text-[11px] leading-5 text-slate-600">
            Trading involves risk. Information provided on this website
            is for educational and informational purposes only and does
            not constitute investment advice or a recommendation to buy
            or sell any financial instrument.
          </div>

        </div>

      </footer>

    </main>
  );
}


/* ================= COMPONENTS ================= */

function FeatureCard({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1422] p-7 transition hover:-translate-y-1 hover:border-blue-500/30">

      <div className="text-sm font-semibold text-blue-500">
        {number}
      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>
  );
}


function AcademyCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1422] p-6">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}


function MarketCard({ symbol }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1422] p-6">

      <div className="text-xs text-slate-500">
        MARKET
      </div>

      <div className="mt-2 text-lg font-semibold">
        {symbol}
      </div>

      <div className="mt-6 h-16 flex items-end gap-1">

        {[30, 45, 35, 55, 48, 70, 62, 80, 72, 88].map(
          (height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-blue-500/60"
              style={{ height: `${height}%` }}
            />
          )
        )}

      </div>

      <div className="mt-4 text-xs text-slate-500">
        Market overview
      </div>

    </div>
  );
}


function InputField({ label, value, onChange }) {
  return (
    <div>

      <label className="mb-2 block text-sm text-slate-400">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-white/10 bg-[#070b14] px-4 py-3 text-white outline-none focus:border-blue-500"
      />

    </div>
  );
}
