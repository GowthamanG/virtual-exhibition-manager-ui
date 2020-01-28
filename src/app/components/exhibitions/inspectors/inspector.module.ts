import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {ExhibitionInspectorComponent} from './exhibition-inspector.component';
import {FormsModule} from '@angular/forms';
import {RoomInspectorComponent} from './room/room-inspector.component';
import {CorridorInspectorComponent} from './corridor/corridor-inspector.component';
//import {CorridorCanvasComponent} from './corridor/corridor-canvas.component';
import {SharedComponentsModule} from '../../shared/shared-components.module';
//import {RoomCanvasComponent} from './room/room-canvas.component';
import {WallInspectorComponent} from './wall/wall-inspector.component';
import {WallCanvasComponent} from './wall/wall-canvas.component';
import {ExhibitInspectorComponent} from './exhibit/exhibit-inspector.component';

@NgModule({
    declarations: [ExhibitionInspectorComponent, RoomInspectorComponent, CorridorInspectorComponent, WallInspectorComponent, ExhibitInspectorComponent, WallCanvasComponent],
    imports: [ BrowserModule, MaterialModule, FormsModule, SharedComponentsModule ],
    exports: [ ExhibitionInspectorComponent, RoomInspectorComponent, CorridorInspectorComponent, WallInspectorComponent, ExhibitInspectorComponent]
})
export class InspectorModule {}
