import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  AllPostContentArray,
  PostContent,
  RefPostContentArray,
  PostTypeContent,
  PostType,
} from '@project/shared/core';
import { Post } from '@project/validation';
import { Type } from 'class-transformer';

import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

@ApiExtraModels(...AllPostContentArray)
export class CreatePostDto {
  @ApiProperty({
    enum: PostType,
    description: 'Post type',
    example: PostType.Video,
  })
  @IsEnum(PostType)
  public type!: PostType;

  @ApiProperty({
    description: 'Post hash tags',
    example: ['hash'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(Post.tags.MaxSize)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MinLength(Post.tags.MinLength, { each: true })
  @MaxLength(Post.tags.MaxLength, { each: true })
  @Matches(Post.tags.Matches, {
    each: true,
    message:
      'tag must start with a letter and can only contain letters, numbers, underscores and pound.',
  })
  public tags!: string[];

  @ApiProperty({
    description: 'Post content by type',
    oneOf: RefPostContentArray,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type((opts) => {
    const type: PostType = opts?.object.type;

    return PostTypeContent[type];
  })
  public content!: PostContent;
}
