import 'multer';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ensureDir } from 'fs-extra';
import { writeFile } from 'node:fs/promises';
import path, { join } from 'node:path';
import dayjs from 'dayjs';
import { randomUUID } from 'node:crypto';
import { extension } from 'mime-types';
import { FileUploaderRepository } from './file-uploader.repository';
import { FileEntity } from './file-uploader.entity';
import { FileVaultConfig } from '@project/config';
import { FileUploaderFactory } from './file-uploader.factory';
import { StoredFile } from '@project/shared/core';

@Injectable()
export class FileUploaderService {
  private readonly logger = new Logger(FileUploaderService.name);
  private readonly DATE_FORMAT = 'YYYY/MM/DD';

  constructor(
    @Inject(FileVaultConfig.KEY)
    private readonly config: ConfigType<typeof FileVaultConfig>,
    private readonly fileRepository: FileUploaderRepository,
    private readonly fileUploaderFactory: FileUploaderFactory
  ) {}

  private getUploadDirectoryPath(): string {
    return this.config.uploadDirectory;
  }

  private getDestinationFilePath(filename: string): string {
    return join(
      this.getUploadDirectoryPath(),
      this.getSubUploadDirectoryPath(),
      filename
    );
  }

  private getSubUploadDirectoryPath(): string {
    const path = dayjs().format(this.DATE_FORMAT).split('/');

    return join(...path);
  }

  public async saveFile(file: Express.Multer.File): Promise<FileEntity> {
    const storedFile = await this.writeFile(file);
    const { size, mimetype, originalname } = file;

    const fileEntity = this.fileUploaderFactory.create({
      hashName: storedFile.filename,
      path: storedFile.path,
      originalName: originalname,
      subDirectory: storedFile.subDirectory,
      size,
      mimetype,
    });

    return this.fileRepository.save(fileEntity);
  }

  public async getFile(fileId: string): Promise<FileEntity> {
    const existFile = await this.fileRepository.findById(fileId);

    if (!existFile) {
      throw new NotFoundException(`File with ${fileId} not found.`);
    }

    return existFile;
  }

  public async getFilesByIds(ids: string[]) {
    return this.fileRepository.findManyByFileIds(ids);
  }

  public async writeFile(file: Express.Multer.File): Promise<StoredFile> {
    try {
      const { port, serveRoot } = this.config;
      const uploadDirectoryPath = this.getUploadDirectoryPath();
      const subDirectory = this.getSubUploadDirectoryPath();
      const fileExtension = String(
        extension(file.mimetype) || file.originalname.split('.').pop()
      );
      const filename = `${randomUUID()}.${fileExtension}`;
      const destinationPath = this.getDestinationFilePath(filename);
      const relativePath = path.relative(uploadDirectoryPath, destinationPath);
      const fullPath = `http://localhost:${port}/${serveRoot}/${relativePath}`;

      await ensureDir(join(uploadDirectoryPath, subDirectory));
      await writeFile(destinationPath, file.buffer);

      return {
        fileExtension,
        filename,
        path: fullPath,
        subDirectory,
      };
    } catch (error: any) {
      this.logger.error(`Error while saving file: ${error.message}`);
      throw new Error(`Can't save file`);
    }
  }
}
