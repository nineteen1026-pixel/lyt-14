import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Droplets,
  Leaf,
  Bug,
  CalendarDays,
  MapPin,
  Activity,
} from "lucide-react";
import { useAppStore } from "@/store";
import { formatDate } from "@/utils/format";
import {
  getPlantHealthStatus,
  getHealthStatusColor,
  getHealthStatusLabel,
  calculatePlantHealthScore,
} from "@/utils/helpers";
import { HEALTH_LEVEL_LABELS, HEALTH_LEVEL_COLORS } from "@/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PlantTimeline } from "@/components/PlantTimeline";
import { HealthRating } from "@/components/HealthRating";

export function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const plants = useAppStore((s) => s.plants);
  const allCareLogs = useAppStore((s) => s.careLogs);
  const allLeafRecords = useAppStore((s) => s.leafRecords);
  const allPestRecords = useAppStore((s) => s.pestRecords);
  const deletePlant = useAppStore((s) => s.deletePlant);

  const plant = plants.find((p) => p.id === id);
  const careLogs = useMemo(
    () =>
      allCareLogs
        .filter((l) => l.plantId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [allCareLogs, id]
  );
  const leafRecords = useMemo(
    () =>
      allLeafRecords
        .filter((l) => l.plantId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [allLeafRecords, id]
  );
  const pestRecords = useMemo(
    () =>
      allPestRecords
        .filter((p) => p.plantId === id)
        .sort((a, b) => b.discoveredDate.localeCompare(a.discoveredDate)),
    [allPestRecords, id]
  );

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
  const healthScore = calculatePlantHealthScore(
    plant,
    allCareLogs,
    allLeafRecords,
    allPestRecords
  );

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
            <div className="mt-2">
              <HealthRating score={healthScore} size="md" showScore />
            </div>
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

      <div className="card p-5">
        <h3 className="font-bold text-forest-900 font-serif mb-4 flex items-center gap-2">
          <Activity size={18} className="text-forest-500" />
          健康评分分析
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-forest-50 rounded-xl">
            <div className={`text-3xl font-bold ${HEALTH_LEVEL_COLORS[healthScore.level]}`}>
              {healthScore.total}
            </div>
            <div className="text-sm text-forest-600 mt-1">综合评分</div>
            <div className="flex justify-center mt-2">
              <HealthRating score={healthScore} size="sm" showLabel={false} />
            </div>
          </div>
          <div className="text-center p-4 bg-sky-50 rounded-xl">
            <div className="text-3xl font-bold text-sky-600">
              {healthScore.careScore}
            </div>
            <div className="text-sm text-sky-700 mt-1">养护频率</div>
            <div className="mt-2 h-2 bg-sky-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${healthScore.careScore}%` }}
              />
            </div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-3xl font-bold text-emerald-600">
              {healthScore.leafScore}
            </div>
            <div className="text-sm text-emerald-700 mt-1">叶片状态</div>
            <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${healthScore.leafScore}%` }}
              />
            </div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <div className="text-3xl font-bold text-amber-600">
              {healthScore.pestScore}
            </div>
            <div className="text-sm text-amber-700 mt-1">病虫害</div>
            <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${healthScore.pestScore}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-cream-50 rounded-xl border border-cream-200">
          <p className="text-sm text-forest-700">
            <span className="font-semibold">健康等级：</span>
            <span className={HEALTH_LEVEL_COLORS[healthScore.level]}>
              {HEALTH_LEVEL_LABELS[healthScore.level]}
            </span>
            <span className="text-forest-500 ml-2">
              {healthScore.level === "excellent" && "植物状态非常好，继续保持！"}
              {healthScore.level === "good" && "植物状态良好，定期养护很重要。"}
              {healthScore.level === "fair" && "植物状态一般，需要加强养护。"}
              {healthScore.level === "poor" && "植物状态较差，建议及时检查。"}
              {healthScore.level === "critical" && "植物状态危险，请立即采取措施！"}
            </span>
          </p>
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

      <PlantTimeline
        plantId={plant.id}
        careLogs={careLogs}
        leafRecords={leafRecords}
        pestRecords={pestRecords}
      />
    </div>
  );
}
