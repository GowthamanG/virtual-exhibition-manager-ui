import {IExhibit} from '../interfaces/objects/exhibit.interface';
import {CHOType} from '../interfaces/objects/cho-type.interface';
import {Vector3f} from '../interfaces/general/vector-3f.model';
import {Room} from './polygonalRoom/room.model';
import {Wall as RoomWall} from './polygonalRoom/wall.model';
import {Corridor} from './corridor/corridor.model';
import {Wall as CorridorWall} from './corridor/wall.model';
import {IRoom} from '../interfaces/polygonalRoom/room.interface';
import {IExhibition} from '../interfaces/exhibition/exhibition.interface';

export class Exhibit implements IExhibit {

    /** Reference to the {Room} or {Wall} this {Exhibit} belongs to. */
    public _belongsTo: (Room | RoomWall| Corridor | CorridorWall |  null);

    /**
     *
     * @param id
     * @param name
     * @param type
     * @param description
     * @param path
     * @param light
     * @param audio
     * @param position
     * @param size
     */
    constructor(public id: string, public name: string, public type: CHOType, public description: string,
                public path: string, public light: boolean, public audio: string, public position: Vector3f, public size: Vector3f) {}




    /**
     * Copies a @type {IExhibit} to a new @type {Exhibit} object.
     *
     * @param e IExhibit object
     * @param target The target for the Proxy object.
     */
    public static copyAsProxy(e: IExhibit, target: object): Exhibit {
        return new Proxy(
            new Exhibit(e.id, e.name, e.type, e.description, e.path, e.light, e.audio, e.position, e.size),
            target
        );
    }

    /**
     * Returns a description of this {Exhibit}'s location.
     */
    get location() {
        if (this.isOnRoomWall) {
            return `Wall (${(<Room>(<RoomWall>this._belongsTo)._belongsTo).text}, ${ (<RoomWall>this._belongsTo).wallNumber})`;
        } else if (this.isInRoom) {
            return `Room (${(<Room>this._belongsTo).text})`;
        } else if (this.isOnCorridorWall) {
            return `Wall (${(<Corridor>(<CorridorWall>this._belongsTo)._belongsTo).text}, ${ (<CorridorWall>this._belongsTo).wallNumber})`;
        } else if (this.isInCorridor) {
            return `Room (${(<Corridor>this._belongsTo).text})`;
        } else {
          return 'No location';
        }
    }

    /**
     * Returns true, if this {Exhibit} hangs on a wall {Room}.
     */
    get isOnRoomWall(): boolean {
        return this._belongsTo instanceof RoomWall;
    }

    /**
     * Returns true, if this {Exhibit} is placed in a {Room}.
     */
    get isInRoom(): boolean {
        return this._belongsTo instanceof RoomWall;
    }

    /**
     * Returns true, if this {Exhibit} hangs on a wall {Corridor}.
     */
    get isOnCorridorWall(): boolean {
      return this._belongsTo instanceof CorridorWall;
    }

    /**
     * Returns true, if this {Exhibit} is placed in a {Corridor}.
     */
    get isInCorridor(): boolean {
      return this._belongsTo instanceof CorridorWall;
    }
}
