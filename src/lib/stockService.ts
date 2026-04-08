import { format, subDays, getUnixTime } from "date-fns";

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
}

export interface FinnhubCandles {
  c: number[]; // List of close prices
  t: number[]; // List of timestamps
  s: string; // Status
}

export const fetchStockQuote = async (symbol: string): Promise<FinnhubQuote | null> => {
  try {
    const response = await fetch(`/api/stock/quote?symbol=${symbol}`);
    if (!response.ok) throw new Error("Failed to fetch quote");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
};

export const fetchStockCandles = async (symbol: string, days: number = 30): Promise<{ date: string; price: number }[]> => {
  try {
    const to = getUnixTime(new Date());
    const from = getUnixTime(subDays(new Date(), days));
    const response = await fetch(`/api/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}`);
    if (!response.ok) throw new Error("Failed to fetch candles");
    const data: FinnhubCandles = await response.json();
    
    if (data.s !== "ok") return [];

    return data.c.map((price, index) => ({
      date: format(new Date(data.t[index] * 1000), "MMM dd"),
      price: price,
    }));
  } catch (error) {
    console.error(`Error fetching candles for ${symbol}:`, error);
    return [];
  }
};

export const fetchCompanyProfile = async (symbol: string) => {
  try {
    const response = await fetch(`/api/stock/profile?symbol=${symbol}`);
    if (!response.ok) throw new Error("Failed to fetch profile");
    return await response.json();
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    return null;
  }
};
