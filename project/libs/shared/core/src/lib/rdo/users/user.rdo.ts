import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { User } from '../../interfaces/users/user.interface';

export class UserRdo implements Omit<User, 'role'> {
  @Expose()
  @ApiProperty({
    description: 'The uniq user ID',
    example: 'df191215-1f3c-407d-96b2-390bdfae1961',
  })
  public id!: string;

  @Expose()
  @ApiProperty({
    description: 'User avatar path',
    example: '/images/user.png',
  })
  @Transform(({ value }) => (value === undefined ? null : value))
  public avatar!: string | null;

  @Expose()
  @ApiProperty({
    description: 'User email',
    example: 'user@user.local',
  })
  public email!: string;

  @Expose()
  @ApiProperty({
    description: 'User first name',
    example: 'Keks',
  })
  public firstname!: string;

  @Expose()
  @ApiProperty({
    type: Date,
    description: 'User create date',
    example: '2024-01-09T14:55:34.697Z',
  })
  public createdAt!: Date;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'User publications count',
    example: '10',
  })
  public publicationsCount!: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'User subscribers count',
    example: '10',
  })
  public subscribersCount!: number;
}