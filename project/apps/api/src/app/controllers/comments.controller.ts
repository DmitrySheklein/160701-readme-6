import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthKeyName } from '@project/shared/helpers';
import { CreateCommentDto, CreateCommentWithUserDto } from '@project/dto';
import { CommentRdo } from '@project/rdo';
import { AxiosExceptionFilter } from '../filters/axios-exception.filter';
import { InjectUserIdInterceptor } from '@project/interceptors';
import { CheckAuthGuard } from '../guards/check-auth.guard';
import { ApiService } from '../service/api.service';
import { RequestWithUserId } from '@project/shared/core';

@ApiTags('comments')
@UseFilters(AxiosExceptionFilter)
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly apiService: ApiService) {}

  @ApiResponse({
    type: CommentRdo,
    status: HttpStatus.CREATED,
    description: 'Comment create successfully',
  })
  @ApiOperation({
    summary: 'Создать комментарий',
    description: 'Create comment',
  })
  @UseGuards(CheckAuthGuard)
  @UseInterceptors(InjectUserIdInterceptor)
  @ApiBearerAuth(AuthKeyName)
  @Post()
  public async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUserId
  ) {
    const {
      body: { userId },
    } = req;
    const comment = await this.apiService.blog<
      CreateCommentWithUserDto,
      CommentRdo
    >({
      method: 'post',
      endpoint: `${postId}/comments`,
      data: { userId, message: createCommentDto.message },
    });

    return comment;
  }

  @ApiOperation({
    summary: 'Удалить комментарий',
    description: 'Remove comment',
  })
  @UseGuards(CheckAuthGuard)
  @UseInterceptors(InjectUserIdInterceptor)
  @ApiBearerAuth(AuthKeyName)
  @Delete(':commentId')
  public async remove(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Req() req: RequestWithUserId
  ) {
    const {
      body: { userId },
    } = req;

    return this.apiService.blog<CreateCommentWithUserDto, CommentRdo>({
      method: 'delete',
      endpoint: `${postId}/comments/${commentId}/${userId}`,
    });
  }
}
