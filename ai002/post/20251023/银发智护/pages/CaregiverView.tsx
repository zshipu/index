import React, { useState, useEffect } from 'react';
import { mockTasks, TASKS_UPDATED_EVENT, ALERTS_UPDATED_EVENT } from '../services/mockData';
import { Alert } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CalendarCheck, 
  Users, 
  MessageSquare, 
  User,
  Bell,
  X,
  HeartPulse,
  Watch
} from 'lucide-react';

const CaregiverView: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState('tasks');
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'task' | 'alert'} | null>(null);

  // Listen for "Push Notifications" from backend (Mocked)
  useEffect(() => {
    const handleTasksUpdated = (e: any) => {
      setTasks([...mockTasks]);
      setNotification({
        show: true,
        message: `收到 ${e.detail?.count || 1} 项新的护理任务 (智能穿戴触发)`,
        type: 'task'
      });
      autoHideNotification();
    };

    const handleAlertsUpdated = (e: any) => {
       const alerts: Alert[] = e.detail?.alerts || [];
       if (alerts.length > 0) {
           setNotification({
               show: true,
               message: `紧急: ${alerts[0].elderName} ${alerts[0].message}`,
               type: 'alert'
           });
           autoHideNotification();
       }
    };

    const autoHideNotification = () => {
      setTimeout(() => {
        setNotification(prev => prev ? {...prev, show: false} : null);
      }, 5000);
    };

    window.addEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
    window.addEventListener(ALERTS_UPDATED_EVENT, handleAlertsUpdated);
    
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, handleTasksUpdated);
      window.removeEventListener(ALERTS_UPDATED_EVENT, handleAlertsUpdated);
    };
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: t.status === 'Pending' ? 'Completed' : 'Pending' } : t
    ));
  };

  const todayStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen md:border md:border-slate-200 md:shadow-2xl md:rounded-[3rem] md:my-4 md:overflow-hidden relative flex flex-col">
      
      {/* Toast Notification */}
      {notification && notification.show && (
        <div className={`
            absolute top-24 left-4 right-4 z-30 text-white p-4 rounded-xl shadow-xl animate-bounce-in flex items-start gap-3
            ${notification.type === 'alert' ? 'bg-red-600' : 'bg-slate-800'}
        `}>
           {notification.type === 'alert' ? <AlertCircle className="w-5 h-5 text-white shrink-0" /> : <Bell className="w-5 h-5 text-orange-400 shrink-0" />}
           <div className="flex-1 text-sm font-medium">{notification.message}</div>
           <button onClick={() => setNotification(null)}>
             <X className="w-4 h-4 text-white/70" />
           </button>
        </div>
      )}

      {/* Mobile Header */}
      <div className="bg-indigo-600 text-white p-6 pt-10 md:pt-8 rounded-b-[2rem] shadow-lg z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-indigo-200 text-xs uppercase tracking-wider mb-1">{todayStr}</p>
            <h1 className="text-2xl font-bold">你好，小张</h1>
            <p className="text-sm text-indigo-100 opacity-90">今天也是充满活力的一天！</p>
          </div>
          <div className="relative">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
               <Bell className="w-5 h-5 text-white" />
             </div>
             {notification && notification.show && (
               <span className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-indigo-600 animate-ping"></span>
             )}
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-800/50" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * progress) / 100} />
              </svg>
              <span className="absolute text-xs font-bold">{isNaN(progress) ? 0 : progress}%</span>
           </div>
           <div>
              <p className="text-sm font-bold">今日任务进度</p>
              <p className="text-xs text-indigo-200">已完成 {completedCount} / {tasks.length} 项</p>
           </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Quick Actions */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
           <button className="shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1">
                 <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-600">快速记录</span>
           </button>
           <button className="shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-1">
                 <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-600">异常上报</span>
           </button>
            <button className="shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mb-1">
                 <HeartPulse className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-[10px] font-medium text-slate-600">生命体征</span>
           </button>
        </div>

        {/* Tasks List */}
        <div>
           <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
             <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
             待办事项
           </h3>
           <div className="space-y-3">
             {tasks.length === 0 ? (
               <p className="text-center text-slate-400 py-4 text-sm">暂无待办任务</p>
             ) : tasks.map((task) => {
              const isAuto = task.id.startsWith('auto_');
              return (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`
                    group flex items-start gap-4 p-4 rounded-xl border shadow-sm transition-all cursor-pointer active:scale-[0.98] relative overflow-hidden
                    ${task.status === 'Completed' 
                      ? 'bg-slate-50 border-slate-100' 
                      : isAuto 
                        ? 'bg-violet-50 border-violet-200 ring-1 ring-violet-100' 
                        : 'bg-white border-slate-100 hover:border-indigo-200'}
                  `}
                >
                  {/* Auto-generated accent strip */}
                  {isAuto && task.status !== 'Completed' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
                  )}

                  <div className={`
                    mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors z-10
                    ${task.status === 'Completed' ? 'text-green-500 bg-green-50' : 'text-slate-300 border-2 border-slate-200 group-hover:border-indigo-400'}
                  `}>
                    {task.status === 'Completed' && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 z-10">
                    <h4 className={`font-bold text-sm ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                       <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          <Clock className="w-3 h-3" /> {task.time}
                       </span>
                       <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                          {task.elderName}
                       </span>
                       
                       {/* Smart Wearable Badge */}
                       {isAuto && (
                         <span className="text-[10px] font-bold text-violet-700 bg-white border border-violet-200 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <Watch className="w-3 h-3" /> 智能穿戴
                         </span>
                       )}
                    </div>
                  </div>

                  {task.priority === 'High' && task.status !== 'Completed' && (
                      <div className="flex flex-col items-center gap-1 z-10">
                          <AlertCircle className="w-4 h-4 text-orange-500 animate-pulse" />
                          <span className="text-[10px] text-orange-500 font-bold">紧急</span>
                      </div>
                  )}
                </div>
              );
            })}
           </div>
        </div>
        
        <div className="h-8"></div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-end pb-6 md:pb-4 rounded-b-[2.5rem]">
         <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'tasks' ? 'text-indigo-600' : 'text-slate-400'}`}
         >
             <CalendarCheck className="w-6 h-6" />
             <span className="text-[10px] font-bold">任务</span>
         </button>
         <button 
            onClick={() => setActiveTab('patients')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'patients' ? 'text-indigo-600' : 'text-slate-400'}`}
         >
             <Users className="w-6 h-6" />
             <span className="text-[10px] font-bold">老人</span>
         </button>
         
         {/* Floating Action Button in Center */}
         <div className="-mt-8 bg-indigo-600 rounded-full p-3 shadow-lg shadow-indigo-200 border-4 border-slate-50 cursor-pointer active:scale-90 transition-transform">
             <CheckCircle2 className="w-8 h-8 text-white" />
         </div>

         <button 
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'messages' ? 'text-indigo-600' : 'text-slate-400'}`}
         >
             <MessageSquare className="w-6 h-6" />
             <span className="text-[10px] font-bold">消息</span>
         </button>
         <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
         >
             <User className="w-6 h-6" />
             <span className="text-[10px] font-bold">我的</span>
         </button>
      </div>
    </div>
  );
};

export default CaregiverView;