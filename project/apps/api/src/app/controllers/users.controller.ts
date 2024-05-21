import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AxiosExceptionFilter } from '../filters/axios-exception.filter';
import {
  UploadedFileRdo,
  LoggedUserRdo,
  RefreshUserRdo,
  ChangePasswordRdo,
  UserRdo,
  RecoveryEmailRdo,
  UserFullRdo,
} from '@project/rdo';

import { AuthKeyName, fillDto } from '@project/shared/helpers';
import { ApiService } from '../service/api.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CheckAuthGuard } from '../guards/check-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import FormData from 'form-data';
import { FileValidationPipe } from '@project/pipes';
import { InjectUserIdInterceptor } from '@project/interceptors';
import {
  ChangePasswordDto,
  LoginUserDto,
  CreateUserDtoWithAvatarFile,
  RecoveryEmailDto,
  CreateUserDto,
} from '@project/dto';
import { ALLOWED_IMG_MIMETYPES, User } from '@project/validation';

@ApiTags('auth')
@Controller('auth')
@UseFilters(AxiosExceptionFilter)
export class UsersController {
  constructor(private readonly apiService: ApiService) {}

  @ApiResponse({
    type: UserFullRdo,
    status: HttpStatus.CREATED,
    description: 'The new user has been successfully created.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateUserDtoWithAvatarFile,
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Регистрация',
  })
  @Post('register')
  public async register(
    @Body() dto: CreateUserDtoWithAvatarFile,
    @UploadedFile(
      new FileValidationPipe(
        User.avatar.FileMaxSize,
        ALLOWED_IMG_MIMETYPES,
        true
      )
    )
    file: Express.Multer.File
  ) {
    let uploadedFile;

    if (file) {
      const form = new FormData();

      form.append('avatar', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      uploadedFile = await this.apiService.fileVault<FormData, UploadedFileRdo>(
        {
          method: 'post',
          endpoint: 'upload/avatar',
          data: form,
        }
      );
    }

    const user = await this.apiService.users<CreateUserDto, UserRdo>({
      method: 'post',
      endpoint: 'register',
      data: { ...dto, avatarId: uploadedFile?.id },
    });

    return fillDto(UserFullRdo, { ...user, avatar: uploadedFile?.path });
  }

  @ApiResponse({
    type: LoggedUserRdo,
    status: HttpStatus.OK,
    description: 'User has been successfully logged.',
  })
  @ApiOperation({
    summary: 'Авторизация',
  })
  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto) {
    const data = await this.apiService.users<LoginUserDto, UserRdo>({
      method: 'post',
      endpoint: 'login',
      data: loginUserDto,
    });

    return data;
  }

  @ApiResponse({
    type: RefreshUserRdo,
    status: HttpStatus.OK,
    description: 'Get a new access/refresh tokens',
  })
  @ApiBearerAuth(AuthKeyName)
  @UseGuards(CheckAuthGuard)
  @UseInterceptors(InjectUserIdInterceptor)
  @ApiOperation({
    summary: 'Новая пара Access/Refresh токен',
  })
  @Post('refresh')
  public async refreshToken(@Req() req: Request) {
    const data = await this.apiService.users<unknown, UserRdo>({
      method: 'post',
      endpoint: 'refresh',
      options: this.apiService.getAuthorizationHeader(req),
    });

    return data;
  }

  @ApiResponse({
    type: UserFullRdo,
    status: HttpStatus.OK,
    description: 'User found',
  })
  @ApiBearerAuth(AuthKeyName)
  @UseGuards(CheckAuthGuard)
  @ApiOperation({
    summary: 'Получить пользователя по id',
  })
  @Get('info')
  public async info(@Req() req: Request) {
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

    return user;
  }

  @ApiResponse({
    type: ChangePasswordRdo,
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  @ApiBearerAuth(AuthKeyName)
  @UseGuards(CheckAuthGuard)
  @UseInterceptors(InjectUserIdInterceptor)
  @ApiOperation({
    summary: 'Измененить пароля пользователя',
  })
  @Patch('change-password')
  public async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto
  ) {
    const data = await this.apiService.users<ChangePasswordDto, UserRdo>({
      method: 'patch',
      endpoint: 'change-password',
      data: dto,
      options: this.apiService.getAuthorizationHeader(req),
    });

    return data;
  }

  @ApiCreatedResponse({
    type: RecoveryEmailRdo,
  })
  @ApiOperation({
    summary: 'Восстановление пароля (письмо)',
  })
  @Post('recovery-email')
  public async recoveryPassword(@Body() dto: RecoveryEmailDto) {
    const data = await this.apiService.users<
      RecoveryEmailDto,
      RecoveryEmailRdo
    >({
      method: 'post',
      endpoint: 'recovery-email',
      data: dto,
    });

    return data;
  }
}
