import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Thermometer, Droplets, Sun, MapPin } from "lucide-react";
import { useAppStore } from "@/store";
import { ENVIRONMENT_FIELD_UNITS } from "@/types";
import { today } from "@/utils/format";

export function EnvironmentForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plants = useAppStore((s) => s.plants);
  const getEnvironmentLocations = useAppStore((s) => s.getEnvironmentLocations);
  const addEnvironmentRecord = useAppStore((s) => s.addEnvironmentRecord);

  const presetLocation = searchParams.get("location") || "";
  const existingLocations = getEnvironmentLocations();
  const plantLocations = Array.from(
    new Set(plants.map((p) => p.location).filter(Boolean))
  );

  const [form, setForm] = useState({
    location: presetLocation || plantLocations[0] || existingLocations[0] || "",
    locationInput: "",
    isNewLocation: false,
    date: today(),
    temperature: "",
    humidity: "",
    light: "",
    notes: "",
  });

  useEffect(() => {
    if (!form.location && plantLocations[0]) {
      setForm((f) => ({ ...f, location: plantLocations[0] }));
    }
  }, [plantLocations, form.location]);

  const allLocationOptions = Array.from(
    new Set([...plantLocations, ...existingLocations])
  ).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLocation = form.isNewLocation ? form.locationInput.trim() : form.location;
    if (!finalLocation) {
      alert("请选择或输入监测位置");
      return;
    }
    if (form.temperature === "" || form.humidity === "" || form.light === "") {
      alert("请填写温度、湿度和光照数据");
      return;
    }
    addEnvironmentRecord({
      location: finalLocation,
      date: form.date,
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
      light: Number(form.light),
      notes: form.notes,
    });
    navigate(`/environment?location=${encodeURIComponent(finalLocation)}`);
  };

  const plantsAtLocation = plants.filter(
    (p) =>
      p.location &&
      p.location === (form.isNewLocation ? form.locationInput : form.location)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/environment" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">🌡️ 记录环境</h1>
          <p className="page-subtitle">记录植物生长位置的温湿度与光照数据</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label flex items-center gap-2">
            <MapPin size={16} className="text-forest-500" /> 监测位置 *
          </label>
          {!form.isNewLocation ? (
            <div className="space-y-2">
              {allLocationOptions.length > 0 ? (
                <select
                  className="select-field"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  <option value="">请选择位置</option>
                  {allLocationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：客厅窗边、阳台南"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              )}
              <button
                type="button"
                onClick={() => setForm({ ...form, isNewLocation: true, locationInput: "" })}
                className="text-sm text-forest-600 hover:text-forest-800 underline underline-offset-2"
              >
                + 添加新位置
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                className="input-field"
                placeholder="输入新位置名称，如：书房桌面"
                value={form.locationInput}
                onChange={(e) => setForm({ ...form, locationInput: e.target.value })}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, isNewLocation: false })}
                className="text-sm text-forest-600 hover:text-forest-800 underline underline-offset-2"
              >
                从已有位置选择
              </button>
            </div>
          )}
          {plantsAtLocation.length > 0 && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-700 mb-2">该位置关联植物：</p>
              <div className="flex flex-wrap gap-1.5">
                {plantsAtLocation.map((p) => (
                  <span
                    key={p.id}
                    className="px-2 py-1 bg-white text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
                  >
                    {p.avatar} {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="label">记录日期</label>
          <input
            type="date"
            className="input-field"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label flex items-center gap-2">
              <Thermometer size={16} className="text-red-400" />
              温度 ({ENVIRONMENT_FIELD_UNITS.temperature}) *
            </label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              placeholder="如：22.5"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value })}
            />
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <Droplets size={16} className="text-sky-400" />
              湿度 ({ENVIRONMENT_FIELD_UNITS.humidity}) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="input-field"
              placeholder="如：60"
              value={form.humidity}
              onChange={(e) => setForm({ ...form, humidity: e.target.value })}
            />
          </div>
          <div>
            <label className="label flex items-center gap-2">
              <Sun size={16} className="text-amber-400" />
              光照 ({ENVIRONMENT_FIELD_UNITS.light}) *
            </label>
            <input
              type="number"
              min="0"
              step="100"
              className="input-field"
              placeholder="如：5000"
              value={form.light}
              onChange={(e) => setForm({ ...form, light: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">备注</label>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="记录当天环境的特殊情况，如阴雨天、开空调等..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/environment" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={18} />
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
