import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { BlogTagEntity } from './tag.entity';
import { BlogTagRepository } from './tag.repository';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class BlogTagService {
  constructor(private readonly blogTagRepository: BlogTagRepository) {}

  public async getTag(id: string): Promise<BlogTagEntity> {
    return this.blogTagRepository.findById(id);
  }

  public async getAllTags(): Promise<BlogTagEntity[]> {
    return await this.blogTagRepository.find();
  }

  public async createTag(dto: CreateTagDto): Promise<BlogTagEntity> {
    const existsCategory = (
      await this.blogTagRepository.find({ name: dto.name })
    ).at(0);
    if (existsCategory) {
      throw new ConflictException('A tag with the name already exists');
    }

    const newTag = new BlogTagEntity(dto);
    await this.blogTagRepository.save(newTag);

    return newTag;
  }

  public async deleteTag(id: string): Promise<void> {
    try {
      await this.blogTagRepository.deleteById(id);
    } catch {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  public async updateTag(
    id: string,
    dto: UpdateTagDto
  ): Promise<BlogTagEntity> {
    const blogTagEntity = await this.getTag(id);
    const newBloTagEntity = Object.assign(blogTagEntity, { ...dto });

    try {
      await this.blogTagRepository.update(newBloTagEntity);
      return blogTagEntity;
    } catch {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  public async getTagsByIds(tagIds: string[]): Promise<BlogTagEntity[]> {
    const tags = await this.blogTagRepository.findByIds(tagIds);

    if (tags.length !== tagIds.length) {
      const foundTagIds = tags.map((tag) => tag.id);
      const notFoundTagIds = tagIds.filter(
        (tagId) => !foundTagIds.includes(tagId)
      );

      if (notFoundTagIds.length > 0) {
        throw new NotFoundException(
          `Tag with ids ${notFoundTagIds.join(', ')} not found.`
        );
      }
    }

    return tags;
  }
}
