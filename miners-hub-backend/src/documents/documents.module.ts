import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Document } from '../entities/document.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
    CloudinaryModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
