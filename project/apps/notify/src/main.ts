/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { DocumentBuilder } from '@nestjs/swagger';
import { attachSwagger } from '@project/shared/helpers';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  attachSwagger({
    app,
    DocumentBuilder: new DocumentBuilder()
      .setTitle('The «Notify» service')
      .setDescription('Notify service API')
      .setVersion('1.0'),

    swaggerCustomOptions: {
      customSiteTitle: '[Notify] Swagger UI',
    },
  });
  
  const configService = app.get(ConfigService);
  const port = configService.get('application.port');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
