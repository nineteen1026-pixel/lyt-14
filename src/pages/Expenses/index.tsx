import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter, Wallet } from "lucide-react";
import { useAppStore } from "@/store";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ICONS,
  EXPENSE_CATEGORY_COLORS,
} from "@/types";
import { formatDate, getRelativeTime } from "@/utils/format";

export function Expenses() {
  const plants = useAppStore((s) => s.plants);
  const expenseRecords = useAppStore((s) => s.expenseRecords);
  const deleteExpenseRecord = useAppStore((s) => s.deleteExpenseRecord);
  const getCategoryExpenseSummary = useAppStore((s) => s.getCategoryExpenseSummary);

  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [plantFilter, setPlantFilter] = useState("全部");

  const filtered = useMemo(() => {
    return expenseRecords.filter((r) => {
      const matchCategory = categoryFilter === "全部" || r.category === categoryFilter;
      const matchPlant = plantFilter === "全部" || r.plantId === plantFilter;
      return matchCategory && matchPlant;
    });
  }, [expenseRecords, categoryFilter, plantFilter]);

  const categorySummary = useMemo(
    () => getCategoryExpenseSummary(),
    [getCategoryExpenseSummary]
  );

  const totalAmount = useMemo(
    () => filtered.reduce((sum, r) => sum + r.amount, 0),
    [filtered]
  );

  const getPlantName = (id: string) => plants.find((p) => p.id === id)?.name || "未知";
  const getPlantAvatar = (id: string) => plants.find((p) => p.id === id)?.avatar || "🌿";

  const handleDelete = (id: string) => {
    if (confirm("确定删除这条费用记录吗？")) deleteExpenseRecord(id);
  };

  const categories = Object.keys(EXPENSE_CATEGORY_LABELS) as Array<
    keyof typeof EXPENSE_CATEGORY_LABELS
  >;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">💰 费用记录</h1>
          <p className="page-subtitle">
            共 {expenseRecords.length} 条记录 · 总支出 ¥{totalAmount.toFixed(2)}
          </p>
        </div>
        <Link to="/expenses/new" className="btn-primary">
          <Plus size={18} />
          记录费用
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Filter size={16} className="text-forest-500" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("全部")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoryFilter === "全部"
                  ? "bg-forest-700 text-white"
                  : "bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? "bg-forest-700 text-white"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                }`}
              >
                {EXPENSE_CATEGORY_LABELS[cat]}
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

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {categorySummary.map((item, i) => (
          <div
            key={item.category}
            className={`card p-4 animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
          >
            <div className="text-2xl mb-2">{EXPENSE_CATEGORY_ICONS[item.category]}</div>
            <p className="text-lg font-bold text-forest-900 font-serif">
              ¥{item.totalAmount.toFixed(2)}
            </p>
            <p className="text-xs text-forest-600">
              {EXPENSE_CATEGORY_LABELS[item.category]}
            </p>
            <p className="text-xs text-forest-400 mt-1">
              {item.recordCount} 笔 · {item.percentage}%
            </p>
          </div>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((record, i) => {
            const colors = EXPENSE_CATEGORY_COLORS[record.category];
            return (
              <div
                key={record.id}
                className={`card p-4 flex items-center gap-4 animate-fade-in-up opacity-0 stagger-${Math.min((i % 6) + 1, 6)}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors.bg}`}
                >
                  {EXPENSE_CATEGORY_ICONS[record.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/plants/${record.plantId}`}
                      className="font-medium text-forest-800 hover:text-forest-900 flex items-center gap-1.5"
                    >
                      <span>{getPlantAvatar(record.plantId)}</span>
                      {getPlantName(record.plantId)}
                    </Link>
                    <span className={`tag ${colors.bg} ${colors.text}`}>
                      {EXPENSE_CATEGORY_LABELS[record.category]}
                    </span>
                  </div>
                  <p className="text-sm text-forest-700 mt-1 font-medium">
                    {record.description}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-forest-500 mt-1">📝 {record.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-rose-600 font-serif">
                      ¥{record.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-forest-400">
                      {formatDate(record.date)} · {getRelativeTime(record.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">
            <Wallet className="inline text-forest-300" size={60} />
          </div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            {expenseRecords.length === 0 ? "还没有费用记录" : "没有符合条件的记录"}
          </h3>
          <p className="text-sm text-forest-500 mb-6">
            {expenseRecords.length === 0
              ? "开始记录你的植物养护开支吧～"
              : "调整筛选条件试试"}
          </p>
          {expenseRecords.length === 0 && (
            <Link to="/expenses/new" className="btn-primary">
              <Plus size={18} />
              添加记录
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
