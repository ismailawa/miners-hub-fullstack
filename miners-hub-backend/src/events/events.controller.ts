import { Controller, Get, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findPublishedUpcoming(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : 6;
    return this.eventsService.findPublishedUpcoming(
      Number.isFinite(parsedLimit) ? parsedLimit : 6,
    );
  }
}
