import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsArray, IsString, IsOptional } from 'class-validator';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity('investors')
@Index(['userId'])
export class Investor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', unique: true })
  @IsNotEmpty()
  userId!: string;

  @OneToOne(() => User, (user) => user.investor)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'company_name' })
  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @Column({ name: 'investment_focus', type: 'text', array: true, default: [] })
  @IsArray()
  @IsString({ each: true })
  investmentFocus!: string[];

  @Column({ name: 'company_reg_number', nullable: true })
  @IsOptional()
  @IsString()
  companyRegNumber?: string;

  @Column({ name: 'business_address', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @Column({ name: 'business_website', nullable: true })
  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Column({ name: 'years_in_operation', nullable: true })
  @IsOptional()
  @IsString()
  yearsInOperation?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => Order, (order) => order.buyer)
  orders!: Order[];
}
