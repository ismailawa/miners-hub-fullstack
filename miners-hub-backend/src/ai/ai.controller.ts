import { Controller, Post, Get, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatMessageDto } from './ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/ai/chat
   * Send a message to the Jatau AI assistant and get a response.
   * No auth required — publicly accessible for engagement.
   */
  @Post('chat')
  async chat(@Body() dto: ChatMessageDto): Promise<{ response: string }> {
    const response = await this.aiService.chat(dto);
    return { response };
  }

  /**
   * GET /api/ai/market-summary
   * Generate a Gemini-powered market intelligence summary from real listings data.
   * No auth required — public analytics.
   */
  @Get('market-summary')
  async marketSummary(): Promise<{ summary: string; generatedAt: string }> {
    const summary = await this.aiService.getMarketSummary();
    return {
      summary,
      generatedAt: new Date().toISOString(),
    };
  }
}
