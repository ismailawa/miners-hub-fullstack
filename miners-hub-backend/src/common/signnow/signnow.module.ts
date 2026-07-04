import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SignNowService } from './signnow.service';

@Module({
  imports: [HttpModule],
  providers: [SignNowService],
  exports: [SignNowService],
})
export class SignNowModule {}
