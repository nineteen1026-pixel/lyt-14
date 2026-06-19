import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Leaf,
  Droplets,
  TrendingUp,
  Plus,
  Calendar,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bug,
  X,
} from "lucide-react";
import { useAppStore } from "@/store";
import { getRelativeTime, today, formatDate } from "@/utils/format";
import {
  getCareStatsByDate,
  generateCareTodos,
  getPestRecurrenceAlerts,
  getHighRiskRecurrenceCount,
} from "@/utils/helpers";
import {
  CARE_TYPE_LABELS,
  CARE_TYPE_ICONS,
  PEST_TYPE_LABELS,
  CARE_TASK_TYPE_LABELS,
  CARE_TASK_TYPE_ICONS,
  RECURRENCE_RISK_LABELS,
  type CareTodo,
} from "@/types";
import { PestRecurrenceAlert } from "@/components/PestRecurrenceAlert";
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
  const carePlans = useAppStore((s) => s.carePlans);
  const pestRecords = useAppStore((s) => s.pestRecords);
  const completeTodoWithLog = useAppStore((s) => s.completeTodoWithLog);

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  const recurrenceAlerts = useMemo(
    () => getPestRecurrenceAlerts(plants, pestRecords),
    [plants, pestRecords]
  );

  const highRiskCount = useMemo(
    () => getHighRiskRecurrenceCount(plants, pestRecords),
    [plants, pestRecords]
  );

  const hasAlerts = recurrenceAlerts.length > 0;
  const topAlerts = recurrenceAlerts.slice(0, 3);

  const allTodos = useMemo(
    () => generateCareTodos(plants, carePlans, careLogs),
    [plants, carePlans, careLogs]
  );

  const careTodos = allTodos.slice(0, 5);
  const totalTodoCount = allTodos.length;
  const overdueCount = allTodos.filter((t) => t.status === "overdue").length;

  const thisMonthCareLogs = careLogs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const healthRate = plants.length > 0 ? 100 : 0;

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

  const handleQuickComplete = async (todo: CareTodo) => {
    setCompletingId(todo.id);
    await new Promise((r) => setTimeout(r, 300));
    const success = completeTodoWithLog(todo.id);
    if (success) {
      // 成功补录
    }
    setCompletingId(null);
  };

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
      label: "养护待办",
      value: totalTodoCount,
      icon: <Calendar size={22} />,
      emoji: overdueCount > 0 ? "⚠️" : "📋",
      color:
        overdueCount > 0
          ? "from-red-400 to-red-600"
          : "from-amber-400 to-amber-600",
      bg: overdueCount > 0 ? "bg-red-50" : "bg-amber-50",
      text:
        overdueCount > 0 ? "text-red-700" : "text-amber-700",
    },
    {
      label: "病害复发预警",
      value: highRiskCount,
      icon: <AlertTriangle size={22} />,
      emoji: highRiskCount > 0 ? "🚨" : "✅",
      color:
        highRiskCount > 0
          ? "from-red-400 to-red-600"
          : "from-emerald-400 to-emerald-600",
      bg: highRiskCount > 0 ? "bg-red-50" : "bg-emerald-50",
      text: highRiskCount > 0 ? "text-red-700" : "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      {hasAlerts && showAlertBanner && highRiskCount > 0 && (
        <div className="relative animate-fade-in-down">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-5 shadow-lg shadow-red-200/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg font-serif">
                  ⚠️ 病虫害复发预警
                </h3>
                <p className="text-red-100 text-sm mt-1">
                  检测到 <span className="font-bold text-white">{highRiskCount}</span>{" "}
                  项高风险复发预警，请及时关注并采取防治措施
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    to="/pests"
                    className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    查看详情
                  </Link>
                  <Link
                    to="/pests/new"
                    className="px-4 py-1.5 bg-white text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    记录处理
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setShowAlertBanner(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

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

      {hasAlerts && (
        <div className="animate-fade-in-up opacity-0 stagger-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bug className="text-red-500" size={18} />
              <h3 className="font-bold text-forest-900 font-serif">
                🐛 病虫害复发预警
              </h3>
              <span className="tag bg-red-100 text-red-700">
                {recurrenceAlerts.length} 项
              </span>
            </div>
            <Link
              to="/pests"
              className="text-sm text-forest-600 hover:text-forest-800 flex items-center gap-1"
            >
              查看全部 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topAlerts.map((alert, i) => (
              <PestRecurrenceAlert
                key={alert.id}
                alert={alert}
                defaultExpanded={i === 0 && alert.riskLevel === "high"}
              />
            ))}
          </div>
          {recurrenceAlerts.length > 3 && (
            <p className="text-xs text-center text-forest-400 mt-2">
              还有 {recurrenceAlerts.length - 3} 项预警，请前往病虫害管理查看
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5 animate-fade-in-up opacity-0 stagger-6">
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {careTodos.length > 0 ? (
                overdueCount > 0 ? (
                  <AlertTriangle className="text-red-500" size={18} />
                ) : (
                  <Clock className="text-amber-500" size={18} />
                )
              ) : (
                <Sparkles className="text-forest-600" size={18} />
              )}
              <h3 className="font-bold text-forest-900 font-serif">
                {careTodos.length > 0
                  ? overdueCount > 0
                    ? `待办事项（逾期 ${overdueCount}）`
                    : "待办事项"
                  : "暂无待办"}
              </h3>
            </div>
            <Link
              to="/care-plans"
              className="text-xs text-forest-500 hover:text-forest-700 flex items-center gap-1"
            >
              管理计划 <ChevronRight size={12} />
            </Link>
          </div>
          {careTodos.length > 0 ? (
            <div className="space-y-2">
              {careTodos.map((todo) => {
                const isCompleting = completingId === todo.id;
                return (
                  <div
                    key={todo.id}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      todo.status === "overdue"
                        ? "border-red-100 bg-red-50/50 hover:bg-red-50"
                        : "border-forest-100 bg-amber-50/30 hover:bg-amber-50/60"
                    } ${isCompleting ? "opacity-50 scale-[0.98]" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                          todo.taskType === "watering"
                            ? "bg-sky-100"
                            : "bg-forest-100"
                        }`}
                      >
                        {CARE_TASK_TYPE_ICONS[todo.taskType]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-forest-800">
                            {todo.plantAvatar} {todo.plantName}
                          </p>
                          <span
                            className={`tag ${
                              todo.status === "overdue"
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {todo.status === "overdue"
                              ? `逾期 ${todo.overdueDays} 天`
                              : "今日待办"}
                          </span>
                        </div>
                        <p className="text-xs text-forest-500 mt-0.5">
                          {CARE_TASK_TYPE_LABELS[todo.taskType]}
                          {todo.defaultAmount !== undefined &&
                            todo.taskType === "watering" &&
                            ` · 默认 ${todo.defaultAmount}ml`}
                          {todo.taskType === "fertilizing" &&
                            (todo.defaultFertilizerType || todo.defaultAmount !== undefined) && (
                              <>
                                {" · "}
                                {todo.defaultFertilizerType}
                                {todo.defaultAmount !== undefined && ` ${todo.defaultAmount}g`}
                              </>
                            )}
                          {" · 应于 "}
                          {formatDate(todo.dueDate)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickComplete(todo)}
                        disabled={isCompleting}
                        className="p-2 rounded-lg bg-forest-600 text-white hover:bg-forest-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
                        title="一键补录日志"
                      >
                        {isCompleting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              {totalTodoCount > 5 && (
                <p className="text-xs text-center text-forest-400 pt-1">
                  还有 {totalTodoCount - 5} 项待办，请前往养护计划查看
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Link
                  to="/care-logs/new"
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  <Plus size={14} />
                  手动记录
                </Link>
                <Link
                  to="/care-plans"
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  <Calendar size={14} />
                  查看全部
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="text-5xl mb-3 animate-float">🌱</div>
              <p className="text-sm text-forest-500">暂无养护待办～</p>
              <p className="text-xs text-forest-400 mt-1">
                {plants.length === 0
                  ? "添加植物后，系统会根据养护计划自动生成待办"
                  : "继续保持！所有养护都按时完成了"}
              </p>
              {plants.length > 0 && (
                <Link to="/care-plans" className="btn-secondary mt-4 text-xs">
                  <Plus size={14} />
                  设置养护计划
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
