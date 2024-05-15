import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentEntity } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from '@project/dto';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentRepository) {}

  public async create(postId: string, dto: CreateCommentDto) {
    const commentEntity = new CommentEntity({ ...dto, postId });

    return this.commentsRepository.save(commentEntity);
  }

  public async findByPostId(postId: string) {
    return this.commentsRepository.find({ postId });
  }

  public async findAll() {
    return this.commentsRepository.find();
  }

  public async findOne(id: string) {
    const existComment = await this.commentsRepository.findById(id);

    return existComment;
  }

  public async update(id: string, updateCommentDto: UpdateCommentDto) {
    const existComment = await this.commentsRepository.findById(id);

    const newCommentEntity = new CommentEntity({
      ...existComment.toPOJO(),
      message: updateCommentDto.message,
    });
    const newComment = await this.commentsRepository.update(newCommentEntity);

    return newComment;
  }

  public async remove(id: string) {
    return this.commentsRepository.deleteById(id);
  }
}
