import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { ChatMessageDto } from './ai.dto';

const JATAU_SYSTEM_INSTRUCTION = `You are Jatau, a professional Nigerian mining officer and market intelligence expert working at Miners Hub. 
Your role is to help miners, investors, and government officials navigate Nigeria's mineral trading landscape.

Key responsibilities:
- Explain mining regulations, licensing requirements, and compliance procedures in Nigeria
- Provide market insights on mineral prices, trends, and investment opportunities
- Help users understand how to use the Miners Hub platform
- Give practical advice about mineral types, grades, and trading practices
- Discuss Nigeria's solid minerals: Gold, Tin, Columbite, Limestone, Coal, Lead/Zinc, Gypsum, Lithium, Granite

Communication style:
- Be professional yet friendly and approachable
- Use clear, simple language — avoid excessive jargon
- Reference Nigerian context (states, LGAs, regulatory bodies like the Ministry of Mines)
- Always be honest about what you know and don't know
- Keep responses concise but thorough`;

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  /**
   * Chat with Jatau (Gemini).
   * Returns a full response string (SSE streaming handled at controller level).
   */
  async chat(dto: ChatMessageDto): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      throw new ServiceUnavailableException(
        'AI service is not configured. Please set GEMINI_API_KEY in your environment.',
      );
    }

    // Build contents array for Gemini
    const history = (dto.history || []).map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    }));

    const contents = [
      ...history,
      { role: 'user', parts: [{ text: dto.message }] },
    ];

    const body = {
      system_instruction: {
        parts: [{ text: JATAU_SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new ServiceUnavailableException(`Gemini API error: ${error}`);
    }

    const data = (await response.json()) as any;
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      'I apologize, I could not generate a response. Please try again.';

    return text;
  }

  /**
   * Generate an AI market summary from real listings data.
   * Queries the database, builds a context, calls Gemini.
   */
  async getMarketSummary(): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return '⚠️ AI market summary requires a valid GEMINI_API_KEY to be configured.';
    }

    // Aggregate real listings data
    const listings = await this.listingRepository.find({
      where: { status: ListingStatus.PUBLISHED },
      select: ['mineralType', 'price', 'quantity', 'location', 'listingType'],
    });

    if (listings.length === 0) {
      return 'No active listings found. Market summary will appear once listings are published on the platform.';
    }

    // Build market context from real data
    const mineralStats: Record<string, { count: number; totalValue: number; locations: Set<string> }> = {};
    let totalListings = 0;
    let totalValue = 0;

    for (const listing of listings) {
      totalListings++;
      const value = Number(listing.price) * Number(listing.quantity);
      totalValue += value;

      if (!mineralStats[listing.mineralType]) {
        mineralStats[listing.mineralType] = { count: 0, totalValue: 0, locations: new Set() };
      }
      mineralStats[listing.mineralType].count++;
      mineralStats[listing.mineralType].totalValue += value;
      if (listing.location) {
        mineralStats[listing.mineralType].locations.add(listing.location);
      }
    }

    const mineralSummary = Object.entries(mineralStats)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([mineral, stats]) =>
        `- ${mineral}: ${stats.count} listing(s), total value ₦${stats.totalValue.toLocaleString()}, locations: ${[...stats.locations].join(', ') || 'N/A'}`,
      )
      .join('\n');

    const marketContext = `
Current Miners Hub Marketplace Data (as of ${new Date().toLocaleDateString('en-NG')}):
Total active listings: ${totalListings}
Total market value: ₦${totalValue.toLocaleString()}

Breakdown by mineral:
${mineralSummary}
    `.trim();

    const prompt = `Based on the following real marketplace data from Miners Hub, a Nigerian mineral trading platform, provide a concise market intelligence summary (200-300 words) with:
1. Key market trends and observations
2. Top opportunities for investors
3. Any notable patterns (concentration in certain minerals or locations)
4. Brief outlook

Market Data:
${marketContext}

Provide actionable insights in plain markdown format with bullet points. Focus on Nigerian mining market context.`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      return '⚠️ Could not generate market summary at this time. Please try again later.';
    }

    const data = (await response.json()) as any;
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      '⚠️ Market summary generation failed. Please try again.'
    );
  }
}
