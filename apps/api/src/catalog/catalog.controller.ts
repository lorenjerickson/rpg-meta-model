import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('professions')
  professions() {
    return this.catalog.professions();
  }

  @Get('professions/:id')
  profession(@Param('id') id: string) {
    const profession = this.catalog.profession(id);
    if (profession === undefined) {
      throw new NotFoundException(`No profession ${id}`);
    }
    return profession;
  }

  @Get('monsters')
  monsters() {
    return this.catalog.monsters();
  }

  @Get('monsters/:id')
  monster(@Param('id') id: string) {
    const monster = this.catalog.monster(id);
    if (monster === undefined) {
      throw new NotFoundException(`No monster ${id}`);
    }
    return monster;
  }
}
