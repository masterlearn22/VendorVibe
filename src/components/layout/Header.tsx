import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors or proposals..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent placeholder:text-slate-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
