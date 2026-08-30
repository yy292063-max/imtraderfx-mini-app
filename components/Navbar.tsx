"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "Home", href: "/" },
  { name: "Markets", href: "/market" },
  { name: "News", href: "/news" },
  { name: "Signals", href: "/signals" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#16263a] bg-[#050d18]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-white"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
            I
          </div>

          <div>
            <div className="text-sm font-bold tracking-wide">
              IMTraderFX
            </div>

            <div className="text-[10px] text-gray-400">
              Trading Intelligence
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {menus.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-300 hover:bg-[#10243a] hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />

            <span className="text-xs font-medium text-green-400">
              Live
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}