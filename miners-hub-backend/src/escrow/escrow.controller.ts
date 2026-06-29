import { Body, Controller, Headers, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EscrowService } from './escrow.service';

@Controller()
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('orders/:id/escrow/initiate')
  @UseGuards(JwtAuthGuard)
  initiate(@Param('id') id: string, @Request() req: any) {
    return this.escrowService.initiateOrderEscrow(id, req.user.id);
  }

  @Post('escrow/flutterwave/webhook')
  webhook(@Body() body: any, @Headers('verif-hash') verifHash?: string) {
    return this.escrowService.handleFlutterwaveWebhook(body, verifHash);
  }
}
