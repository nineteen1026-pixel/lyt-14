import { Link } from "react-router-dom";
import {
  Leaf,
  Droplets,
  Bug,
  TrendingUp,
  Plus,
  Calendar,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store";
import { getRelativeTime, today } from "@/utils/format";
import {
  getPlantHealthStatus,
  getHealthStatusColor,
  getHealthStatusLabel,
  getCareStatsByDate,
  getPlantsNeedingCare,
} from "@/utils/helpers";
import {
  CARE_TYPE_LABELS,
  CARE_TYPE_ICONS,
  PEST_TYPE_LABELS,
} from "@/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function Dashboard() {
  const plants = useAppStore((s) => s.plants);
  const careLogs = useAppStore((s) => s.careLogs);
  const pestRecords = useAppStore((s) => s.pestRecords);

  const thisMonthCareLogs = careLogs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const ongoingPests = pestRecords.filter((p) => p.status === "ongoing");

  const healthyCount = plants.filter(
    (p) => getPlantHealthStatus(p, careLogs, pestRecords) === "healthy"
  ).length;
  const healthRate =
    plants.length > 0 ? Math.round((healthyCount / plants.length) * 100) : 0;

  const careStats = getCareStatsByDate(careLogs, 14);

  const categoryData = plants.reduce((acc, p) => {
    const existing = acc.find((i) => i.name === p.category);
    if (existing) existing.value++;
    else acc.push({ name: p.category, value: 1 });
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ["#8CB369", "#6a9b4a", "#517c39", "#C9A96E", "#D9BC85", "#a0c983"];

  const recentActivities = [
    ...careLogs.slice(0, 3).map((l) => ({
      type: "care" as const,
      id: l.id,
      plantId: l.plantId,
      date: l.date,
      icon: CARE_TYPE_ICONS[l.type],
      label: CARE_TYPE_LABELS[l.type],
    })),
    ...pestRecords.slice(0, 2).map((p) => ({
      type: "pest" as const,
      id: p.id,
      plantId: p.plantId,
      date: p.discoveredDate,
      icon: p.type === "disease" ? "🦠" : "🐛",
      label: PEST_TYPE_LABELS[p.type] + "记录",
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const getPlantName = (id: string) => plants.find((p) => p.id === id)?.name || "未知植物";

  const plantsNeedingCare = getPlantsNeedingCare(plants, careLogs).slice(0, 3);

  const stats = [
    {
      label: "植物总数",
      value: plants.length,
      icon: <Leaf size={22} />,
      emoji: "🪴",
      color: "from-forest-400 to-forest-600",
      bg: "bg-forest-50",
      text: "text-forest-700",
    },
    {
      label: "本月养护",
      value: thisMonthCareLogs.length,
      icon: <Droplets size={22} />,
      emoji: "💧",
      color: "from-sky-400 to-sky-600",
      bg: "bg-sky-50",
      text: "text-sky-700",
    },
    {
      label: "活跃病虫害",
      value: ongoingPests.length,
      icon: <Bug size={22} />,
      emoji: "🐛",
      color: "from-amber-400 to-amber-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "健康率",
      value: `${healthRate}%`,
      icon: <TrendingUp size={22} />,
      emoji: "✨",
      color: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">🌿 欢迎回来</h1>
          <p className="page-subtitle">今天是 {today()}，来看看你的植物们吧</p>
        </div>
        <Link to="/care-logs/new" className="btn-primary">
          <Plus size={18} />
          记录养护
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`card card-hover p-5 animate-fade-in-up opacity-0 stagger-${i + 1}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-forest-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-forest-900 font-serif">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center`}
              >
                <span className="text-2xl">{stat.emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2 animate-fade-in-up opacity-0 stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-forest-900 font-serif">
              📈 近两周养护趋势
            </h3>
            <Link to="/care-logs" className="text-sm text-forest-600 hover:text-forest-800 flex items-center gap-1">
              查看全部 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={careStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFert" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8CB369" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8CB369" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2efd7" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#517c39" }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={{ stroke: "#c5dfb1" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#517c39" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #c5dfb1",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "watering" ? "浇水" : name === "fertilizing" ? "施肥" : "光照",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="watering"
                  stroke="#60a5fa"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWater)"
                  name="watering"
                />
                <Area
                  type="monotone"
                  dataKey="fertilizing"
                  stroke="#8CB369"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorFert)"
                  name="fertilizing"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 animate-fade-in-up opacity-0 stagger-4">
          <h3 className="font-bold text-forest-900 font-serif mb-4">
            🗂️ 植物分类分布
          </h3>
          <div className="h-48">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #c5dfb1",
                      borderRadius: "12px",
                      fontSize: "13px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-forest-400 text-sm">
                暂无数据
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {categoryData.map((c, i) => (
              <span
                key={c.name}
                className="tag bg-forest-50 text-forest-700"
                style={{ borderLeft: `3px solid ${COLORS[i % COLORS.length]}` }}
              >
                {c.name} · {c.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 animate-fade-in-up opacity-0 stagger-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-forest-600" size={18} />
            <h3 className="font-bold text-forest-900 font-serif">最近活动</h3>
          </div>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((a) => (
                <div
                  key={a.type + a.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-forest-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-lg flex-shrink-0">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest-800">
                      {getPlantName(a.plantId)}
                      <span className="text-forest-500 mx-1">·</span>
                      {a.label}
                    </p>
                    <p className="text-xs text-forest-500">
                      {getRelativeTime(a.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-forest-400 text-sm">
              暂无活动记录
            </div>
          )}
        </div>

        <div className="card p-5 animate-fade-in-up opacity-0 stagger-6">
          <div className="flex items-center gap-2 mb-4">
            {plantsNeedingCare.length > 0 ? (
              <AlertCircle className="text-amber-500" size={18} />
            ) : (
              <Sparkles className="text-forest-600" size={18} />
            )}
            <h3 className="font-bold text-forest-900 font-serif">
              {plantsNeedingCare.length > 0 ? "养护提醒" : "植物状态良好"}
            </h3>
          </div>
          {plantsNeedingCare.length > 0 ? (
            <div className="space-y-3">
              {plantsNeedingCare.map((p) => {
                const status = getPlantHealthStatus(p, careLogs, pestRecords);
                return (
                  <Link
                    key={p.id}
                    to={`/plants/${p.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-forest-50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-forest-50 flex items-center justify-center text-2xl">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-forest-800">{p.name}</p>
                        <span
                          className={`w-2 h-2 rounded-full ${getHealthStatusColor(status)}`}
                        />
                        <span className="text-xs text-forest-500">
                          {getHealthStatusLabel(status)}
                        </span>
                      </div>
                      <p className="text-xs text-forest-500">需要浇水 · {p.location}</p>
                    </div>
                    <ChevronRight size={16} className="text-forest-400" />
                  </Link>
                );
              })}
              <Link to="/care-logs/new" className="btn-secondary w-full mt-2">
                <Plus size={16} />
                批量记录养护
              </Link>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="text-5xl mb-3 animate-float">🌱</div>
              <p className="text-sm text-forest-500">所有植物状态良好～</p>
              <p className="text-xs text-forest-400 mt-1">继续保持！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
