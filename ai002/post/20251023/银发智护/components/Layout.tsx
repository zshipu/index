import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Activity, 
  Menu, 
  X,
  ClipboardList,
  Settings,
  Smartphone,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'elders', label: '老人管理', icon: Users },
    { id: 'alerts', label: '智能预警', icon: Bell },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  const demoItems = [
    { id: 'caregiver', label: '演示：护理端', icon: ClipboardList },
    { id: 'family', label: '演示：家属端', icon: Smartphone },
    { id: 'elder-user', label: '演示：长者端', icon: User },
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">银发智护</h1>
            <p className="text-xs text-slate-500">智能健康系统</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">管理后台</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}

          <div className="my-4 border-t border-slate-100"></div>
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">App 演示</p>
           {demoItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-violet-50 text-violet-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <img 
              src="https://ui-avatars.com/api/?name=Lin+Yi&background=random" 
              alt="User" 
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">林医生</p>
              <p className="text-xs text-slate-500 truncate">护士长</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Activity className="w-6 h-6 text-indigo-600" />
           <span className="font-bold text-slate-800">银发智护</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-slate-800/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
             <nav className="space-y-2">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">管理后台</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                      activePage === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <div className="my-4 border-t border-slate-100"></div>
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">App 演示</p>
              {demoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                      activePage === item.id ? 'bg-violet-50 text-violet-700' : 'text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;