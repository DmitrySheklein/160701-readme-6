import { BaseMongoRepository } from '@project/data-access';
import { Model } from 'mongoose';
import { BlogUserEntity } from './blog-user.entity';
import { BlogUserFactory } from './blog-user.factory';
import { Injectable } from '@nestjs/common';
import { BlogUserModel } from './blog-user.model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogUserRepository extends BaseMongoRepository<
  BlogUserEntity,
  BlogUserModel
> {
  constructor(
    entityFactory: BlogUserFactory,
    @InjectModel(BlogUserModel.name) blogUserModel: Model<BlogUserModel>
  ) {
    super(entityFactory, blogUserModel);
  }

  public async findByEmail(email: string): Promise<BlogUserEntity | null> {
    const document = await this.model.findOne({ email }).exec();

    if (!document) return null;

    return this.createEntityFromDocument(document);
  }

  public async findManyByUserIds(userIds: string[]) {
    const users = await this.model.find({ _id: { $in: userIds } }).exec();

    return users.map((document) => this.createEntityFromDocument(document));
  }
}
