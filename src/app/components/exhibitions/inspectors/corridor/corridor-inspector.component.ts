import {Component, Input} from '@angular/core';
import {Corridor} from '../../../../model/implementations/corridor/corridor.model';
import {Textures} from '../../../../model/interfaces/general/textures.model';
import {EditorService} from '../../../../services/editor/editor.service';
import {Room} from '../../../../model/implementations/polygonalRoom/room.model';

@Component({
    selector: 'app-corridor-inspector',
    templateUrl: 'corridor-inspector.component.html',
    styleUrls: ['corridor-inspector.component.scss']
})

export class CorridorInspectorComponent {
    @Input('corridor')
    private _corridor: Corridor = null;

    /** List of available textures. */
    private _textures: string[] = Textures.map(v => v.toString());
    /** List of available rooms. */
    private _rooms: Room[] = this._editor.current.rooms.map(v => v);
    private _neighbourCorridors: Corridor[] = this._editor.current.corridors.map(v => v);

    /**
     * Default constructor.
     */
    constructor(private _editor: EditorService) {}

    /**
     *
     */
    get textures() {
        return this._textures;
    }

    /**
    * only show those rooms, which are still not selected by any corridors
    */
    get rooms() {
      const availableRooms: Array<Room> = new Array<Room>().concat(this._rooms);

      for (const r of availableRooms) {
        for (const c of this._neighbourCorridors) {
          if (c.connects.includes(r)) {
            const i = availableRooms.indexOf(r);
            availableRooms.splice(i, 1);
          }
        }
      }
      return availableRooms;
    }


    /**
     * Getter for the
     */
    get corridor(): Corridor {
        return this._corridor;
    }
}
