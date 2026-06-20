import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAppStore } from "@/store";
import {
  ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ICONS,
  EXPENSE_CATEGORY_COLORS,
} from "@/types";
import { today } from "@/utils/format";

export function ExpenseForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plants = useAppStore((s) => s.plants);
  const addExpenseRecord = useAppStore((s) => s.addExpenseRecord);

  const preselectedPlant = searchParams.get("plantId") || (plants[0]?.id ?? "");
  const preselectedCategory = (searchParams.get("category") as ExpenseCategory) || "fertilizer";

  const [form, setForm] = useState({
    plantId: preselectedPlant,
    category: preselectedCategory as ExpenseCategory,
    amount: "",
    date: today(),
    description: "",
    notes: "",
  });

  useEffect(() => {
    if (!form.plantId && plants[0]) {
      setForm((f) => ({ ...f, plantId: plants[0].id }));
    }
  }, [plants, form.plantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plantId) {
      alert("请先添加植物");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      alert("请输入有效的金额");
      return;
    }
    if (!form.description.trim()) {
      alert("请输入费用描述");
      return;
    }
    addExpenseRecord({
      plantId: form.plantId,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      description: form.description.trim(),
      notes: form.notes,
    });
    navigate("/expenses");
  };

  const categories = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/expenses" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">💰 记录费用</h1>
          <p className="page-subtitle">记录植物养护的费用支出</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">费用类别</label>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {categories.map((cat) => {
              const colors = EXPENSE_CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    form.category === cat
                      ? `border-forest-500 ${colors.bg}`
                      : "border-forest-100 bg-white hover:border-forest-300"
                  }`}
                >
                  <div className="text-2xl mb-1">{EXPENSE_CATEGORY_ICONS[cat]}</div>
                  <div className="text-xs font-medium text-forest-800">
                    {EXPENSE_CATEGORY_LABELS[cat]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">选择植物 *</label>
            <select
              className="select-field"
              value={form.plantId}
              onChange={(e) => setForm({ ...form, plantId: e.target.value })}
            >
              {plants.length === 0 && <option value="">请先添加植物</option>}
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">日期</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">金额 (元) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field text-lg font-bold"
              placeholder="如：59.90"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="label">费用描述 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="如：营养土、复合肥、陶瓷花盆"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">备注</label>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="记录购买渠道、规格、使用感受等..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/expenses" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary" disabled={plants.length === 0}>
            <Save size={18} />
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
