import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { CreateEventDto, UpdateEventDto } from './events.dto';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async onModuleInit() {
    const count = await this.eventRepository.count();
    if (count > 0) return;

    await this.eventRepository.save([
      this.eventRepository.create({
        title: 'Nigeria Mining Week',
        description:
          'A national gathering for mining operators, regulators, investors, and service providers focused on responsible mineral development.',
        date: '2026-10-15',
        location: 'Abuja, Nigeria',
        imageUrl: 'https://picsum.photos/seed/nigeria-mining-week/1200/800',
        registrationUrl: 'https://www.nigeriaminingweek.com',
        featured: true,
        status: EventStatus.PUBLISHED,
      }),
      this.eventRepository.create({
        title: 'Mineral Trade & Investment Forum',
        description:
          'Connect with verified miners, commodity buyers, logistics providers, and private capital partners across the Nigerian mineral value chain.',
        date: '2026-11-05',
        location: 'Lagos, Nigeria',
        imageUrl: 'https://picsum.photos/seed/mineral-trade-forum/1200/800',
        featured: false,
        status: EventStatus.PUBLISHED,
      }),
      this.eventRepository.create({
        title: 'Responsible Mining Compliance Workshop',
        description:
          'A practical workshop covering KYC, licensing, documentation, and transparent reporting for mineral producers and investors.',
        date: '2026-12-01',
        location: 'Online',
        imageUrl:
          'https://picsum.photos/seed/mining-compliance-workshop/1200/800',
        featured: false,
        status: EventStatus.PUBLISHED,
      }),
    ]);
  }

  findPublishedUpcoming(limit = 6): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        status: EventStatus.PUBLISHED,
        date: MoreThanOrEqual(new Date().toISOString().slice(0, 10)),
      },
      order: {
        featured: 'DESC',
        date: 'ASC',
      },
      take: limit,
    });
  }

  findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      order: {
        date: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  create(dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...dto,
      status: dto.status || EventStatus.PUBLISHED,
      featured: dto.featured || false,
    });
    return this.eventRepository.save(event);
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    Object.assign(event, dto);
    return this.eventRepository.save(event);
  }

  async delete(id: string): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.eventRepository.remove(event);
  }
}
