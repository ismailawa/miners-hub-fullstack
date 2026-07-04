import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  @IsArray()
  history?: { role: 'user' | 'model'; content: string }[];
}

export class ForecastDto {
  @IsNotEmpty()
  @IsString()
  mineral!: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  historicalPrices!: number[];
}
