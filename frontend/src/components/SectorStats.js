import { SECTOR_COLORS } from "../data/sectorsData";

export default function SectorStats({ sector }) {
  const colors = SECTOR_COLORS[sector.color];

  const stats = [
    {
      label: `Total ${sector.recordLabel}`,
      value: sector.stats.total,
      icon: "📊",
      color: "text-slate-900"
    },
    {
      label: "Verified",
      value: sector.stats.verified,
      icon: "✅",
      color: "text-emerald-600"
    },
    {
      label: "Revoked",
      value: sector.stats.revoked,
      icon: "❌",
      color: "text-rose-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`card border ${colors.border} relative overflow-hidden`}
        >
          {/* Decorative gradient */}
          <div
            className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${colors.gradient} opacity-10`}
          ></div>

          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                {stat.label}
              </div>
              <div className={`text-3xl font-extrabold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
            </div>
            <div className="text-4xl opacity-80">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}