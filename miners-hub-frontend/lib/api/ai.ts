/**
 * AI API Service
 *
 * Connects to the backend /api/ai endpoints (Gemini-powered Jatau assistant).
 */

import apiClient from './client';

export interface JatauChatPayload extends Record<string, unknown> {
  message: string;
  persona?: string;
}

export interface JatauChatResponse {
  response: string;
}

export interface MarketSummaryResponse {
  summary: string;
  generatedAt: string;
}

export interface ForecastResponse {
  prices: number[];
}

/**
 * Send a message to the Jatau AI assistant
 */
export async function chatWithJatau(payload: JatauChatPayload): Promise<JatauChatResponse> {
  return apiClient.post<JatauChatResponse>('/api/ai/chat', payload);
}

/**
 * Get a live AI-generated market intelligence summary
 */
export async function getMarketSummary(): Promise<MarketSummaryResponse> {
  return apiClient.get<MarketSummaryResponse>('/api/ai/market-summary');
}

export async function getPriceForecast(
  mineral: string,
  historicalPrices: number[],
): Promise<ForecastResponse> {
  return apiClient.post<ForecastResponse>('/api/ai/forecast', {
    mineral,
    historicalPrices,
  });
}
