import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Filter, Thermometer, Droplets, Sun, MapPin, Edit2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Bar,
} from "recharts";
import { useAppStore } from "@/store";
import { ENVIRONMENT_FIELD_UNITS } from "@/types";
import { formatDate, getRelativeTime } from "@/utils/format";

export function Environment() {
  const [searchParams] = useSearchParams();
  const environmentRecords = useAppStore((s) => s.environmentRecords);
  const getEnvironmentLocations = useAppStore((s) => s.getEnvironmentLocations);
  const deleteEnvironmentRecord = useAppStore((s) => s.deleteEnvironmentRecord);
  const plants = useAppStore((s) => s.plants);

  const locations = getEnvironmentLocations();
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || "全部"
  );
  const [viewMode, setViewMode] = useState<"list" | "chart">("chart");

  const filtered = useMemo(() => {
    return environmentRecords
      .filter((r) => locationFilter === "全部" || r.location === locationFilter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [environmentRecords, locationFilter]);

  const chartData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    const last14 = sorted.slice(-14);
    return last14.map((r) => ({
      date: r.date.slice(5),
      temperature: r.temperature,
      humidity: r.humidity,
      light: r.light,
      location: r.location,
    }));
  }, [filtered]);

  const chartDataByLocation = useMemo(() => {
    const map = new Map<string, typeof chartData>();
    environmentRecords
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((r) => {
        const list = map.get(r.location) || [];
        list.push({
          date: r.date.slice(5),
          temperature: r.temperature,
          humidity: r.humidity,
          light: r.light,
          location: r.location,
        });
        map.set(r.location, list);
      });
    return map;
  }, [environmentRecords]);

  const stats = useMemo(() => {
    if (filtered.length === 0)
      return {
        avgTemp: 0,
        avgHumidity: 0,
        avgLight: 0,
        recordCount: 0,
        locationCount: 0,
      };
    const sum = filtered.reduce(
      (acc, r) => ({
        temp: acc.temp + r.temperature,
        humidity: acc.humidity + r.humidity,
        light: acc.light + r.light,
      }),
      { temp: 0, humidity: 0, light: 0 }
    );
    const uniqueLocations = new Set(filtered.map((r) => r.location));
    return {
      avgTemp: Math.round((sum.temp / filtered.length) * 10) / 10,
      avgHumidity: Math.round(sum.humidity / filtered.length),
      avgLight: Math.round(sum.light / filtered.length),
      recordCount: filtered.length,
      locationCount: uniqueLocations.size,
    };
  }, [filtered]);

  const plantsByLocation = useMemo(() => {
    const map = new Map<string, string[]>();
    plants.forEach((p) => {
      if (p.location) {
        const list = map.get(p.location) || [];
        list.push(`${p.avatar} ${p.name}`);
        map.set(p.location, list);
      }
    });
    return map;
  }, [plants]);

  const handleDelete = (id: string) => {
    if (confirm("确定删除这条环境记录吗？")) deleteEnvironmentRecord(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">🌡️ 环境监测</h1>
          <p className="page-subtitle">
            记录每日温湿度与光照，共 {environmentRecords.length} 条记录，{locations.length} 个监测位置
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-forest-50 rounded-full p-1">
            <button
              onClick={() => setViewMode("chart")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === "chart"
                  ? "bg-forest-700 text-white shadow"
                  : "text-forest-700 hover:text-forest-900"
              }`}
            >
              📊 图表
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-forest-700 text-white shadow"
                  : "text-forest-700 hover:text-forest-900"
              }`}
            >
              📋 列表
            </button>
          </div>
          <Link to="/environment/new" className="btn-primary">
            <Plus size={18} />
            记录环境
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-forest-500 mb-1">
            <Thermometer size={14} className="text-red-400" />
            平均温度
          </div>
          <p className="text-2xl font-bold text-forest-900 font-serif">
            {stats.avgTemp}
            <span className="text-sm font-normal text-forest-500 ml-1">
              {ENVIRONMENT_FIELD_UNITS.temperature}
            </span>
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-forest-500 mb-1">
            <Droplets size={14} className="text-sky-400" />
            平均湿度
          </div>
          <p className="text-2xl font-bold text-forest-900 font-serif">
            {stats.avgHumidity}
            <span className="text-sm font-normal text-forest-500 ml-1">
              {ENVIRONMENT_FIELD_UNITS.humidity}
            </span>
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-forest-500 mb-1">
            <Sun size={14} className="text-amber-400" />
            平均光照
          </div>
          <p className="text-2xl font-bold text-forest-900 font-serif">
            {stats.avgLight.toLocaleString()}
            <span className="text-sm font-normal text-forest-500 ml-1">
              {ENVIRONMENT_FIELD_UNITS.light}
            </span>
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-forest-500 mb-1">
            <MapPin size={14} className="text-forest-500" />
            监测位置
          </div>
          <p className="text-2xl font-bold text-forest-900 font-serif">
            {stats.locationCount}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-sm text-forest-500 mb-1">
            📝 记录总数
          </div>
          <p className="text-2xl font-bold text-forest-900 font-serif">
            {stats.recordCount}
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter size={16} className="text-forest-500" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLocationFilter("全部")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                locationFilter === "全部"
                  ? "bg-forest-700 text-white"
                  : "bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              全部位置
            </button>
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(loc)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  locationFilter === loc
                    ? "bg-forest-700 text-white"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
        {locationFilter !== "全部" && plantsByLocation.get(locationFilter) && (
          <div className="mt-3 pt-3 border-t border-forest-100 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-forest-500">该位置关联植物：</span>
            {plantsByLocation.get(locationFilter)?.map((p, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {viewMode === "chart" && chartData.length > 0 && (
        <div className="space-y-5">
          {(locationFilter === "全部"
            ? locations
            : [locationFilter]
          ).map((loc) => {
            const locData =
              locationFilter === "全部"
                ? (chartDataByLocation.get(loc) || []).slice(-14)
                : chartData;
            if (locData.length === 0) return null;
            return (
              <div key={loc} className="card p-5">
                <h3 className="font-bold text-forest-900 font-serif mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-forest-500" />
                  {loc}
                  {locationFilter === "全部" && (
                    <span className="text-xs font-normal text-forest-400 ml-1">
                      ({locData.length} 天)
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div>
                    <h4 className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-1.5">
                      <Thermometer size={14} className="text-red-400" />
                      温度趋势
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={locData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2efd7" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#517c39" }} axisLine={{ stroke: "#c5dfb1" }} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#517c39" }} axisLine={false} tickLine={false} unit="°C" />
                          <Tooltip contentStyle={{ background: "white", border: "1px solid #c5dfb1", borderRadius: "12px", fontSize: "13px" }} formatter={(v: number) => [`${v}°C`, "温度"]} />
                          <Line type="monotone" dataKey="temperature" stroke="#f87171" strokeWidth={2} dot={{ r: 2 }} name="温度" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-1.5">
                      <Droplets size={14} className="text-sky-400" />
                      湿度趋势
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={locData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2efd7" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#517c39" }} axisLine={{ stroke: "#c5dfb1" }} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#517c39" }} axisLine={false} tickLine={false} unit="%" />
                          <Tooltip contentStyle={{ background: "white", border: "1px solid #c5dfb1", borderRadius: "12px", fontSize: "13px" }} formatter={(v: number) => [`${v}%`, "湿度"]} />
                          <Line type="monotone" dataKey="humidity" stroke="#60a5fa" strokeWidth={2} dot={{ r: 2 }} name="湿度" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-1.5">
                      <Sun size={14} className="text-amber-400" />
                      光照强度
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={locData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2efd7" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#517c39" }} axisLine={{ stroke: "#c5dfb1" }} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#517c39" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "white", border: "1px solid #c5dfb1", borderRadius: "12px", fontSize: "13px" }} formatter={(v: number) => [`${v.toLocaleString()} lux`, "光照"]} />
                          <Bar dataKey="light" fill="#fbbf24" radius={[3, 3, 0, 0]} name="光照" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "list" && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((record, i) => (
            <div
              key={record.id}
              className={`card p-4 flex items-center gap-4 animate-fade-in-up opacity-0 stagger-${
                Math.min((i % 6) + 1, 6)
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-50 to-amber-50 flex items-center justify-center text-2xl">
                🌡️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-forest-800 flex items-center gap-1.5">
                    <MapPin size={14} className="text-forest-500" />
                    {record.location}
                  </span>
                </div>
                <div className="text-sm text-forest-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1">
                    <Thermometer size={12} className="text-red-400" />
                    温度: {record.temperature}
                    {ENVIRONMENT_FIELD_UNITS.temperature}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets size={12} className="text-sky-400" />
                    湿度: {record.humidity}
                    {ENVIRONMENT_FIELD_UNITS.humidity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sun size={12} className="text-amber-400" />
                    光照: {record.light.toLocaleString()}{" "}
                    {ENVIRONMENT_FIELD_UNITS.light}
                  </span>
                  {record.notes && <span>📝 {record.notes}</span>}
                </div>
                {plantsByLocation.get(record.location) && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-forest-400">关联植物:</span>
                    {plantsByLocation.get(record.location)?.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm text-forest-700">
                    {formatDate(record.date)}
                  </p>
                  <p className="text-xs text-forest-400">
                    {getRelativeTime(record.date)}
                  </p>
                </div>
                <Link
                  to={`/environment/${record.id}/edit`}
                  className="p-2 rounded-lg hover:bg-forest-50 text-forest-400 hover:text-forest-600 transition-colors"
                >
                  <Edit2 size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🌡️</div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            {environmentRecords.length === 0
              ? "还没有环境记录"
              : "该位置暂无记录"}
          </h3>
          <p className="text-sm text-forest-500 mb-6">
            {environmentRecords.length === 0
              ? "开始记录你的植物生长环境吧～"
              : "换个位置或添加新记录试试"}
          </p>
          {environmentRecords.length === 0 && (
            <Link to="/environment/new" className="btn-primary">
              <Plus size={18} />
              添加记录
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
