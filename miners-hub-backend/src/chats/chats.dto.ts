import { IsNotEmpty, IsUUID, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsUUID()
  receiverId!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  message!: string;
}
