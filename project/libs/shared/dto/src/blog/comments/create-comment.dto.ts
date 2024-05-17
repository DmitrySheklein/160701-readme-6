import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '@project/shared/core';
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { CommentValidator } from '@project/validation';

export class CreateCommentDto
  implements Omit<Comment, 'createdAt' | 'updatedAt' | 'postId' | 'userId'>
{
  @ApiProperty({
    description: 'Comment message',
    example: 'Lorem ipsum',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(CommentValidator.message.Min)
  @MaxLength(CommentValidator.message.Max)
  public message!: string;
}
