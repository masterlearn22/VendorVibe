import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UploadCloud, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Vendor Directory", href: "/vendors", icon: Users },
  { name: "Upload Proposal", href: "/upload", icon: UploadCloud },
  { name: "AI Compare", href: "/compare", icon: ArrowLeftRight },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-50 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-black text-lg">V</span>
          </div>
          VendorVibe
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-slate-50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">Admin User</span>
            <span className="text-xs text-slate-400">Procurement Team</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
