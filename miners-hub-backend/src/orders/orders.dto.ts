import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  listingId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity!: number;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

export class OrdersQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['buyer', 'seller'])
  role: 'buyer' | 'seller' = 'buyer';

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
