import 'multer';
import { Express } from 'express';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaderService } from './file-uploader.service';
import { MongoIdValidationPipe } from '@project/pipes';
import { fillDto, generateSchemeApiError } from '@project/shared/helpers';

import {
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileValidationPipe } from '@project/pipes';
import {
  ALLOWED_IMG_MIMETYPES,
  User,
  PostContentValidator,
} from '@project/validation';
import { UploadedFileRdo } from '@project/rdo';

@ApiTags('files')
@Controller('files')
export class FileUploaderController {
  constructor(private readonly fileUploaderService: FileUploaderService) {}

  @ApiResponse({
    type: UploadedFileRdo,
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully',
  })
  @ApiOperation({ summary: 'Загрузить файл аватара' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          maxLength: User.avatar.FileMaxSize,
          description: 'PNG or JPG file',
          enum: ['image/png', 'image/jpeg'],
        },
      },
    },
  })
  @Post('/upload/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  public async uploadAvatarFile(
    @UploadedFile(
      new FileValidationPipe(User.avatar.FileMaxSize, ALLOWED_IMG_MIMETYPES)
    )
    file: Express.Multer.File
  ) {
    const existFile = await this.fileUploaderService.saveFile(file);

    return fillDto(UploadedFileRdo, existFile.toPOJO());
  }

  @ApiOperation({ summary: 'Загрузить файл изображения поста' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          maxLength: PostContentValidator.photo.file.FileMaxSize,
          description: 'PNG or JPG file',
          enum: ['image/png', 'image/jpeg'],
        },
      },
    },
  })
  @Post('/upload/post/photo')
  @UseInterceptors(FileInterceptor('photo'))
  public async uploadPostPhotoFile(
    @UploadedFile(
      new FileValidationPipe(
        PostContentValidator.photo.file.FileMaxSize,
        ALLOWED_IMG_MIMETYPES
      )
    )
    file: Express.Multer.File
  ) {
    const existFile = await this.fileUploaderService.saveFile(file);

    return fillDto(UploadedFileRdo, existFile.toPOJO());
  }

  @ApiOkResponse({
    isArray: true,
    type: UploadedFileRdo,
    description: 'File founded successfully',
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    schema: generateSchemeApiError('File not found', HttpStatus.NOT_FOUND),
  })
  @ApiOperation({ summary: 'Получить файлы по ID' })
  @Get('all')
  public async showAll(
    @Query('filesIds', ParseArrayPipe, MongoIdValidationPipe) filesIds: string[]
  ) {
    const existFiles = await this.fileUploaderService.getFilesByIds(filesIds);

    return fillDto(
      UploadedFileRdo,
      existFiles.map((el) => el.toPOJO())
    );
  }

  @ApiResponse({
    type: UploadedFileRdo,
    status: HttpStatus.OK,
    description: 'File founded successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
    schema: generateSchemeApiError('File not found', HttpStatus.NOT_FOUND),
  })
  @ApiOperation({ summary: 'Получить файл по ID' })
  @Get(':fileId')
  public async show(@Param('fileId', MongoIdValidationPipe) fileId: string) {
    const existFile = await this.fileUploaderService.getFile(fileId);

    return fillDto(UploadedFileRdo, existFile.toPOJO());
  }
}
