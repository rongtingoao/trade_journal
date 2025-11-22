import React, { useState, useRef } from 'react';
import { TradeFormData, TradeStatus, TradeDirection, TradeRecord } from '../types';
import { analyzeTradeWithAI } from '../services/geminiService';
import { Upload, Bot, Loader2, Save, X, Calendar } from 'lucide-react';

interface TradeFormProps {
  onSave: (trade: TradeRecord) => void;
  onCancel: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSave, onCancel }) => {
  // Initialize with current local date-time formatted for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<TradeFormData>({
    date: getCurrentDateTime(),
    priceSource: '',
    timeframe: '',
    model: '',
    direction: TradeDirection.LONG,
    entryPrice: '',
    exitPrice: '',
    rr: '',
    status: TradeStatus.WIN,
    notes: '',
  });

  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const details = `
      Date: ${formData.date}
      Price Source: ${formData.priceSource}
      Timeframe: ${formData.timeframe}
      Model: ${formData.model}
      Direction: ${formData.direction}
      Result: ${formData.status}
      Notes: ${formData.notes}
    `;
    
    const analysis = await analyzeTradeWithAI(screenshot, details);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safe ID generation
    const safeId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Safe timestamp generation
    const timestamp = formData.date ? new Date(formData.date).getTime() : Date.now();

    const newTrade: TradeRecord = {
      id: safeId,
      timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      ...formData,
      entryPrice: Number(formData.entryPrice) || 0,
      exitPrice: Number(formData.exitPrice) || 0,
      rr: Number(formData.rr) || 0,
      screenshotBase64: screenshot,
      aiAnalysis: aiAnalysis || undefined,
    };
    onSave(newTrade);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <h2 className="text-2xl font-bold text-white">Log New Trade</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <form id="trade-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-slate-400 text-sm mb-1">Date & Time</label>
              <div className="relative">
                <input
                  required
                  name="date"
                  type="datetime-local"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none [color-scheme:dark]"
                  value={formData.date}
                  onChange={handleInputChange}
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Price Source</label>
                <select
                  required
                  name="priceSource"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.priceSource}
                  onChange={handleInputChange}
                >
                  <option value="">Select Source</option>
                  <option value="1m">1m</option>
                  <option value="5m">5m</option>
                  <option value="15m">15m</option>
                  <option value="30m">30m</option>
                  <option value="1h">1h</option>
                  <option value="4h">4h</option>
                  <option value="1d">1d</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Timeframe</label>
                <select
                  required
                  name="timeframe"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.timeframe}
                  onChange={handleInputChange}
                >
                  <option value="">Select TF</option>
                  <option value="1m">1m</option>
                  <option value="5m">5m</option>
                  <option value="15m">15m</option>
                  <option value="30m">30m</option>
                  <option value="1h">1h</option>
                  <option value="4h">4h</option>
                  <option value="1d">1d</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Entry Model</label>
              <select
                required
                name="model"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.model}
                onChange={handleInputChange}
              >
                <option value="">Select Model</option>
                <option value="in-out -reject dc">in-out -reject dc</option>
                <option value="deepzone dc">deepzone dc</option>
                <option value="deepzone cc">deepzone cc</option>
                <option value="reject new snr dc">reject new snr dc</option>
                <option value="reject new snr cc">reject new snr cc</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-slate-400 text-sm mb-1">Direction</label>
                <select
                  name="direction"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.direction}
                  onChange={handleInputChange}
                >
                  <option value={TradeDirection.LONG}>Long</option>
                  <option value={TradeDirection.SHORT}>Short</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Outcome</label>
                <select
                  name="status"
                  className={`w-full border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none ${
                    formData.status === TradeStatus.WIN ? 'bg-emerald-900/30' : 
                    formData.status === TradeStatus.LOSS ? 'bg-red-900/30' : 'bg-amber-900/30'
                  }`}
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value={TradeStatus.WIN}>Win</option>
                  <option value={TradeStatus.LOSS}>Loss</option>
                  <option value={TradeStatus.BREAK_EVEN}>Break Even</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Entry Price</label>
                <input
                  name="entryPrice"
                  type="number"
                  step="any"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.entryPrice}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Exit Price</label>
                <input
                  name="exitPrice"
                  type="number"
                  step="any"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.exitPrice}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Risk:Reward</label>
                <input
                  required
                  name="rr"
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.rr}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Notes / Psychology</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="What were you thinking?"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Screenshot</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-lg p-4 hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[120px]"
              >
                {screenshot ? (
                  <img src={screenshot} alt="Preview" className="max-h-[200px] rounded object-contain" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-slate-400 text-sm">Click to upload chart image</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </form>

          {/* Right Column: AI Analysis */}
          <div className="flex flex-col h-full bg-slate-950/50 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Gemini AI Mentor</h3>
              </div>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!screenshot && !formData.notes)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isAnalyzing 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Trade'
                )}
              </button>
            </div>
            
            <div className="flex-1 bg-slate-900 rounded-lg p-4 border border-slate-800 overflow-y-auto text-sm text-slate-300 leading-relaxed">
              {aiAnalysis ? (
                <div className="whitespace-pre-wrap font-mono">{aiAnalysis}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <Bot className="w-12 h-12 mb-3 opacity-20" />
                  <p>Upload a screenshot and fill in details,</p>
                  <p>then click "Analyze Trade" to get AI insights.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 bg-slate-900 sticky bottom-0 flex justify-end gap-4">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            form="trade-form"
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};