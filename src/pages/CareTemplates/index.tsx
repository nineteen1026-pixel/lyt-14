import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Droplets,
  Sprout,
  Sun,
  BookOpen,
  Sparkles,
  Copy,
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  PLANT_CATEGORIES,
  LIGHT_INTENSITY_LABELS,
  type CareTemplate,
} from "@/types";
import { formatDate } from "@/utils/format";

export function CareTemplates() {
  const careTemplates = useAppStore((s) => s.careTemplates);
  const deleteCareTemplate = useAppStore((s) => s.deleteCareTemplate);
  const addCareTemplate = useAppStore((s) => s.addCareTemplate);
  const plants = useAppStore((s) => s.plants);

  const [categoryFilter, setCategoryFilter] = useState("全部");

  const filtered = useMemo(() => {
    return careTemplates.filter((t) => {
      const matchCategory =
        categoryFilter === "全部" || t.category === categoryFilter;
      return matchCategory;
    });
  }, [careTemplates, categoryFilter]);

  const getPlantCountByCategory = (category: string) => {
    return plants.filter((p) => p.category === category).length;
  };

  const handleDelete = (template: CareTemplate) => {
    if (template.isPreset) {
      alert("预设模板不可删除");
      return;
    }
    if (confirm(`确定删除模板「${template.name}」吗？`)) {
      deleteCareTemplate(template.id);
    }
  };

  const handleDuplicate = (template: CareTemplate) => {
    addCareTemplate({
      name: `${template.name} (副本)`,
      category: template.category,
      description: template.description,
      emoji: template.emoji,
      watering: { ...template.watering },
      fertilizing: { ...template.fertilizing },
      lighting: { ...template.lighting },
      generalTips: template.generalTips,
    });
  };

  const presetCount = careTemplates.filter((t) => t.isPreset).length;
  const customCount = careTemplates.filter((t) => !t.isPreset).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">📚 养护方案模板库</h1>
          <p className="page-subtitle">
            共 {careTemplates.length} 个模板，预设 {presetCount} 个，自定义 {customCount} 个
          </p>
        </div>
        <Link to="/care-templates/new" className="btn-primary">
          <Plus size={18} />
          新建模板
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-forest-50 text-forest-600 flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-sm text-forest-500">模板总数</p>
              <p className="text-2xl font-bold text-forest-900 font-serif">
                {careTemplates.length}
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
              <p className="text-sm text-forest-500">预设模板</p>
              <p className="text-2xl font-bold text-forest-900 font-serif">
                {presetCount}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sprout size={22} />
            </div>
            <div>
              <p className="text-sm text-forest-500">覆盖植物</p>
              <p className="text-2xl font-bold text-forest-900 font-serif">
                {plants.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("全部")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              categoryFilter === "全部"
                ? "bg-forest-700 text-white"
                : "bg-forest-50 text-forest-700 hover:bg-forest-100"
            }`}
          >
            全部类别
          </button>
          {PLANT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoryFilter === c
                  ? "bg-forest-700 text-white"
                  : "bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template, i) => {
            const plantCount = getPlantCountByCategory(template.category);
            return (
              <div
                key={template.id}
                className={`card p-5 animate-fade-in-up opacity-0 stagger-${
                  Math.min((i % 6) + 1, 6)
                } hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center text-3xl shadow-sm">
                    {template.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-forest-900 font-serif text-base truncate">
                        {template.name}
                      </h3>
                      {template.isPreset && (
                        <span className="tag bg-sky-50 text-sky-700 text-xs">
                          预设
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-forest-500 mt-1">
                      {template.category} · {plantCount} 株植物适用
                    </p>
                  </div>
                </div>

                <p className="text-sm text-forest-600 mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center flex-shrink-0">
                      <Droplets size={16} />
                    </div>
                    <div>
                      <p className="text-forest-500 text-xs">浇水</p>
                      <p className="text-forest-800 font-medium">
                        每 {template.watering.intervalDays} 天 · {template.watering.defaultAmount}ml
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-500 flex items-center justify-center flex-shrink-0">
                      <Sprout size={16} />
                    </div>
                    <div>
                      <p className="text-forest-500 text-xs">施肥</p>
                      <p className="text-forest-800 font-medium">
                        每 {template.fertilizing.intervalDays} 天 · {template.fertilizing.defaultFertilizerType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                      <Sun size={16} />
                    </div>
                    <div>
                      <p className="text-forest-500 text-xs">光照</p>
                      <p className="text-forest-800 font-medium">
                        {LIGHT_INTENSITY_LABELS[template.lighting.recommendedIntensity]} · {template.lighting.dailyDurationHours}h/天
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-forest-100">
                  <p className="text-xs text-forest-400 mb-3">
                    更新于 {formatDate(template.updatedAt)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-forest-50 text-forest-600 hover:bg-forest-100 transition-colors flex items-center justify-center gap-1"
                      title="复制模板"
                    >
                      <Copy size={14} />
                      复制
                    </button>
                    <Link
                      to={`/care-templates/${template.id}/edit`}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors flex items-center justify-center gap-1"
                      title="编辑"
                    >
                      <Edit2 size={14} />
                      编辑
                    </Link>
                    {!template.isPreset && (
                      <button
                        onClick={() => handleDelete(template)}
                        className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">
            <BookOpen className="inline text-forest-300" size={60} />
          </div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            暂无养护模板
          </h3>
          <p className="text-sm text-forest-500 mb-6">
            创建自定义养护模板，方便快速应用到植物上
          </p>
          <Link to="/care-templates/new" className="btn-primary">
            <Plus size={18} />
            创建第一个模板
          </Link>
        </div>
      )}
    </div>
  );
}
