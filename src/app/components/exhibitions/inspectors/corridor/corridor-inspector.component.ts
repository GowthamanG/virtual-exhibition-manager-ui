import {Component, Input} from '@angular/core';
import {Corridor} from '../../../../model/implementations/corridor.model';
import {Textures} from '../../../../model/interfaces/general/textures.model';

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

    /**
     * Default constructor.
     */
    constructor() {}

    /**
     *
     */
    get textures() {
        return this._textures;
    }

    /**
    *
    */
    get rooms() {
      return this.corridor.connects;
    }


    /**
     * Getter for the
     */
    get corridor(): Corridor {
        return this._corridor;
    }
}
