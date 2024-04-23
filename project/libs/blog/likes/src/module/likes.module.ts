import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { LikesRepository } from './likes.repository';
import { PrismaClientModule } from '@project/blog-models';
import { LikeFactory } from './likes.factory';

@Module({
  imports: [PrismaClientModule],
  controllers: [LikesController],
  providers: [LikesService, LikesRepository, LikeFactory],
  exports: [LikesService],
})
export class LikesModule {}
