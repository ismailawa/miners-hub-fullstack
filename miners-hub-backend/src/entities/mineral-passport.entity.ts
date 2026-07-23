import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Contract } from './contract.entity';
import { EscrowTransaction } from './escrow-transaction.entity';
import { LabResult } from './lab-result.entity';
import { License } from './license.entity';
import { Listing } from './listing.entity';
import { MineSite } from './mine-site.entity';
import { Miner } from './miner.entity';
import { Order } from './order.entity';
import { ProductionReport } from './production-report.entity';
import { Shipment } from './shipment.entity';
import { User } from './user.entity';

export enum MineralPassportStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  DISPUTED = 'disputed',
  EXPIRED = 'expired',
}

@Entity('mineral_passports')
@Index(['passportNumber'], { unique: true })
@Index(['publicVerificationToken'], { unique: true })
@Index(['status'])
@Index(['minerId'])
@Index(['listingId'])
@Index(['orderId'])
export class MineralPassport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'passport_number', type: 'varchar', unique: true })
  @IsString()
  passportNumber!: string;

  @Column({ name: 'public_verification_token', type: 'varchar', unique: true })
  @IsString()
  publicVerificationToken!: string;

  @Column({ name: 'miner_id', type: 'uuid' })
  @IsUUID()
  minerId!: string;

  @ManyToOne(() => Miner)
  @JoinColumn({ name: 'miner_id' })
  miner!: Miner;

  @Column({ name: 'site_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @ManyToOne(() => MineSite, { nullable: true })
  @JoinColumn({ name: 'site_id' })
  site?: MineSite | null;

  @Column({ name: 'license_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @ManyToOne(() => License, { nullable: true })
  @JoinColumn({ name: 'license_id' })
  license?: License | null;

  @Column({ name: 'production_report_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  productionReportId?: string | null;

  @ManyToOne(() => ProductionReport, { nullable: true })
  @JoinColumn({ name: 'production_report_id' })
  productionReport?: ProductionReport | null;

  @Column({ name: 'lab_result_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  labResultId?: string | null;

  @ManyToOne(() => LabResult, { nullable: true })
  @JoinColumn({ name: 'lab_result_id' })
  labResult?: LabResult | null;

  @Column({ name: 'listing_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  listingId?: string | null;

  @ManyToOne(() => Listing, { nullable: true })
  @JoinColumn({ name: 'listing_id' })
  listing?: Listing | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string | null;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order | null;

  @Column({ name: 'shipment_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  shipmentId?: string | null;

  @ManyToOne(() => Shipment, { nullable: true })
  @JoinColumn({ name: 'shipment_id' })
  shipment?: Shipment | null;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  contractId?: string | null;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contract_id' })
  contract?: Contract | null;

  @Column({ name: 'escrow_transaction_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  escrowTransactionId?: string | null;

  @ManyToOne(() => EscrowTransaction, { nullable: true })
  @JoinColumn({ name: 'escrow_transaction_id' })
  escrowTransaction?: EscrowTransaction | null;

  @Column({
    type: 'enum',
    enum: MineralPassportStatus,
    default: MineralPassportStatus.ACTIVE,
  })
  @IsEnum(MineralPassportStatus)
  status!: MineralPassportStatus;

  @Column({ name: 'qr_code_url', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  qrCodeUrl?: string | null;

  @Column({ type: 'jsonb', default: {} })
  snapshot!: Record<string, any>;

  @Column({ name: 'issued_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  issuedBy?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'issued_by' })
  issuer?: User | null;

  @Column({ name: 'issued_at', type: 'timestamp', nullable: true })
  issuedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
