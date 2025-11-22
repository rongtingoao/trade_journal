import React, { useState, useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { TradeForm } from './components/TradeForm';
import { TradeList } from './components/TradeList';
import { TradeRecord } from './types';
import { PlusCircle, LayoutDashboard, History, TrendingUp, Filter, Calendar } from 'lucide-react';

const STORAGE_KEY = 'trade_journal_data';

const App: React.FC = () => {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal'>('dashboard');

  // Filter State
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTrades(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    } catch (e) {
      console.error("Failed to save to local storage. Storage might be full (e.g. too many images).", e);
      // In a real app, you might want to show a toast notification here.
    }
  }, [trades]);

  const handleSaveTrade = (newTrade: TradeRecord) => {
    setTrades(prev => [newTrade, ...prev]);
    setIsFormOpen(false);
    setActiveTab('journal'); 
  };

  // Filter trades based on selected date range
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const tradeDate = new Date(trade.timestamp);
      
      if (dateFilter.start) {
        const startDate = new Date(dateFilter.start);
        startDate.setHours(0, 0, 0, 0);
        if (tradeDate < startDate) return false;
      }
      
      if (dateFilter.end) {
        const endDate = new Date(dateFilter.end);
        endDate.setHours(23, 59, 59, 999);
        if (tradeDate > endDate) return false;
      }
      
      return true;
    });
  }, [trades, dateFilter]);

  const setMonthFilter = (offset: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    
    // Format YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    setDateFilter({
      start: formatDate(start),
      end: formatDate(end)
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">TradeJournal AI</span>
            </div>
            
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
            >
              <PlusCircle className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filter Bar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter by Date:</span>
          </div>
          
          <input
            type="date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
          />

          <div className="h-6 w-px bg-slate-700 mx-2 hidden sm:block"></div>

          <button 
            onClick={() => setMonthFilter(0)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium text-slate-300 transition-colors"
          >
            This Month
          </button>
          <button 
            onClick={() => setMonthFilter(-1)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium text-slate-300 transition-colors"
          >
            Last Month
          </button>
           <button 
            onClick={() => setDateFilter({ start: '', end: '' })}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-xs font-medium text-slate-300 transition-colors ml-auto"
          >
            Clear Filter
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl w-fit mb-8 border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'journal' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            Journal
          </button>
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'dashboard' ? (
            <Dashboard trades={filteredTrades} />
          ) : (
            <TradeList trades={filteredTrades} />
          )}
        </div>
      </main>

      {/* Modals */}
      {isFormOpen && (
        <TradeForm 
          onSave={handleSaveTrade} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;