import React, { useState, useEffect } from 'react';
import { mockElders, mockFamilyMessages, triggerWakeUpRoutine, syncDeviceData, DATA_UPDATED_EVENT } from '../services/mockData';
import { Sun, Battery, Footprints, Utensils, Calendar, Heart, Moon, Watch, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

const ElderUserView: React.FC = () => {
  // Simulating Zhang Wei (ID: 1)
  const [me, setMe] = useState(mockElders[0]); 
  const [isAwake, setIsAwake] = useState(me.sleepStatus === 'Awake');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleDataUpdate = () => {
      setMe({...mockElders[0]}); // Force refresh from mock store
    };
    window.addEventListener(DATA_UPDATED_EVENT, handleDataUpdate);
    return () => window.removeEventListener(DATA_UPDATED_EVENT, handleDataUpdate);
  }, []);

  const handleWakeUp = () => {
    setIsAwake(true);
    triggerWakeUpRoutine(me.id);
    alert("智能手表检测到您已起床。\n已自动通知护理员进行晨间检查。");
  };

  const handleSync = (abnormal: boolean = false) => {
      setIsSyncing(true);
      setTimeout(() => {
          syncDeviceData(me.id, abnormal);
          setIsSyncing(false);
          if (abnormal) {
              alert("已模拟发送异常健康数据（心率/血氧）至护理端。");
          }
      }, 800);
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-orange-100 min-h-[800px] flex flex-col">
        
        {/* Top Bar */}
        <div className="bg-orange-100 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm">
              {isAwake ? <Sun className="w-8 h-8 text-orange-500" /> : <Moon className="w-8 h-8 text-indigo-500" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{isAwake ? '早上好，' : '休息中，'}</h1>
              <p className="text-xl text-slate-600">{me.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full">
            <Battery className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-slate-700">{batteryLevel}%</span>
          </div>
        </div>

        <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Watch Simulation & Goals */}
          <div className="space-y-8">
            
            {/* Smart Watch Simulator Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Watch className="w-6 h-6 text-blue-400" />
                        <span className="font-medium text-blue-200">华为 Watch 4 Pro</span>
                    </div>
                    <button 
                        onClick={() => handleSync(false)}
                        disabled={isSyncing}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="手动同步数据"
                    >
                        <RefreshCw className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                
                <div className="flex flex-col items-center justify-center py-4 min-h-[160px]">
                    {!isAwake ? (
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-indigo-800/50 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Moon className="w-10 h-10 text-indigo-300" />
                            </div>
                            <p className="text-slate-300">检测到睡眠状态...</p>
                            <button 
                                onClick={handleWakeUp}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold transition-all active:scale-95 shadow-lg border border-orange-400 text-sm"
                            >
                                模拟起床 (触发任务)
                            </button>
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                             <div className="grid grid-cols-2 gap-4 text-center">
                                 <div className="bg-white/10 rounded-xl p-3">
                                     <p className="text-xs text-slate-400">心率</p>
                                     <p className={`text-xl font-bold ${me.stats.heartRate > 100 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                         {me.stats.heartRate} <span className="text-xs font-normal">bpm</span>
                                     </p>
                                 </div>
                                 <div className="bg-white/10 rounded-xl p-3">
                                     <p className="text-xs text-slate-400">血氧</p>
                                     <p className={`text-xl font-bold ${me.stats.spo2 < 94 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                         {me.stats.spo2}%
                                     </p>
                                 </div>
                             </div>
                             
                             <div className="flex justify-center gap-2">
                                 <button 
                                    onClick={() => handleSync(false)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                                 >
                                     同步正常数据
                                 </button>
                                 <button 
                                    onClick={() => handleSync(true)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                                 >
                                     <AlertTriangle className="w-3 h-3" /> 模拟异常预警
                                 </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Big Steps Card */}
            <div className="bg-green-50 rounded-3xl p-8 border-2 border-green-100 flex flex-col items-center text-center shadow-sm transition-all duration-500">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <Footprints className="w-8 h-8" /> 今日步数
              </h2>
              
              <div className="relative w-48 h-48 mb-4">
                 {/* Simple CSS Circle */}
                 <div className="w-full h-full rounded-full border-[12px] border-green-200 flex items-center justify-center bg-white">
                    <div className="text-center">
                        <span className="block text-5xl font-bold text-slate-800">{me.stats.steps}</span>
                        <span className="text-slate-400 text-lg">/ 4000</span>
                    </div>
                 </div>
              </div>
              
              <p className="text-xl text-green-700">继续保持！你做得很好。</p>
            </div>
          </div>

          {/* Right Column: Family & Messages */}
          <div className="bg-indigo-50 rounded-3xl p-8 border-2 border-indigo-100 shadow-sm flex flex-col">
             <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
                <Heart className="w-8 h-8 text-red-500" /> 家人的爱
             </h2>

             <div className="flex-1 space-y-4">
                {mockFamilyMessages.map((msg) => (
                  <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-lg text-sm">
                        {msg.from}
                      </span>
                      <span className="text-slate-400 text-sm">{msg.time}</span>
                    </div>
                    <p className="text-xl text-slate-800 leading-relaxed">
                      "{msg.content}"
                    </p>
                    <div className="mt-4 flex justify-end">
                       <button className="bg-red-50 text-red-600 px-6 py-2 rounded-full text-lg font-bold hover:bg-red-100 transition-colors border border-red-100">
                         回复 ❤️
                       </button>
                    </div>
                  </div>
                ))}
             </div>

             <div className="mt-6 pt-6 border-t border-indigo-200 text-center">
                <p className="text-indigo-600 text-lg">相册里有 <span className="font-bold">2</span> 张新照片</p>
                <button className="mt-3 w-full bg-indigo-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-indigo-700 transition-colors">
                  打开相册
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ElderUserView;