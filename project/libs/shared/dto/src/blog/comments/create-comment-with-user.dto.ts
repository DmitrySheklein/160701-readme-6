import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';

export class CreateCommentWithUserDto extends CreateCommentDto {
  @ApiProperty({
    description: 'User id',
    example: '65b7a93fe29bcc5e9410a607',
  })
  @IsMongoId()
  public userId!: string;
}
