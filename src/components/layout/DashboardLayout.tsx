import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
