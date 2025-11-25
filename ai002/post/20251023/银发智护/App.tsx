import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ElderlyDetail from './pages/ElderlyDetail';
import AlertCenter from './pages/AlertCenter';
import CaregiverView from './pages/CaregiverView';
import FamilyView from './pages/FamilyView';
import ElderUserView from './pages/ElderUserView';
import { mockElders } from './services/mockData';
import { Users } from 'lucide-react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedElderId, setSelectedElderId] = useState<string | null>(null);

  // Simple hash router handling
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard';
      // Handle params like #elder/1
      if (hash.startsWith('elder/')) {
        const id = hash.split('/')[1];
        setSelectedElderId(id);
        setCurrentPage('elder-detail');
      } else {
        setCurrentPage(hash);
        setSelectedElderId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string, param?: string) => {
    if (param) {
      window.location.hash = `${page}/${param}`;
    } else {
      window.location.hash = page;
    }
  };

  // Simple Elderly List View for the "Elders" page (inline for brevity)
  const EldersList = () => (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-800">老人档案管理</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockElders.map(elder => (
            <div 
                key={elder.id} 
                onClick={() => navigate('elder', elder.id)}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
               <img src={elder.imgUrl} className="w-20 h-20 rounded-full object-cover mb-4" />
               <h3 className="font-bold text-slate-900 text-lg">{elder.name}</h3>
               <p className="text-slate-500 text-sm mb-4">{elder.room}室 • {elder.age}岁</p>
               <div className="grid grid-cols-2 gap-4 w-full bg-slate-50 rounded-lg p-3 text-sm">
                   <div>
                       <span className="block text-slate-400 text-xs">状态</span>
                       <span className="font-medium text-slate-700">{elder.riskLevel}</span>
                   </div>
                   <div>
                       <span className="block text-slate-400 text-xs">健康分</span>
                       <span className="font-medium text-green-600">{elder.stats.healthScore}</span>
                   </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'elders':
        return <EldersList />;
      case 'elder-detail':
        return selectedElderId ? <ElderlyDetail elderId={selectedElderId} onBack={() => navigate('elders')} /> : <EldersList />;
      case 'alerts':
        return <AlertCenter />;
      case 'caregiver':
        return <CaregiverView />;
      case 'family':
        return <FamilyView />;
      case 'elder-user':
        return <ElderUserView />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={navigate}>
      {renderContent()}
    </Layout>
  );
};

export default App;