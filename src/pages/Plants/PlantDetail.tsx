import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Droplets,
  Sun,
  Leaf,
  Bug,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { useAppStore } from "@/store";
import { formatDate, getRelativeTime } from "@/utils/format";
import {
  CARE_TYPE_LABELS,
  CARE_TYPE_ICONS,
  LEAF_COLOR_LABELS,
  PEST_STATUS_LABELS,
} from "@/types";
import {
  getPlantHealthStatus,
  getHealthStatusColor,
  getHealthStatusLabel,
} from "@/utils/helpers";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const plant = useAppStore((s) => (id ? s.getPlantById(id) : undefined));
  const careLogs = useAppStore((s) => (id ? s.getCareLogsByPlant(id) : []));
  const leafRecords = useAppStore((s) => (id ? s.getLeafRecordsByPlant(id) : []));
  const pestRecords = useAppStore((s) => (id ? s.getPestRecordsByPlant(id) : []));
  const deletePlant = useAppStore((s) => s.deletePlant);
  const allCareLogs = useAppStore((s) => s.careLogs);
  const allPestRecords = useAppStore((s) => s.pestRecords);

  if (!plant) {
    return (
      <div className="card p-16 text-center">
        <p className="text-forest-500">植物不存在</p>
        <Link to="/plants" className="btn-secondary mt-4">
          返回列表
        </Link>
      </div>
    );
  }

  const health = getPlantHealthStatus(plant, allCareLogs, allPestRecords);

  const chartData = careLogs
    .slice()
    .reverse()
    .slice(-14)
    .reduce((acc, log) => {
      const existing = acc.find((d) => d.date === log.date);
      if (existing) {
        existing[log.type] = (existing[log.type] || 0) + 1;
      } else {
        acc.push({
          date: log.date.slice(5),
          watering: log.type === "watering" ? 1 : 0,
          fertilizing: log.type === "fertilizing" ? 1 : 0,
          lighting: log.type === "lighting" ? 1 : 0,
        });
      }
      return acc;
    }, [] as Array<{ date: string; watering: number; fertilizing: number; lighting: number }>);

  const handleDelete = () => {
    if (confirm(`确定删除「${plant.name}」吗？`)) {
      deletePlant(plant.id);
      window.location.href = "/plants";
    }
  };

  const allRecords = [
    ...careLogs.map((l) => ({
      kind: "care" as const,
      id: l.id,
      date: l.date,
      icon: CARE_TYPE_ICONS[l.type],
      title: CARE_TYPE_LABELS[l.type],
      desc:
        l.type === "watering"
          ? `浇水 ${l.amount || "-"}ml`
          : l.type === "fertilizing"
          ? `施肥 ${l.fertilizerType || ""}`
          : `光照 ${l.lightDuration || "-"}小时`,
    })),
    ...leafRecords.map((l) => ({
      kind: "leaf" as const,
      id: l.id,
      date: l.date,
      icon: "🍃",
      title: "叶片观察",
      desc: `${LEAF_COLOR_LABELS[l.colorStatus]}${l.notes ? " · " + l.notes.slice(0, 20) : ""}`,
    })),
    ...pestRecords.map((p) => ({
      kind: "pest" as const,
      id: p.id,
      date: p.discoveredDate,
      icon: p.type === "disease" ? "🦠" : "🐛",
      title: p.name,
      desc: `${PEST_STATUS_LABELS[p.status]} · ${p.symptoms.slice(0, 20)}`,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link to="/plants" className="btn-ghost p-2">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-50 to-cream-100 flex items-center justify-center text-4xl">
            {plant.avatar}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-forest-900 font-serif">
                {plant.name}
              </h1>
              <span className={`tag ${getHealthStatusColor(health)} text-white`}>
                {getHealthStatusLabel(health)}
              </span>
            </div>
            <p className="text-sm text-forest-500 mt-1">{plant.species}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/plants/${plant.id}/edit`} className="btn-secondary">
            <Edit2 size={16} />
            编辑
          </Link>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 size={16} />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2 text-forest-600">
              <Leaf size={16} className="text-forest-500" />
              {plant.category}
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <MapPin size={16} className="text-forest-500" />
              {plant.location || "未设置位置"}
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <CalendarDays size={16} className="text-forest-500" />
              种植于 {formatDate(plant.plantedDate)}
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <Droplets size={16} className="text-forest-500" />
              养护记录 {careLogs.length} 条
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <Bug size={16} className="text-forest-500" />
              病虫害 {pestRecords.length} 条
            </div>
          </div>
          {plant.notes && (
            <div className="mt-4 p-4 bg-cream-50 rounded-xl border border-cream-200">
              <p className="text-sm text-forest-700 leading-relaxed">📝 {plant.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 flex flex-col gap-3">
          <h4 className="font-bold text-forest-800 text-sm mb-1">快捷操作</h4>
          <Link
            to={{ pathname: "/care-logs/new", search: `?plantId=${plant.id}` }}
            className="btn-primary w-full justify-center"
          >
            <Plus size={16} />
            记录养护
          </Link>
          <Link
            to={{ pathname: "/leaves/new", search: `?plantId=${plant.id}` }}
            className="btn-secondary w-full justify-center"
          >
            <Leaf size={16} />
            叶片观察
          </Link>
          <Link
            to={{ pathname: "/pests/new", search: `?plantId=${plant.id}` }}
            className="btn-secondary w-full justify-center"
          >
            <Bug size={16} />
            记录病虫害
          </Link>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-forest-900 font-serif mb-4">📈 养护趋势</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2efd7" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#517c39" }}
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
                  formatter={(v: number, n: string) => [
                    v,
                    n === "watering" ? "浇水" : n === "fertilizing" ? "施肥" : "光照",
                  ]}
                />
                <Line type="monotone" dataKey="watering" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3 }} name="watering" />
                <Line type="monotone" dataKey="fertilizing" stroke="#8CB369" strokeWidth={2.5} dot={{ r: 3 }} name="fertilizing" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-bold text-forest-900 font-serif mb-4">📋 记录时间线</h3>
        {allRecords.length > 0 ? (
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-forest-100" />
            {allRecords.map((r, i) => (
              <div
                key={r.kind + r.id}
                className={`relative pb-5 ${i === allRecords.length - 1 ? "pb-0" : ""}`}
              >
                <div
                  className={`absolute -left-[18px] top-1 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white shadow ${
                    r.kind === "pest"
                      ? "bg-amber-100"
                      : r.kind === "leaf"
                      ? "bg-emerald-100"
                      : "bg-sky-100"
                  }`}
                >
                  {r.icon}
                </div>
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-forest-800 text-sm">
                      {r.title}
                    </span>
                    <span className="text-xs text-forest-400">
                      {getRelativeTime(r.date)}
                    </span>
                  </div>
                  <p className="text-sm text-forest-600 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-forest-400 text-sm">
            还没有任何记录，开始记录吧～
          </div>
        )}
      </div>
    </div>
  );
}
