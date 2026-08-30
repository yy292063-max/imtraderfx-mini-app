"use client";

type Category =
  | "all"
  | "forex"
  | "metals"
  | "crypto";

type CategoryTabsProps = {
  active: Category;
  onChange: (category: Category) => void;
};

const categories: {
  key: Category;
  label: string;
  icon: string;
}[] = [
  {
    key: "all",
    label: "All",
    icon: "🌐",
  },
  {
    key: "forex",
    label: "Forex",
    icon: "💱",
  },
  {
    key: "metals",
    label: "Metals",
    icon: "🥇",
  },
  {
    key: "crypto",
    label: "Crypto",
    icon: "₿",
  },
];

export default function CategoryTabs({
  active,
  onChange,
}: CategoryTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "24px",
        flexWrap: "wrap",
      }}
    >
      {categories.map((category) => {
        const isActive = active === category.key;

        return (
          <button
            key={category.key}
            onClick={() => onChange(category.key)}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: isActive
                ? "1px solid #38bdf8"
                : "1px solid #334155",
              background: isActive
                ? "#0c4a6e"
                : "#0f172a",
              color: isActive
                ? "#ffffff"
                : "#94a3b8",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ marginRight: "6px" }}>
              {category.icon}
            </span>

            {category.label}
          </button>
        );
      })}
    </div>
  );
}