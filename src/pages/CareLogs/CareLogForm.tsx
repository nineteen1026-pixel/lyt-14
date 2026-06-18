import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Droplets, Sprout, Sun } from "lucide-react";
import { useAppStore } from "@/store";
import {
  CareLogType,
  LightIntensity,
  CARE_TYPE_LABELS,
  LIGHT_INTENSITY_LABELS,
} from "@/types";
import { today } from "@/utils/format";

export function CareLogForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plants = useAppStore((s) => s.plants);
  const addCareLog = useAppStore((s) => s.addCareLog);

  const preselectedPlant = searchParams.get("plantId") || (plants[0]?.id ?? "");

  const [form, setForm] = useState({
    plantId: preselectedPlant,
    type: "watering" as CareLogType,
    date: today(),
    amount: "",
    fertilizerType: "",
    lightDuration: "",
    lightIntensity: "medium" as LightIntensity,
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
    addCareLog({
      plantId: form.plantId,
      type: form.type,
      date: form.date,
      amount: form.amount ? Number(form.amount) : undefined,
      fertilizerType: form.fertilizerType || undefined,
      lightDuration: form.lightDuration ? Number(form.lightDuration) : undefined,
      lightIntensity: form.type === "lighting" ? form.lightIntensity : undefined,
      notes: form.notes,
    });
    navigate("/care-logs");
  };

  const typeOptions: Array<{ value: CareLogType; label: string; icon: string }> = [
    { value: "watering", label: "浇水", icon: "💧" },
    { value: "fertilizing", label: "施肥", icon: "🌾" },
    { value: "lighting", label: "光照", icon: "☀️" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/care-logs" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">📝 记录养护</h1>
          <p className="page-subtitle">记录植物的日常养护情况</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">养护类型</label>
          <div className="grid grid-cols-3 gap-3">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, type: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  form.type === opt.value
                    ? "border-forest-500 bg-forest-50"
                    : "border-forest-100 bg-white hover:border-forest-300"
                }`}
              >
                <div className="text-3xl mb-1">{opt.icon}</div>
                <div className="text-sm font-medium text-forest-800">{opt.label}</div>
              </button>
            ))}
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

        {form.type === "watering" && (
          <div>
            <label className="label flex items-center gap-2">
              <Droplets size={16} className="text-sky-500" /> 浇水量 (ml)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              className="input-field"
              placeholder="如：200"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
        )}

        {form.type === "fertilizing" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Sprout size={16} className="text-forest-500" /> 肥料种类
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="如：复合肥、有机肥、液肥"
                value={form.fertilizerType}
                onChange={(e) => setForm({ ...form, fertilizerType: e.target.value })}
              />
            </div>
            <div>
              <label className="label">用量 (g)</label>
              <input
                type="number"
                min="0"
                className="input-field"
                placeholder="如：5"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>
        )}

        {form.type === "lighting" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Sun size={16} className="text-amber-500" /> 光照时长 (小时)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="input-field"
                placeholder="如：4"
                value={form.lightDuration}
                onChange={(e) => setForm({ ...form, lightDuration: e.target.value })}
              />
            </div>
            <div>
              <label className="label">光照强度</label>
              <select
                className="select-field"
                value={form.lightIntensity}
                onChange={(e) =>
                  setForm({ ...form, lightIntensity: e.target.value as LightIntensity })
                }
              >
                {(["low", "medium", "high"] as LightIntensity[]).map((li) => (
                  <option key={li} value={li}>
                    {LIGHT_INTENSITY_LABELS[li]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="label">备注</label>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder={`记录本次${CARE_TYPE_LABELS[form.type]}的细节或观察...`}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/care-logs" className="btn-secondary">
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
