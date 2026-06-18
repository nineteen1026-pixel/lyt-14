import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Filter, Droplets, Sun } from "lucide-react";
import { useAppStore } from "@/store";
import {
  CARE_TYPE_LABELS,
  CARE_TYPE_ICONS,
  LIGHT_INTENSITY_LABELS,
} from "@/types";
import { formatDate, getRelativeTime } from "@/utils/format";

export function CareLogs() {
  const [searchParams] = useSearchParams();
  const plants = useAppStore((s) => s.plants);
  const careLogs = useAppStore((s) => s.careLogs);
  const deleteCareLog = useAppStore((s) => s.deleteCareLog);

  const [typeFilter, setTypeFilter] = useState("全部");
  const [plantFilter, setPlantFilter] = useState(searchParams.get("plantId") || "全部");

  const filtered = useMemo(() => {
    return careLogs.filter((l) => {
      const matchType = typeFilter === "全部" || l.type === typeFilter;
      const matchPlant = plantFilter === "全部" || l.plantId === plantFilter;
      return matchType && matchPlant;
    });
  }, [careLogs, typeFilter, plantFilter]);

  const getPlantName = (id: string) => plants.find((p) => p.id === id)?.name || "未知";
  const getPlantAvatar = (id: string) => plants.find((p) => p.id === id)?.avatar || "🌿";

  const handleDelete = (id: string) => {
    if (confirm("确定删除这条养护记录吗？")) deleteCareLog(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">💧 养护日志</h1>
          <p className="page-subtitle">共 {careLogs.length} 条养护记录</p>
        </div>
        <Link to="/care-logs/new" className="btn-primary">
          <Plus size={18} />
          记录养护
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter size={16} className="text-forest-500" />
          <div className="flex flex-wrap gap-2">
            {["全部", "watering", "fertilizing", "lighting"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  typeFilter === t
                    ? "bg-forest-700 text-white"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                }`}
              >
                {t === "全部" ? "全部" : CARE_TYPE_LABELS[t as keyof typeof CARE_TYPE_LABELS]}
              </button>
            ))}
          </div>
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="select-field sm:ml-auto sm:w-auto"
          >
            <option value="全部">全部植物</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((log, i) => (
            <div
              key={log.id}
              className={`card p-4 flex items-center gap-4 animate-fade-in-up opacity-0 stagger-${Math.min((i % 6) + 1, 6)}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  log.type === "watering"
                    ? "bg-sky-50"
                    : log.type === "fertilizing"
                    ? "bg-forest-50"
                    : "bg-amber-50"
                }`}
              >
                {CARE_TYPE_ICONS[log.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/plants/${log.plantId}`}
                    className="font-medium text-forest-800 hover:text-forest-900 flex items-center gap-1.5"
                  >
                    <span>{getPlantAvatar(log.plantId)}</span>
                    {getPlantName(log.plantId)}
                  </Link>
                  <span className="tag bg-forest-50 text-forest-700">
                    {CARE_TYPE_LABELS[log.type]}
                  </span>
                </div>
                <div className="text-sm text-forest-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {log.type === "watering" && (
                    <span>💧 浇水量: {log.amount || "-"} ml</span>
                  )}
                  {log.type === "fertilizing" && (
                    <span>🌾 肥料: {log.fertilizerType || "-"} {log.amount ? `· ${log.amount}g` : ""}</span>
                  )}
                  {log.type === "lighting" && (
                    <span>
                      <Sun size={12} className="inline" /> 光照: {log.lightDuration || "-"}小时 ·{" "}
                      {log.lightIntensity ? LIGHT_INTENSITY_LABELS[log.lightIntensity] : ""}
                    </span>
                  )}
                  {log.notes && <span>📝 {log.notes}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm text-forest-700">{formatDate(log.date)}</p>
                  <p className="text-xs text-forest-400">{getRelativeTime(log.date)}</p>
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">
            <Droplets className="inline text-sky-300" size={60} />
          </div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            {careLogs.length === 0 ? "还没有养护记录" : "没有符合条件的记录"}
          </h3>
          <p className="text-sm text-forest-500 mb-6">
            {careLogs.length === 0 ? "开始记录你的植物养护吧～" : "调整筛选条件试试"}
          </p>
          {careLogs.length === 0 && (
            <Link to="/care-logs/new" className="btn-primary">
              <Plus size={18} />
              添加记录
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
