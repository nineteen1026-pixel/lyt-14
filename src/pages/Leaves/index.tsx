import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Image as ImageIcon, X, ZoomIn } from "lucide-react";
import { useAppStore } from "@/store";
import { LEAF_COLOR_LABELS, LEAF_CURL_LABELS } from "@/types";
import { formatDate, getRelativeTime } from "@/utils/format";
import { getAllLeafImages } from "@/utils/helpers";

export function Leaves() {
  const [searchParams] = useSearchParams();
  const plants = useAppStore((s) => s.plants);
  const leafRecords = useAppStore((s) => s.leafRecords);
  const deleteLeafRecord = useAppStore((s) => s.deleteLeafRecord);

  const [plantFilter, setPlantFilter] = useState(searchParams.get("plantId") || "全部");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "gallery">("gallery");

  const filtered =
    plantFilter === "全部"
      ? leafRecords
      : leafRecords.filter((r) => r.plantId === plantFilter);

  const allImages = getAllLeafImages(
    plantFilter === "全部" ? leafRecords : leafRecords.filter((r) => r.plantId === plantFilter)
  );

  const getPlantName = (id: string) => plants.find((p) => p.id === id)?.name || "未知";
  const getPlantAvatar = (id: string) => plants.find((p) => p.id === id)?.avatar || "🌿";

  const handleDelete = (id: string) => {
    if (confirm("确定删除这条叶片记录吗？")) deleteLeafRecord(id);
  };

  const colorMap: Record<string, string> = {
    normal: "bg-forest-500",
    yellowing: "bg-yellow-500",
    browning: "bg-amber-700",
    spotting: "bg-orange-500",
    wilting: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 page-header">
        <div>
          <h1 className="page-title">🍃 叶片监测</h1>
          <p className="page-subtitle">
            {leafRecords.length} 条记录 · {allImages.length} 张照片
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-forest-50 rounded-full p-1">
            <button
              onClick={() => setViewMode("gallery")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === "gallery"
                  ? "bg-white shadow text-forest-800"
                  : "text-forest-600 hover:text-forest-800"
              }`}
            >
              图片画廊
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white shadow text-forest-800"
                  : "text-forest-600 hover:text-forest-800"
              }`}
            >
              记录列表
            </button>
          </div>
          <Link to="/leaves/new" className="btn-primary">
            <Plus size={18} />
            添加记录
          </Link>
        </div>
      </div>

      {plants.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPlantFilter("全部")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                plantFilter === "全部"
                  ? "bg-forest-700 text-white"
                  : "bg-forest-50 text-forest-700 hover:bg-forest-100"
              }`}
            >
              全部植物
            </button>
            {plants.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlantFilter(p.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  plantFilter === p.id
                    ? "bg-forest-700 text-white"
                    : "bg-forest-50 text-forest-700 hover:bg-forest-100"
                }`}
              >
                {p.avatar} {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === "gallery" ? (
        allImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {allImages.map((img, i) => (
              <div
                key={i}
                className={`group relative aspect-square rounded-2xl overflow-hidden bg-forest-50 cursor-zoom-in animate-fade-in-up opacity-0 stagger-${Math.min((i % 6) + 1, 6)}`}
                onClick={() => setPreviewImage(img.image)}
              >
                {img.image.startsWith("data:") ? (
                  <img
                    src={img.image}
                    alt="叶片"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🍃
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                  <div className="text-white text-xs">
                    <p className="font-medium">
                      {getPlantAvatar(img.plantId)} {getPlantName(img.plantId)}
                    </p>
                    <p className="opacity-80">{formatDate(img.date)}</p>
                  </div>
                  <ZoomIn
                    size={18}
                    className="absolute top-3 right-3 text-white/80"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <div className="text-6xl mb-4">
              <ImageIcon className="inline text-forest-300" size={60} />
            </div>
            <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
              还没有叶片照片
            </h3>
            <p className="text-sm text-forest-500 mb-6">
              记录叶片状态变化，上传照片跟踪植物健康
            </p>
            <Link to="/leaves/new" className="btn-primary">
              <Plus size={18} />
              添加记录
            </Link>
          </div>
        )
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <div
              key={r.id}
              className={`card p-4 animate-fade-in-up opacity-0 stagger-${Math.min((i % 6) + 1, 6)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {r.images.length > 0 && r.images[0].startsWith("data:") ? (
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden bg-forest-50 cursor-zoom-in"
                      onClick={() => setPreviewImage(r.images[0])}
                    >
                      <img src={r.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-forest-50 flex items-center justify-center text-3xl">
                      🍃
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/plants/${r.plantId}`}
                      className="font-medium text-forest-800 hover:text-forest-900 flex items-center gap-1.5"
                    >
                      <span>{getPlantAvatar(r.plantId)}</span>
                      {getPlantName(r.plantId)}
                    </Link>
                    <span className={`w-2.5 h-2.5 rounded-full ${colorMap[r.colorStatus]}`} />
                    <span className="tag bg-forest-50 text-forest-700">
                      {LEAF_COLOR_LABELS[r.colorStatus]}
                    </span>
                    <span className="tag bg-amber-50 text-amber-700">
                      {LEAF_CURL_LABELS[r.curlStatus]}
                    </span>
                    {r.spots.length > 0 && (
                      <span className="tag bg-orange-50 text-orange-700">
                        {r.spots.length}处斑点
                      </span>
                    )}
                  </div>
                  {r.notes && (
                    <p className="text-sm text-forest-600 mt-2">📝 {r.notes}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-forest-400">
                    <span>{formatDate(r.date)}</span>
                    <span>·</span>
                    <span>{getRelativeTime(r.date)}</span>
                    {r.images.length > 1 && (
                      <>
                        <span>·</span>
                        <span>{r.images.length}张照片</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🍃</div>
          <h3 className="font-bold text-forest-800 text-lg mb-2 font-serif">
            没有符合条件的记录
          </h3>
          <p className="text-sm text-forest-500">调整筛选条件或添加新记录</p>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            onClick={() => setPreviewImage(null)}
          >
            <X size={20} />
          </button>
          <img
            src={previewImage}
            alt="预览"
            className="max-w-full max-h-full rounded-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
