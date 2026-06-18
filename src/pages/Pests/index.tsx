import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Filter, Bug, CheckCircle, Clock } from "lucide-react";
import { useAppStore } from "@/store";
import {
  SEVERITY_LABELS,
  PEST_TYPE_LABELS,
  PEST_STATUS_LABELS,
} from "@/types";
import { formatDate, getRelativeTime } from "@/utils/format";

export function Pests() {
  const [searchParams] = useSearchParams();
  const plants = useAppStore((s) => s.plants);
  const pestRecords = useAppStore((s) => s.pestRecords);
  const deletePestRecord = useAppStore((s) => s.deletePestRecord);

  const [statusFilter, setStatusFilter] = useState("全部");
  const [plantFilter, setPlantFilter] = useState(searchParams.get("plantId") || "全部");
  const [typeFilter, setTypeFilter] = useState("全部");

  const filtered = useMemo(() => {
    return pestRecords.filter((p) => {
      const matchStatus = statusFilter === "全部" || p.status === statusFilter;
      const matchPlant = plantFilter === "全部" || p.plantId === plantFilter;
      const matchType = typeFilter === "全部" || p.type === typeFilter;
      return matchStatus && matchPlant && matchType;
    });
  }, [pestRecords, statusFilter, plantFilter, typeFilter]);

  const getPlantName = (id: string) => plants.find((p) => p.id === id)?.name || "未知";
  const getPlantAvatar = (id: string) => plants.find((p) => p.id === id)?.avatar || "🌿";

  const severityBg: Record<string, string> = {
    low: "bg-amber-100 text-amber-700",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
  };

  const handleDelete = (id: string) => {
    if (confirm("确定删除这条病虫害记录吗？")) deletePestRecord(id);
  };

  const ongoing = pestRecords.filter((p) => p.status === "ongoing").length;
  const resolved = pestRecords.filter((p) => p.status === "resolved").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">🐛 病虫害管理</h1>
          <p className="page-subtitle">
            {pestRecords.length} 条记录 · 进行中 {ongoing} · 已解决 {resolved}
          </p>
        </div>
        <Link to="/pests/new" className="btn-primary">
          <Plus size={18} />
          记录病虫害
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="text-amber-500" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-forest-900 font-serif">{ongoing}</p>
            <p className="text-sm text-forest-500">处理中</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="text-emerald-500" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-forest-900 font-serif">{resolved}</p>
            <p className="text-sm text-forest-500">已解决</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center gap-y-3">
          <Filter size={16} className="text-forest-500" />
          <div className="flex flex-wrap gap-2">
            {["全部", "ongoing", "resolved"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  statusFilter === s
                    ? "bg-forest-700 text-white"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                }`}
              >
                {s === "全部" ? "全部状态" : PEST_STATUS_LABELS[s as keyof typeof PEST_STATUS_LABELS]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["全部", "disease", "pest"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  typeFilter === t
                    ? "bg-forest-700 text-white"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                }`}
              >
                {t === "全部" ? "全部类型" : PEST_TYPE_LABELS[t as keyof typeof PEST_TYPE_LABELS]}
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
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className={`card p-5 animate-fade-in-up opacity-0 stagger-${Math.min((i % 6) + 1, 6)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{p.type === "disease" ? "🦠" : "🐛"}</span>
                    <h3 className="font-bold text-forest-900 font-serif">{p.name}</h3>
                    <span className={`tag ${severityBg[p.severity]}`}>
                      {SEVERITY_LABELS[p.severity]}
                    </span>
                    <span
                      className={`tag ${
                        p.status === "ongoing"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {PEST_STATUS_LABELS[p.status]}
                    </span>
                    <span className="tag bg-forest-50 text-forest-700">
                      {PEST_TYPE_LABELS[p.type]}
                    </span>
                  </div>
                  <Link
                    to={`/plants/${p.plantId}`}
                    className="text-sm text-forest-600 hover:text-forest-800 mt-2 inline-flex items-center gap-1"
                  >
                    {getPlantAvatar(p.plantId)} {getPlantName(p.plantId)}
                  </Link>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-forest-50 rounded-xl">
                      <p className="text-xs text-forest-500 mb-1">症状描述</p>
                      <p className="text-forest-800">{p.symptoms || "-"}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <p className="text-xs text-amber-600 mb-1">防治方法</p>
                      <p className="text-amber-800">{p.treatmentMethod || "-"}</p>
                    </div>
                    {p.treatmentEffect && (
                      <div className="p-3 bg-emerald-50 rounded-xl sm:col-span-2">
                        <p className="text-xs text-emerald-600 mb-1">处理效果</p>
                        <p className="text-emerald-800">{p.treatmentEffect}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-forest-400 flex-wrap">
                    <span>发现: {formatDate(p.discoveredDate)}</span>
                    <span>·</span>
                    <span>{getRelativeTime(p.discoveredDate)}</span>
                    {p.resolvedDate && (
                      <>
                        <span>·</span>
                        <span>解决: {formatDate(p.resolvedDate)}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors flex-shrink-0"
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
            <Bug className="inline text-forest-300" size={60} />
          </div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            {pestRecords.length === 0 ? "暂无病虫害记录" : "没有符合条件的记录"}
          </h3>
          <p className="text-sm text-forest-500 mb-6">
            {pestRecords.length === 0
              ? "发现病虫害时及时记录，跟踪防治效果"
              : "调整筛选条件试试"}
          </p>
          {pestRecords.length === 0 && (
            <Link to="/pests/new" className="btn-primary">
              <Plus size={18} />
              添加记录
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
