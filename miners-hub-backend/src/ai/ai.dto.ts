import { IsNotEmpty, IsString, IsArray, IsOptional, IsIn } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  @IsArray()
  history?: { role: 'user' | 'model'; content: string }[];
}
