import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  ImagePlus,
  AlertTriangle,
  Lightbulb,
  History,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  PestType,
  Severity,
  PestStatus,
  SEVERITY_LABELS,
  PEST_TYPE_LABELS,
  PEST_STATUS_LABELS,
} from "@/types";
import { today, formatDate } from "@/utils/format";
import { compressImage } from "@/utils/export";
import { getPestHistoryByPlantAndName } from "@/utils/helpers";

export function PestForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plants = useAppStore((s) => s.plants);
  const pestRecords = useAppStore((s) => s.pestRecords);
  const addPestRecord = useAppStore((s) => s.addPestRecord);

  const preselectedPlant = searchParams.get("plantId") || (plants[0]?.id ?? "");

  const [form, setForm] = useState({
    plantId: preselectedPlant,
    type: "disease" as PestType,
    name: "",
    discoveredDate: today(),
    severity: "medium" as Severity,
    symptoms: "",
    treatmentMethod: "",
    treatmentDate: today(),
    treatmentEffect: "",
    followUpNotes: "",
    status: "ongoing" as PestStatus,
    resolvedDate: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const pestHistory = useMemo(() => {
    if (!form.plantId || !form.name.trim()) return [];
    return getPestHistoryByPlantAndName(
      form.plantId,
      form.name,
      pestRecords
    );
  }, [form.plantId, form.name, pestRecords]);

  const hasHistory = pestHistory.length > 0;

  const recommendedTreatment = useMemo(() => {
    if (!hasHistory) return "";
    const resolved = pestHistory.filter(
      (r) => r.status === "resolved" && r.treatmentMethod && r.treatmentEffect
    );
    if (resolved.length === 0) {
      const withTreatment = pestHistory.filter((r) => r.treatmentMethod);
      return withTreatment.length > 0 ? withTreatment[0].treatmentMethod : "";
    }
    const scored = resolved.map((r) => {
      let score = 0;
      const effect = r.treatmentEffect.toLowerCase();
      if (effect.includes("完全") || effect.includes("痊愈") || effect.includes("全部")) score = 3;
      else if (effect.includes("明显") || effect.includes("显著") || effect.includes("很好")) score = 2;
      else if (effect.includes("有效果") || effect.includes("有效") || effect.includes("好转")) score = 1;
      return { record: r, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].record.treatmentMethod;
  }, [pestHistory, hasHistory]);

  const applyRecommendedTreatment = () => {
    if (recommendedTreatment) {
      setForm((f) => ({ ...f, treatmentMethod: recommendedTreatment }));
    }
  };

  useEffect(() => {
    if (!form.plantId && plants[0]) {
      setForm((f) => ({ ...f, plantId: plants[0].id }));
    }
  }, [plants, form.plantId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i]);
        newImages.push(compressed);
      }
      setImages((prev) => [...prev, ...newImages]);
    } catch {
      alert("图片处理失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plantId) {
      alert("请先添加植物");
      return;
    }
    if (!form.name.trim()) {
      alert("请输入病虫害名称");
      return;
    }
    addPestRecord({
      ...form,
      images,
    });
    navigate("/pests");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/pests" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">🐛 记录病虫害</h1>
          <p className="page-subtitle">详细记录症状、防治方法和跟踪效果</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">类型</label>
          <div className="grid grid-cols-2 gap-3">
            {(["disease", "pest"] as PestType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  form.type === t
                    ? "border-forest-500 bg-forest-50"
                    : "border-forest-100 bg-white hover:border-forest-300"
                }`}
              >
                <div className="text-3xl mb-1">{t === "disease" ? "🦠" : "🐛"}</div>
                <div className="font-medium text-forest-800">{PEST_TYPE_LABELS[t]}</div>
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
            <label className="label">病虫害名称 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="如：黑斑病、蚜虫、白粉病"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {hasHistory && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-amber-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-800">
                      ⚠️ 该植物曾发生过「{form.name}」{pestHistory.length}{" "}
                      次，请注意复发风险
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                      className="text-xs text-amber-600 hover:text-amber-800 mt-1 underline underline-offset-2"
                    >
                      {showHistoryPanel ? "收起历史记录" : "查看历史记录"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {hasHistory && recommendedTreatment && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-start gap-2">
                  <Lightbulb
                    size={16}
                    className="text-emerald-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-800">
                      💡 推荐历史有效方案
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      {recommendedTreatment}
                    </p>
                    <button
                      type="button"
                      onClick={applyRecommendedTreatment}
                      className="mt-2 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      应用此方案
                    </button>
                  </div>
                </div>
              </div>
            )}
            {hasHistory && showHistoryPanel && (
              <div className="mt-3 p-3 rounded-xl bg-forest-50 border border-forest-200">
                <div className="flex items-center gap-2 mb-2">
                  <History size={14} className="text-forest-600" />
                  <span className="text-sm font-medium text-forest-800">
                    历史记录
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pestHistory.map((record) => (
                    <div
                      key={record.id}
                      className="p-2.5 rounded-lg bg-white border border-forest-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-forest-500">
                          {formatDate(record.discoveredDate)}
                        </span>
                        <span
                          className={`text-xs tag ${
                            record.status === "resolved"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {record.status === "resolved" ? "已解决" : "处理中"}
                        </span>
                      </div>
                      <p className="text-xs text-forest-700 mt-1">
                        严重程度：{SEVERITY_LABELS[record.severity]}
                      </p>
                      {record.treatmentEffect && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          效果：{record.treatmentEffect}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">发现日期</label>
            <input
              type="date"
              className="input-field"
              value={form.discoveredDate}
              onChange={(e) => setForm({ ...form, discoveredDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">严重程度</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as Severity[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, severity: s })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.severity === s
                      ? s === "low"
                        ? "bg-amber-100 ring-2 ring-amber-400 text-amber-700"
                        : s === "medium"
                        ? "bg-orange-100 ring-2 ring-orange-400 text-orange-700"
                        : "bg-red-100 ring-2 ring-red-400 text-red-700"
                      : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                  }`}
                >
                  {SEVERITY_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label">症状描述</label>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="详细描述观察到的症状，如叶片出现的斑点、虫子形态、位置分布等..."
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
          />
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Upload size={16} className="text-forest-500" />
            症状照片
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden bg-forest-50 group"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-forest-200 hover:border-forest-400 bg-forest-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors text-forest-400 hover:text-forest-600">
              <ImagePlus size={28} />
              <span className="text-xs mt-1">{uploading ? "处理中..." : "添加图片"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">防治方法</label>
            <textarea
              className="textarea-field"
              rows={3}
              placeholder="使用的药物、处理方式、操作步骤..."
              value={form.treatmentMethod}
              onChange={(e) => setForm({ ...form, treatmentMethod: e.target.value })}
            />
          </div>
          <div>
            <label className="label">处理日期</label>
            <input
              type="date"
              className="input-field mb-3"
              value={form.treatmentDate}
              onChange={(e) => setForm({ ...form, treatmentDate: e.target.value })}
            />
            <label className="label">处理效果</label>
            <textarea
              className="textarea-field"
              rows={2}
              placeholder="观察到的效果变化..."
              value={form.treatmentEffect}
              onChange={(e) => setForm({ ...form, treatmentEffect: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">当前状态</label>
            <div className="flex gap-2">
              {(["ongoing", "resolved"] as PestStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      status: s,
                      resolvedDate: s === "resolved" ? form.resolvedDate || today() : "",
                    })
                  }
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.status === s
                      ? s === "ongoing"
                        ? "bg-amber-100 ring-2 ring-amber-400 text-amber-700"
                        : "bg-emerald-100 ring-2 ring-emerald-400 text-emerald-700"
                      : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                  }`}
                >
                  {PEST_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          {form.status === "resolved" && (
            <div>
              <label className="label">解决日期</label>
              <input
                type="date"
                className="input-field"
                value={form.resolvedDate}
                onChange={(e) => setForm({ ...form, resolvedDate: e.target.value })}
              />
            </div>
          )}
        </div>

        <div>
          <label className="label">后续备注</label>
          <textarea
            className="textarea-field"
            rows={2}
            placeholder="复查计划、注意事项等..."
            value={form.followUpNotes}
            onChange={(e) => setForm({ ...form, followUpNotes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/pests" className="btn-secondary">
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
