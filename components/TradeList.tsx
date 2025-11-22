import React, { useState } from 'react';
import { TradeRecord, TradeStatus } from '../types';
import { ArrowUp, ArrowDown, Image as ImageIcon, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';

interface TradeListProps {
  trades: TradeRecord[];
}

export const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
        <p className="text-slate-400">No trades recorded yet. Start by adding a new entry.</p>
      </div>
    );
  }

  // Sort by newest first
  const sortedTrades = [...trades].sort((a, b) => b.timestamp - a.timestamp);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
      <div className="grid grid-cols-12 bg-slate-900/50 p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
        <div className="col-span-2">Date / Source</div>
        <div className="col-span-1">TF</div>
        <div className="col-span-2">Model</div>
        <div className="col-span-1">Dir</div>
        <div className="col-span-2">Result</div>
        <div className="col-span-1 text-right">R:R</div>
        <div className="col-span-2 text-right">Price</div>
        <div className="col-span-1 text-center">View</div>
      </div>

      <div className="divide-y divide-slate-700">
        {sortedTrades.map((trade) => (
          <div key={trade.id} className="bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
            <div 
              className="grid grid-cols-12 p-4 items-center cursor-pointer"
              onClick={() => toggleExpand(trade.id)}
            >
              <div className="col-span-2">
                <div className="text-white font-medium">{trade.priceSource || "Unknown"}</div>
                <div className="text-xs text-slate-500">{new Date(trade.timestamp).toLocaleDateString()}</div>
              </div>
              <div className="col-span-1 text-slate-300 text-sm">{trade.timeframe}</div>
              <div className="col-span-2 text-slate-300 text-sm truncate pr-2">{trade.model}</div>
              <div className="col-span-1">
                {trade.direction === 'Long' ? (
                  <span className="flex items-center text-emerald-400 text-xs font-bold">
                    <ArrowUp className="w-3 h-3 mr-1" /> LONG
                  </span>
                ) : (
                  <span className="flex items-center text-red-400 text-xs font-bold">
                    <ArrowDown className="w-3 h-3 mr-1" /> SHORT
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  trade.status === TradeStatus.WIN ? 'bg-emerald-500/20 text-emerald-400' :
                  trade.status === TradeStatus.LOSS ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {trade.status}
                </span>
              </div>
              <div className="col-span-1 text-right text-slate-300 font-mono">{trade.rr}R</div>
              <div className="col-span-2 text-right">
                <div className="text-xs text-slate-400">In: {trade.entryPrice}</div>
                <div className="text-xs text-slate-400">Out: {trade.exitPrice}</div>
              </div>
              <div className="col-span-1 flex justify-center text-slate-400">
                {expandedId === trade.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Expanded Detail View */}
            {expandedId === trade.id && (
              <div className="p-4 bg-slate-900/50 border-t border-slate-700/50 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                    <p className="text-slate-300 text-sm bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                      {trade.notes || "No notes provided."}
                    </p>

                    {trade.screenshotBase64 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <ImageIcon className="w-3 h-3" /> Screenshot
                        </h4>
                        <img 
                          src={trade.screenshotBase64} 
                          alt="Chart" 
                          className="w-full h-auto rounded-lg border border-slate-700" 
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <BrainCircuit className="w-3 h-3" /> AI Analysis
                    </h4>
                    <div className="text-slate-300 text-sm bg-slate-800 p-3 rounded-lg border border-purple-900/30 min-h-[100px] whitespace-pre-wrap">
                      {trade.aiAnalysis || "No AI analysis available for this trade."}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};