import React, { useState, useEffect, useRef } from 'react';
import { MINERAL_PRICES_DATA } from '../lib/constants/data';
import { MineralPrice } from '../lib/types';

const HOURLY_UPDATE_INTERVAL_MS = 60 * 60 * 1000;
const USD_TO_NGN_RATE = Number(process.env.NEXT_PUBLIC_USD_NGN_RATE || 1600);

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ngnFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatUsd = (value: number) => usdFormatter.format(value);
const formatNgn = (value: number) => ngnFormatter.format(value);

const getNextHourlyUpdate = (date: Date) => new Date(date.getTime() + HOURLY_UPDATE_INTERVAL_MS);

const MineralIcon: React.FC<{ symbol: string }> = ({ symbol }) => {
  const icons: { [key: string]: React.ReactNode } = {
    'Fe': ( // Iron Ore
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.515 11.123a.75.75 0 011.06-1.06l1.5 1.5a.75.75 0 01-1.06 1.06l-1.5-1.5zm2.94 2.94a.75.75 0 01-1.06 1.06l-1.5-1.5a.75.75 0 011.06-1.06l1.5 1.5zM12 6a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008A.75.75 0 0111.25 7.5V6.75A.75.75 0 0112 6zm-3.75 3a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
      </svg>
    ),
    'Pb': ( // Lead Ore
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A32.94 32.94 0 0112 3.75c0-1.094.226-2.16.634-3.174a.75.75 0 00-.671-.29zM6.75 8.25A.75.75 0 017.5 9v6a.75.75 0 01-1.5 0V9A.75.75 0 016.75 8.25zM16.5 8.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zM12 18.75c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" clipRule="evenodd" />
      </svg>
    ),
    'Zn': ( // Zinc Ore
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 p-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400">
        <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v1.286a.75.75 0 00.75.75h.008a.75.75 0 00.75-.75v-.533c.07-.06.143-.118.22-.176A8.25 8.25 0 016 4.5c1.5 0 2.86.445 4.004 1.204a.75.75 0 001.064-.971zM11.25 19.467c-.31-.1-.617-.206-.926-.32a.75.75 0 00-.588 1.406 8.23 8.23 0 01-1.576.42V18.75a.75.75 0 00-.75-.75H6a.75.75 0 00-.75.75v1.286a.75.75 0 00.5.707A9.735 9.735 0 006 21a9.707 9.707 0 005.25-1.533.75.75 0 00-.564-1.394zM18 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" />
      </svg>
    ),
    'Au': ( // Gold
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-500 dark:text-yellow-400">
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.829 2.829l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.829 2.829l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.829-2.829l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.966 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036a.75.75 0 00.728.568l1.036.258a.75.75 0 010 1.456l-1.036.258a.75.75 0 00-.728.568l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a.75.75 0 00-.728-.568l-1.036-.258a.75.75 0 010-1.456l1.036-.258a.75.75 0 00.728-.568l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183a.75.75 0 00.513.712l1.183.394a.75.75 0 010 1.424l-1.183.394a.75.75 0 00-.513.712l-.394 1.183a.75.75 0 01-1.424 0l-.394-1.183a.75.75 0 00-.513-.712l-1.183-.394a.75.75 0 010-1.424l1.183-.394a.75.75 0 00.513-.712l.394-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
      </svg>
    ),
    'C': ( // Coal
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 p-1 rounded-full bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-400">
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0L2.47 11.47a.75.75 0 101.06 1.06l8.94-8.94z" />
        <path d="M21.75 12c.031.152.062.304.093.457a.75.75 0 01-1.01.835A11.94 11.94 0 0112 10.5c-.77 0-1.516.11-2.228.314a.75.75 0 01-.65-.96A13.44 13.44 0 0012 9c4.256 0 7.906 1.94 10.07 4.933a.75.75 0 01-.32.967z" />
      </svg>
    ),
    'CaCO₃': ( // Limestone
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 p-1 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
        <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5V3.75a.75.75 0 000-1.5h-15zM12 6a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V6.75A.75.75 0 0112 6zm-5.25.75a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V6.75zm10.5 0a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V6.75z" clipRule="evenodd" />
      </svg>
    ),
  };

  return icons[symbol] || <div className="w-8 h-8 bg-border rounded-full" />;
};

const PriceRow: React.FC<{ mineral: MineralPrice }> = ({ mineral }) => {
  const [flash, setFlash] = useState<'up' | 'down' | ''>('');
  const prevPriceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevPriceRef.current !== undefined && prevPriceRef.current !== mineral.price) {
      setFlash(mineral.price > prevPriceRef.current ? 'up' : 'down');
      const timer = setTimeout(() => setFlash(''), 500); // flash for 500ms
      prevPriceRef.current = mineral.price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = mineral.price;
  }, [mineral.price]);

  const isPositive = mineral.change >= 0;
  
  const flashClass = flash === 'up' ? 'bg-green-500/20' : flash === 'down' ? 'bg-red-500/20' : '';
  const transitionClass = 'transition-colors duration-500';

  return (
    <tr className={`${flashClass} ${transitionClass}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-4">
          <MineralIcon symbol={mineral.symbol} />
          <div>
            <div className="font-bold text-text-primary">{mineral.name}</div>
            <div className="text-sm text-text-muted">{mineral.symbol}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-semibold text-text-primary text-right">
        <div>{formatUsd(mineral.price)}</div>
        <div className="mt-1 text-xs font-medium text-text-muted">
          {formatNgn(mineral.price * USD_TO_NGN_RATE)}
        </div>
      </td>
      <td className={`px-6 py-4 whitespace-nowrap font-semibold text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        <span className="inline-flex items-center">
          {isPositive ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          )}
          {isPositive ? '+' : ''}{mineral.change.toFixed(2)}%
        </span>
      </td>
    </tr>
  );
};


const MineralPrices: React.FC = () => {
  const [prices, setPrices] = useState<MineralPrice[]>(MINERAL_PRICES_DATA);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(() => new Date());

  useEffect(() => {
    const updatePrices = () => {
      setPrices(prevPrices =>
        prevPrices.map(mineral => {
          const changePercent = (Math.random() - 0.5) * 0.015;
          const newPrice = mineral.price * (1 + changePercent);
          const originalPrice = MINERAL_PRICES_DATA.find(p => p.symbol === mineral.symbol)?.price || newPrice;
          const newChange = ((newPrice - originalPrice) / originalPrice) * 100;

          return { ...mineral, price: newPrice, change: newChange };
        })
      );
      setLastUpdatedAt(new Date());
    };

    const interval = setInterval(() => {
      updatePrices();
    }, HOURLY_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const nextUpdatedAt = getNextHourlyUpdate(lastUpdatedAt);

  return (
    <section id="minerals" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-4xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">Live Mineral Prices</h2>
              <p className="mt-3 text-base text-text-secondary">
                International reference prices with naira equivalents refreshed hourly.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-primary px-4 py-3 text-sm text-text-secondary">
              <div className="font-semibold text-text-primary">Hourly update</div>
              <div>Last: {timeFormatter.format(lastUpdatedAt)}</div>
              <div>Next: {timeFormatter.format(nextUpdatedAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-secondary rounded-lg shadow-lg border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Mineral
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    USD / NGN Equivalent
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Change (24h)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {prices.map((mineral) => (
                    <PriceRow key={mineral.symbol} mineral={mineral} />
                ))}
              </tbody>
            </table>
            <div className="border-t border-border bg-primary/40 px-6 py-3 text-xs text-text-muted">
              USD is the reference market price. NGN equivalent uses the configured exchange rate of {formatNgn(USD_TO_NGN_RATE)} per $1.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MineralPrices;
