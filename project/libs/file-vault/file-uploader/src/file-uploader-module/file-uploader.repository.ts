import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@project/data-access';
import { FileEntity } from './file-uploader.entity';
import { FileUploaderFactory } from './file-uploader.factory';
import { FileModel } from './file.model';

@Injectable()
export class FileUploaderRepository extends BaseMongoRepository<
  FileEntity,
  FileModel
> {
  constructor(
    entityFactory: FileUploaderFactory,
    @InjectModel(FileModel.name) fileModel: Model<FileModel>
  ) {
    super(entityFactory, fileModel);
  }


  public async findManyByFileIds(filesIds: string[]) {
    const files = await this.model.find({ _id: { $in: filesIds } }).exec();

    return files.map((document) => this.createEntityFromDocument(document));
  }
}
