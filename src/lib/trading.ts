import { subDays, format } from "date-fns";
import { fetchStockQuote, fetchStockCandles } from "./stockService";

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: { date: string; price: number }[];
  sector: string;
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  avgPrice: number;
}

const SECTORS = ["Technology", "Healthcare", "Finance", "Energy", "Consumer Goods"];

const generateHistory = (basePrice: number) => {
  return Array.from({ length: 30 }).map((_, i) => ({
    date: format(subDays(new Date(), 29 - i), "MMM dd"),
    price: basePrice + (Math.random() - 0.5) * (basePrice * 0.1),
  }));
};

export const MOCK_STOCKS: StockData[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 185.92, change: 1.25, changePercent: 0.68, sector: "Technology", history: generateHistory(185) },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 415.10, change: -2.30, changePercent: -0.55, sector: "Technology", history: generateHistory(415) },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 15.40, changePercent: 1.79, sector: "Technology", history: generateHistory(875) },
  { symbol: "TSLA", name: "Tesla, Inc.", price: 175.05, change: -5.12, changePercent: -2.84, sector: "Consumer Goods", history: generateHistory(175) },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 195.45, change: 0.85, changePercent: 0.44, sector: "Finance", history: generateHistory(195) },
  { symbol: "XOM", name: "Exxon Mobil Corp.", price: 118.20, change: 2.10, changePercent: 1.81, sector: "Energy", history: generateHistory(118) },
  { symbol: "PFE", name: "Pfizer Inc.", price: 28.45, change: -0.15, changePercent: -0.52, sector: "Healthcare", history: generateHistory(28) },
];

export const enrichStockWithRealData = async (stock: StockData): Promise<StockData> => {
  const quote = await fetchStockQuote(stock.symbol);
  const history = await fetchStockCandles(stock.symbol);

  if (!quote) return stock;

  return {
    ...stock,
    price: quote.c,
    change: quote.d,
    changePercent: quote.dp,
    history: history.length > 0 ? history : stock.history,
  };
};

export const getStockBySymbol = (symbol: string) => MOCK_STOCKS.find(s => s.symbol === symbol);

export const calculatePortfolioValue = (portfolio: PortfolioItem[]) => {
  return portfolio.reduce((acc, item) => {
    const stock = getStockBySymbol(item.symbol);
    return acc + (stock ? stock.price * item.shares : 0);
  }, 0);
};

export const calculateProfitLoss = (portfolio: PortfolioItem[]) => {
  return portfolio.reduce((acc, item) => {
    const stock = getStockBySymbol(item.symbol);
    if (!stock) return acc;
    const currentVal = stock.price * item.shares;
    const costBasis = item.avgPrice * item.shares;
    return acc + (currentVal - costBasis);
  }, 0);
};
