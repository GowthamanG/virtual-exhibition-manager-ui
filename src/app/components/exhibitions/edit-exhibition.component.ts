import {Component} from '@angular/core';
import {EditorService} from '../../services/editor/editor.service';
import {Exhibition} from '../../model/implementations/exhibition.model';
import {Room} from '../../model/implementations/room/room.model';
import {Wall as RoomWall} from '../../model/implementations/room/wall.model';
import {Corridor} from '../../model/implementations/corridor/corridor.model';
import {Wall as CorridorWall} from '../../model/implementations/corridor/wall.model';
import {Exhibit} from '../../model/implementations/exhibit.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


@Component({
    selector: 'app-edit-exhibitions',
    templateUrl: 'edit-exhibition.component.html',
    styleUrls: ['edit-exhibition.component.scss']
})
export class EditExhibitionComponent {

    /** The {NestedTreeControl} for the per-room tree list. */
    private _treeControl = new NestedTreeControl<any>(node => {
        if (node instanceof Room) {
          return [node.walls, node.exhibits];
        } else if (node instanceof Corridor) {
          return [node.walls, node.exhibits];
        } else if (node instanceof RoomWall) {
            return node.exhibits;
        } else if (node instanceof CorridorWall) {
          return node.exhibits;
        } else if (node instanceof Exhibit) {
            return [];
        } else {
            return node;
        }
    });

    /** The data source for the per-room tree list. */
    private _roomDataSources: Observable<Room[]>;
    /** The data source for the per-corridor tree list */
    private _corridorDataSources: Observable<Corridor[]>;

    /** Helper functions to render the tree list. */
    public readonly isWallFiller = (_: number, node: (Room | Corridor | RoomWall | CorridorWall | Exhibit)) => Array.isArray(node) && _ === 0;
    public readonly isExhibitFiller = (_: number, node: (Room | Corridor | RoomWall | CorridorWall | Exhibit)) => Array.isArray(node)  && _ === 1;
    public readonly isRoom = (_: number, node: (Room | Corridor | RoomWall | CorridorWall | Exhibit | FillerNode)) => node instanceof Room;
    public readonly isCorridor = (_: number, node: (Room | Corridor | RoomWall | CorridorWall | Exhibit | FillerNode)) => node instanceof Corridor;
    public readonly isRoomWall = (_: number, node: (Room | Corridor | RoomWall | CorridorWall | Exhibit | FillerNode)) => node instanceof RoomWall;
    public readonly isCorridorWall = (_: number, node: (Room | Corridor | RoomWall | CorridorWall | Exhibit | FillerNode)) => node instanceof CorridorWall;
    public readonly isExhibit = (_: number, node: (Room | Corridor | RoomWall | CorridorWall | Exhibit | FillerNode)) => node instanceof Exhibit;

    /**
     * Default constructor.
     *
     * @param _editor Reference to the {EditorService}
     */
    constructor(private _editor: EditorService) {
        this._roomDataSources = this._editor.currentObservable.pipe(map( e => e.rooms));
        this._corridorDataSources = this._editor.currentObservable.pipe(map(e => e.corridors));
    }

    /**
     * Getter for the @type {Exhibition}.
     */
    get exhibition(): Observable<Exhibition> {
        return this._editor.currentObservable;
    }

    /**
     * Getter for the inspected element.
     */
    get inspected(): Observable<(Exhibition | Room | Corridor | RoomWall | CorridorWall | Exhibit)> {
        return this._editor.inspectedObservable;
    }

    /**
     * Getter for the tree control.
     */
    get treeControl(): NestedTreeControl<(Room | Corridor | RoomWall | CorridorWall | Exhibit)> {
        return this._treeControl;
    }

    /**
     * Creates and adds a new {Room} to the current {Exhibition}.
     */
    public addNewRoom() {
        this._editor.current.addRoom(Room.empty());
    }

  /**
   * Creates and adds a new {Corridor} to the current {Exhibition}.
   * TODO scale to other rooms
   */
  public addNewCorridor() {
      this._editor.current.addCorridor(Corridor.empty());
    }

    /**
     * Deletes the provided {Room} from the current {Exhibition}
     *
     * @param r The {Room} to delete.
     */
    public removeRoom(r: Room): void {
        this._editor.current.deleteRoom(r);
    }

    /**
    * Deletes the provided {Corridor} from the current {Exhibition}
    *
    * @param c The {Corridor} to delete.
    */
    public removeCorridor(c: Corridor): void {
      this._editor.current.deleteCorridor(c);
    }

    /**
     * Returns the name of type of the currently inspected element.
     *
     * @return Type of the inspected element.
     */
    get selectedType(): Observable<string> {
        return this.inspected.pipe(
            map(i => {
                if (i instanceof Exhibit) {
                    return 'Exhibit';
                } else if (i instanceof Exhibition) {
                    return 'Exhibition';
                } else if (i instanceof Room) {
                    return 'Room';
                } else if (i instanceof RoomWall) {
                  return 'Wall';
                } else if (i instanceof Corridor) {
                    return 'Corridor';
                } else if (i instanceof CorridorWall) {
                  return 'Wall';
                } else {
                    return 'Nothing';
                }
            })
        );
    }

    /**
     *
     */
    get isSelectedExhibition(): Observable<boolean> {
        return this.inspected.pipe(map(e => e  instanceof Exhibition));
    }

    /**
     *
     */
    get isSelectedRoom() {
        return this.inspected.pipe(map(e => e  instanceof Room));
    }

    /**
     *
     */
    get isSelectedRoomWall() {
        return this.inspected.pipe(map(e => e  instanceof RoomWall));
    }

    get isSelectedCorridorWall() {
      return this.inspected.pipe(map(e => e  instanceof CorridorWall));
    }

    /**
     *
     */
    get isSelectedExhibit() {
        return this.inspected.pipe(map(e => e  instanceof Exhibit));
    }

    /**
    *
    */
    get isSelectedCorridor() {
      return this.inspected.pipe(map(e => e instanceof Corridor));
    }

  /**
     *
     * @param event
     * @param rw
     * @param e
     */
    public removeExhibitClicked(event: MouseEvent, e: Exhibit) {
        e._belongsTo.removeExhibit(e);
        event.stopPropagation();
    }

    /**
     * Called whenever a user clicks a {Exhibition}.
     * @param event The mouse event.
     */
    public exhibitionClicked(event: MouseEvent) {
        this._editor.inspected = this._editor.current;
        event.stopPropagation();
    }

    /**
     * Called whenever a user clicks a {Exhibit}.
     * @param event The mouse event.
     * @param exhibit The {Exhibit} that has been clicked.
     */
    public exhibitClicked(event: MouseEvent, exhibit: Exhibit) {
        this._editor.inspected = exhibit;
        event.stopPropagation();
    }


    /**
     * Called whenever a user clicks a {Room}.
     * @param event The mouse event.
     * @param room The {Room} that has been clicked.
     */
    public roomClicked(event: MouseEvent, room: Room) {
        this._editor.inspected = room;
        event.stopPropagation();
    }

    /**
    * Called whenever a user clicks a {Corridor}.
    * @param event The mouse event.
    * @param corridor The {Corridor} that has been clicked.
    */
    public corridorClicked(event: MouseEvent, corridor: Corridor) {
      this._editor.inspected = corridor;
      event.stopPropagation();
    }

    /**
     * Called whenever a user clicks a {Wall}.
     * @param event The mouse event.
     * @param wall The {Wall} that has been clicked.
     */
    public roomWallClicked(event: MouseEvent, wall: RoomWall) {
        this._editor.inspected = wall;
        event.stopPropagation();
    }
    /**
    * Called whenever a user clicks a {Wall}.
    * @param event The mouse event.
    * @param wall The {Wall} that has been clicked.
    */
    public corridorWallClicked(event: MouseEvent, wall: CorridorWall) {
      this._editor.inspected = wall;
      event.stopPropagation();
    }
}


/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface FillerNode {
    roomWalls: RoomWall[];
    corridorWalls: CorridorWall[];
    exhibits: Exhibit[];
}
