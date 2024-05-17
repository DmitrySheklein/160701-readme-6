import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { appConfig } from '@project/config';

@Injectable()
export class SwaggerService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>
  ) {
    this.config.port;
  }

  createConfig() {
    const config = new DocumentBuilder()
      .setTitle('The «API Gateway» service')
      .setDescription('«API Gateway» service API')
      .setVersion('1.0')
      .addTag('auth', 'Авторизация и Регистрация')
      .addTag('posts', 'Публикации')
      .addTag('likes', 'Лайки')
      .addTag('comments', 'Комментарии')
      .addTag('tags', 'Теги')
      .addBearerAuth(
        {
          name: 'Authorization',
          bearerFormat: 'Bearer',
          scheme: 'Bearer',
          type: 'http',
          in: 'Header',
        },
        AuthKeyName
      )
      .addBasicAuth({ type: 'http' })
      .build();

    const swaggerCustomOptions: SwaggerCustomOptions = {
      customSiteTitle: '[API Gateway] Swagger UI',
    };

    return { config, swaggerCustomOptions };
  }
}

export const AuthKeyName = 'access-token';
