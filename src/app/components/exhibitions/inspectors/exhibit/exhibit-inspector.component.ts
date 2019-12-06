import {Component, Input} from '@angular/core';
import {Textures} from '../../../../model/interfaces/general/textures.model';
import {Shapes} from '../../../../model/interfaces/general/shapes.model';
import {Exhibit} from '../../../../model/implementations/exhibit.model';
import {VremApiService} from '../../../../services/http/vrem-api.service';

@Component({
    selector: 'app-exhibit-inspector',
    templateUrl: 'exhibit-inspector.component.html',
    styleUrls: ['exhibit-inspector.component.scss']
})
export class ExhibitInspectorComponent {
    @Input('exhibit')
    private _exhibit: Exhibit = null;

    /** List of available textures. */
    private _textures: string[] = Textures.map(v => v.toString());

    private _shapes: string[] = Shapes.map(value => value.toString());

    /**
     * Default constructor.
     *
     * @param _service Reference to the {VremApiService}
     */
    constructor(private _service: VremApiService) {
    }


    /**
     *
     */
    get service() {
        return this._service;
    }

    /**
     * Getter for available textures.
     */
    get textures() {
        return this._textures;
    }

    get shapes() {
      return this._shapes;
    }

    /**
     * Getter for {Exhibit}.
     */
    public get exhibit() {
        return this._exhibit;
    }
}
