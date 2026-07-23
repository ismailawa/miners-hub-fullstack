import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KycService } from './kyc.service';
import { MetaMapCompleteDto, MetaMapStartDto } from './kyc.dto';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('metamap/start')
  startMetaMap(@Request() req: any, @Body() dto: MetaMapStartDto) {
    return this.kycService.startMetaMap(req.user.id, dto);
  }

  @Post('metamap/complete')
  completeMetaMap(@Request() req: any, @Body() dto: MetaMapCompleteDto) {
    return this.kycService.completeMetaMap(req.user.id, dto);
  }

  @Get('status')
  getStatus(@Request() req: any) {
    return this.kycService.getStatus(req.user.id);
  }
}
