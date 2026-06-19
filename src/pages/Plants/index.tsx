import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Edit2, Trash2, ChevronRight, ArrowUpDown } from "lucide-react";
import { useAppStore } from "@/store";
import { PLANT_CATEGORIES } from "@/types";
import {
  getPlantHealthStatus,
  getHealthStatusColor,
  getHealthStatusLabel,
  calculatePlantHealthScore,
} from "@/utils/helpers";
import { formatDate, daysBetween } from "@/utils/format";
import { HealthRating } from "@/components/HealthRating";

export function Plants() {
  const plants = useAppStore((s) => s.plants);
  const careLogs = useAppStore((s) => s.careLogs);
  const leafRecords = useAppStore((s) => s.leafRecords);
  const pestRecords = useAppStore((s) => s.pestRecords);
  const deletePlant = useAppStore((s) => s.deletePlant);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [healthFilter, setHealthFilter] = useState("全部");
  const [sortBy, setSortBy] = useState<"name" | "health" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const plantsWithHealth = useMemo(() => {
    return plants.map((plant) => ({
      plant,
      healthScore: calculatePlantHealthScore(
        plant,
        careLogs,
        leafRecords,
        pestRecords
      ),
    }));
  }, [plants, careLogs, leafRecords, pestRecords]);

  const filteredPlants = useMemo(() => {
    let result = plantsWithHealth.filter(({ plant, healthScore }) => {
      const matchSearch =
        plant.name.toLowerCase().includes(search.toLowerCase()) ||
        plant.species.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "全部" || plant.category === category;
      const health = getPlantHealthStatus(plant, careLogs, pestRecords);
      const matchHealth = healthFilter === "全部" || health === healthFilter;
      return matchSearch && matchCategory && matchHealth;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.plant.name.localeCompare(b.plant.name, "zh-CN");
          break;
        case "health":
          comparison = a.healthScore.total - b.healthScore.total;
          break;
        case "date":
          comparison = a.plant.plantedDate.localeCompare(b.plant.plantedDate);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    plantsWithHealth,
    search,
    category,
    healthFilter,
    careLogs,
    pestRecords,
    sortBy,
    sortOrder,
  ]);

  const toggleSort = (field: "name" | "health" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定删除「${name}」吗？相关的养护记录和病虫害记录也会被删除。`)) {
      deletePlant(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">🪴 我的植物</h1>
          <p className="page-subtitle">共 {plants.length} 株植物正在养护中</p>
        </div>
        <Link to="/plants/new" className="btn-primary">
          <Plus size={18} />
          添加植物
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400"
            />
            <input
              type="text"
              placeholder="搜索植物名称或品种..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-forest-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-field min-w-[120px]"
            >
              <option>全部</option>
              {PLANT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="select-field min-w-[120px]"
            >
              <option>全部</option>
              <option value="healthy">健康</option>
              <option value="warning">需关注</option>
              <option value="danger">需处理</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-forest-100">
          <ArrowUpDown size={16} className="text-forest-500" />
          <span className="text-sm text-forest-600 font-medium">排序：</span>
          <button
            onClick={() => toggleSort("name")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "name"
                ? "bg-forest-500 text-white"
                : "bg-forest-50 text-forest-600 hover:bg-forest-100"
            }`}
          >
            名称{sortBy === "name" && (sortOrder === "asc" ? " ↑" : " ↓")}
          </button>
          <button
            onClick={() => toggleSort("health")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "health"
                ? "bg-forest-500 text-white"
                : "bg-forest-50 text-forest-600 hover:bg-forest-100"
            }`}
          >
            健康评分{sortBy === "health" && (sortOrder === "asc" ? " ↑" : " ↓")}
          </button>
          <button
            onClick={() => toggleSort("date")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "date"
                ? "bg-forest-500 text-white"
                : "bg-forest-50 text-forest-600 hover:bg-forest-100"
            }`}
          >
            种植日期{sortBy === "date" && (sortOrder === "asc" ? " ↑" : " ↓")}
          </button>
        </div>
      </div>

      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlants.map(({ plant, healthScore }, i) => {
            const health = getPlantHealthStatus(plant, careLogs, pestRecords);
            const plantCareLogs = careLogs.filter((l) => l.plantId === plant.id);
            const daysGrowing = daysBetween(plant.plantedDate, formatDate(new Date()));
            return (
              <Link
                key={plant.id}
                to={`/plants/${plant.id}`}
                className={`card card-hover p-5 group animate-fade-in-up opacity-0 stagger-${Math.min((i % 6) + 1, 6)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-50 to-cream-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                    {plant.avatar}
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                    <Link
                      to={`/plants/${plant.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-forest-100 text-forest-500 hover:text-forest-700 transition-colors"
                    >
                      <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(plant.id, plant.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-forest-900 text-lg mb-0.5 font-serif">
                  {plant.name}
                </h3>
                <p className="text-xs text-forest-500 mb-3">{plant.species}</p>
                <div className="mb-3">
                  <HealthRating score={healthScore} size="sm" showScore />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="tag bg-forest-50 text-forest-700">
                    {plant.category}
                  </span>
                  <span
                    className={`tag ${getHealthStatusColor(health)} text-white`}
                  >
                    {getHealthStatusLabel(health)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-forest-100">
                  <div className="text-xs text-forest-500">
                    📍 {plant.location}
                  </div>
                  <div className="text-xs text-forest-500">
                    🌱 {daysGrowing}天
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-forest-400">
                  <span>养护记录 {plantCareLogs.length} 条</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            {plants.length === 0 ? "还没有添加植物" : "没有找到匹配的植物"}
          </h3>
          <p className="text-sm text-forest-500 mb-6">
            {plants.length === 0
              ? "点击上方按钮，添加你的第一株植物吧"
              : "试试调整搜索或筛选条件"}
          </p>
          {plants.length === 0 && (
            <Link to="/plants/new" className="btn-primary">
              <Plus size={18} />
              添加植物
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
