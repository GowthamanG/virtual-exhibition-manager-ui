import {IWall} from '../interfaces/room/wall.interface';
import {Vector3f} from '../interfaces/general/vector-3f.model';
import {Direction} from '../interfaces/room/direction.model';
import {Exhibit} from './exhibit.model';
import {Room} from './room.model';

export class Wall implements IWall {
    /** List of @type {Exhibit}s placed on this @type {Wall}. */
    public readonly exhibits: Exhibit[] = [];

    /** Reference to the {Room} this {Wall} belongs to. */
    public _belongsTo: (Room | null);

    /**
     * Default constructor for @type {Wall}.
     * @param direction
     * @param color
     * @param texture
     */
    constructor(public direction: Direction, public color: Vector3f, public texture: string) {}

    /**
     * Copies a @type {IWall} to a new @type {Wall} object.
     *
     * @param w IWall object
     */
    public static copy(w: IWall): Wall{
        const n = new Wall(w.direction, w.color, w.texture);
        for (const e of w.exhibits) {
            const ec = Exhibit.copy(e);
            ec._belongsTo = n;
            n.exhibits.push(ec);
        }
        return n;
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
        if (e instanceof Exhibit) {
            e = this.exhibits.indexOf(e);
        }
        if (e > -1 && e < this.exhibits.length) {
            this.exhibits.splice(e, 1);
            return true;
        } else {
            return false;
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
    get width() {
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
    }

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
            return `${this._belongsTo.text} (${this.direction})`;
        } else {
           return  this.direction;
        }
    }
}
