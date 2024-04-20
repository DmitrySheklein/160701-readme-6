import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuthUser, UserRole } from '@project/shared/core';
// import { User } from '@project/validation';

@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class BlogUserModel extends Document implements AuthUser {
  @Prop({
    default: null,
  })
  public avatar!: string;

  @Prop({
    required: true,
    unique: true,
  })
  public email!: string;

  @Prop({
    required: true,
    // minlength: User.firstname.Min,
    // maxlength: User.firstname.Max,
  })
  public firstname!: string;

  @Prop({
    required: true,
  })
  public passwordHash!: string;

  @Prop({
    required: true,
    type: String,
    enum: UserRole,
    default: UserRole.User,
  })
  public role!: UserRole;

  @Prop({
    type: Number,
    default: 0,
  })
  subscribersCount!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  publicationsCount!: number;
}

export const BlogUserSchema = SchemaFactory.createForClass(BlogUserModel);
