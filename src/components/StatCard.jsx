import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "emerald" }) => {
  
  const colorMap = {
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    rose: "text-rose-500 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
    cyan: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400",
    amber: "text-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && trendValue && (
        <div className="flex items-center text-sm mt-4">
          <span className={`font-medium ${trend === 'up' ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
            {trend === 'up' ? '+' : '-'}{trendValue}
          </span>
          <span className="text-slate-500 dark:text-slate-400 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
