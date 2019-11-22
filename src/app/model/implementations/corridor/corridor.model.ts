import {IRoom} from '../../interfaces/room/room.interface';
import {Vector3f} from '../../interfaces/general/vector-3f.model';
// TODO: own wall model for corridors
import {Wall} from '../room/wall.model';
import {Room} from '../room/room.model';
import {Exhibit} from '../exhibit.model';
import {Exhibition} from '../exhibition.model';
import {Directions} from '../../interfaces/corridors/direction.model';
import {ICorridor} from '../../interfaces/corridors/corridor.interface';


export class Corridor implements ICorridor {

  /** List of @type {Exhibit}s placed directly in this @type {Room}. */
  public exhibits: Exhibit[] = [];

  /** List of @type {Wall}s that make up this @type {Room}. */
  public walls: Wall[] = [];

  /** Reference to the {Exhibition} this {Room} belongs to. */
  public _belongsTo: (Exhibition | null);

  /**stores the rooms which are conected by this corridor*/
  public connects: Room[] = [];

  /**
   * Default constructor for @type {Room}.
   *
   * @param text
   // tslint:disable-next-line:no-redundant-jsdoc
   * @param ambient
   // tslint:disable-next-line:no-redundant-jsdoc
   * @param ceiling
   // tslint:disable-next-line:no-redundant-jsdoc
   * @param floor
   // tslint:disable-next-line:no-redundant-jsdoc
   * @param position
   // tslint:disable-next-line:no-redundant-jsdoc
   * @param entrypoint
   // tslint:disable-next-line:no-redundant-jsdoc
   * @param size
   // tslint:disable-next-line:no-redundant-jsdoc
   */
  constructor(public text: string, public ambient: string, public ceiling: string, public floor: string,
              public position: Vector3f, public entrypoint: Vector3f, public size: Vector3f) {}

  /**
   * Creates and returns an empty {Corridor}
   */
  public static empty(): Corridor {
    const corridor = new Corridor(
      'Empty corridor', null, 'NWood', 'NWood',
      <Vector3f>{x: 0.0, y: 0.0, z: 0.0}, <Vector3f>{x: 1.0, y: 0.0, z: 1.0}, <Vector3f>{x: 5.0, y: 5.0, z: 5.0}
    );
    for (const d of Directions) {
      const w = new Wall(d, <Vector3f>{x: 0.0, y: 0.0, z: 0.0}, 'NBricks');
      corridor.walls.push(w);
      w._belongsTo = corridor;
    }
    return corridor;
  }


  /**
   * Adds an {Exhibit} to this {Room}
   *
   * @param e The {Exhibit} to add.
   * @return True on success, false otherwise.
   */
  public addExhibit(e: Exhibit) {
    if (e.type === 'MODEL') {
      this.exhibits.push(e);
      e._belongsTo = this;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Removes an {Exhibit} from this {Room}
   *
   * @param e The {Exhibit} to remove OR its index.
   * @return True on success, false otherwise.
   */
  public removeExhibit(e: (Exhibit | number)) {
    if (e instanceof Exhibit && e._belongsTo === this) {
      const idx = this.exhibits.indexOf(e);
      if (idx > -1 && idx < this.exhibits.length) {
        e._belongsTo = null;
        this.exhibits.splice(idx, 1);
      }
    } else if (typeof e === 'number') {
      if (e > -1 && e < this.exhibits.length) {
        this.exhibits[e]._belongsTo = null;
        this.exhibits.splice(e, 1);
      }
    }
  }


}
