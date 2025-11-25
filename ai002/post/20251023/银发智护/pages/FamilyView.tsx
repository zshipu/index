import React, { useState } from 'react';
import { mockElders, mockTimelineEvents } from '../services/mockData';
import { Heart, MessageCircle, Share2, Trophy, Activity, Moon, User, Footprints } from 'lucide-react';
import { SimpleLineChart } from '../components/Charts';

const FamilyView: React.FC = () => {
  const dad = mockElders[0]; // Simulating Zhang Wei is the parent
  const [liked, setLiked] = useState(false);

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen md:border md:border-slate-200 md:shadow-xl md:rounded-[3rem] md:my-4 md:overflow-hidden">
      {/* App Header */}
      <div className="bg-indigo-600 text-white p-6 pt-8 md:rounded-t-[2.5rem]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">父亲的健康</h1>
            <p className="text-indigo-200 text-sm">已连接: {dad.name}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Main Health Score Card */}
        <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">今日健康评分</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-indigo-600">{dad.stats.healthScore}</span>
              <span className="text-green-600 text-sm font-bold">↑ +3 分</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">状态极佳</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">优秀</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
            <Footprints className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">步数</p>
            <p className="font-bold text-slate-800">{dad.stats.steps}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
            <Moon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">睡眠</p>
            <p className="font-bold text-slate-800">{dad.stats.sleep}小时</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
            <Activity className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400">心率</p>
            <p className="font-bold text-slate-800">{dad.stats.heartRate}</p>
          </div>
        </div>

        {/* Weekly Report Snippet */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">每周健康周报</h3>
                <p className="text-white/80 text-xs">11月11日 - 11月17日</p>
              </div>
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="bg-white/10 rounded-lg p-3 mb-3 backdrop-blur-sm">
              <p className="text-sm font-medium">🏆 本周亮点</p>
              <ul className="text-xs text-white/90 mt-1 space-y-1 list-disc list-inside">
                <li>连续6天达成步数目标。</li>
                <li>深睡时长增加了25分钟。</li>
              </ul>
            </div>
            <button className="w-full py-2 bg-white text-violet-600 rounded-lg text-sm font-bold">阅读完整报告</button>
          </div>
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Timeline Feed */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3 px-1">今日动态</h3>
          <div className="space-y-4">
            {mockTimelineEvents.map((event) => (
              <div key={event.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${event.type === 'Activity' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <span className="text-xs font-bold text-slate-500">{event.time}</span>
                  </div>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{event.type === 'Activity' ? '活动' : event.type === 'Diet' ? '饮食' : '检查'}</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{event.title}</h4>
                <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                {event.image && (
                  <img src={event.image} alt="Event" className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <div className="flex gap-4 pt-2 border-t border-slate-50">
                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} /> 点赞
                  </button>
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-600">
                    <MessageCircle className="w-4 h-4" /> 评论
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Bar (Fixed Bottom on Mobile) */}
        <div className="pt-4 pb-8">
           <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-slate-100">
               <img src="https://ui-avatars.com/api/?name=Me" className="w-10 h-10 rounded-full" />
               <div className="flex-1">
                   <input type="text" placeholder="给爸爸发条消息..." className="w-full bg-slate-50 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100" />
               </div>
               <button className="p-2 bg-indigo-600 text-white rounded-full">
                   <Share2 className="w-4 h-4" />
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyView;