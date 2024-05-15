import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AxiosExceptionFilter } from '../filters/axios-exception.filter';
import { CheckAuthGuard } from '../guards/check-auth.guard';
import { InjectUserIdInterceptor } from '@project/interceptors';
import { AuthKeyName, fillDto } from '@project/shared/helpers';
import { PostQuery, RequestWithUserId } from '@project/shared/core';
import {
  PostRdo,
  PostWithAuthorFullRdo,
  PostWithPaginationRdo,
  UploadedFileRdo,
  UserRdo,
} from '@project/rdo';
import { CreatePostDto, CreatePostWithAuthorDto } from '@project/dto';
import { ApiService } from '../service/api.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
@UseFilters(AxiosExceptionFilter)
export class BlogController {
  constructor(private readonly apiService: ApiService) {}

  @ApiBearerAuth(AuthKeyName)
  @ApiResponse({
    type: PostWithAuthorFullRdo,
    status: HttpStatus.CREATED,
    description: 'The new post has been successfully created.',
  })
  @ApiOperation({
    summary: 'Создать пост',
  })
  @UseGuards(CheckAuthGuard)
  @UseInterceptors(InjectUserIdInterceptor)
  @Post('/')
  public async create(
    @Body() dto: CreatePostDto,
    @Req() req: RequestWithUserId
  ) {
    const {
      body: { userId },
    } = req;
    const post = await this.apiService.blog<CreatePostWithAuthorDto, PostRdo>({
      method: 'post',
      endpoint: '',
      data: { ...dto, authorId: userId },
    });

    const user = await this.apiService.users<unknown, UserRdo>({
      method: 'get',
      endpoint: 'info',
      options: this.apiService.getAuthorizationHeader(req),
    });

    if (user.avatar) {
      const file = await this.apiService.fileVault<string, UploadedFileRdo>({
        method: 'get',
        endpoint: user.avatar,
      });

      user.avatar = file.path;
    }

    return fillDto(PostWithAuthorFullRdo, { ...post, author: user });
  }

  @ApiOperation({
    summary: 'Получить все посты',
  })
  @ApiResponse({
    isArray: true,
    type: PostRdo,
    status: HttpStatus.OK,
  })
  @Get('/')
  public async index(@Query() query: PostQuery) {
    const posts = await this.apiService.blog({
      method: 'get',
      endpoint: '',
      options: { params: query },
    });

    return fillDto(PostWithPaginationRdo<PostWithAuthorFullRdo>, posts);
  }
}
