import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Droplets,
  Sprout,
  Filter,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  PLANT_CATEGORIES,
  CARE_TASK_TYPE_LABELS,
  CARE_TASK_TYPE_ICONS,
  type CarePlan,
} from "@/types";
import { formatDate } from "@/utils/format";

export function CarePlans() {
  const carePlans = useAppStore((s) => s.carePlans);
  const plants = useAppStore((s) => s.plants);
  const deleteCarePlan = useAppStore((s) => s.deleteCarePlan);
  const toggleCarePlan = useAppStore((s) => s.toggleCarePlan);
  const getCareTodos = useAppStore((s) => s.getCareTodos);

  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [typeFilter, setTypeFilter] = useState("全部");

  const todos = getCareTodos();

  const getPlantCountByCategory = (category: string) => {
    if (category === "all") return plants.length;
    return plants.filter((p) => p.category === category).length;
  };

  const getTodoCountByPlan = (planId: string) => {
    return todos.filter((t) => t.planId === planId).length;
  };

  const getOverdueCountByPlan = (planId: string) => {
    return todos.filter((t) => t.planId === planId && t.status === "overdue").length;
  };

  const filtered = useMemo(() => {
    return carePlans.filter((p) => {
      const matchCategory =
        categoryFilter === "全部" ||
        (categoryFilter === "全部植物" && p.category === "all") ||
        p.category === categoryFilter;
      const matchType = typeFilter === "全部" || p.taskType === typeFilter;
      return matchCategory && matchType;
    });
  }, [carePlans, categoryFilter, typeFilter]);

  const handleDelete = (plan: CarePlan) => {
    if (
      confirm(
        `确定删除「${plan.category === "all" ? "全部植物" : plan.category}」的${
          CARE_TASK_TYPE_LABELS[plan.taskType]
        }计划吗？`
      )
    ) {
      deleteCarePlan(plan.id);
    }
  };

  const handleToggle = (plan: CarePlan) => {
    toggleCarePlan(plan.id);
  };

  const enabledCount = carePlans.filter((p) => p.enabled).length;
  const totalOverdue = todos.filter((t) => t.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">📅 养护计划</h1>
          <p className="page-subtitle">
            共 {carePlans.length} 个计划，已启用 {enabledCount} 个
          </p>
        </div>
        <Link to="/care-plans/new" className="btn-primary">
          <Plus size={18} />
          新建计划
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center">
              <Sprout size={22} />
            </div>
            <div>
              <p className="text-sm text-forest-500">计划总数</p>
              <p className="text-2xl font-bold text-forest-900 font-serif">
                {carePlans.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
            <div>
              <p className="text-sm text-forest-500">逾期待办</p>
              <p className="text-2xl font-bold text-forest-900 font-serif">
                {totalOverdue}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm text-forest-500">待办总数</p>
              <p className="text-2xl font-bold text-forest-900 font-serif">
                {todos.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter size={16} className="text-forest-500" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("全部")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                typeFilter === "全部"
                  ? "bg-forest-700 text-white"
                  : "bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              全部类型
            </button>
            <button
              onClick={() => setTypeFilter("watering")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                typeFilter === "watering"
                  ? "bg-sky-600 text-white"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100"
              }`}
            >
              💧 浇水
            </button>
            <button
              onClick={() => setTypeFilter("fertilizing")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                typeFilter === "fertilizing"
                  ? "bg-forest-600 text-white"
                  : "bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              🌾 施肥
            </button>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field sm:ml-auto sm:w-auto"
          >
            <option value="全部">全部类别</option>
            <option value="all">全部植物</option>
            {PLANT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((plan, i) => {
            const plantCount = getPlantCountByCategory(plan.category);
            const todoCount = getTodoCountByPlan(plan.id);
            const overdueCount = getOverdueCountByPlan(plan.id);
            return (
              <div
                key={plan.id}
                className={`card p-4 animate-fade-in-up opacity-0 stagger-${
                  Math.min((i % 6) + 1, 6)
                } ${!plan.enabled ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      plan.taskType === "watering" ? "bg-sky-50" : "bg-forest-50"
                    }`}
                  >
                    {CARE_TASK_TYPE_ICONS[plan.taskType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-forest-900 font-serif text-base">
                        {plan.category === "all" ? "全部植物" : plan.category}
                      </h3>
                      <span
                        className={`tag ${
                          plan.taskType === "watering"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-forest-50 text-forest-700"
                        }`}
                      >
                        {CARE_TASK_TYPE_LABELS[plan.taskType]}
                      </span>
                      {!plan.enabled && (
                        <span className="tag bg-gray-100 text-gray-500">已停用</span>
                      )}
                      {overdueCount > 0 && (
                        <span className="tag bg-red-50 text-red-600">
                          {overdueCount} 项逾期
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-forest-600">
                      <span>
                        📆 周期：每 {plan.intervalDays} 天
                      </span>
                      <span>
                        🪴 覆盖植物：{plantCount} 株
                      </span>
                      {plan.defaultAmount !== undefined && (
                        <span>
                          {plan.taskType === "watering" ? (
                            <>💧 默认水量：{plan.defaultAmount} ml</>
                          ) : (
                            <>🌾 默认用量：{plan.defaultAmount} g</>
                          )}
                        </span>
                      )}
                      {plan.defaultFertilizerType && (
                        <span>🧪 肥料：{plan.defaultFertilizerType}</span>
                      )}
                      {todoCount > 0 && <span>⏰ 待办：{todoCount} 项</span>}
                    </div>
                    <p className="text-xs text-forest-400 mt-2">
                      更新于 {formatDate(plan.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(plan)}
                      className={`p-2 rounded-lg transition-colors ${
                        plan.enabled
                          ? "text-forest-500 hover:bg-forest-50 hover:text-forest-700"
                          : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      }`}
                      title={plan.enabled ? "停用计划" : "启用计划"}
                    >
                      <Power size={18} />
                    </button>
                    <Link
                      to={`/care-plans/${plan.id}/edit`}
                      className="p-2 rounded-lg text-forest-500 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-2 rounded-lg text-forest-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">
            <Droplets className="inline text-sky-300" size={60} />
          </div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            {carePlans.length === 0 ? "还没有养护计划" : "没有符合条件的计划"}
          </h3>
          <p className="text-sm text-forest-500 mb-6">
            {carePlans.length === 0
              ? "设置养护周期，让系统帮你提醒植物养护时间～"
              : "调整筛选条件试试"}
          </p>
          {carePlans.length === 0 && (
            <Link to="/care-plans/new" className="btn-primary">
              <Plus size={18} />
              创建第一个计划
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
