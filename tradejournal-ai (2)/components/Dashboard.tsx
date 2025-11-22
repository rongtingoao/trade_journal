import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TradeRecord, TradeStatus, DashboardStats } from '../types';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface DashboardProps {
  trades: TradeRecord[];
}

const COLORS = {
  [TradeStatus.WIN]: '#10B981', // Emerald 500
  [TradeStatus.LOSS]: '#EF4444', // Red 500
  [TradeStatus.BREAK_EVEN]: '#F59E0B', // Amber 500
};

export const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  
  const stats: DashboardStats = useMemo(() => {
    const totalTrades = trades.length;
    if (totalTrades === 0) return { totalTrades: 0, winRate: 0, avgRR: 0, netRR: 0 };

    const wins = trades.filter(t => t.status === TradeStatus.WIN).length;
    const winRate = (wins / totalTrades) * 100;
    
    const totalRR = trades.reduce((acc, t) => {
      if (t.status === TradeStatus.WIN) return acc + t.rr;
      if (t.status === TradeStatus.LOSS) return acc - 1; // Assuming 1R risk
      return acc;
    }, 0);

    const avgRR = trades.reduce((acc, t) => acc + t.rr, 0) / totalTrades;

    return {
      totalTrades,
      winRate,
      avgRR,
      netRR: totalRR
    };
  }, [trades]);

  const pieData = useMemo(() => {
    const counts = { [TradeStatus.WIN]: 0, [TradeStatus.LOSS]: 0, [TradeStatus.BREAK_EVEN]: 0 };
    trades.forEach(t => counts[t.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [trades]);

  const modelPerformance = useMemo(() => {
    const models: Record<string, { wins: number; total: number }> = {};
    trades.forEach(t => {
      if (!models[t.model]) models[t.model] = { wins: 0, total: 0 };
      models[t.model].total++;
      if (t.status === TradeStatus.WIN) models[t.model].wins++;
    });
    return Object.entries(models).map(([name, data]) => ({
      name,
      winRate: (data.wins / data.total) * 100
    }));
  }, [trades]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Win Rate</h3>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.winRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Net R:R</h3>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className={`text-2xl font-bold mt-2 ${stats.netRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.netRR.toFixed(2)}R
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Total Trades</h3>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.totalTrades}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-sm font-medium">Avg R:R (Wins)</h3>
            <TrendingDown className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.avgRR.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-sm backdrop-blur-md h-[300px]">
          <h3 className="text-white font-semibold mb-4">Win/Loss Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as TradeStatus]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-sm backdrop-blur-md h-[300px]">
          <h3 className="text-white font-semibold mb-4">Win Rate by Model</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                cursor={{fill: '#334155', opacity: 0.4}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              />
              <Bar dataKey="winRate" fill="#8b5cf6" name="Win Rate %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
