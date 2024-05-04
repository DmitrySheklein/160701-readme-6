/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { attachSwagger } from '@project/shared/helpers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  attachSwagger({
    app,
    DocumentBuilder: new DocumentBuilder()
      .setTitle('The «File-vault» service')
      .setDescription('«File-vault» service API')
      .setVersion('1.0'),
    swaggerCustomOptions: {
      customSiteTitle: '[File-vault] Swagger UI',
    },
  });
  const configService = app.get(ConfigService);
  const port = configService.get('application.port');
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
