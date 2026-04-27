interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: string;
  trend?: { value: string; up: boolean };
}

export default function StatsCard({ label, value, sub, icon, color, trend }: Props) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${color}10` }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: 0.5 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {icon}
        </div>
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{sub}</p>}
      </div>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: trend.up ? "#22c55e" : "#ef4444" }}>
            {trend.up ? "▲" : "▼"} {trend.value}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>bulan ini</span>
        </div>
      )}
    </div>
  );
}
