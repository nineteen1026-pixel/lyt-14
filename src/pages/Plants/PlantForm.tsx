import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAppStore } from "@/store";
import { PLANT_CATEGORIES, PLANT_EMOJIS, PlantCategory } from "@/types";
import { today } from "@/utils/format";

export function PlantForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const getPlantById = useAppStore((s) => s.getPlantById);
  const addPlant = useAppStore((s) => s.addPlant);
  const updatePlant = useAppStore((s) => s.updatePlant);

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
      addPlant(form);
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
