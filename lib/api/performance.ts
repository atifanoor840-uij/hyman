import { apiRequest, ApiClientError } from './client';

// Types matching the MT5 performance API response
export interface AccountInfo {
  id: string;
  name: string;
  server: string;
  currency: string;
  company: string;
  balance: number;
  equity: number;
  margin: number;
  margin_free: number;
  profit: number;
  account_number: string;
  leverage: number;
  trade_allowed: number;
  [key: string]: unknown;
}

export interface DailyPerformance {
  date: string;
  volume: number;
  drawdown: number;
  twr_percent: number;
  peak_balance: number;
  cumulative_equity: number;
  cumulative_profit: number;
  cumulative_balance: number;
  twr_equity_percent: number;
}

export interface AccountStats {
  equity: number;
  profit: number;
  balance: number;
  twr_percent: number;
  peak_balance: number;
  drawdown_percent: number;
  drawdown_on_balance_percent?: number;
  total_deposits?: number;
  total_withdrawals?: number;
  [key: string]: unknown;
}

export interface RecentTrade {
  symbol: string;
  ticket: string;
  volume: number;
  duration: number;
  open_time: string;
  close_time: string;
  net_profit: number;
}

/** Open position row from MT5 / performance API */
export interface OpenTrade {
  symbol?: string;
  ticket?: string | number;
  volume?: number;
  open_time?: string;
  /** Floating P/L (unrealized) */
  profit?: number;
  type?: number | string;
  price_open?: number;
  price_current?: number;
  swap?: number;
  [key: string]: unknown;
}

export interface EquityCurve {
  daily_performance: DailyPerformance[];
  deposits_withdrawals?: { date: string; amount: number }[];
}

export interface AdvancedStatisticsCharts {
  recent_trades_duration?: RecentTrade[];
  trades_by_hour?: { won: number; hour: number; lost: number }[];
  trades_by_weekday?: { day: number; won: number; lost: number }[];
  [key: string]: unknown;
}

export interface AdvancedStatistics {
  /** Trade list; backend may put it here or under charts.recent_trades_duration */
  recent_trades_duration?: RecentTrade[];
  charts?: AdvancedStatisticsCharts;
  win_rate?: number;
  total_trades?: number;
  profit_factor?: number;
  [key: string]: unknown;
}

export interface PerformanceResponse {
  success: boolean;
  id: string;
  account_info: AccountInfo;
  statistics: {
    account_stats: AccountStats;
    equity_curve: EquityCurve;
    twr_progression?: { twr_trade_by_trade: number[] };
    monthly_yearly_performance?: unknown;
    advanced_statistics: AdvancedStatistics;
    by_symbol?: Record<string, unknown>;
  };
  metadata?: { user_id: string; platform: string; last_updated: string };
  open_trades?: { count: number; total: number; data: OpenTrade[] };
}

export async function getPerformanceData(orderId: string): Promise<PerformanceResponse> {
  try {
    const response = await apiRequest<PerformanceResponse>(
      `/mt5/performance/${encodeURIComponent(orderId)}`,
      { method: 'GET' }
    );
    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('Failed to fetch performance data. Please try again.');
  }
}
