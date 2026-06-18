import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen">
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="animate-fade-in-up opacity-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
