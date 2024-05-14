import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { AuthService } from './authentication-service.interface';
import { ChangePasswordDto, User } from '@project/shared/core';
import { RecoveryEmailDto } from '../../dto/recovery-email.dto';
import { BlogUserEntity } from '@project/blog-user';

@Injectable()
export class AuthenticationLoggerService implements AuthService {
  private readonly logger = new Logger(AuthenticationLoggerService.name);

  constructor(private readonly proxy: AuthService) {}

  public async register(dto: CreateUserDto) {
    try {
      const entity = await this.proxy.register(dto);
      this.logger.log(`Успешная регистрация: ${entity.email}`);

      return entity;
    } catch (e: any) {
      this.logger.error(`Ошибка регистрации: ${e?.message}`);
      throw e;
    }
  }

  public async verifyUser(dto: LoginUserDto) {
    return this.proxy.verifyUser(dto);
  }

  public async getUserById(id: string) {
    return this.proxy.getUserById(id);
  }

  public async getUserByEmail(id: string) {
    return this.proxy.getUserByEmail(id);
  }

  public async createUserToken(user: BlogUserEntity) {
    return this.proxy.createUserToken(user);
  }
  public async changePassword(id: string, dto: ChangePasswordDto) {
    return this.proxy.changePassword(id, dto);
  }
  public async recoveryEmail(dto: RecoveryEmailDto) {
    return this.proxy.recoveryEmail(dto);
  }
}
