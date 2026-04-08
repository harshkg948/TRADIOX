import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Newspaper, GraduationCap, Bell, Loader2, RefreshCcw, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MOCK_STOCKS, calculatePortfolioValue, calculateProfitLoss, StockData, enrichStockWithRealData } from "../lib/trading";
import { getMarketNews, analyzeMarket, getEducationalContent } from "../lib/gemini";
import { fetchCompanyProfile } from "../lib/stockService";
import { VoiceAssistant } from "./VoiceAssistant";
import { PriceAlert } from "./PriceAlert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState([
    { symbol: "AAPL", shares: 10, avgPrice: 170 },
    { symbol: "NVDA", shares: 5, avgPrice: 800 },
  ]);
  const [stocks, setStocks] = useState<StockData[]>(MOCK_STOCKS);
  const [news, setNews] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData>(MOCK_STOCKS[0]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [eduContent, setEduContent] = useState<any>(null);
  const [isEduLoading, setIsEduLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const refreshStockData = async () => {
    setIsRefreshing(true);
    try {
      const configRes = await fetch("/api/config");
      const config = await configRes.json();
      setHasApiKey(config.hasFinnhub);

      if (!config.hasFinnhub) {
        setIsRefreshing(false);
        return;
      }

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            return await enrichStockWithRealData(stock);
          } catch (e) {
            return stock;
          }
        })
      );
      setStocks(updatedStocks);
      
      // Update selected stock if it's in the list
      const updatedSelected = updatedStocks.find(s => s.symbol === selectedStock.symbol);
      if (updatedSelected) setSelectedStock(updatedSelected);
      
      toast.success("Market data updated");
    } catch (error) {
      console.error("Error refreshing stocks", error);
      toast.error("Failed to refresh market data");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshStockData();
      try {
        const marketNews = await getMarketNews();
        setNews(marketNews);
        
        // Fetch initial profile
        setIsProfileLoading(true);
        const profile = await fetchCompanyProfile(selectedStock.symbol);
        setCompanyProfile(profile);
      } catch (error) {
        console.error("Error fetching news or profile", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    init();
  }, []);

  const handleStockSelect = async (stock: StockData) => {
    setSelectedStock(stock);
    setIsAnalyzing(true);
    setIsProfileLoading(true);
    try {
      const [analysisResult, profileResult] = await Promise.all([
        analyzeMarket(stock.symbol, stock.sector),
        fetchCompanyProfile(stock.symbol)
      ]);
      setAnalysis(analysisResult);
      setCompanyProfile(profileResult);
    } catch (error) {
      console.error("Error analyzing stock or fetching profile", error);
    } finally {
      setIsAnalyzing(false);
      setIsProfileLoading(false);
    }
  };

  const handleLearn = async (topic: string) => {
    setIsEduLoading(true);
    try {
      const data = await getEducationalContent(topic);
      setEduContent(data);
    } catch (error) {
      console.error("Error fetching educational content", error);
    } finally {
      setIsEduLoading(false);
    }
  };

  const getStockBySymbol = (symbol: string) => stocks.find(s => s.symbol === symbol);

  const portfolioValue = portfolio.reduce((acc, item) => {
    const stock = getStockBySymbol(item.symbol);
    return acc + (stock ? stock.price * item.shares : 0);
  }, 0);

  const totalPL = portfolio.reduce((acc, item) => {
    const stock = getStockBySymbol(item.symbol);
    if (!stock) return acc;
    return acc + (stock.price - item.avgPrice) * item.shares;
  }, 0);

  const pieData = portfolio.map((item) => {
    const stock = getStockBySymbol(item.symbol);
    return {
      name: item.symbol,
      value: stock ? stock.price * item.shares : 0,
    };
  }).filter((item) => item.value > 0);

  const CHART_COLORS = ["#2d4a22", "#4a6d3a", "#7a9a6b", "#a5c096", "#d4ccb6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-[1600px] mx-auto">
      <PriceAlert isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} stock={selectedStock} />
      
      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="lg:col-span-12">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-4 flex items-center justify-between soft-shadow">
            <div className="flex items-center gap-3 text-amber-700 text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Finnhub API key missing. Using mock data. Add FINNHUB_API_KEY to your environment for real-time data.</span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-amber-500/30 hover:bg-amber-500/10" onClick={() => window.open('https://finnhub.io/', '_blank')}>
              Get Key
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar / Stats */}
      <div className="lg:col-span-3 space-y-8">
        <Card className="organic-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Balance</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
              onClick={refreshStockData}
              disabled={isRefreshing || !hasApiKey}
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-serif font-bold tracking-tight text-primary">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className={`flex items-center mt-3 text-sm font-medium ${totalPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalPL >= 0 ? <TrendingUp className="w-4 h-4 mr-1.5" /> : <TrendingDown className="w-4 h-4 mr-1.5" />}
              {totalPL >= 0 ? '+' : ''}${(Math.abs(totalPL) || 0).toFixed(2)} ({(((totalPL / (portfolioValue - totalPL)) * 100) || 0).toFixed(2)}%)
            </div>
          </CardContent>
        </Card>

        <VoiceAssistant 
          portfolio={portfolio} 
          onAction={(action) => {
            if (action.type === "invest") {
              toast.success(`Strategy created for investing $${action.data.amount || 1000} in ${action.data.sector || 'AI stocks'}`);
            }
          }} 
        />

        <Card className="organic-card relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/20 blob-shape animate-sway pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <Newspaper className="w-4 h-4 text-primary" /> Market News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {news.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`text-[10px] rounded-full px-2 py-0 border-primary/20 bg-primary/5 text-primary`}>
                        {item.impact}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium">{item.time}</span>
                    </div>
                    <h4 className="text-sm font-serif font-bold mb-1.5 leading-tight group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-6 space-y-8">
        <Card className="organic-card overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blob-shape animate-sway pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
            <div>
              <CardTitle className="text-3xl font-serif font-bold text-primary">{selectedStock.name} ({selectedStock.symbol})</CardTitle>
              <div className="text-sm text-muted-foreground font-medium mt-1">{selectedStock.sector}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-serif font-bold text-primary">${(selectedStock?.price || 0).toFixed(2)}</div>
              <div className={`text-sm font-medium mt-1 ${(selectedStock?.change || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {(selectedStock?.change || 0) >= 0 ? '+' : ''}{(selectedStock?.change || 0).toFixed(2)} ({(selectedStock?.changePercent || 0).toFixed(2)}%)
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedStock.history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d4a22" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2d4a22" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(45, 74, 34, 0.03)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280', fontWeight: 500}} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #e5e1d3', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(45, 74, 34, 0.1)' }}
                    itemStyle={{ color: '#2d4a22', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#2d4a22" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#2d4a22', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          
          {/* Company Profile Section */}
          <div className="px-6 pb-6 pt-2 border-t border-border/50 relative z-10">
            {isProfileLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary/40" />
                <span className="text-xs text-muted-foreground font-medium">Loading company details...</span>
              </div>
            ) : companyProfile && companyProfile.name ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {companyProfile.logo && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border bg-white p-1">
                        <img src={companyProfile.logo} alt={companyProfile.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-primary">{companyProfile.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{companyProfile.country} • {companyProfile.exchange}</p>
                    </div>
                  </div>
                  {companyProfile.weburl && (
                    <Button variant="ghost" size="sm" className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5" onClick={() => window.open(companyProfile.weburl, '_blank')}>
                      Visit Website
                    </Button>
                  )}
                </div>
                {companyProfile.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-medium italic">
                    {companyProfile.description}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground font-medium italic py-2">Company profile details unavailable for this symbol.</p>
            )}
          </div>
        </Card>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-full border border-border">
            <TabsTrigger value="analysis" className="rounded-full data-[state=active]:bg-white data-[state=active]:soft-shadow font-serif text-lg">AI Analysis</TabsTrigger>
            <TabsTrigger value="strategy" className="rounded-full data-[state=active]:bg-white data-[state=active]:soft-shadow font-serif text-lg">Strategy</TabsTrigger>
            <TabsTrigger value="education" className="rounded-full data-[state=active]:bg-white data-[state=active]:soft-shadow font-serif text-lg">Learn</TabsTrigger>
          </TabsList>
          <TabsContent value="analysis" className="mt-6">
            <Card className="organic-card">
              <CardContent className="pt-8">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">AI is analyzing market trends and risk factors...</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-serif font-bold text-primary">Market Outlook</h3>
                      <Badge className={`rounded-full px-4 py-1 text-xs font-bold ${analysis.riskLevel === 'High' ? 'bg-rose-100 text-rose-700 border-rose-200' : analysis.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`} variant="outline">
                        Risk: {analysis.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-base leading-relaxed text-muted-foreground font-medium italic">"{analysis.analysis}"</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-[24px] bg-muted/30 border border-border soft-shadow">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">1-Week Prediction</div>
                        <div className="text-lg font-serif font-bold text-primary">{analysis.prediction}</div>
                      </div>
                      <div className="p-6 rounded-[24px] bg-muted/30 border border-border soft-shadow">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">AI Confidence</div>
                        <div className="text-lg font-serif font-bold text-primary">{analysis.confidence}%</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground font-medium italic">
                    Select a stock or ask the assistant to start analysis.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="strategy" className="mt-6">
             <Card className="organic-card">
              <CardContent className="pt-8">
                {analysis ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-serif font-bold text-primary">Recommended Strategy</h3>
                    <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 soft-shadow">
                      <p className="text-base leading-relaxed italic text-primary font-medium">"{analysis.strategy}"</p>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Risk Mitigation</h4>
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium">{analysis.riskDetails}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground font-medium italic">
                    Generate an analysis first to see the strategy.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="education" className="mt-6">
            <Card className="organic-card">
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold">Trading Academy</h3>
                  </div>
                  
                  {isEduLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground font-medium">AI is preparing your lesson...</p>
                    </div>
                  ) : eduContent ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-xl font-serif font-bold text-primary">{eduContent.title}</h4>
                      <p className="text-base text-muted-foreground leading-relaxed font-medium">{eduContent.content}</p>
                      <div className="p-6 rounded-[24px] bg-secondary/50 border border-border soft-shadow">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Key Takeaways</p>
                        <ul className="space-y-3">
                          {eduContent.tips.map((tip: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-3 font-medium text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/5 text-primary font-bold" onClick={() => setEduContent(null)}>Back to Topics</Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-base text-muted-foreground leading-relaxed font-medium">
                        New to trading? Our AI-powered learning modules help you understand market dynamics, risk management, and how to build a diversified portfolio with a natural approach.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {["Stock Market Basics", "Risk Management", "Technical Analysis", "Portfolio Diversification"].map((topic) => (
                          <Button key={topic} variant="outline" className="justify-start h-auto py-5 px-6 text-left rounded-[24px] border-border hover:border-primary/30 hover:bg-primary/5 transition-all group" onClick={() => handleLearn(topic)}>
                            <div>
                              <div className="text-base font-serif font-bold group-hover:text-primary transition-colors">{topic}</div>
                              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">5 min read</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-3 space-y-8">
        <Card className="organic-card relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 blob-shape animate-float pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <PieChartIcon className="w-4 h-4 text-primary" /> Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
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
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid #e5e1d3', borderRadius: '16px' }}
                    itemStyle={{ color: '#2d4a22', fontWeight: 600 }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="organic-card relative overflow-hidden">
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/10 blob-shape animate-float pointer-events-none" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <PieChartIcon className="w-4 h-4 text-primary" /> My Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {portfolio.map((item) => {
                const stock = stocks.find(s => s.symbol === item.symbol);
                if (!stock) return null;
                const currentVal = stock.price * item.shares;
                const profit = (stock.price - item.avgPrice) * item.shares;
                return (
                  <div key={item.symbol} className="flex items-center justify-between group cursor-pointer" onClick={() => handleStockSelect(stock)}>
                    <div>
                      <div className="text-base font-serif font-bold group-hover:text-primary transition-colors">{item.symbol}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.shares} shares</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-serif font-bold text-primary">${(currentVal || 0).toFixed(2)}</div>
                      <div className={`text-[10px] font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {profit >= 0 ? '+' : ''}{(profit || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="organic-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-primary" /> Market Watch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stocks.filter(s => !portfolio.some(p => p.symbol === s.symbol)).map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between group cursor-pointer" onClick={() => handleStockSelect(stock)}>
                  <div>
                    <div className="text-base font-serif font-bold group-hover:text-primary transition-colors">{stock.symbol}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-serif font-bold text-primary">${(stock?.price || 0).toFixed(2)}</div>
                    <div className={`text-[10px] font-bold ${stock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{(stock?.changePercent || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="organic-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
              <Bell className="w-4 h-4 text-primary" /> Price Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs p-4 rounded-[20px] bg-secondary/30 border border-border soft-shadow">
                <span className="font-bold text-primary">NVDA &gt; $900</span>
                <Badge variant="outline" className="text-[10px] rounded-full border-primary/20 bg-primary/5 text-primary">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-xs p-4 rounded-[20px] bg-secondary/30 border border-border opacity-50">
                <span className="font-bold">AAPL &lt; $180</span>
                <Badge variant="outline" className="text-[10px] rounded-full">Triggered</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs h-10 rounded-full border-primary/20 hover:bg-primary/5 text-primary font-bold uppercase tracking-widest" onClick={() => setIsAlertOpen(true)}>
                + Set New Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
