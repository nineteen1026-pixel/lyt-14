import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Droplets, Sprout, Info } from "lucide-react";
import { useAppStore } from "@/store";
import {
  PLANT_CATEGORIES,
  CARE_TASK_TYPE_LABELS,
  type CareTaskType,
  type PlantCategory,
} from "@/types";

export function CarePlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const carePlans = useAppStore((s) => s.carePlans);
  const plants = useAppStore((s) => s.plants);
  const addCarePlan = useAppStore((s) => s.addCarePlan);
  const updateCarePlan = useAppStore((s) => s.updateCarePlan);

  const isEditing = !!id;
  const existingPlan = isEditing ? carePlans.find((p) => p.id === id) : null;

  const [form, setForm] = useState({
    category: (existingPlan?.category || PLANT_CATEGORIES[0]) as
      | PlantCategory
      | "all",
    taskType: (existingPlan?.taskType || "watering") as CareTaskType,
    intervalDays: String(existingPlan?.intervalDays || 7),
    defaultAmount: existingPlan?.defaultAmount
      ? String(existingPlan.defaultAmount)
      : "",
    defaultFertilizerType: existingPlan?.defaultFertilizerType || "",
    enabled: existingPlan?.enabled ?? true,
  });

  useEffect(() => {
    if (isEditing && !existingPlan) {
      navigate("/care-plans");
    }
  }, [isEditing, existingPlan, navigate]);

  const plantCount =
    form.category === "all"
      ? plants.length
      : plants.filter((p) => p.category === form.category).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const intervalDays = Number(form.intervalDays);
    if (!intervalDays || intervalDays < 1) {
      alert("周期天数必须大于 0");
      return;
    }

    const planData = {
      category: form.category,
      taskType: form.taskType,
      intervalDays,
      defaultAmount: form.defaultAmount
        ? Number(form.defaultAmount)
        : undefined,
      defaultFertilizerType:
        form.taskType === "fertilizing" && form.defaultFertilizerType
          ? form.defaultFertilizerType
          : undefined,
      enabled: form.enabled,
    };

    if (isEditing && existingPlan) {
      updateCarePlan(existingPlan.id, planData);
    } else {
      addCarePlan(planData);
    }

    navigate("/care-plans");
  };

  const typeOptions: Array<{
    value: CareTaskType;
    label: string;
    icon: string;
    desc: string;
  }> = [
    {
      value: "watering",
      label: "浇水计划",
      icon: "💧",
      desc: "按周期提醒浇水，可设置默认水量",
    },
    {
      value: "fertilizing",
      label: "施肥计划",
      icon: "🌾",
      desc: "按周期提醒施肥，可设置默认肥料和用量",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/care-plans" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">
            {isEditing ? "✏️ 编辑养护计划" : "📅 新建养护计划"}
          </h1>
          <p className="page-subtitle">
            {isEditing
              ? "修改养护计划的周期和参数"
              : "按植物类别设置浇水或施肥的周期"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">计划类型</label>
          <div className="grid grid-cols-2 gap-3">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm({ ...form, taskType: opt.value })
                }
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  form.taskType === opt.value
                    ? form.taskType === "watering"
                      ? "border-sky-400 bg-sky-50"
                      : "border-forest-400 bg-forest-50"
                    : "border-forest-100 bg-white hover:border-forest-300"
                }`}
              >
                <div className="text-3xl mb-1">{opt.icon}</div>
                <div className="text-sm font-medium text-forest-800">
                  {opt.label}
                </div>
                <div className="text-xs text-forest-500 mt-0.5">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">适用植物类别 *</label>
            <select
              className="select-field"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as PlantCategory | "all",
                })
              }
            >
              <option value="all">全部植物</option>
              {PLANT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="text-xs text-forest-500 mt-1.5 flex items-center gap-1">
              <Info size={12} />
              将覆盖 {plantCount} 株植物
            </p>
          </div>
          <div>
            <label className="label">周期（天）*</label>
            <input
              type="number"
              min="1"
              className="input-field"
              placeholder="如：7"
              value={form.intervalDays}
              onChange={(e) =>
                setForm({ ...form, intervalDays: e.target.value })
              }
            />
            <p className="text-xs text-forest-500 mt-1.5">
              距上次{CARE_TASK_TYPE_LABELS[form.taskType]}超过此天数将提醒
            </p>
          </div>
        </div>

        {form.taskType === "watering" && (
          <div>
            <label className="label flex items-center gap-2">
              <Droplets size={16} className="text-sky-500" /> 默认浇水量 (ml)
              <span className="text-xs text-forest-400 font-normal">
                一键补录时使用
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="50"
              className="input-field"
              placeholder="如：200（留空则不预设）"
              value={form.defaultAmount}
              onChange={(e) =>
                setForm({ ...form, defaultAmount: e.target.value })
              }
            />
          </div>
        )}

        {form.taskType === "fertilizing" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Sprout size={16} className="text-forest-500" /> 肥料种类
                <span className="text-xs text-forest-400 font-normal">
                  一键补录时使用
                </span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="如：复合肥、有机肥、液肥"
                value={form.defaultFertilizerType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultFertilizerType: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="label">默认用量 (g)</label>
              <input
                type="number"
                min="0"
                className="input-field"
                placeholder="如：5（留空则不预设）"
                value={form.defaultAmount}
                onChange={(e) =>
                  setForm({ ...form, defaultAmount: e.target.value })
                }
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-xl bg-forest-50/60 border border-forest-100">
          <input
            type="checkbox"
            id="enabled"
            checked={form.enabled}
            onChange={(e) =>
              setForm({ ...form, enabled: e.target.checked })
            }
            className="w-4 h-4 rounded border-forest-300 text-forest-600 focus:ring-forest-500"
          />
          <label
            htmlFor="enabled"
            className="text-sm text-forest-700 cursor-pointer flex-1"
          >
            <span className="font-medium">立即启用该计划</span>
            <span className="text-forest-500 ml-2">
              关闭后暂不生成待办提醒
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/care-plans" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={18} />
            {isEditing ? "保存修改" : "创建计划"}
          </button>
        </div>
      </form>
    </div>
  );
}
