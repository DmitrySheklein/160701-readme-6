/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { RequestIdInterceptor } from '@project/interceptors';
import { SwaggerService } from './app/service/swagger.service';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  const swaggerService = app.get(SwaggerService);
  const { config, swaggerCustomOptions } = swaggerService.createConfig();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPathPrefix = 'spec';
  SwaggerModule.setup(swaggerPathPrefix, app, document, swaggerCustomOptions);

  const configService = app.get(ConfigService);
  const port = configService.get('application.port');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`🚀 Swagger api: http://localhost:${port}/${swaggerPathPrefix}`);
}

bootstrap();
