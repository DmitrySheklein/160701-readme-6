import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AuthKeyName,
  fillDto,
  generateSchemeApiError,
} from '@project/shared/helpers';

import { AuthService } from './services/authentication-service.interface';
import {
  ApiBearerAuth,
  ApiTags,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthenticationResponseMessage } from './authentication.constant';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
  RecoveryEmailDto,
} from '@project/dto';
import {
  UserRdo,
  ChangePasswordRdo,
  RecoveryEmailRdo,
  RefreshUserRdo,
  LoggedUserRdo,
} from '@project/rdo';
import { PasswordTokenService } from '../password-token-module/password-token.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RequestWithUser } from './request-with-user.interface';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { RequestWithTokenPayload } from './request-with-token-payload.interface';
import { MongoIdValidationPipe } from '@project/pipes';
import { Roles } from '../decorators/role.decorator';
import { UserRole } from '@project/shared/core';
import { RolesGuard } from '../guards/role.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
  constructor(
    @Inject('AuthService')
    private readonly authService: AuthService,
    private readonly passwordTokenService: PasswordTokenService
  ) {}

  @ApiCreatedResponse({
    type: UserRdo,
    description: AuthenticationResponseMessage.UserCreated,
  })
  @ApiConflictResponse({
    description: AuthenticationResponseMessage.UserExist,
    schema: generateSchemeApiError(
      AuthenticationResponseMessage.UserExist,
      HttpStatus.CONFLICT
    ),
  })
  @ApiBadRequestResponse({
    description: 'Bad request data',
    schema: generateSchemeApiError('Bad request data', HttpStatus.BAD_REQUEST),
  })
  @ApiOperation({
    summary: 'Регистрация',
  })
  @Post('register')
  public async create(@Body() dto: CreateUserDto) {
    const newUser = await this.authService.register(dto);

    return fillDto(UserRdo, newUser.toPOJO());
  }

  @ApiOkResponse({
    type: LoggedUserRdo,
    description: AuthenticationResponseMessage.LoggedSuccess,
  })
  @ApiUnauthorizedResponse({
    description: AuthenticationResponseMessage.LoggedError,
    schema: generateSchemeApiError(
      AuthenticationResponseMessage.LoggedError,
      HttpStatus.UNAUTHORIZED
    ),
  })
  @ApiOperation({
    summary: 'Авторизация',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  public async login(
    @Req() { user }: RequestWithUser,
    @Body() _: LoginUserDto
  ) {
    const userToken = await this.authService.createUserToken(user);

    return fillDto(LoggedUserRdo, { ...user.toPOJO(), ...userToken });
  }

  @ApiOperation({
    summary: 'Получить пользователя по id',
  })
  @ApiOkResponse({
    type: UserRdo,
    description: AuthenticationResponseMessage.UserFound,
  })
  @ApiNotFoundResponse({
    description: AuthenticationResponseMessage.UserNotFound,
  })
  @ApiBearerAuth(AuthKeyName)
  @UseGuards(JwtAuthGuard)
  @Get('info')
  public async show(@Req() { user }: RequestWithTokenPayload) {
    const existUser = await this.authService.getUserByEmail(
      String(user?.email)
    );

    return fillDto(UserRdo, existUser.toPOJO());
  }

  @ApiOkResponse({
    type: ChangePasswordRdo,
    description: AuthenticationResponseMessage.PasswordChangeSuccess,
  })
  @ApiNotFoundResponse({
    description: AuthenticationResponseMessage.UserNotFound,
    schema: generateSchemeApiError(
      AuthenticationResponseMessage.UserNotFound,
      HttpStatus.NOT_FOUND
    ),
  })
  @ApiBadRequestResponse({
    schema: generateSchemeApiError('Bad request data', HttpStatus.BAD_REQUEST),
  })
  @ApiOperation({
    summary: 'Измененить пароля пользователя',
  })
  @ApiBearerAuth(AuthKeyName)
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  public async changePassword(
    @Req() { user }: RequestWithTokenPayload,
    @Body() dto: ChangePasswordDto
  ) {
    await this.authService.changePassword(String(user?.sub), dto);

    return fillDto(ChangePasswordRdo, {
      message: AuthenticationResponseMessage.PasswordChangeSuccess,
    });
  }

  @ApiCreatedResponse({
    type: RecoveryEmailRdo,
    description: AuthenticationResponseMessage.RecoveryEmailSuccess,
  })
  @ApiOperation({
    summary: 'Восстановление пароля (письмо)',
  })
  @Post('recovery-email')
  public async recoveryPassword(@Body() dto: RecoveryEmailDto) {
    const { email } = dto;
    const recoveryToken = await this.authService.recoveryEmail(dto);

    await this.passwordTokenService.deletePasswordTokensByEmail(email);
    await this.passwordTokenService.createPasswordSession({
      tokenId: recoveryToken,
      userEmail: email,
    });

    return fillDto(RecoveryEmailRdo, {
      message: AuthenticationResponseMessage.RecoveryEmailSuccess,
    });
  }

  @ApiBearerAuth(AuthKeyName)
  @ApiOkResponse({
    type: RefreshUserRdo,
    description: AuthenticationResponseMessage.NewJWTTokensSuccess,
  })
  @ApiOperation({
    summary: 'Новая пара Access/Refresh токен',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  public async refreshToken(@Req() { user }: RequestWithUser) {
    return this.authService.createUserToken(user);
  }

  @ApiBearerAuth(AuthKeyName)
  @ApiOperation({
    summary: 'Проверка авторизации пользователя',
  })
  @UseGuards(JwtAuthGuard)
  @Post('check')
  public async checkToken(@Req() { user: payload }: RequestWithTokenPayload) {
    return payload;
  }

  @ApiOkResponse({
    isArray: true,
    type: UserRdo,
    description: AuthenticationResponseMessage.UserFound,
  })
  @ApiOperation({
    summary: 'Получения списка юзеров по id',
  })
  @Get('users')
  public async findUsers(
    @Query('usersIds', ParseArrayPipe, MongoIdValidationPipe) usersIds: string[]
  ) {
    const existUsers = await this.authService.getUsersByIds(usersIds);

    return fillDto(
      UserRdo,
      existUsers.map((el) => el.toPOJO())
    );
  }

  @ApiOperation({
    summary: 'Удаление пользователя по id',
  })
  @ApiBearerAuth(AuthKeyName)
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':deleteUserId')
  public async deleteUser(
    @Param('deleteUserId', MongoIdValidationPipe) deleteUserId: string,
    @Req() { user }: RequestWithTokenPayload
  ) {
    return this.authService.deleteUserById({
      userId: String(user?.sub),
      deleteUserId,
    });
  }
}
