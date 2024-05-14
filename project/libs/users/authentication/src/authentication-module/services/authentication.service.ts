import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BlogUserEntity, BlogUserRepository } from '@project/blog-user';
import { CreateUserDto } from '../../dto/create-user.dto';
import {
  AuthUser,
  ChangePasswordDto,
  Token,
  TokenPayload,
  User,
  UserRole,
} from '@project/shared/core';
import {
  AUTH_USER_EXISTS,
  AUTH_USER_NOT_FOUND_OR_PASSWORD_WRONG,
  OLD_PASSWORD_NOT_CORRECT,
} from '../authentication.constant';

import { LoginUserDto } from '../../dto/login-user.dto';
import { AuthService } from './authentication-service.interface';
import { Hasher } from '../../hasher-module/hasher.interface';
import { HasherComponent } from '../../hasher-module/hasher.enum';
import { JwtService } from '@nestjs/jwt';
import { JWT_ACCESS_KEY, JWT_REFRESH_KEY } from '@project/config';
import { RecoveryEmailDto } from '../../dto/recovery-email.dto';
import { randomUUID } from 'node:crypto';
import { RefreshTokenService } from '../../refresh-token-module/refresh-token.service';

@Injectable()
export class AuthenticationService implements AuthService {
  constructor(
    private readonly blogUserRepository: BlogUserRepository,
    @Inject(JWT_ACCESS_KEY)
    private readonly jwtAccessService: JwtService,
    @Inject(JWT_REFRESH_KEY)
    private readonly jwtRefreshService: JwtService,
    @Inject(HasherComponent.Service)
    private readonly hasherService: Hasher,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  public async register(dto: CreateUserDto): Promise<BlogUserEntity> {
    const { email, firstname, password, avatarId } = dto;
    const existUser = await this.blogUserRepository.findByEmail(email);

    if (existUser) {
      throw new ConflictException(`${AUTH_USER_EXISTS}: ${email}`);
    }

    const passwordHash = await this.hasherService.generatePasswordHash(
      password
    );

    const blogUser: AuthUser = {
      email,
      firstname,
      role: UserRole.User,
      avatar: avatarId,
      passwordHash,
    };

    const userEntity = new BlogUserEntity(blogUser);
    const newEntity = await this.blogUserRepository.save(userEntity);

    return newEntity;
  }

  public async verifyUser(dto: LoginUserDto) {
    const { email, password } = dto;
    const existUser = await this.blogUserRepository.findByEmail(email);

    if (!existUser) {
      throw new UnauthorizedException(AUTH_USER_NOT_FOUND_OR_PASSWORD_WRONG);
    }

    const isEqualPassword = await this.hasherService.comparePassword({
      password,
      passwordHash: existUser.passwordHash,
    });

    if (!isEqualPassword) {
      throw new UnauthorizedException(AUTH_USER_NOT_FOUND_OR_PASSWORD_WRONG);
    }

    return existUser;
  }

  public async getUserById(id: string) {
    const existUser = await this.blogUserRepository.findById(id);

    if (!existUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return existUser;
  }

  public async getUserByEmail(email: string) {
    const existUser = await this.blogUserRepository.findByEmail(email);

    if (!existUser) {
      throw new NotFoundException(`User with email: ${email} not found`);
    }

    return existUser;
  }

  public async createUserToken({
    id,
    email,
    role,
    firstname,
  }: User): Promise<Token> {
    const accessTokenPayload: TokenPayload = {
      sub: String(id),
      email,
      role,
      firstname,
    };
    const refreshTokenPayload = {
      ...accessTokenPayload,
      tokenId: crypto.randomUUID(),
    };

    await this.refreshTokenService.createRefreshSession(refreshTokenPayload);

    try {
      const accessToken = await this.jwtAccessService.signAsync(
        accessTokenPayload
      );
      const refreshToken = await this.jwtRefreshService.signAsync(
        refreshTokenPayload
      );

      return { accessToken, refreshToken };
    } catch (error: any) {
      throw new HttpException(
        `Ошибка при создании токена: ${error?.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async changePassword(id: string, dto: ChangePasswordDto) {
    const { oldPassword, newPassword } = dto;
    const existUser = await this.getUserById(id);

    if (!existUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const isOldPasswordCorrect = await this.hasherService.comparePassword({
      password: oldPassword,
      passwordHash: existUser.passwordHash,
    });

    if (!isOldPasswordCorrect) {
      throw new BadRequestException(OLD_PASSWORD_NOT_CORRECT);
    }

    const passwordHash = await this.hasherService.generatePasswordHash(
      newPassword
    );
    const newUser = existUser.setPasswordHash(passwordHash);

    await this.blogUserRepository.update(newUser);

    return newUser;
  }

  public async recoveryEmail(dto: RecoveryEmailDto) {
    const existUser = await this.blogUserRepository.findByEmail(dto.email);

    if (!existUser) {
      throw new NotFoundException(`User with email: ${dto.email} not found`);
    }

    return randomUUID();
  }
}
