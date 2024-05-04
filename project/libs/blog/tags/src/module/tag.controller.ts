import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { fillDto } from '@project/shared/helpers';
import { TagRdo } from './rdo/tag.rdo';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagService } from './tag.service';

@ApiTags('tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @ApiResponse({
    type: TagRdo,
    status: HttpStatus.OK,
    description: 'Tag found',
  })
  @Get('/:tagId')
  public async show(@Param('tagId') tagId: string) {
    const tagEntity = await this.tagService.getTag(tagId);

    return fillDto(TagRdo, tagEntity.toPOJO());
  }

  @ApiResponse({
    type: [TagRdo],
    status: HttpStatus.OK,
    description: 'Tags found',
  })
  @Get('/')
  public async index() {
    const blogTagEntities = await this.tagService.getAllTags();
    const tags = blogTagEntities.map((blogTag) => blogTag.toPOJO());

    return fillDto(TagRdo, tags);
  }

  @Post('/')
  public async create(@Body() dto: CreateTagDto) {
    const newTag = await this.tagService.createTag(dto);

    return fillDto(TagRdo, newTag.toPOJO());
  }

  @Delete('/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async destroy(@Param('tagId') tagId: string) {
    await this.tagService.deleteTag(tagId);
  }

  @Patch('/:tagId')
  public async update(
    @Param('tagId') tagId: string,
    @Body() dto: UpdateTagDto
  ) {
    const updatedTag = await this.tagService.updateTag(tagId, dto);

    return fillDto(TagRdo, updatedTag.toPOJO());
  }
}