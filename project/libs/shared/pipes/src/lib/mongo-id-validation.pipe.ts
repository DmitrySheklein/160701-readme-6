import { Types } from 'mongoose';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const BAD_MONGO_ID_ERROR = 'Bad mongo entity ID';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform {
  public transform(value: string | string[], { type }: ArgumentMetadata) {
    if (type !== 'param' && type !== 'query') {
      throw new Error('This pipe must used only with params and query!');
    }
    const values = Array.isArray(value) ? value : [value];
    const isValid = values.every((el) => Types.ObjectId.isValid(el));

    if (!isValid) {
      throw new BadRequestException(BAD_MONGO_ID_ERROR);
    }

    return value;
  }
}
