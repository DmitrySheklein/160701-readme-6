import { Injectable } from '@nestjs/common';

import { AuthService } from './authentication-service.interface';
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginUserDto,
  RecoveryEmailDto,
} from '@project/dto';

import { BlogUserEntity } from '@project/blog-user';
import { NotifyService } from '@project/users-notify';

@Injectable()
export class AuthenticationNotifyService implements AuthService {
  constructor(
    private readonly proxy: AuthService,
    private readonly notifyService: NotifyService
  ) {}

  public async register(dto: CreateUserDto) {
    const newUser = await this.proxy.register(dto);
    const { email, firstname, id } = newUser;

    await this.notifyService.registerSubscriber({
      email,
      firstname,
      userId: String(id),
    });

    return newUser;
  }

  public async verifyUser(dto: LoginUserDto) {
    return this.proxy.verifyUser(dto);
  }

  public async getUserById(id: string) {
    return this.proxy.getUserById(id);
  }

  public async getUsersByIds(ids: string[]) {
    return this.proxy.getUsersByIds(ids);
  }

  public async getUserByEmail(id: string) {
    return this.proxy.getUserByEmail(id);
  }

  public async createUserToken(user: BlogUserEntity) {
    return this.proxy.createUserToken(user);
  }

  public async changePassword(id: string, dto: ChangePasswordDto) {
    const userEntity = await this.proxy.changePassword(id, dto);
    const { email, firstname, id: userId } = userEntity.toPOJO();

    await this.notifyService.changePassword({
      email,
      firstname,
      userId: String(userId),
    });

    return userEntity;
  }

  public async recoveryEmail(dto: RecoveryEmailDto) {
    const { email } = dto;
    const recoveryToken = await this.proxy.recoveryEmail(dto);

    await this.notifyService.recoveryEmail({
      email,
      recoveryToken,
    });

    return recoveryToken;
  }

  public async deleteUserById({
    userId,
    deleteUserId,
  }: {
    userId: string;
    deleteUserId: string;
  }) {
    return this.proxy.deleteUserById({ userId, deleteUserId });
  }
}
