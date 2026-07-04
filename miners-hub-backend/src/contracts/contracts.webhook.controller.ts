import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContractStatus } from '../entities/contract.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from '../entities/contract.entity';
import { Repository } from 'typeorm';

@Controller('webhooks/signnow')
export class SignNowWebhookController {
  private readonly logger = new Logger(SignNowWebhookController.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-signnow-webhook-secret') webhookSecret?: string,
  ) {
    const expectedSecret = this.configService.get<string>(
      'SIGNNOW_WEBHOOK_SECRET',
    );
    if (expectedSecret && webhookSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid SignNow webhook secret.');
    }

    this.logger.log(`Received SignNow Webhook: ${JSON.stringify(payload)}`);

    const event = payload?.meta?.event;
    const documentId = payload?.content?.id;

    if (!documentId) {
      return { status: 'ignored', reason: 'no document id' };
    }

    if (event === 'document.complete' || event === 'document.update') {
      // Find contract by metadata->>signNowDocumentId
      const contract = await this.contractRepository
        .createQueryBuilder('contract')
        .where("contract.metadata->>'signNowDocumentId' = :documentId", {
          documentId,
        })
        .getOne();

      if (!contract) {
        this.logger.warn(
          `No contract found for SignNow document: ${documentId}`,
        );
        return { status: 'ignored', reason: 'contract not found' };
      }

      // If document is fully signed
      if (
        event === 'document.complete' &&
        contract.status !== ContractStatus.SIGNED
      ) {
        // We bypass standard status updates here since this is system driven
        contract.status = ContractStatus.SIGNED;

        // We could theoretically fetch document details from SignNow to get timestamps,
        // but for now we'll just set them to now.
        const now = new Date();
        if (!contract.party1SignedAt) contract.party1SignedAt = now;
        if (!contract.party2SignedAt) contract.party2SignedAt = now;

        await this.contractRepository.save(contract);
        this.logger.log(`Contract ${contract.id} marked as SIGNED via webhook`);
      }
    }

    return { status: 'success' };
  }
}
