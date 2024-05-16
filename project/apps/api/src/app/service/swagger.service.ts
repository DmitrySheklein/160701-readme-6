import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export class SwaggerService {
  static createConfig() {
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
      .build();
    const swaggerCustomOptions: SwaggerCustomOptions = {};

    return { config, swaggerCustomOptions };
  }
}

export const AuthKeyName = 'access-token';
