import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen">
        <div className="sticky top-0 z-30 px-8 py-4 bg-gradient-to-b from-white via-white/95 to-white/0 backdrop-blur-sm border-b border-cream-100">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-forest-500 hidden sm:block">🌿 植物观察日志</span>
            </div>
            <GlobalSearch />
            <div className="w-24" />
          </div>
        </div>
        <div className="p-8 max-w-[1400px] mx-auto pt-6">
          <div className="animate-fade-in-up opacity-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
