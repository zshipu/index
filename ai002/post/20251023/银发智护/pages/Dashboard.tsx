import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { Users, AlertCircle, HeartPulse, Activity, ChevronRight, ArrowRight } from 'lucide-react';
import { HealthScoreDistribution, SimpleLineChart } from '../components/Charts';
import { mockAlerts, mockElders, DATA_UPDATED_EVENT, ALERTS_UPDATED_EVENT } from '../services/mockData';
import { Alert, RiskLevel } from '../types';

interface DashboardProps {
  onNavigate: (page: string, param?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey(k => k + 1);
    window.addEventListener(DATA_UPDATED_EVENT, handleUpdate);
    window.addEventListener(ALERTS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(DATA_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(ALERTS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const totalElders = mockElders.length;
  // Use RiskLevel enum to match the updated Chinese values if strictly equal, 
  // but here we filter by severity logic. Since we updated types.ts to Chinese values,
  // RiskLevel.CRITICAL is '紧急', RiskLevel.HIGH is '高风险'.
  const criticalAlerts = mockAlerts.filter(a => a.level === RiskLevel.CRITICAL || a.level === RiskLevel.HIGH).length;
  const avgHealthScore = Math.round(mockElders.reduce((acc, curr) => acc + curr.stats.healthScore, 0) / totalElders);

  // Mock aggregate trend data
  const trendData = [
    { date: '周一', value: 82 },
    { date: '周二', value: 83 },
    { date: '周三', value: 81 },
    { date: '周四', value: 84 },
    { date: '周五', value: 85 },
    { date: '周六', value: 86 },
    { date: '周日', value: avgHealthScore },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">仪表盘概览</h2>
        <p className="text-slate-500">欢迎回来，林医生。这是今日的健康摘要。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="在院老人数" 
          value={totalElders} 
          icon={Users} 
          color="blue" 
          trend="up"
          change="+2"
        />
        <StatCard 
          label="活跃预警" 
          value={criticalAlerts} 
          icon={AlertCircle} 
          color="red"
          trend="down" 
          change={criticalAlerts > 0 ? "+1" : "-1"}
        />
        <StatCard 
          label="平均健康分" 
          value={avgHealthScore} 
          icon={HeartPulse} 
          color="green"
          trend="up"
          change="+3 分"
        />
        <StatCard 
          label="数据同步率" 
          value="98%" 
          icon={Activity} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">全院健康趋势</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg p-2 outline-none">
              <option>近 7 天</option>
              <option>近 30 天</option>
            </select>
          </div>
          <SimpleLineChart data={trendData} color="#4f46e5" />
        </div>

        {/* Health Distribution */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">健康状态分布</h3>
          <div className="flex-1 flex flex-col justify-center">
            <HealthScoreDistribution />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button 
              onClick={() => onNavigate('elders')}
              className="w-full flex items-center justify-center gap-2 text-indigo-600 font-medium hover:bg-indigo-50 p-2 rounded-lg transition-colors"
            >
              查看所有老人 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800">近期高危预警</h3>
             <button onClick={() => onNavigate('alerts')} className="text-sm text-indigo-600 font-medium hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-slate-100">
            {mockAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('elders', alert.elderId)}>
                <div className={`w-2 h-2 mt-2 rounded-full ${alert.level === RiskLevel.CRITICAL ? 'bg-red-500' : 'bg-orange-400'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-slate-900">{alert.elderName}</p>
                    <span className="text-xs text-slate-400">{alert.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 self-center" />
              </div>
            ))}
            {mockAlerts.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">暂无预警</div>}
          </div>
        </div>

         <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">AI 健康洞察</h3>
              <p className="text-indigo-100 text-sm opacity-90 leading-relaxed">
                AI 模型检测到 B 区老人的活动能力在过去 2 周内有下降趋势。建议针对该区域组织更多的集体康复活动。
              </p>
            </div>
            <button 
              onClick={() => onNavigate('elders')}
              className="mt-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
            >
              查看详细分析
              <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;