import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  GitCompareArrows,
  Check,
  Plus,
  X,
  Droplets,
  Sun,
  FlaskConical,
  Bug,
  ShieldCheck,
  Leaf,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CalendarClock,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAppStore } from "@/store";
import { calculatePlantHealthScore } from "@/utils/helpers";
import {
  SEVERITY_LABELS,
  PEST_STATUS_LABELS,
  HEALTH_LEVEL_LABELS,
  HEALTH_LEVEL_COLORS,
  type Plant,
  type PlantHealthScore,
} from "@/types";

const COMPARE_COLORS = [
  { main: "#4d7c3b", bg: "bg-forest-600", light: "bg-forest-50", text: "text-forest-700", border: "border-forest-200", chart: "#4d7c3b" },
  { main: "#3b82f6", bg: "bg-sky-600", light: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", chart: "#3b82f6" },
  { main: "#f59e0b", bg: "bg-amber-600", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", chart: "#f59e0b" },
  { main: "#ef4444", bg: "bg-red-600", light: "bg-red-50", text: "text-red-700", border: "border-red-200", chart: "#ef4444" },
  { main: "#8b5cf6", bg: "bg-violet-600", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", chart: "#8b5cf6" },
];

interface PlantCompareData {
  plant: Plant;
  health: PlantHealthScore;
  wateringCount30d: number;
  fertilizingCount30d: number;
  lightingCount30d: number;
  wateringAvgAmount: number;
  fertilizingAvgAmount: number;
  lightingAvgDuration: number;
  activePestCount: number;
  resolvedPestCount: number;
  pestRecords: { name: string; type: "disease" | "pest"; severity: "low" | "medium" | "high"; status: "ongoing" | "resolved"; discoveredDate: string }[];
}

export function PlantCompare() {
  const plants = useAppStore((s) => s.plants);
  const careLogs = useAppStore((s) => s.careLogs);
  const leafRecords = useAppStore((s) => s.leafRecords);
  const pestRecords = useAppStore((s) => s.pestRecords);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);
  const [expandedPest, setExpandedPest] = useState<string | null>(null);

  const togglePlant = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const removePlant = (id: string) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const compareData = useMemo<PlantCompareData[]>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return selectedIds
      .map((id) => {
        const plant = plants.find((p) => p.id === id);
        if (!plant) return null;

        const health = calculatePlantHealthScore(plant, careLogs, leafRecords, pestRecords);
        const plantLogs = careLogs.filter((l) => {
          if (l.plantId !== id) return false;
          const d = new Date(l.date);
          return d >= thirtyDaysAgo && d <= now;
        });

        const wateringLogs = plantLogs.filter((l) => l.type === "watering");
        const fertilizingLogs = plantLogs.filter((l) => l.type === "fertilizing");
        const lightingLogs = plantLogs.filter((l) => l.type === "lighting");

        const plantPests = pestRecords.filter((p) => p.plantId === id);
        const activePests = plantPests.filter((p) => p.status === "ongoing");
        const resolvedPests = plantPests.filter((p) => p.status === "resolved");

        return {
          plant,
          health,
          wateringCount30d: wateringLogs.length,
          fertilizingCount30d: fertilizingLogs.length,
          lightingCount30d: lightingLogs.length,
          wateringAvgAmount: wateringLogs.length > 0
            ? Math.round(wateringLogs.reduce((s, l) => s + (l.amount || 0), 0) / wateringLogs.length)
            : 0,
          fertilizingAvgAmount: fertilizingLogs.length > 0
            ? Math.round(fertilizingLogs.reduce((s, l) => s + (l.amount || 0), 0) / fertilizingLogs.length)
            : 0,
          lightingAvgDuration: lightingLogs.length > 0
            ? Math.round(lightingLogs.reduce((s, l) => s + (l.lightDuration || 0), 0) / lightingLogs.length * 10) / 10
            : 0,
          activePestCount: activePests.length,
          resolvedPestCount: resolvedPests.length,
          pestRecords: plantPests.map((p) => ({
            name: p.name,
            type: p.type,
            severity: p.severity,
            status: p.status,
            discoveredDate: p.discoveredDate,
          })),
        };
      })
      .filter(Boolean) as PlantCompareData[];
  }, [selectedIds, plants, careLogs, leafRecords, pestRecords]);

  const radarData = useMemo(() => {
    if (compareData.length === 0) return [];
    return [
      { metric: "养护评分", ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, d.health.careScore])) },
      { metric: "叶片评分", ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, d.health.leafScore])) },
      { metric: "病虫害评分", ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, d.health.pestScore])) },
      { metric: "浇水频率", ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, Math.min(d.wateringCount30d * 10, 100)])) },
      { metric: "施肥频率", ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, Math.min(d.fertilizingCount30d * 20, 100)])) },
      { metric: "光照记录", ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, Math.min(d.lightingCount30d * 15, 100)])) },
    ];
  }, [compareData]);

  const barData = useMemo(() => {
    return [
      {
        name: "浇水",
        ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, d.wateringCount30d])),
      },
      {
        name: "施肥",
        ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, d.fertilizingCount30d])),
      },
      {
        name: "光照",
        ...Object.fromEntries(compareData.map((d, i) => [`plant${i}`, d.lightingCount30d])),
      },
    ];
  }, [compareData]);

  const suggestions = useMemo(() => {
    if (compareData.length < 2) return [];
    const result: string[] = [];

    const sorted = [...compareData].sort((a, b) => a.health.total - b.health.total);
    const worst = sorted[0];
    const best = sorted[sorted.length - 1];

    if (worst.health.total < best.health.total - 15) {
      result.push(`${worst.plant.name}的综合健康评分(${worst.health.total})远低于${best.plant.name}(${best.health.total})，建议参考${best.plant.name}的养护频率进行调整。`);
    }

    compareData.forEach((d) => {
      if (d.wateringCount30d < 3) {
        result.push(`${d.plant.name}近30天仅浇水${d.wateringCount30d}次，频率偏低，可能影响健康状态。`);
      }
      if (d.fertilizingCount30d === 0) {
        result.push(`${d.plant.name}近30天无施肥记录，建议根据品种需求定期施肥。`);
      }
      if (d.activePestCount > 0) {
        result.push(`${d.plant.name}有${d.activePestCount}项未解决的病虫害，需优先处理以防扩散。`);
      }
    });

    const highWater = compareData.filter((d) => d.wateringCount30d >= 6);
    const lowWater = compareData.filter((d) => d.wateringCount30d <= 2);
    if (highWater.length > 0 && lowWater.length > 0) {
      result.push("浇水频率差异较大，不同品种的需水量不同，建议按品种制定差异化浇水计划。");
    }

    const diseasePlants = compareData.filter((d) => d.activePestCount > 0);
    if (diseasePlants.length >= 2) {
      result.push("多株植物同时出现病虫害，可能存在环境问题（通风不良/湿度过高），建议检查养护环境。");
    }

    return result;
  }, [compareData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">🔬 植物对比分析</h1>
          <p className="page-subtitle">选取多株植物并排对比，辅助养护策略调整</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={18} className="text-forest-600" />
            <h3 className="font-bold text-forest-900 font-serif">选择对比植物</h3>
            <span className="tag bg-forest-50 text-forest-700">
              {selectedIds.length}/5 株已选
            </span>
          </div>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="btn-secondary text-xs py-2"
          >
            {showSelector ? "收起" : "选择植物"}
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIds.map((id, i) => {
              const plant = plants.find((p) => p.id === id);
              if (!plant) return null;
              const color = COMPARE_COLORS[i];
              return (
                <div
                  key={id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${color.light} ${color.text} ${color.border} text-sm font-medium animate-fade-in-up opacity-0`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.main }} />
                  <span>{plant.avatar} {plant.name}</span>
                  <button
                    onClick={() => removePlant(id)}
                    className="ml-0.5 hover:opacity-70 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showSelector && (
          <div className="border border-forest-100 rounded-xl p-4 bg-forest-50/30 animate-fade-in-up">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {plants.map((plant) => {
                const isSelected = selectedIds.includes(plant.id);
                const idx = selectedIds.indexOf(plant.id);
                const color = isSelected ? COMPARE_COLORS[idx] : null;
                return (
                  <button
                    key={plant.id}
                    onClick={() => togglePlant(plant.id)}
                    disabled={!isSelected && selectedIds.length >= 5}
                    className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? `${color!.light} ${color!.text} ${color!.border} shadow-sm`
                        : "bg-white border-forest-100 hover:border-forest-300 text-forest-700 hover:bg-forest-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{plant.avatar}</span>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: color!.main }}
                        >
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1 truncate">{plant.name}</p>
                    <p className="text-xs opacity-60 truncate">{plant.category}</p>
                  </button>
                );
              })}
            </div>
            {plants.length === 0 && (
              <div className="py-8 text-center text-forest-400 text-sm">
                暂无植物，请先添加植物
              </div>
            )}
          </div>
        )}
      </div>

      {compareData.length === 0 && (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4 animate-float">🔬</div>
          <h3 className="text-lg font-bold text-forest-800 font-serif mb-2">
            开始对比分析
          </h3>
          <p className="text-sm text-forest-500 max-w-md mx-auto">
            选择 2-5 株植物，系统将为你展示养护频率、健康评分和病虫害数据的并排对比，帮助你调整养护策略。
          </p>
          <button
            onClick={() => setShowSelector(true)}
            className="btn-primary mt-5"
          >
            <Plus size={16} />
            选择植物
          </button>
        </div>
      )}

      {compareData.length >= 2 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5 animate-fade-in-up opacity-0 stagger-1">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-forest-600" />
                <h3 className="font-bold text-forest-900 font-serif">健康评分雷达图</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#c5dfb1" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fontSize: 12, fill: "#517c39" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#8CB369" }}
                    />
                    {compareData.map((_, i) => (
                      <Radar
                        key={i}
                        name={compareData[i].plant.name}
                        dataKey={`plant${i}`}
                        stroke={COMPARE_COLORS[i].main}
                        fill={COMPARE_COLORS[i].main}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value: string) => (
                        <span style={{ color: "#517c39" }}>{value}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #c5dfb1",
                        borderRadius: "12px",
                        fontSize: "13px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5 animate-fade-in-up opacity-0 stagger-2">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={18} className="text-sky-600" />
                <h3 className="font-bold text-forest-900 font-serif">养护频率对比（近30天）</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2efd7" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#517c39" }}
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
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {compareData.map((_, i) => (
                      <Bar
                        key={i}
                        dataKey={`plant${i}`}
                        name={compareData[i].plant.name}
                        fill={COMPARE_COLORS[i].main}
                        radius={[4, 4, 0, 0]}
                        barSize={Math.max(12, 36 / compareData.length)}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up opacity-0 stagger-3">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-forest-600" />
              <h3 className="font-bold text-forest-900 font-serif">健康评分对比</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {compareData.map((data, i) => {
                const color = COMPARE_COLORS[i];
                return (
                  <div key={data.plant.id} className={`card p-5 border-l-4 ${color.border} animate-fade-in-up opacity-0`} style={{ borderLeftColor: color.main, animationDelay: `${i * 0.08}s` }}>
                    <div className="flex items-center gap-3 mb-4">
                      <Link to={`/plants/${data.plant.id}`} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform" style={{ backgroundColor: `${color.main}15` }}>
                        {data.plant.avatar}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/plants/${data.plant.id}`} className="font-bold text-forest-900 font-serif truncate hover:underline">{data.plant.name}</Link>
                        <p className="text-xs text-forest-500 truncate">{data.plant.category} · {data.plant.location}</p>
                      </div>
                      <Link to={`/care-plans`} className="p-1.5 rounded-lg hover:bg-forest-50 text-forest-400 hover:text-forest-600 transition-colors" title="养护计划">
                        <CalendarClock size={14} />
                      </Link>
                    </div>

                    <div className="text-center mb-4">
                      <div className="relative w-20 h-20 mx-auto mb-2">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e2efd7"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={color.main}
                            strokeWidth="3"
                            strokeDasharray={`${data.health.total}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-forest-900 font-serif">{data.health.total}</span>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${HEALTH_LEVEL_COLORS[data.health.level]}`}>
                        {HEALTH_LEVEL_LABELS[data.health.level]}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <ScoreBar label="养护" icon={<Droplets size={12} />} score={data.health.careScore} color={color.main} />
                      <ScoreBar label="叶片" icon={<Leaf size={12} />} score={data.health.leafScore} color={color.main} />
                      <ScoreBar label="病虫害" icon={<Bug size={12} />} score={data.health.pestScore} color={color.main} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="animate-fade-in-up opacity-0 stagger-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplets size={18} className="text-sky-600" />
              <h3 className="font-bold text-forest-900 font-serif">养护频率详情</h3>
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-forest-50/50 border-b border-forest-100">
                      <th className="text-left py-3 px-4 font-semibold text-forest-800">指标</th>
                      {compareData.map((d, i) => (
                        <th key={d.plant.id} className="text-center py-3 px-4 font-semibold" style={{ color: COMPARE_COLORS[i].main }}>
                          {d.plant.avatar} {d.plant.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-forest-50">
                      <td className="py-3 px-4 text-forest-600 flex items-center gap-2"><Droplets size={14} className="text-sky-500" /> 浇水次数</td>
                      {compareData.map((d, i) => {
                        const max = Math.max(...compareData.map((x) => x.wateringCount30d));
                        const isMax = d.wateringCount30d === max && max > 0;
                        return (
                          <td key={d.plant.id} className={`text-center py-3 px-4 font-medium ${isMax ? "font-bold" : ""}`} style={{ color: isMax ? COMPARE_COLORS[i].main : undefined }}>
                            {d.wateringCount30d}次
                            {isMax && <span className="text-xs ml-1">🏆</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-forest-50 bg-forest-50/20">
                      <td className="py-3 px-4 text-forest-600 pl-8">平均浇水量</td>
                      {compareData.map((d) => (
                        <td key={d.plant.id} className="text-center py-3 px-4 text-forest-700">
                          {d.wateringAvgAmount > 0 ? `${d.wateringAvgAmount}ml` : "-"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-forest-50">
                      <td className="py-3 px-4 text-forest-600 flex items-center gap-2"><FlaskConical size={14} className="text-forest-500" /> 施肥次数</td>
                      {compareData.map((d, i) => {
                        const max = Math.max(...compareData.map((x) => x.fertilizingCount30d));
                        const isMax = d.fertilizingCount30d === max && max > 0;
                        return (
                          <td key={d.plant.id} className={`text-center py-3 px-4 font-medium ${isMax ? "font-bold" : ""}`} style={{ color: isMax ? COMPARE_COLORS[i].main : undefined }}>
                            {d.fertilizingCount30d}次
                            {isMax && <span className="text-xs ml-1">🏆</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-forest-50 bg-forest-50/20">
                      <td className="py-3 px-4 text-forest-600 pl-8">平均施肥量</td>
                      {compareData.map((d) => (
                        <td key={d.plant.id} className="text-center py-3 px-4 text-forest-700">
                          {d.fertilizingAvgAmount > 0 ? `${d.fertilizingAvgAmount}g` : "-"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-forest-50">
                      <td className="py-3 px-4 text-forest-600 flex items-center gap-2"><Sun size={14} className="text-amber-500" /> 光照记录</td>
                      {compareData.map((d, i) => {
                        const max = Math.max(...compareData.map((x) => x.lightingCount30d));
                        const isMax = d.lightingCount30d === max && max > 0;
                        return (
                          <td key={d.plant.id} className={`text-center py-3 px-4 font-medium ${isMax ? "font-bold" : ""}`} style={{ color: isMax ? COMPARE_COLORS[i].main : undefined }}>
                            {d.lightingCount30d}次
                            {isMax && <span className="text-xs ml-1">🏆</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-forest-50 bg-forest-50/20">
                      <td className="py-3 px-4 text-forest-600 pl-8">平均光照时长</td>
                      {compareData.map((d) => (
                        <td key={d.plant.id} className="text-center py-3 px-4 text-forest-700">
                          {d.lightingAvgDuration > 0 ? `${d.lightingAvgDuration}h` : "-"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up opacity-0 stagger-5">
            <div className="flex items-center gap-2 mb-3">
              <Bug size={18} className="text-amber-600" />
              <h3 className="font-bold text-forest-900 font-serif">病虫害数据对比</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {compareData.map((data, i) => {
                const color = COMPARE_COLORS[i];
                const isExpanded = expandedPest === data.plant.id;
                const displayPests = isExpanded ? data.pestRecords : data.pestRecords.slice(0, 3);
                return (
                  <div key={data.plant.id} className={`card p-4 animate-fade-in-up opacity-0`} style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.main }} />
                      <Link to={`/plants/${data.plant.id}`} className="font-bold text-forest-900 font-serif text-sm truncate hover:underline">{data.plant.name}</Link>
                      {data.activePestCount > 0 && (
                        <Link to="/pests" className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors ml-auto" title="查看病虫害">
                          <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className={`p-2.5 rounded-lg ${data.activePestCount > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                        <p className={`text-xs ${data.activePestCount > 0 ? "text-red-500" : "text-emerald-500"}`}>处理中</p>
                        <p className={`text-lg font-bold ${data.activePestCount > 0 ? "text-red-600" : "text-emerald-600"}`}>{data.activePestCount}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-forest-50">
                        <p className="text-xs text-forest-500">已解决</p>
                        <p className="text-lg font-bold text-forest-700">{data.resolvedPestCount}</p>
                      </div>
                    </div>

                    {data.pestRecords.length > 0 ? (
                      <div className="space-y-1.5">
                        {displayPests.map((pest, j) => (
                          <div key={j} className="flex items-center gap-2 p-2 rounded-lg bg-forest-50/50 text-xs">
                            <span className="text-sm">{pest.type === "disease" ? "🦠" : "🐛"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-forest-800 truncate">{pest.name}</p>
                              <p className="text-forest-400">{SEVERITY_LABELS[pest.severity]} · {PEST_STATUS_LABELS[pest.status]}</p>
                            </div>
                          </div>
                        ))}
                        {data.pestRecords.length > 3 && (
                          <button
                            onClick={() => setExpandedPest(isExpanded ? null : data.plant.id)}
                            className="w-full text-xs text-forest-500 hover:text-forest-700 flex items-center justify-center gap-1 py-1 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {isExpanded ? "收起" : `还有${data.pestRecords.length - 3}条`}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-xs text-forest-400">
                        ✅ 无病虫害记录
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="card p-5 border-amber-200 bg-gradient-to-r from-amber-50/50 to-cream-50 animate-fade-in-up opacity-0 stagger-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-600" />
                  <h3 className="font-bold text-forest-900 font-serif">养护策略建议</h3>
                </div>
                <Link to="/care-plans" className="btn-secondary text-xs py-1.5">
                  <CalendarClock size={14} />
                  前往养护计划
                </Link>
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-amber-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle size={12} className="text-amber-600" />
                    </div>
                    <p className="text-sm text-forest-800 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {compareData.length === 1 && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">👆</div>
          <p className="text-sm text-forest-500">
            已选择 1 株植物，请再选择至少 1 株以开始对比分析
          </p>
          <button
            onClick={() => setShowSelector(true)}
            className="btn-secondary mt-4 text-xs"
          >
            <Plus size={14} />
            继续选择
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  icon,
  score,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  score: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-xs text-forest-600">
          {icon}
          {label}
        </span>
        <span className="text-xs font-semibold" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-forest-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
