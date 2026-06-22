import React, { useState, useMemo, useRef, MouseEvent, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PRODUCTION_DATA, PRICE_CORRELATION_DATA, EXPORT_DATA, MARKET_SENTIMENT_DATA, HISTORICAL_PRICE_DATA } from '../lib/constants/data';
import { ProductionDataPoint, HistoricalPricePoint, ExportData, PriceCorrelation, ForecastDataPoint } from '../lib/types';

const ChartCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-secondary rounded-lg p-6 border border-border h-full flex flex-col ${className}`}>
        <h3 className="text-xl font-bold text-text-primary mb-4 flex-shrink-0">{title}</h3>
        <div className="flex-grow flex items-center justify-center">
            {children}
        </div>
    </div>
);

const MarketSentimentGauge: React.FC = () => {
    const { sentiment, value } = MARKET_SENTIMENT_DATA;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (value / 100) * circumference;

    let colorClass = 'text-yellow-400';
    if (sentiment === 'Bullish') colorClass = 'text-green-400';
    if (sentiment === 'Bearish') colorClass = 'text-red-400';

    let bgColorClass = 'text-yellow-400/20';
    if (sentiment === 'Bullish') bgColorClass = 'text-green-400/20';
    if (sentiment === 'Bearish') bgColorClass = 'text-red-400/20';

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-border" />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-text-primary">{value}%</span>
                <span className={`text-lg font-semibold ${colorClass}`}>{sentiment}</span>
            </div>
        </div>
    );
};

const ExportDestinationsChart: React.FC = () => {
    const data: ExportData[] = EXPORT_DATA;
    const maxVolume = Math.max(...data.map(d => d.volume));

    return (
        <div className="w-full space-y-3">
            {data.map(d => (
                <div key={d.country} className="flex items-center group">
                    <span className="w-28 text-sm text-text-secondary truncate">{d.country}</span>
                    <div className="flex-1 bg-primary rounded-full h-6 relative overflow-hidden">
                        <div className="bg-blue-500 h-6 rounded-full transition-all duration-500" style={{ width: `${(d.volume / maxVolume) * 100}%` }}></div>
                        <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-white">{d.volume.toLocaleString()}k T</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const PriceCorrelationHeatmap: React.FC = () => {
    const { minerals, correlations } = PRICE_CORRELATION_DATA;
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

    const getColor = (value: number) => {
        if (value > 0.66) return 'bg-green-600';
        if (value > 0.33) return 'bg-green-800';
        if (value > 0) return 'bg-green-900/50';
        if (value < -0.66) return 'bg-red-600';
        if (value < -0.33) return 'bg-red-800';
        if (value < 0) return 'bg-red-900/50';
        return 'bg-gray-700';
    };

    return (
        <div className="relative w-full aspect-square max-w-sm mx-auto" onMouseLeave={() => setTooltip(null)}>
            <div className="grid grid-cols-6 gap-1 text-xs">
                {/* Header Row */}
                <div />
                {minerals.map(m => <div key={m} className="font-bold text-center text-text-muted truncate">{m}</div>)}

                {/* Data Rows */}
                {minerals.map((rowMineral, i) => (
                    <React.Fragment key={rowMineral}>
                        <div className="font-bold text-right text-text-muted truncate">{rowMineral}</div>
                        {correlations[i].map((value, j) => (
                            <div
                                key={`${i}-${j}`}
                                onMouseMove={(e) => setTooltip({ content: `${rowMineral} / ${minerals[j]}: ${value.toFixed(2)}`, x: e.clientX, y: e.clientY })}
                                className={`aspect-square rounded-sm transition-transform hover:scale-110 ${getColor(value)} ${i === j ? 'opacity-50' : ''}`}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>
            {tooltip && (
                <div className="fixed z-10 p-2 text-sm bg-secondary border border-border rounded-md shadow-lg pointer-events-none" style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}>
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

const AIMarketSummary: React.FC = () => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const apiKey = process.env.API_KEY;
                if (!apiKey) {
                    setError("API Key not configured for AI Market Summary.");
                    setIsLoading(false);
                    return;
                }
                const ai = new GoogleGenAI({ apiKey });

                const prompt = `You are a senior market analyst for the Nigerian mining sector. Based on the following data, provide a concise summary of market trends in 3-4 bullet points. Focus on actionable insights for miners and investors. Use Markdown for formatting, specifically using bullet points ('*') and bold text ('**text**') for emphasis on key terms.
                
                - Production Data (in thousand tonnes): ${JSON.stringify(PRODUCTION_DATA)}
                - Top Export Destinations (in thousand tonnes): ${JSON.stringify(EXPORT_DATA)}
                - Overall Market Sentiment: ${JSON.stringify(MARKET_SENTIMENT_DATA)}
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                setSummary(response.text || '');

            } catch (err) {
                console.error("Gemini API error:", err);
                setError("Could not generate market summary at this time.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, []);

    const renderSummary = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'));

        const renderLine = (line: string) => {
            // Split by the markdown bold syntax, keeping the delimiters
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <React.Fragment>
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            // Render the bold part with a different style
                            return <strong key={i} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>;
                        }
                        // Render the normal text part
                        return part;
                    })}
                </React.Fragment>
            );
        };

        return (
            <ul className="space-y-4">
                {lines.map((line, index) => {
                    const content = line.replace(/^[-*]\s*/, '');
                    return (
                        <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 mt-1.5 mr-3">
                                <svg className="w-5 h-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <p className="text-text-secondary"><>{renderLine(content)}</></p>
                        </li>
                    );
                })}
            </ul>
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse w-full">
                <div className="h-4 bg-primary rounded w-3/4"></div>
                <div className="h-4 bg-primary rounded w-full"></div>
                <div className="h-4 bg-primary rounded w-5/6"></div>
                <div className="h-4 bg-primary rounded w-1/2"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-400">{error}</p>;
    }

    return renderSummary(summary);
};


const ProductionTrendChart: React.FC = () => {
    const data = PRODUCTION_DATA;
    const minerals = Object.keys(data[0]).filter(key => key !== 'month');
    const colors = ['#FBBF24', '#34D399', '#60A5FA'];
    const width = 500;
    const height = 300;
    const padding = 40;
    const yMax = 100;

    const xScale = (index: number) => padding + index * (width - 2 * padding) / (data.length - 1);
    const yScale = (value: number) => height - padding - (value / yMax) * (height - 2 * padding);

    const pointsToPath = (points: { x: number, y: number }[]) => {
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };

    return (
        <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    {colors.map((color, i) => (

                        <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                {/* Y-Axis */}
                {[0, 25, 50, 75, 100].map(val => (
                    <g key={val} className="text-xs text-text-muted">
                        <line x1={padding} y1={yScale(val)} x2={width - padding} y2={yScale(val)} stroke="currentColor" strokeDasharray="2" strokeOpacity="0.3" />
                        <text x={padding - 8} y={yScale(val)} dominantBaseline="middle" textAnchor="end">{val}</text>
                    </g>
                ))}
                {/* X-Axis */}
                {data.map((d, i) => (
                    <g key={d.month} className="text-xs text-text-muted">
                        <text x={xScale(i)} y={height - padding + 15} textAnchor="middle">{d.month}</text>
                    </g>
                ))}

                {minerals.map((mineral, i) => {
                    const points = data.map((d, j) => ({ x: xScale(j), y: yScale(d[mineral] as number) }));
                    return (
                        <g key={mineral}>

                            <path d={pointsToPath(points)} fill={`url(#gradient-${i})`} />
                            <path d={pointsToPath(points)} fill="none" stroke={colors[i]} strokeWidth="2" />
                            {points.map((p, j) => <circle key={j} cx={p.x} cy={p.y} r="3" fill={colors[i]} />)}
                        </g>
                    )
                })}
            </svg>
            <div className="flex justify-center space-x-4 mt-2">
                {minerals.map((mineral, i) => (
                    <div key={mineral} className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }}></div>
                        <span className="text-text-secondary">{mineral}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LineChart: React.FC<{
    data: { [key: string]: { x: number; y: number; type?: string }[] };
    colors: string[];
    width?: number;
    height?: number;
    padding?: number;
}> = ({ data, colors, width = 500, height = 300, padding = 40 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

    const { series, allPoints, xMax, yMin, yMax } = useMemo(() => {
        const series = Object.keys(data);
        const allPoints = series.flatMap(s => data[s]);
        if (allPoints.length === 0) return { series, allPoints, xMax: 0, yMin: 0, yMax: 0 };
        const xMax = Math.max(...allPoints.map(p => p.x));
        const yMin = Math.min(...allPoints.map(p => p.y));
        const yMax = Math.max(...allPoints.map(p => p.y));
        return { series, allPoints, xMax, yMin, yMax };
    }, [data]);

    if (allPoints.length === 0) return null;

    const xScale = (x: number) => padding + (x / xMax) * (width - 2 * padding);
    const yScale = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

    const pointsToPath = (points: { x: number, y: number }[]) => {
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };

    const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
        const point = e.target as SVGCircleElement;
        if (point.tagName === 'circle') {
            const seriesIndex = parseInt(point.dataset.seriesIndex || '0');
            const pointIndex = parseInt(point.dataset.pointIndex || '0');
            const seriesName = series[seriesIndex];
            const dataPoint = data[seriesName][pointIndex];
            setTooltip({ content: `${seriesName}: $${dataPoint.y.toFixed(2)}`, x: e.clientX, y: e.clientY });
        } else {
            setTooltip(null);
        }
    };

    return (
        <div className="relative w-full h-full" ref={containerRef}>
            {tooltip && (
                <div className="fixed z-10 p-2 text-sm bg-secondary border border-border rounded-md shadow-lg pointer-events-none" style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}>
                    {tooltip.content}
                </div>
            )}
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
                {/* Y-Axis */}
                {[...Array(5)].map((_, i) => {
                    const val = yMin + (i / 4) * (yMax - yMin);
                    return (
                        <g key={i} className="text-xs text-text-muted">
                            <line x1={padding} y1={yScale(val)} x2={width - padding} y2={yScale(val)} stroke="currentColor" strokeDasharray="2" strokeOpacity="0.3" />
                            <text x={padding - 8} y={yScale(val)} dominantBaseline="middle" textAnchor="end">${Math.round(val)}</text>
                        </g>
                    )
                })}

                {series.map((s, i) => {
                    const historicalPoints = data[s].filter(p => p.type === 'historical').map(p => ({ x: xScale(p.x), y: yScale(p.y) }));
                    const forecastPoints = data[s].filter(p => p.type === 'forecast').map(p => ({ x: xScale(p.x), y: yScale(p.y) }));
                    return (
                        <g key={s}>
                            <path d={pointsToPath(historicalPoints)} fill="none" stroke={colors[i % colors.length]} strokeWidth="2" />
                            <path d={pointsToPath(forecastPoints)} fill="none" stroke={colors[i % colors.length]} strokeWidth="2" strokeDasharray="4" />

                            {data[s].map((p, j) => (
                                <circle key={j} cx={xScale(p.x)} cy={yScale(p.y)} r="3" fill={colors[i % colors.length]} opacity={0} data-series-index={i} data-point-index={j} />
                            ))}
                        </g>
                    )
                })}
            </svg>
        </div>
    );
};

const PriceForecastChart: React.FC = () => {
    const [activeMineral, setActiveMineral] = useState('Gold');
    const [chartData, setChartData] = useState<{ [key: string]: { x: number, y: number, type?: 'historical' | 'forecast' }[] }>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateForecast = async () => {
            setIsLoading(true);
            const historicalData = HISTORICAL_PRICE_DATA[activeMineral];
            if (!historicalData) return;

            try {
                const apiKey = process.env.API_KEY;
                if (!apiKey) {
                    throw new Error("API Key not configured");
                }
                const ai = new GoogleGenAI({ apiKey });

                const prompt = `Given the following historical price data for ${activeMineral} over the last year, predict the price for the next 30 days. Provide only a comma-separated list of 30 numerical values representing the daily prices. Do not include any other text or explanation.
                
                Historical Data (last 30 days): ${JSON.stringify(historicalData.slice(-30).map(d => d.price))}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                const text = response.text || '';
                const forecastPrices = text.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));

                const today = new Date(historicalData[historicalData.length - 1].date);
                const forecastDataPoints: { date: string, price: number, type: 'forecast' }[] = forecastPrices.map((price, i) => {
                    const forecastDate = new Date(today);
                    forecastDate.setDate(today.getDate() + i + 1);
                    return { date: forecastDate.toISOString().split('T')[0], price: price, type: 'forecast' };
                });

                const combinedData = [...historicalData.slice(-90).map(d => ({ ...d, type: 'historical' as 'historical' })), ...forecastDataPoints];

                const processed = combinedData.map((d, i) => ({ x: i, y: d.price, type: d.type as 'historical' | 'forecast' }));
                setChartData({ [activeMineral]: processed });

            } catch (error) {
                console.error("Failed to generate forecast", error);
                // Fallback to only historical data
                const processed = historicalData.slice(-120).map((d, i) => ({ x: i, y: d.price, type: 'historical' as 'historical' }));
                setChartData({ [activeMineral]: processed });
            } finally {
                setIsLoading(false);
            }
        };
        generateForecast();
    }, [activeMineral]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-text-muted">Generating forecast...</p>
                    </div>
                ) : (
                    <LineChart data={chartData} colors={['#A78BFA']} />
                )}
            </div>
            <div className="flex-shrink-0 flex justify-center space-x-2 mt-4">
                {Object.keys(HISTORICAL_PRICE_DATA).map(mineral => (
                    <button
                        key={mineral}
                        onClick={() => setActiveMineral(mineral)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${activeMineral === mineral ? 'bg-accent text-accent-content' : 'bg-primary hover:bg-border'}`}
                    >
                        {mineral}
                    </button>
                ))}
            </div>
        </div>
    );
};


const DataAnalyticsPage: React.FC = () => {
    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Data & Analytics Hub</h1>
                    <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">Visualize market trends, production data, and gain AI-powered insights into the Nigerian mining sector.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    <ChartCard title="AI Market Summary" className="xl:col-span-3">
                        <AIMarketSummary />
                    </ChartCard>
                    <ChartCard title="Production Trends (YTD, in kT)">
                        <ProductionTrendChart />
                    </ChartCard>
                    <ChartCard title="Price Forecasting">
                        <PriceForecastChart />
                    </ChartCard>
                    <ChartCard title="Market Sentiment">
                        <MarketSentimentGauge />
                    </ChartCard>
                    <ChartCard title="Top Export Destinations">
                        <ExportDestinationsChart />
                    </ChartCard>
                    <ChartCard title="Price Correlation Matrix">
                        <PriceCorrelationHeatmap />
                    </ChartCard>
                </div>
            </div>
        </main>
    );
};


export default DataAnalyticsPage;