export enum TradeStatus {
  WIN = 'WIN',
  LOSS = 'LOSS',
  BREAK_EVEN = 'BE'
}

export enum TradeDirection {
  LONG = 'Long',
  SHORT = 'Short'
}

export interface TradeRecord {
  id: string;
  timestamp: number;
  priceSource: string; // Where the price comes from (e.g., Exchange, Broker)
  timeframe: string;
  model: string; // Entry Model
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  rr: number; // Risk to Reward Ratio
  status: TradeStatus;
  screenshotBase64?: string;
  notes?: string;
  aiAnalysis?: string;
}

export interface TradeFormData {
  date: string;
  priceSource: string;
  timeframe: string;
  model: string;
  direction: TradeDirection;
  entryPrice: string;
  exitPrice: string;
  rr: string;
  status: TradeStatus;
  notes: string;
}

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  avgRR: number;
  netRR: number;
}