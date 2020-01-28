import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../material.module';
import {EditExhibitionComponent} from './edit-exhibition.component';
import {ListExhibitionComponent} from './list-exhibition.component';
import {InspectorModule} from './inspectors/inspector.module';
import {EditExhibitionVisualComponent} from './edit-exhibition-visual/edit-exhibition-visual.component';
import {ChooseEditorComponent} from './choose-editor/choose-editor.component';
import {RouterModule} from '@angular/router';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { RoomDialogueComponent } from './dialogues/room-dialogue/room-dialogue.component';
import {FormsModule} from '@angular/forms';
import {SharedComponentsModule} from '../shared/shared-components.module';
import { AlertMessageComponent } from '../alert-message/alert-message.component';


@NgModule({
  declarations: [ EditExhibitionComponent, ListExhibitionComponent, EditExhibitionVisualComponent, ChooseEditorComponent, RoomDialogueComponent, AlertMessageComponent],
  imports: [BrowserModule, MaterialModule, InspectorModule, RouterModule, DragDropModule, FormsModule, SharedComponentsModule],
  entryComponents: [RoomDialogueComponent, AlertMessageComponent],
  exports: [ EditExhibitionComponent, ListExhibitionComponent ]
})
export class ExhibitionsModule {}
