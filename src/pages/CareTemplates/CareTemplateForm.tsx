import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Droplets, Sprout, Sun, Lightbulb } from "lucide-react";
import { useAppStore } from "@/store";
import {
  PLANT_CATEGORIES,
  PLANT_EMOJIS,
  LIGHT_INTENSITY_LABELS,
  type LightIntensity,
  type PlantCategory,
} from "@/types";

export function CareTemplateForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const getTemplateById = useAppStore((s) => s.getTemplateById);
  const addCareTemplate = useAppStore((s) => s.addCareTemplate);
  const updateCareTemplate = useAppStore((s) => s.updateCareTemplate);

  const existingTemplate = id ? getTemplateById(id) : undefined;

  const [form, setForm] = useState<{
    name: string;
    category: PlantCategory;
    description: string;
    emoji: string;
    watering: {
      intervalDays: number;
      defaultAmount: number;
      tips: string;
    };
    fertilizing: {
      intervalDays: number;
      defaultAmount: number;
      defaultFertilizerType: string;
      tips: string;
    };
    lighting: {
      recommendedIntensity: LightIntensity;
      dailyDurationHours: number;
      tips: string;
    };
    generalTips: string;
  }>({
    name: "",
    category: PLANT_CATEGORIES[0],
    description: "",
    emoji: PLANT_EMOJIS[0],
    watering: {
      intervalDays: 7,
      defaultAmount: 200,
      tips: "",
    },
    fertilizing: {
      intervalDays: 30,
      defaultAmount: 5,
      defaultFertilizerType: "复合肥",
      tips: "",
    },
    lighting: {
      recommendedIntensity: "medium",
      dailyDurationHours: 4,
      tips: "",
    },
    generalTips: "",
  });

  useEffect(() => {
    if (existingTemplate) {
      setForm({
        name: existingTemplate.name,
        category: existingTemplate.category,
        description: existingTemplate.description,
        emoji: existingTemplate.emoji,
        watering: { ...existingTemplate.watering },
        fertilizing: { ...existingTemplate.fertilizing },
        lighting: { ...existingTemplate.lighting },
        generalTips: existingTemplate.generalTips,
      });
    }
  }, [existingTemplate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("请输入模板名称");
      return;
    }
    if (isEdit && id) {
      updateCareTemplate(id, form);
    } else {
      addCareTemplate(form);
    }
    navigate("/care-templates");
  };

  const updateWatering = (field: string, value: any) => {
    setForm({
      ...form,
      watering: { ...form.watering, [field]: value },
    });
  };

  const updateFertilizing = (field: string, value: any) => {
    setForm({
      ...form,
      fertilizing: { ...form.fertilizing, [field]: value },
    });
  };

  const updateLighting = (field: string, value: any) => {
    setForm({
      ...form,
      lighting: { ...form.lighting, [field]: value },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/care-templates" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">
            {isEdit ? "✏️ 编辑养护模板" : "➕ 新建养护模板"}
          </h1>
          <p className="page-subtitle">
            {isEdit ? "更新模板的养护参数" : "创建一个新的养护方案模板"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-forest-800 font-serif text-lg flex items-center gap-2">
            <span>📋</span> 基本信息
          </h2>

          <div>
            <label className="label">模板图标</label>
            <div className="flex flex-wrap gap-2">
              {PLANT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, emoji })}
                  className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 ${
                    form.emoji === emoji
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
              <label className="label">模板名称 *</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：观叶植物标准养护"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">适用分类</label>
              <select
                className="select-field"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as PlantCategory })
                }
              >
                {PLANT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">模板描述</label>
            <input
              type="text"
              className="input-field"
              placeholder="简要描述这个模板适合什么样的植物"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-forest-800 font-serif text-lg flex items-center gap-2">
            <Droplets size={20} className="text-sky-500" /> 浇水参数
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">浇水周期（天）</label>
              <input
                type="number"
                min="1"
                max="90"
                className="input-field"
                value={form.watering.intervalDays}
                onChange={(e) =>
                  updateWatering(
                    "intervalDays",
                    parseInt(e.target.value) || 1
                  )
                }
              />
            </div>
            <div>
              <label className="label">默认水量（ml）</label>
              <input
                type="number"
                min="10"
                max="2000"
                className="input-field"
                value={form.watering.defaultAmount}
                onChange={(e) =>
                  updateWatering(
                    "defaultAmount",
                    parseInt(e.target.value) || 100
                  )
                }
              />
            </div>
          </div>

          <div>
            <label className="label">浇水小贴士</label>
            <textarea
              className="textarea-field"
              rows={2}
              placeholder="记录浇水注意事项..."
              value={form.watering.tips}
              onChange={(e) => updateWatering("tips", e.target.value)}
            />
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-forest-800 font-serif text-lg flex items-center gap-2">
            <Sprout size={20} className="text-forest-500" /> 施肥参数
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">施肥周期（天）</label>
              <input
                type="number"
                min="1"
                max="180"
                className="input-field"
                value={form.fertilizing.intervalDays}
                onChange={(e) =>
                  updateFertilizing(
                    "intervalDays",
                    parseInt(e.target.value) || 7
                  )
                }
              />
            </div>
            <div>
              <label className="label">默认用量（g）</label>
              <input
                type="number"
                min="1"
                max="100"
                className="input-field"
                value={form.fertilizing.defaultAmount}
                onChange={(e) =>
                  updateFertilizing(
                    "defaultAmount",
                    parseInt(e.target.value) || 5
                  )
                }
              />
            </div>
            <div>
              <label className="label">肥料类型</label>
              <input
                type="text"
                className="input-field"
                placeholder="如：复合肥"
                value={form.fertilizing.defaultFertilizerType}
                onChange={(e) =>
                  updateFertilizing("defaultFertilizerType", e.target.value)
                }
              />
            </div>
          </div>

          <div>
            <label className="label">施肥小贴士</label>
            <textarea
              className="textarea-field"
              rows={2}
              placeholder="记录施肥注意事项..."
              value={form.fertilizing.tips}
              onChange={(e) => updateFertilizing("tips", e.target.value)}
            />
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-forest-800 font-serif text-lg flex items-center gap-2">
            <Sun size={20} className="text-amber-500" /> 光照参数
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">推荐光照强度</label>
              <select
                className="select-field"
                value={form.lighting.recommendedIntensity}
                onChange={(e) =>
                  updateLighting(
                    "recommendedIntensity",
                    e.target.value as LightIntensity
                  )
                }
              >
                {Object.entries(LIGHT_INTENSITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">每日光照时长（小时）</label>
              <input
                type="number"
                min="1"
                max="16"
                className="input-field"
                value={form.lighting.dailyDurationHours}
                onChange={(e) =>
                  updateLighting(
                    "dailyDurationHours",
                    parseInt(e.target.value) || 4
                  )
                }
              />
            </div>
          </div>

          <div>
            <label className="label">光照小贴士</label>
            <textarea
              className="textarea-field"
              rows={2}
              placeholder="记录光照注意事项..."
              value={form.lighting.tips}
              onChange={(e) => updateLighting("tips", e.target.value)}
            />
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-forest-800 font-serif text-lg flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" /> 综合养护建议
          </h2>
          <textarea
            className="textarea-field"
            rows={3}
            placeholder="记录综合养护建议、注意事项..."
            value={form.generalTips}
            onChange={(e) =>
              setForm({ ...form, generalTips: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/care-templates" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={18} />
            {isEdit ? "保存修改" : "创建模板"}
          </button>
        </div>
      </form>
    </div>
  );
}
