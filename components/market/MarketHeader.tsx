type Category =
  | "all"
  | "forex"
  | "metals"
  | "crypto";

const categories = [
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

interface Props {
  active: Category;
  onChange: (value: Category) => void;
}

export default function CategoryTabs({
  active,
  onChange,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 30,
      }}
    >
      {categories.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            border:
              active === item.key
                ? "1px solid #3b82f6"
                : "1px solid #1e293b",
            background:
              active === item.key
                ? "#2563eb"
                : "#0f172a",
            color: "#fff",
          }}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  );
}