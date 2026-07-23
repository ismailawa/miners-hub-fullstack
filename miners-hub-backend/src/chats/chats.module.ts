import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '../entities/chat.entity';
import { User } from '../entities/user.entity';
import { UsersModule } from '../users/users.module';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, User]),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsService],
})
export class ChatsModule {}
