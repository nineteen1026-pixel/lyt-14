import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, BookOpen, Droplets, Sprout, Sun, Check } from "lucide-react";
import { useAppStore } from "@/store";
import {
  PLANT_CATEGORIES,
  PLANT_EMOJIS,
  PlantCategory,
  LIGHT_INTENSITY_LABELS,
  type CareTemplate,
} from "@/types";
import { today } from "@/utils/format";

export function PlantForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const getPlantById = useAppStore((s) => s.getPlantById);
  const addPlant = useAppStore((s) => s.addPlant);
  const addPlantWithTemplate = useAppStore((s) => s.addPlantWithTemplate);
  const updatePlant = useAppStore((s) => s.updatePlant);
  const careTemplates = useAppStore((s) => s.careTemplates);

  const existingPlant = id ? getPlantById(id) : undefined;

  const [form, setForm] = useState<{
    name: string;
    species: string;
    category: PlantCategory | string;
    plantedDate: string;
    location: string;
    avatar: string;
    notes: string;
  }>({
    name: "",
    species: "",
    category: PLANT_CATEGORIES[0],
    plantedDate: today(),
    location: "",
    avatar: PLANT_EMOJIS[0],
    notes: "",
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const categoryTemplates = useMemo(() => {
    return careTemplates.filter((t) => t.category === form.category);
  }, [careTemplates, form.category]);

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return careTemplates.find((t) => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId, careTemplates]);

  useEffect(() => {
    if (categoryTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(categoryTemplates[0].id);
    } else if (categoryTemplates.length === 0) {
      setSelectedTemplateId(null);
    }
  }, [form.category, categoryTemplates, selectedTemplateId]);

  useEffect(() => {
    if (existingPlant) {
      setForm({
        name: existingPlant.name,
        species: existingPlant.species,
        category: existingPlant.category,
        plantedDate: existingPlant.plantedDate,
        location: existingPlant.location,
        avatar: existingPlant.avatar,
        notes: existingPlant.notes,
      });
    }
  }, [existingPlant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("请输入植物名称");
      return;
    }
    if (isEdit && id) {
      updatePlant(id, form);
    } else {
      if (selectedTemplateId) {
        addPlantWithTemplate(form, selectedTemplateId);
      } else {
        addPlant(form);
      }
    }
    navigate("/plants");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/plants" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">
            {isEdit ? "✏️ 编辑植物" : "🌱 添加新植物"}
          </h1>
          <p className="page-subtitle">
            {isEdit ? "更新植物的基本信息" : "记录植物的基本档案信息"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">植物头像</label>
          <div className="flex flex-wrap gap-2">
            {PLANT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm({ ...form, avatar: emoji })}
                className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 ${
                  form.avatar === emoji
                    ? "bg-forest-100 ring-2 ring-forest-500 scale-110"
                    : "bg-forest-50 hover:bg-forest-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">植物名称 *</label>
            <input
              type="text"
              className="input-field"
              placeholder="如：绿萝"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">品种/学名</label>
            <input
              type="text"
              className="input-field"
              placeholder="如：Epipremnum aureum"
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">植物分类</label>
            <select
              className="select-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {PLANT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">种植日期</label>
            <input
              type="date"
              className="input-field"
              value={form.plantedDate}
              onChange={(e) => setForm({ ...form, plantedDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">养护位置</label>
          <input
            type="text"
            className="input-field"
            placeholder="如：客厅窗边、阳台南"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        {!isEdit && (
          <div className="pt-2">
            <label className="label flex items-center gap-2">
              <BookOpen size={16} />
              选择养护模板
              <span className="text-xs text-forest-400 font-normal">
                新建植物可一键套用养护方案
              </span>
            </label>

            {categoryTemplates.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {categoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedTemplateId === template.id
                          ? "bg-forest-600 text-white shadow-md"
                          : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                      }`}
                    >
                      <span className="text-lg">{template.emoji}</span>
                      <span>{template.name}</span>
                      {selectedTemplateId === template.id && (
                        <Check size={14} />
                      )}
                    </button>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-forest-50 to-sky-50 border border-forest-200 space-y-3">
                    <p className="text-sm text-forest-600">
                      {selectedTemplate.description}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <div className="text-xl mb-1">💧</div>
                        <p className="text-xs text-forest-500">浇水</p>
                        <p className="text-sm font-bold text-forest-800">
                          每 {selectedTemplate.watering.intervalDays} 天
                        </p>
                      </div>
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <div className="text-xl mb-1">🌾</div>
                        <p className="text-xs text-forest-500">施肥</p>
                        <p className="text-sm font-bold text-forest-800">
                          每 {selectedTemplate.fertilizing.intervalDays} 天
                        </p>
                      </div>
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <div className="text-xl mb-1">☀️</div>
                        <p className="text-xs text-forest-500">光照</p>
                        <p className="text-sm font-bold text-forest-800">
                          {selectedTemplate.lighting.dailyDurationHours}h/天
                        </p>
                      </div>
                    </div>
                    {selectedTemplate.generalTips && (
                      <p className="text-xs text-forest-500 pt-2 border-t border-forest-200/50">
                        💡 {selectedTemplate.generalTips}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 text-center text-sm text-gray-500">
                该分类暂无养护模板，植物创建后可手动设置养护计划
              </div>
            )}
          </div>
        )}

        <div>
          <label className="label">备注</label>
          <textarea
            className="textarea-field"
            rows={4}
            placeholder="记录植物的习性、养护要点等..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/plants" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={18} />
            {isEdit ? "保存修改" : "添加植物"}
          </button>
        </div>
      </form>
    </div>
  );
}
