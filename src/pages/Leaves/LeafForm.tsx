import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, ImagePlus } from "lucide-react";
import { useAppStore } from "@/store";
import {
  LeafColor,
  LeafCurl,
  LEAF_COLOR_LABELS,
  LEAF_CURL_LABELS,
} from "@/types";
import { today } from "@/utils/format";
import { compressImage } from "@/utils/export";

export function LeafForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plants = useAppStore((s) => s.plants);
  const addLeafRecord = useAppStore((s) => s.addLeafRecord);

  const preselectedPlant = searchParams.get("plantId") || (plants[0]?.id ?? "");

  const [form, setForm] = useState({
    plantId: preselectedPlant,
    date: today(),
    colorStatus: "normal" as LeafColor,
    curlStatus: "none" as LeafCurl,
    notes: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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
    addLeafRecord({
      ...form,
      spots: [],
      images,
    });
    navigate("/leaves");
  };

  const colorOptions: Array<{ value: LeafColor; bg: string }> = [
    { value: "normal", bg: "bg-forest-500" },
    { value: "yellowing", bg: "bg-yellow-500" },
    { value: "browning", bg: "bg-amber-700" },
    { value: "spotting", bg: "bg-orange-500" },
    { value: "wilting", bg: "bg-red-500" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/leaves" className="btn-ghost p-2">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title mb-0">🍃 叶片观察记录</h1>
          <p className="page-subtitle">记录叶片状态，上传照片跟踪变化</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
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
            <label className="label">观察日期</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">叶片颜色状态</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, colorStatus: opt.value })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  form.colorStatus === opt.value
                    ? "bg-forest-50 ring-2 ring-forest-500"
                    : "bg-forest-50/50 hover:bg-forest-50"
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${opt.bg}`} />
                {LEAF_COLOR_LABELS[opt.value]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">叶片卷曲程度</label>
          <div className="flex flex-wrap gap-2">
            {(["none", "slight", "moderate", "severe"] as LeafCurl[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm({ ...form, curlStatus: opt })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  form.curlStatus === opt
                    ? "bg-forest-50 ring-2 ring-forest-500 text-forest-800"
                    : "bg-forest-50/50 text-forest-700 hover:bg-forest-50"
                }`}
              >
                {LEAF_CURL_LABELS[opt]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Upload size={16} className="text-forest-500" />
            上传叶片照片
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
          <p className="text-xs text-forest-400 mt-2">
            支持 JPG/PNG 格式，图片会自动压缩保存
          </p>
        </div>

        <div>
          <label className="label">观察备注</label>
          <textarea
            className="textarea-field"
            rows={4}
            placeholder="记录叶片的具体观察、异常情况或其他备注..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/leaves" className="btn-secondary">
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
