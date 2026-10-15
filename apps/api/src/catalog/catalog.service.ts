import { Injectable } from '@nestjs/common';
import { MONSTERS, PROFESSIONS } from '@dnd-domain/system';

/** Reads the game system's catalogs. */
@Injectable()
export class CatalogService {
  professions() {
    return PROFESSIONS;
  }

  profession(id: string) {
    return PROFESSIONS.find((profession) => profession.id === id);
  }

  monsters() {
    return MONSTERS;
  }

  monster(id: string) {
    return MONSTERS.find((monster) => monster.id === id);
  }
}
