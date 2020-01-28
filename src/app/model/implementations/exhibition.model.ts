import {IExhibition} from '../interfaces/exhibition/exhibition.interface';
import {Room} from './polygonalRoom/room.model';
import {ObjectId} from '../interfaces/exhibition/objectid.interface';
import {Corridor} from './corridor/corridor.model';

/**
 *
 */
export class Exhibition implements IExhibition {

  /** List of @type {Rooms} for this @type {Exhibition}. */
  public rooms: Room[] = [];
  public corridors: Corridor[] = [];

  /**
   * Copies a @type {IExhibition} to a new @type {Exhibition} object.
   *
   * @param e IExhibition object
   * @param target The target for the Proxy object.
   */
  public static copyAsProxy(e: IExhibition, target: object): Exhibition {
    const n = new Proxy(new Exhibition(e.id, e.key, e.name, e.description), target);
    n.rooms = new Proxy([], target);
    n.corridors = new Proxy([], target);
    for (const r of e.rooms) {
      const rc = Room.copyAsProxy(r, target);
      rc._belongsTo = n;
      n.rooms.push(rc);
    }

    for (const c of e.corridors) {
      const rc = Corridor.copyAsProxy(c, target);
      rc._belongsTo = n;
      n.corridors.push(rc);
    }
    return n;
  }

  /**
   *
   * @param id
   * @param key
   * @param name
   * @param description
   */
  constructor(public id: ObjectId, public key: string, public name: string, public description: string) {
  }

  /**
   * Returns a short ID for this @type {Exhibition}
   */
  get shortId(): string {
    if (this.id != null) {
      return this.id.id.substr(0, 5);
    } else {
      return 'n/a';
    }
  }

  /**
   * Adds a copyAsProxy of the provided {Room} to this {Exhibition}
   *
   * @param r The {Room} to delete OR the index of the {Room} to delete.
   * @return true on success, false otherwise.
   */
  public addRoom(r: Room) {
    this.rooms.push(r);
    r._belongsTo = this;
  }

  public addCorridor(c: Corridor, /*rA: Room, rB: Room*/) {
    this.corridors.push(c);
    c._belongsTo = this;
  }

  /**
   * Delete the provided {Room} from this {Exhibition}
   *
   * @param r The {Room} to delete OR the index of the {Room} to delete.
   * @return true on success, false otherwise.
   */
  public deleteRoom(r: (Room | number)) {
    if (r instanceof Room) {
      r = this.rooms.indexOf(r);
    }
    if (r > -1 && r < this.rooms.length) {
      this.rooms.splice(r, 1);
      return true;
    } else {
      return false;
    }
  }

  public deleteCorridor(c: (Corridor | number)) {
    if (c instanceof Corridor) {
      c = this.corridors.indexOf(c);
    }
    if (c > -1 && c < this.corridors.length) {
      this.corridors.splice(c, 1);
      return true;
    } else {
      return false;
    }
  }
}
