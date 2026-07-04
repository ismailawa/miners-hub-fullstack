import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const forumCategories = [
  'general',
  'equipment',
  'investment',
  'policy',
] as const;

export class CreateForumPostDto {
  @IsString()
  @MinLength(4)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsOptional()
  @IsIn(forumCategories)
  category?: string;
}

export class CreateForumReplyDto {
  @IsString()
  @MinLength(2)
  content!: string;
}

export class ForumFilterDto {
  @IsOptional()
  @IsIn(['all', ...forumCategories])
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
