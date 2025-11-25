import React from 'react';
import { mockAlerts } from '../services/mockData';
import { RiskLevel } from '../types';
import { AlertTriangle, Check, Bell, Filter } from 'lucide-react';

const AlertCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">预警中心</h2>
          <p className="text-slate-500">实时健康异常监测与系统通知。</p>
        </div>
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50">
                <Filter className="w-4 h-4" /> 筛选
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                全部标记为已读
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                    <tr>
                        <th className="px-6 py-4">等级</th>
                        <th className="px-6 py-4">老人</th>
                        <th className="px-6 py-4">预警内容</th>
                        <th className="px-6 py-4">类型</th>
                        <th className="px-6 py-4">时间</th>
                        <th className="px-6 py-4">状态</th>
                        <th className="px-6 py-4">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {mockAlerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${alert.level === RiskLevel.CRITICAL ? 'bg-red-100 text-red-800' : 
                                      alert.level === RiskLevel.HIGH ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {alert.level === RiskLevel.CRITICAL && <AlertTriangle className="w-3 h-3" />}
                                    {alert.level}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">{alert.elderName}</td>
                            <td className="px-6 py-4 text-slate-600 max-w-md truncate">{alert.message}</td>
                            <td className="px-6 py-4 text-slate-500">{alert.type}</td>
                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{alert.timestamp}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs
                                    ${alert.status === '待处理' ? 'text-red-600 bg-red-50' : 
                                      alert.status === '已查看' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>
                                    {alert.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs uppercase tracking-wide">
                                    查看详情
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AlertCenter;