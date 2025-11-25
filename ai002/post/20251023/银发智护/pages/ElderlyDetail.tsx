
import React, { useState, useEffect } from 'react';
import { Elder, RiskLevel, HealthGoal } from '../types';
import { mockElders, DATA_UPDATED_EVENT } from '../services/mockData';
import { generateHealthPlan } from '../services/geminiService';
import { 
  Activity, 
  Moon, 
  Footprints, 
  Scale, 
  ArrowLeft, 
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  HeartPulse,
  Droplets,
  Info,
  Target,
  Trophy,
  Flag
} from 'lucide-react';
import { SimpleLineChart } from '../components/Charts';

interface ElderlyDetailProps {
  elderId: string;
  onBack: () => void;
}

const ElderlyDetail: React.FC<ElderlyDetailProps> = ({ elderId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'plan'>('overview');
  const [elder, setElder] = useState<Elder | null>(null);
  
  // AI Plan State
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    const updateElderData = () => {
      const found = mockElders.find(e => e.id === elderId);
      setElder(found ? { ...found } : null);
    };

    updateElderData();

    // Subscribe to real-time data updates
    window.addEventListener(DATA_UPDATED_EVENT, updateElderData);
    return () => window.removeEventListener(DATA_UPDATED_EVENT, updateElderData);
  }, [elderId]);

  if (!elder) return <div>加载中...</div>;

  const handleGeneratePlan = async () => {
    setIsLoadingPlan(true);
    setPlanError(null);
    try {
      const resultJson = await generateHealthPlan(elder);
      // Clean up JSON string if it contains markdown code blocks
      const cleanedJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();
      setAiPlan(JSON.parse(cleanedJson));
    } catch (error) {
      setPlanError("无法生成方案。请确保已配置 API Key。");
      // Fallback mock for demo purposes if API fails (expected in environments without key)
      setTimeout(() => {
          setAiPlan({
              summary: "患者生命体征平稳，但活动量呈下降趋势。体重略高于最佳 BMI 范围。",
              dietPlan: ["早餐：燕麦粥配浆果", "午餐：烤鸡胸肉沙拉", "晚餐：清蒸鱼配时蔬", "注意：限制钠盐摄入"],
              exercisePlan: ["晨间 20 分钟慢走", "椅子瑜伽练习", "避免剧烈提重物"],
              caregiverTips: ["监测水分摄入情况", "检查脚踝是否有水肿"],
              riskAssessment: "由于步数减少，存在中度跌倒风险。心血管风险较低。"
          });
          setPlanError(null); 
      }, 1500);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch(level) {
      case RiskLevel.LOW: return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH: return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL: return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getVitalStatus = (type: 'hr' | 'spo2', value: number) => {
    if (type === 'hr') {
      if (value < 50 || value > 110) return { label: '异常', color: 'text-red-700 bg-red-100 border-red-200', icon: AlertTriangle, desc: '超出安全范围' };
      if (value < 60 || value > 100) return { label: '关注', color: 'text-orange-700 bg-orange-100 border-orange-200', icon: AlertTriangle, desc: '偏离正常值' };
      return { label: '正常', color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircle2, desc: '处于最佳范围' };
    } else {
      if (value < 90) return { label: '严重低氧', color: 'text-red-700 bg-red-100 border-red-200', icon: AlertTriangle, desc: '需立即供氧' };
      if (value < 95) return { label: '偏低', color: 'text-orange-700 bg-orange-100 border-orange-200', icon: AlertTriangle, desc: '需密切观察' };
      return { label: '正常', color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircle2, desc: '血氧充足' };
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
        case 'Achieved': return 'text-green-700 bg-green-100';
        case 'At Risk': return 'text-red-700 bg-red-100';
        default: return 'text-blue-700 bg-blue-100';
    }
  };

  const getGoalStatusLabel = (status: string) => {
    switch (status) {
        case 'Achieved': return '已达成';
        case 'At Risk': return '需关注';
        default: return '进行中';
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> 返回列表
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <img src={elder.imgUrl} alt={elder.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{elder.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(elder.riskLevel)}`}>
              {elder.riskLevel}
            </span>
          </div>
          <div className="text-sm text-slate-500 flex flex-wrap gap-4">
            <span>年龄: <strong className="text-slate-700">{elder.age}</strong></span>
            <span>性别: <strong className="text-slate-700">{elder.gender}</strong></span>
            <span>房间: <strong className="text-slate-700">{elder.room}</strong></span>
            <span>护理等级: <strong className="text-slate-700">{elder.careLevel}</strong></span>
          </div>
        </div>
        <div className="flex flex-col items-end">
            <div className="text-right">
                <span className="text-sm text-slate-400">综合健康分</span>
                <div className="text-3xl font-bold text-indigo-600">{elder.stats.healthScore}</div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'charts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            趋势图表
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'plan' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            AI 智能方案
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
           {/* Real-time Vitals Section */}
           <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      实时体征监测
                  </h3>
                  <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full animate-pulse border border-green-100">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          设备在线
                      </span>
                      <span className="text-xs text-slate-400">最近同步: 刚刚</span>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Heart Rate Card */}
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between min-h-[180px] relative overflow-hidden group hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                      
                      {/* Top Row */}
                      <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <HeartPulse className="w-5 h-5 text-red-500" />
                              心率 (Heart Rate)
                          </div>
                          {(() => {
                             const status = getVitalStatus('hr', elder.stats.heartRate);
                             const Icon = status.icon;
                             return (
                               <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                                   <Icon className="w-3 h-3" /> {status.label}
                               </span>
                             );
                          })()}
                      </div>

                      {/* Value Row */}
                      <div className="mt-4 relative z-10 flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-slate-900 tracking-tight">{elder.stats.heartRate}</span>
                          <span className="text-sm text-slate-500 font-medium">bpm</span>
                      </div>

                      {/* Visual Range Bar */}
                      <div className="mt-4 relative z-10">
                         <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                             <span>40</span>
                             <span className="text-green-600 font-medium">正常范围: 60 - 100</span>
                             <span>140</span>
                         </div>
                         <div className="w-full h-2.5 bg-slate-200 rounded-full relative overflow-hidden">
                             {/* Normal Zone: 60-100 in a 40-140 range. Width 40%, Start 20% */}
                             <div className="absolute top-0 bottom-0 left-[20%] width-[40%] w-[40%] bg-green-400/30 border-x border-green-400/50"></div>
                             
                             {/* Current Value Marker */}
                             <div 
                                className={`absolute top-0 bottom-0 w-1.5 rounded-full transition-all duration-500 ${elder.stats.heartRate > 100 || elder.stats.heartRate < 60 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-800'}`}
                                style={{ left: `${Math.min(100, Math.max(0, (elder.stats.heartRate - 40) ))}%` }}
                             ></div>
                         </div>
                         <div className="mt-2 text-xs text-slate-500 text-right">
                            {getVitalStatus('hr', elder.stats.heartRate).desc}
                         </div>
                      </div>
                  </div>

                  {/* SpO2 Card */}
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between min-h-[180px] relative overflow-hidden group hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                      
                      {/* Top Row */}
                      <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <Droplets className="w-5 h-5 text-blue-500" />
                              血氧饱和度 (SpO2)
                          </div>
                          {(() => {
                             const status = getVitalStatus('spo2', elder.stats.spo2);
                             const Icon = status.icon;
                             return (
                               <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.color}`}>
                                   <Icon className="w-3 h-3" /> {status.label}
                               </span>
                             );
                          })()}
                      </div>
                      
                      {/* Value Row */}
                      <div className="mt-4 relative z-10 flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-slate-900 tracking-tight">{elder.stats.spo2}</span>
                          <span className="text-sm text-slate-500 font-medium">%</span>
                      </div>

                       {/* Visual Range Bar */}
                       <div className="mt-4 relative z-10">
                         <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                             <span>80</span>
                             <span className="text-green-600 font-medium">正常范围: 95 - 100</span>
                             <span>100</span>
                         </div>
                         <div className="w-full h-2.5 bg-slate-200 rounded-full relative overflow-hidden">
                             {/* Normal Zone: 95-100 in a 80-100 range. Width 25%, Start 75% */}
                             <div className="absolute top-0 bottom-0 left-[75%] w-[25%] bg-green-400/30 border-l border-green-400/50"></div>
                             
                             {/* Current Value Marker */}
                             <div 
                                className={`absolute top-0 bottom-0 w-1.5 rounded-full transition-all duration-500 ${elder.stats.spo2 < 95 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-slate-800'}`}
                                style={{ left: `${Math.min(100, Math.max(0, (elder.stats.spo2 - 80) * 5))}%` }}
                             ></div>
                         </div>
                         <div className="mt-2 text-xs text-slate-500 text-right">
                            {getVitalStatus('spo2', elder.stats.spo2).desc}
                         </div>
                      </div>
                  </div>
              </div>
           </div>

            {/* Health Goals Tracking Section */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-indigo-600" />
                        健康目标追踪
                    </h3>
                    <button className="text-sm text-indigo-600 font-medium hover:underline">
                        管理目标
                    </button>
                </div>

                {elder.goals && elder.goals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {elder.goals.map((goal) => {
                            const progress = Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100));
                            const isWeight = goal.type === 'Weight';
                            // For weight, progress visualization might be inverted or specific, but let's stick to simple percentage for MVP
                            // Assuming Steps/Sleep is "more is better", Weight is "reach target"
                            
                            return (
                                <div key={goal.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                                                {goal.type === 'Weight' && <Scale className="w-4 h-4" />}
                                                {goal.type === 'Steps' && <Footprints className="w-4 h-4" />}
                                                {goal.type === 'Sleep' && <Moon className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{goal.title}</p>
                                                <p className="text-xs text-slate-400">目标: {goal.targetValue} {goal.unit}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getGoalStatusColor(goal.status)}`}>
                                            {getGoalStatusLabel(goal.status)}
                                        </span>
                                    </div>

                                    <div className="flex items-end gap-1 mb-2">
                                        <span className="text-2xl font-bold text-slate-800">{goal.currentValue}</span>
                                        <span className="text-xs text-slate-500 mb-1">/ {goal.targetValue} {goal.unit}</span>
                                    </div>

                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-1000 ${goal.status === 'Achieved' ? 'bg-green-500' : goal.status === 'At Risk' ? 'bg-red-400' : 'bg-blue-500'}`}
                                            style={{ width: `${isWeight ? 100 : progress}%` }} 
                                        ></div>
                                        {/* Note: Weight progress bar logic is simplified here. Ideally it shows deviation. */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>暂无设定健康目标</p>
                        <button className="mt-2 text-sm text-indigo-600 font-medium">立即设定</button>
                    </div>
                )}
            </div>

           {/* Other Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: '体重', value: `${elder.stats.weight} kg`, icon: Scale, color: 'bg-blue-50 text-blue-600' },
               { label: '今日步数', value: elder.stats.steps, icon: Footprints, color: 'bg-green-50 text-green-600' },
               { label: '睡眠时长', value: `${elder.stats.sleep} 小时`, icon: Moon, color: 'bg-indigo-50 text-indigo-600' },
             ].map((stat, idx) => (
               <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                 <div className={`p-3 rounded-full ${stat.color}`}>
                   <stat.icon className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-sm text-slate-500">{stat.label}</p>
                   <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                 </div>
               </div>
             ))}
           </div>
           
           {/* Recent History Table Placeholder */}
           <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">近期护理记录</h3>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">日期</th>
                    <th className="px-4 py-3">观察记录</th>
                    <th className="px-4 py-3">记录人</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="px-4 py-3">今天, 08:00</td>
                    <td className="px-4 py-3">血压正常 (120/80)。情绪良好。</td>
                    <td className="px-4 py-3">护士小萨</td>
                  </tr>
                   <tr className="border-b border-slate-50">
                    <td className="px-4 py-3">昨天, 21:30</td>
                    <td className="px-4 py-3">按时服药。主诉轻微膝盖疼痛。</td>
                    <td className="px-4 py-3">护理员小张</td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">体重历史趋势</h3>
            <SimpleLineChart data={elder.history.weight} color="#3b82f6" />
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">步数历史趋势</h3>
            <SimpleLineChart data={elder.history.steps} color="#22c55e" />
          </div>
           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">心率历史趋势</h3>
            <SimpleLineChart data={elder.history.heartRate} color="#ef4444" />
          </div>
           <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">睡眠历史趋势</h3>
            <SimpleLineChart data={elder.history.sleep} color="#6366f1" />
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Sidebar for Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <BrainCircuit className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-bold text-indigo-900 mb-2">AI 健康顾问</h3>
              <p className="text-indigo-700 text-sm mb-6">
                基于 {elder.name} 的近期体征数据和护理记录，使用 Gemini AI 生成综合健康计划。
              </p>
              <button 
                onClick={handleGeneratePlan}
                disabled={isLoadingPlan}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoadingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : '生成智能方案'}
              </button>
              {planError && (
                 <p className="mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">{planError} (正在显示演示数据)</p>
              )}
            </div>
            
            {aiPlan && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                    <h4 className="font-bold text-slate-800 mb-3">风险评估</h4>
                    <div className="p-3 bg-slate-50 rounded text-sm text-slate-700 border-l-4 border-orange-400">
                        {aiPlan.riskAssessment}
                    </div>
                </div>
            )}
          </div>

          {/* Plan Display */}
          <div className="lg:col-span-2">
             {!aiPlan ? (
                 <div className="h-full min-h-[400px] bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <BrainCircuit className="w-8 h-8 text-slate-300" />
                    </div>
                    <p>尚未生成方案。</p>
                    <p className="text-sm mt-2">点击“生成智能方案”开始分析数据。</p>
                 </div>
             ) : (
                 <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">每周健康计划</h3>
                        <p className="text-slate-600 italic border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50 rounded-r">
                            "{aiPlan.summary}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
                                <span className="w-6 h-6 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">🥗</span>
                                饮食建议
                            </h4>
                            <ul className="space-y-3">
                                {aiPlan.dietPlan.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">🏃</span>
                                活动计划
                            </h4>
                            <ul className="space-y-3">
                                {aiPlan.exercisePlan.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100">
                        <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
                             <AlertTriangle className="w-5 h-5 text-orange-500" />
                             护理员重点关注
                        </h4>
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 space-y-2">
                            {aiPlan.caregiverTips.map((tip: string, i: number) => (
                                <p key={i} className="text-sm text-orange-800 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> {tip}
                                </p>
                            ))}
                        </div>
                    </div>
                 </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderlyDetail;
