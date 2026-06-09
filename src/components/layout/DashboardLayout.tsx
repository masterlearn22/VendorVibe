import { Link, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  BarChart3, 
  Building2, 
  Upload, 
  Sparkles,
  MessageSquare,
  Flag,
  AlertCircle,
  DollarSign,
  Menu,
  X
} from "lucide-react";

export function DashboardLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: BarChart3 },
    { name: "Vendor Directory", path: "/vendors", icon: Building2 },
    { name: "AI Compare", path: "/compare", icon: Sparkles },
    { name: "Upload Proposal", path: "/upload", icon: Upload },
  ];

  const sideIcons = [
    { icon: MessageSquare, id: 'msg', path: '/messages' },
    { icon: Flag, id: 'flag', path: '/priority' },
    { icon: AlertCircle, id: 'alert', path: '/alerts' },
    { icon: DollarSign, id: 'dollar', path: '/financials' },
    { icon: Menu, id: 'menu', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-800 flex justify-center p-4 md:p-8 font-sans">
      {/* Main Container mirroring the image's rounded app window look */}
      <div className="bg-white/40 backdrop-blur-3xl w-full max-w-[1400px] rounded-[2.5rem] border border-white/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col relative z-10">
        
        {/* Top Navigation Area */}
        <header className="px-8 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 pl-2">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">VendorVibe</h1>
          </div>

          {/* Top Pill Navigation (Hidden on very small screens, scrolls horizontally) */}
          <nav className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 overflow-x-auto w-full md:w-auto hide-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#ff5a36] text-white shadow-md shadow-orange-500/20' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Mobile Menu Toggle & Spacer */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block w-32"></div> {/* Spacer to balance logo */}
          </div>
        </header>

        {/* Main Content Area with Left Mini Sidebar */}
        <div className="flex flex-1 overflow-hidden p-6 pt-2">
          
          {/* Left Mini Sidebar for Icons */}
          <div className="hidden md:flex flex-col items-center gap-6 pr-6 pt-8 w-20 shrink-0">
            {sideIcons.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link 
                  key={item.id} 
                  to={item.path}
                  className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border ${
                    isActive 
                      ? 'bg-[#ff5a36] text-white border-[#ff5a36] shadow-md shadow-orange-500/20' 
                      : 'bg-white text-slate-400 hover:text-[#ff5a36] hover:shadow-sm border-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto pr-2 pb-8 rounded-3xl">
            <Outlet />
          </main>
          
        </div>
      </div>
      
      {/* Decorative Background Blob */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-orange-300/30 blur-[120px] pointer-events-none -z-10"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative ml-auto w-64 h-full bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-lg text-slate-800">Menu Lainnya</h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {sideIcons.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const labels = { msg: 'Team Notes', flag: 'Priority Vendors', alert: 'Risk Alerts', dollar: 'Financials', menu: 'Settings' };
                return (
                  <Link 
                    key={item.id} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${
                      isActive 
                        ? 'bg-[#ff5a36]/10 text-[#ff5a36]' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {labels[item.id as keyof typeof labels]}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
