import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Leaf,
  Droplets,
  Bug,
  BarChart3,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store";

const navItems = [
  { path: "/", label: "仪表盘", icon: LayoutDashboard, emoji: "🌿" },
  { path: "/plants", label: "植物管理", icon: Leaf, emoji: "🪴" },
  { path: "/care-logs", label: "养护日志", icon: Droplets, emoji: "💧" },
  { path: "/leaves", label: "叶片监测", icon: ImageIcon, emoji: "🍃" },
  { path: "/pests", label: "病虫害", icon: Bug, emoji: "🐛" },
  { path: "/data", label: "数据中心", icon: BarChart3, emoji: "📊" },
];

export function Sidebar() {
  const plants = useAppStore((s) => s.plants);
  const pestRecords = useAppStore((s) => s.pestRecords);
  const ongoingPests = pestRecords.filter((p) => p.status === "ongoing").length;

  return (
    <aside className="w-60 h-screen bg-gradient-to-b from-forest-900 to-forest-800 flex flex-col fixed left-0 top-0 z-20">
      <div className="px-6 py-6 border-b border-forest-700/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-2xl shadow-lg">
            🌱
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-serif">植物观察日志</h1>
            <p className="text-xs text-forest-300">Plant Journal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-forest-600/60 text-white shadow-inner"
                  : "text-forest-200 hover:bg-forest-700/40 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="flex-1">{item.label}</span>
            {item.path === "/pests" && ongoingPests > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold">
                {ongoingPests}
              </span>
            )}
            {item.path === "/plants" && plants.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-forest-500/50 text-forest-100 rounded-full">
                {plants.length}
              </span>
            )}
            <ChevronRight
              size={14}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
            />
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-forest-700/50">
        <div className="p-3 rounded-xl bg-forest-800/60 border border-forest-700/40">
          <p className="text-xs text-forest-300 mb-1">🌾 今日提示</p>
          <p className="text-sm text-forest-100 leading-relaxed">
            {plants.length > 0
              ? `共养护 ${plants.length} 株植物，记得记录观察哦～`
              : "添加你的第一株植物，开始记录养护日记吧！"}
          </p>
        </div>
      </div>
    </aside>
  );
}
