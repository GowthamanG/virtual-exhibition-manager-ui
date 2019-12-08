import {IWall} from '../../interfaces/polygonalRoom/wall.interface';
import {Vector3f} from '../../interfaces/general/vector-3f.model';
import {Exhibit} from '../exhibit.model';
import {Room} from './room.model';

export class Wall implements IWall {
    //wallNumber: number;
    //wallCoordinates: Vector3f[];
  /** List of @type {Exhibit}s placed on this @type {Wall}. */
  public exhibits: Exhibit[] = [];

  /** Reference to the {Room} this {Wall} belongs to. */
  public _belongsTo: (Room | null);

  public wallCoordinates: Vector3f[] = [];

  /**
   * Default constructor for @type {Wall}.
   * @param wallNumber
   * @param color
   * @param texture
   */
  constructor(public wallNumber: string, public color: Vector3f, public texture: string) {}

  /**
   * Copies a @type {IWall} to a new @type {Wall} object.
   *
   * @param w IWall object
   * @param target The target for the Proxy object.
   */
  public static copyAsProxy(w: IWall, target: object = {}): Wall {
    const n = new Proxy(new Wall(w.wallNumber, w.color, w.texture), target);
    n.exhibits = new Proxy([], target);
    n.wallCoordinates = new Proxy([], target);
    for (const e of w.exhibits) {
      const ec = Exhibit.copyAsProxy(e, target);
      ec._belongsTo = n;
      n.exhibits.push(ec);
    }
    for (const c of w.wallCoordinates) {
      let coordinate: Vector3f = {x: c.x, y: c.y, z: c.z};
      const wc = new Proxy(coordinate, target);
      n.wallCoordinates.push(wc);
    }
    return n;
  }

  /**
   * Creates and returns an empty {Room}
   */
  public static empty(wallNumber: number): Wall {
    const wall = new Wall(wallNumber.toString(), <Vector3f>{x: 0.0, y: 0.0, z: 0.0}, 'NBricks');
    return wall;
  }

  /**
   * Adds an {Exhibit} to this {Wall}
   *
   * @param e The {Exhibit} to add.
   * @return True on success, false otherwise.
   */
  public addExhibit(e: Exhibit) {
    if (e.type === 'IMAGE' || e.type === 'VIDEO') {
      this.exhibits.push(e);
      e._belongsTo = this;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Removes an {Exhibit} from this {Wall}
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


  /**
   * Getter for the number of {Exhibit}s.
   */
  get numberOfExhibits() {
    return this.exhibits.length;
  }

  /**
   * The width of this {Wall}. Only defined, if it belongs to a {Room}.
   */
  /*get width() {
    if (this._belongsTo) {
      switch (this.direction) {
        case 'NORTH':
        case 'SOUTH':
          return this._belongsTo.size.x;
        case 'WEST':
        case 'EAST':
          return this._belongsTo.size.z;
      }
    } else {
      return Number.NaN;
    }
  }*/

  /**
   * The height of this {Wall}. Only defined, if it belongs to a {Room}.
   */
  get height() {
    if (this._belongsTo) {
      return this._belongsTo.size.y;
    } else {
      return Number.NaN;
    }
  }

  /**
   * Returns this {Wall}'s designation.
   */
  get designation() {
    if (this._belongsTo) {
      return `${this._belongsTo.text} (${this.wallNumber})`;
    } else {
      return  this.wallNumber;
    }
  }
}
