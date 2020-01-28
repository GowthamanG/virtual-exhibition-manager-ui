import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {EditorService} from '../../../services/editor/editor.service';
import {Exhibition} from '../../../model/implementations/exhibition.model';
import {Room} from '../../../model/implementations/polygonalRoom/room.model';
import {Wall} from '../../../model/implementations/polygonalRoom/wall.model';
import {Wall as RoomWall} from '../../../model/implementations/polygonalRoom/wall.model';
import {Corridor} from '../../../model/implementations/corridor/corridor.model';
import {Wall as CorridorWall} from '../../../model/implementations/corridor/wall.model';
import {Exhibit} from '../../../model/implementations/exhibit.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {Observable} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {Vector3f} from '../../../model/interfaces/general/vector-3f.model';
import {VremApiService} from '../../../services/http/vrem-api.service';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {forEach} from '@angular/router/src/utils/collection';
import {Vector2f} from '../../../model/interfaces/general/vector-2f.model';
import {RoomDialogueComponent} from '../dialogues/room-dialogue/room-dialogue.component';
import {MatDialog} from '@angular/material';
import {el} from '@angular/platform-browser/testing/src/browser_util';
// import * as Two from 'two.js';

declare var Two: any;
declare var $: any;

@Component({
  selector: 'app-edit-exhibition-visual',
  templateUrl: './edit-exhibition-visual.component.html',
  styleUrls: ['./edit-exhibition-visual.component.scss']
})
export class EditExhibitionVisualComponent implements AfterViewInit {

  @ViewChild('vis', {read: ElementRef}) vis_elem: ElementRef;
  private two_global: any;
  private art_global: any;
  private two_width: number;
  private two_height: number;
  private two_width_scaled: number;
  private two_height_scaled: number;
  private pix_per_m: number;

  private lookup_table: any;
  private current_wall: RoomWall;

  private wall_width: number;
  private wall_width_scaled: number;
  private wall_height: number;
  private wall_height_scaled: number;

  private width_3_0: number; // length of line from wall coordinate [3] to [0]
  private width_2_1: number; // length of line from wall coordinate [2] to [1]
  private width_2_0: number; // length of line from wall coordinate [2] to [0]
  private width_3_1: number; // length of line from wall coordinate [3] to [1]

  private trapezoid_1 = false; //longest side below

  /**       ---
   *      .     .
   *    .         .
   *  .            .
   * ----------------
   *
   * widths could have different size
   */

  private trapezoid_2 = false; //longest side above

  /**
   *
   * ----------------
   *  .            .
   *    .        .
   *      .    .
   *        ---
   *
   *  widths could have different size
   */

  private rectangle_inclined_1 = false;

  /**
   *  ----------------
   *    .               .
   *      .               .
   *        .               .
   *          ----------------
   *
   * widths could have different size
   */

  private rectangle_inclined_2 = false;

  /**
   *        ----------------
   *      .               .
   *    .               .
   *  .               .
   * ----------------
   *
   * widths could have different size
   *
   */

  ngAfterViewInit(): void {
    this._roomDataSources.subscribe(x => this.current_wall = x[0].walls[0]);
    this.drawWall(this.current_wall);
  }

  /**
   * Draws the surface of the wall and its exhibits. Allows the user to move around the exhibits to a new position or to add
   * new exhibits into the wall.
   * The black boundaries on the left and right side appear when the ceiling is scaled.
   *
   * @param wall Wall currently being inspected
   */
  drawWall(wall: Wall): void {
    while (this.vis_elem.nativeElement.firstChild) {
      this.vis_elem.nativeElement.removeChild(this.vis_elem.nativeElement.firstChild);
    }

    let _room = Room.copyAsProxy(wall._belongsTo);
    let _wall = Wall.copyAsProxy(wall);

    _room._belongsTo = null;
    _wall._belongsTo = null;

    this.trapezoid_1 = false;
    this.trapezoid_2 = false;
    this.rectangle_inclined_1 = false;
    this.rectangle_inclined_2 = false;


    // Length (width and heigth) calculated with pythagoras formula
    this.wall_width = Math.sqrt(Math.pow(_wall.wallCoordinates[0].x - _wall.wallCoordinates[1].x, 2) + Math.pow(_wall.wallCoordinates[0].y - _wall.wallCoordinates[1].y, 2) + Math.pow(_wall.wallCoordinates[0].z - _wall.wallCoordinates[1].z, 2));
    this.wall_height = _room.height;
    let ratio_wall = this.wall_width / this.wall_height;

    const elem = this.vis_elem.nativeElement;
    const ratio_elem = elem.clientWidth / elem.clientHeight;

    if (ratio_wall > ratio_elem) {
      this.two_width = elem.clientWidth;
      this.two_height = this.two_width / ratio_wall;
      this.pix_per_m = this.two_width / this.wall_width;
    } else {
      this.two_height = elem.clientHeight;
      this.two_width = this.two_height * ratio_wall;
      this.pix_per_m = elem.clientHeight / this.wall_height;
      elem.style.width = this.two_width;
    }

    let draw_surface =  function (width: number, height: number, that) {
      let params = {width: width, height: height};
      that.two_global = new Two(params).appendTo(elem);

      let wall = that.two_global.makeRectangle(0, 0, width, height);
      wall.center();

      wall.translation.set(that.two_global.width / 2, that.two_global.height / 2);
      wall.scale = 1;
      wall.fill = '#EEEEEE';
      wall.noStroke();
    };


    if (_room.ceiling_scale !== 1.0) {

      let midOfCeiling: Vector3f = {x: 0, y: 0, z: 0};
      let numberOfVertices = _room.walls.length; //Num of edges == num of vertices of a polygon

      for (let i = 0; i < _room.walls.length; i++) {
        midOfCeiling.x += _room.walls[i].wallCoordinates[2].x;
        midOfCeiling.y += _room.walls[i].wallCoordinates[2].y;
        midOfCeiling.z += _room.walls[i].wallCoordinates[2].z;
      }

      midOfCeiling.x /= numberOfVertices;
      midOfCeiling.y /= numberOfVertices;
      midOfCeiling.z /= numberOfVertices;

      _wall.wallCoordinates[2].x = midOfCeiling.x + ((_wall.wallCoordinates[2].x - midOfCeiling.x) * _room.ceiling_scale);
      _wall.wallCoordinates[2].y = midOfCeiling.y + ((_wall.wallCoordinates[2].y - midOfCeiling.y) * _room.ceiling_scale);
      _wall.wallCoordinates[2].z = midOfCeiling.z + ((_wall.wallCoordinates[2].z - midOfCeiling.z) * _room.ceiling_scale);
      _wall.wallCoordinates[3].x = midOfCeiling.x + ((_wall.wallCoordinates[3].x - midOfCeiling.x) * _room.ceiling_scale);
      _wall.wallCoordinates[3].y = midOfCeiling.y + ((_wall.wallCoordinates[3].y - midOfCeiling.y) * _room.ceiling_scale);
      _wall.wallCoordinates[3].z = midOfCeiling.z + ((_wall.wallCoordinates[3].z - midOfCeiling.z) * _room.ceiling_scale);

      this.wall_width_scaled = Math.sqrt(Math.pow(_wall.wallCoordinates[2].x - _wall.wallCoordinates[3].x, 2) + Math.pow(_wall.wallCoordinates[2].y - _wall.wallCoordinates[3].y, 2) + Math.pow(_wall.wallCoordinates[2].z - _wall.wallCoordinates[3].z, 2));
      this.width_2_0 = Math.sqrt(Math.pow(_wall.wallCoordinates[2].x - _wall.wallCoordinates[0].x, 2) + Math.pow(_wall.wallCoordinates[2].y - _wall.wallCoordinates[0].y, 2) + Math.pow(_wall.wallCoordinates[2].z - _wall.wallCoordinates[0].z, 2));
      this.width_2_1 = Math.sqrt(Math.pow(_wall.wallCoordinates[1].x - _wall.wallCoordinates[2].x, 2) + Math.pow(_wall.wallCoordinates[1].y - _wall.wallCoordinates[2].y, 2) + Math.pow(_wall.wallCoordinates[1].z - _wall.wallCoordinates[2].z, 2));
      // Heron's formula to compute the height of the wall https://en.wikipedia.org/wiki/Heron%27s_formula, https://en.wikipedia.org/wiki/Triangle
      let s = (this.wall_width + this.width_2_0 + this.width_2_1) / 2;
      this.wall_height_scaled = (2 * Math.sqrt(s * (s - this.width_2_0) * (s - this.width_2_1) * (s - this.wall_width))) / this.wall_width;


      //Pythagoras for width_3_0 and width_2_1
      this.width_3_0 = Math.pow(_wall.wallCoordinates[3].x - _wall.wallCoordinates[0].x, 2) + Math.pow(_wall.wallCoordinates[3].y - _wall.wallCoordinates[0].y, 2) + Math.pow(_wall.wallCoordinates[3].z - _wall.wallCoordinates[0].z, 2); // length between wall coordinate 0 and 3, without y
      this.width_3_0 -= Math.pow(this.wall_height_scaled, 2);
      this.width_3_0 = Math.sqrt(Math.abs(this.width_3_0));

      this.width_2_1 = Math.pow(_wall.wallCoordinates[1].x - _wall.wallCoordinates[2].x, 2) + Math.pow(_wall.wallCoordinates[1].y - _wall.wallCoordinates[2].y, 2) + Math.pow(_wall.wallCoordinates[1].z - _wall.wallCoordinates[2].z, 2); // length between wall coordinate 1 and 0, without y
      this.width_2_1 -= Math.pow(this.wall_height_scaled, 2);
      this.width_2_1 = Math.sqrt(Math.abs(this.width_2_1));


      // Check which shape the wall does have. We distinguish between trapezoid, and rectangle inclined. Here, some special cases will be checked.
      if (this.wall_width > this.wall_width_scaled) {
        if (this.width_3_0 > this.width_2_1) {
          if (this.width_3_0 > this.wall_width) {
            this.rectangle_inclined_2 = true;
          } else {
            this.trapezoid_1 = true;
          }
        } else if (this.width_3_0 < this.width_2_1) {
          if (this.width_2_1 > this.wall_width) {
            this.rectangle_inclined_1 = true;
          } else {
            this.trapezoid_1 = true;
          }
        } else {
          this.trapezoid_1 = true;
        }
      } else if (this.wall_width < this.wall_width_scaled) {
        if (this.width_3_0 > this.width_2_1) {
          if (this.width_3_0 > this.wall_width_scaled) {
            this.rectangle_inclined_2 = true;
          } else {
            this.trapezoid_2 = true;
          }
        } else if (this.width_3_0 < this.width_2_1) {
          if (this.width_2_1 > this.wall_width_scaled) {
            this.rectangle_inclined_1 = true;
          } else {
            this.trapezoid_2 = true;
          }
        } else {
          this.trapezoid_2 = true;
        }
      } else {
        if (this.width_3_0 > this.width_2_1) {
          this.rectangle_inclined_2 = true;
        } else if (this.width_3_0 < this.width_2_1) {
          this.rectangle_inclined_1 = true;
        }
      }

      let set_Vis_size_params = function (width: number, height: number, that) {
        ratio_wall = width / height;
        if (ratio_wall > ratio_elem) {
          that.two_width_scaled = elem.clientWidth;
          that.two_height_scaled = that.two_width_scaled / ratio_wall;
          that.pix_per_m = that.two_width_scaled / width;
        } else {
          that.two_height_scaled = elem.clientHeight;
          that.two_width_scaled = that.two_height_scaled * ratio_wall;
          that.pix_per_m = elem.clientHeight / height;
          elem.style.width = that.two_width_scaled;
        }
      };

      // Scaled wall
      if (this.trapezoid_1) {
        set_Vis_size_params(this.wall_width, this.wall_height_scaled, this);
        draw_surface(this.two_width_scaled, this.two_height_scaled, this);
      } else if (this.trapezoid_2) {
        set_Vis_size_params(this.wall_width_scaled, this.wall_height_scaled, this);
        draw_surface(this.two_width_scaled, this.two_height_scaled, this);
      } else if (this.rectangle_inclined_1) {
        set_Vis_size_params(this.width_2_1, this.wall_height_scaled, this);
        draw_surface(this.two_width_scaled, this.two_height_scaled, this);
      } else if (this.rectangle_inclined_2) {
        set_Vis_size_params(this.width_3_0, this.wall_height_scaled, this);
        draw_surface(this.two_width_scaled, this.two_height_scaled, this);
      }

      // Compute start and end position of both boundaries (boundary 1 and 2)
      let start_1_x: number;
      let start_1_y: number;
      let end_1_x: number;
      let end_1_y: number;
      let start_2_x: number;
      let start_2_y: number;
      let end_2_x: number;
      let end_2_y: number;

      if (this.trapezoid_1) {

        let ratio = this.wall_width / this.wall_width_scaled;
        let ratio_2 = Math.pow(this.width_2_0, 2);
        ratio_2 -= Math.pow(this.wall_height_scaled, 2);
        ratio_2 = Math.sqrt(Math.abs(ratio_2));
        ratio_2 = this.wall_width / ratio_2;

        start_1_x = 0;
        start_1_y = this.two_height_scaled;
        end_1_x = this.two_width_scaled / ratio_2;
        end_1_y = 0;

        start_2_x = this.two_width_scaled;
        start_2_y = this.two_height_scaled;
        end_2_x = end_1_x + this.two_width_scaled / ratio;
        end_2_y = 0;

      } else if (this.trapezoid_2) {

        let ratio = this.wall_width_scaled / this.wall_width;

        let ratio_2 = Math.pow(this.width_2_0, 2);
        ratio_2 -= Math.pow(this.wall_height_scaled, 2);
        ratio_2 = Math.sqrt(Math.abs(ratio_2));
        ratio_2 = this.wall_width_scaled / ratio_2;

        start_1_x = this.two_width_scaled / ratio_2;
        start_1_y = this.two_height_scaled;
        end_1_x = 0;
        end_1_y = 0;

        start_2_x = start_1_x + this.two_width_scaled / ratio;
        start_2_y = this.two_height_scaled;
        end_2_x = this.two_width_scaled;
        end_2_y = 0;

      } else if (this.rectangle_inclined_1) {

        let ratio = this.width_2_1 / this.wall_width_scaled;

        let ratio_2 = Math.pow(this.width_2_0, 2);
        ratio_2 -= Math.pow(this.wall_height_scaled, 2);
        ratio_2 = Math.sqrt(Math.abs(ratio_2));
        ratio_2 = this.width_2_1 / ratio_2;

        start_1_x = this.two_width_scaled / ratio_2;
        start_1_y = this.two_height_scaled;
        end_1_x = 0;
        end_1_y = 0;

        start_2_x = this.two_width_scaled;
        start_2_y = this.two_height_scaled;
        end_2_x = this.two_width_scaled / ratio;
        end_2_y = 0;

      } else if (this.rectangle_inclined_2) {

        let ratio = this.width_3_0 / this.wall_width;

        let ratio_2 = Math.pow(this.width_2_0, 2);
        ratio_2 -= Math.pow(this.wall_height_scaled, 2);
        ratio_2 = Math.sqrt(Math.abs(ratio_2));
        ratio_2 = this.width_3_0 / ratio_2;

        start_1_x = 0;
        start_1_y = this.two_height_scaled;
        end_1_x = this.two_width_scaled / ratio_2;
        end_1_y = 0;

        start_2_x = this.two_width_scaled / ratio;
        start_2_y = this.two_height_scaled;
        end_2_x = this.two_width_scaled;
        end_2_y = 0;

      }

      let wall_boundary_1 = this.two_global.makeLine(start_1_x, start_1_y, end_1_x, end_1_y);
      wall_boundary_1.scale = 1;
      wall_boundary_1.fill = '#000000';

      let wall_boundary_2 = this.two_global.makeLine(start_2_x, start_2_y, end_2_x, end_2_y);
      wall_boundary_2.scale = 1;
      wall_boundary_2.fill = '#000000';

      this.art_global = this.two_global.makeGroup();
      this.two_global.update();

    } else {
      draw_surface(this.two_width, this.two_height, this);
    }

    _room = null;
    _wall = null;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.current_wall._belongsTo.ceiling_scale !== 1.0) {
      event.item.data.position.x = (this.two_width_scaled / 2) / this.pix_per_m;
      event.item.data.position.y = (this.two_height_scaled / 2) / this.pix_per_m;
    } else {
      event.item.data.position.x = (this.two_width / 2) / this.pix_per_m;
      event.item.data.position.y = (this.two_height / 2) / this.pix_per_m;
    }

    this.drawExhibit(event.item.data, this);
    this.current_wall.exhibits.push(event.item.data);
    // TODO: add exhibit to exhibition object
  }
  getPreview(exhibit: Exhibit) {
    return this._vrem_service.urlForContent(exhibit.path);
  }

  /** The {NestedTreeControl} for the per-room tree list. */
  private _treeControl = new NestedTreeControl<any>(node => {
    if (node instanceof Room) {
      return [node.walls, node.exhibits];
    } else if (node instanceof RoomWall) {
      return node.exhibits;
    } else if (node instanceof Exhibit) {
      return [];
    } else {
      return node;
    }
  });

  /** The data source for the per-room tree list. */
  private _roomDataSources: Observable<Room[]>;
  private _exhibits: Observable<Exhibit[]>;

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
   * @param _vrem_service
   * @param _dialog
   */
  constructor(private _editor: EditorService, private _vrem_service: VremApiService, private _dialog: MatDialog) {
    this._roomDataSources = this._editor.currentObservable.pipe(map( e => e.rooms));
    this._exhibits = this._vrem_service.listExhibits();
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
  get treeControl(): NestedTreeControl<(Room | RoomWall | Exhibit)> {
    return this._treeControl;
  }

  /**
   * Creates and adds a new {Room} to the current {Exhibition}.
   */
  public addNewRoom() {
    let coordinates: Vector2f[] = [];
    let data = {
      Room: Room.empty(),
      Coordinates: coordinates
    };

    const dialogRef = this._dialog.open(RoomDialogueComponent, {
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      console.log(data);
      if (result !== null) {

        for (let i = 0; i < data.Coordinates.length - 1; i++) {
          const w = Wall.empty(i);
          w.wallCoordinates.push({x: data.Coordinates[i].x, y: 0, z: data.Coordinates[i].y});
          w.wallCoordinates.push({x: data.Coordinates[i + 1].x, y: 0, z: data.Coordinates[i + 1].y});
          w.wallCoordinates.push({x: data.Coordinates[i].x, y: data.Room.height, z: data.Coordinates[i].y});
          w.wallCoordinates.push({x: data.Coordinates[i + 1].x, y: data.Room.height, z: data.Coordinates[i + 1].y});
          data.Room.walls.push(w);
          w._belongsTo = data.Room;
        }

        this._editor.current.addRoom(data.Room);
      }

    });
  }

  public addNewCorridor() {
    const c: Corridor = Corridor.empty();

    for (let i = 0; i < 2; i++) {
      const w = CorridorWall.empty(i);
      w.wallCoordinates.push({x: 0, y: 0, z: 0});
      w.wallCoordinates.push({x: 0, y: 0, z: 0});
      w.wallCoordinates.push({x: 0, y: 0, z: 0});
      w.wallCoordinates.push({x: 0, y: 0, z: 0});
      c.walls.push(w);
      w._belongsTo = c;
    }
    this._editor.current.addCorridor(c);
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
   * @param exhibition The {Exhibition} that has been clicked.
   */
  public exhibitionClicked(event: MouseEvent, exhibition: Exhibition) {
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
   * @param corridor
   */
  public corridorClicked(event: MouseEvent, corridor: Corridor) {
    this._editor.inspected = corridor;
    event.stopPropagation();
    //this.drawWall(wall);
  }

  /**
   * Called whenever a user clicks a {Wall}.
   * @param event The mouse event.
   * @param wall The {Wall} that has been clicked.
   */
  public roomWallClicked(event: MouseEvent, wall: RoomWall) {
    this._editor.inspected = wall;
    this.current_wall = wall;
    this.drawWall(this.current_wall);
    event.stopPropagation();
    this.drawArt(wall);
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

  drawArt(roomWall: RoomWall = null, corridorWall: CorridorWall = null): void {

    this.two_global.remove(this.art_global);
    this.art_global = this.two_global.makeGroup();
    this.lookup_table = {};

    if (roomWall !== null) {
      let exhibit: any;
      for (exhibit in roomWall.exhibits) {
        const e = roomWall.exhibits[exhibit];
        this.drawExhibit(e, this);
      }
    } else if (corridorWall !== null) {
      let exhibit: any;
      for (exhibit in roomWall.exhibits) {
        const e = roomWall.exhibits[exhibit];
        this.drawExhibit(e, this);
      }
    }

  }

  drawExhibit(e, that): void {
    const path = this._vrem_service.urlForContent(e.path);
    const image = this.two_global.makeTexture(path, function () {
      let art: any;

      // Todo: Offset for exhibit placement highly experimental! For now the offset is manually adjusted. It should be generalized in the future.
      if (that.current_wall._belongsTo.ceiling_scale !== 1.0) {

        if (that.trapezoid_1) {
          if (image === undefined) {
            art = that.two_global.makeSprite(path, e.position.x * that.pix_per_m, that.two_height_scaled - e.position.y * that.pix_per_m);
          } else {
            art = that.two_global.makeSprite(image, e.position.x * that.pix_per_m, that.two_height_scaled - e.position.y * that.pix_per_m);
          }
        } else if (that.trapezoid_2) {
          let ratio = that.wall_width_scaled / that.wall_width;
          let offset_width = ((that.two_width_scaled - that.two_width_scaled / ratio) / 2);

          if (image === undefined) {
            art = that.two_global.makeSprite(path, e.position.x * that.pix_per_m + offset_width, that.two_height_scaled - e.position.y * that.pix_per_m);
          } else {
            art = that.two_global.makeSprite(image, e.position.x * that.pix_per_m + offset_width, that.two_height_scaled - e.position.y * that.pix_per_m);
          }

        } else if (that.rectangle_inclined_1) {

          let ratio = Math.pow(that.width_2_0, 2);
          ratio -= Math.pow(that.wall_height_scaled, 2);
          ratio = Math.sqrt(Math.abs(ratio));
          ratio = that.width_2_1 / ratio;
          let offset_width: number;

          if (that.wall_width_scaled > that.wall_width) {
            offset_width = ((that.two_width_scaled - that.two_width_scaled / ratio) / 1.5);
          } else {
            offset_width = ((that.two_width_scaled - that.two_width_scaled / ratio) / 20);
          }

          if (image === undefined) {
            art = that.two_global.makeSprite(path, e.position.x * that.pix_per_m + offset_width, that.two_height_scaled - e.position.y * that.pix_per_m);
          } else {
            art = that.two_global.makeSprite(image, e.position.x * that.pix_per_m + offset_width, that.two_height_scaled - e.position.y * that.pix_per_m);
          }

        } else if (that.rectangle_inclined_2) {
          if (image === undefined) {
            art = that.two_global.makeSprite(path, e.position.x * that.pix_per_m, that.two_height_scaled - e.position.y * that.pix_per_m);
          } else {
            art = that.two_global.makeSprite(image, e.position.x * that.pix_per_m, that.two_height_scaled - e.position.y * that.pix_per_m);
          }
        }
      } else {
        if (image === undefined) {
          art = that.two_global.makeSprite(path, e.position.x * that.pix_per_m, that.two_height - e.position.y * that.pix_per_m);
        } else {
          art = that.two_global.makeSprite(image, e.position.x * that.pix_per_m, that.two_height - e.position.y * that.pix_per_m);
        }
      }

      art.scale = (e.size.x * that.pix_per_m) / art.width;
      that.art_global.add(image);
      that.art_global.add(art);
      that.two_global.update();
      that.addInteractivity(art);
      that.lookup_table[art.id] = e;
    });
  }

  addInteractivity(shape): void {
    const that = this;
    let offset_x: number;
    let offset_y: number;

    const drag = function (e) {
      e.preventDefault();
      let x = e.clientX - offset_x;
      let y = e.clientY + pageYOffset - offset_y;
      shape.translation.set(x, y);
      that.two_global.update();
    };
    const dragEnd = function (e) {
      e.preventDefault();
      $(window)
        .unbind('mousemove', drag)
        .unbind('mouseup', dragEnd);
      that.lookup_table[shape.id].position.x = shape.translation.x / that.pix_per_m;

      // Todo: Offset for exhibit placement highly experimental! For now the offset is manually adjusted. It should be generalized in the future.
      if (that.current_wall._belongsTo.ceiling_scale !== 1.0) {

        if (that.trapezoid_1) {
          that.lookup_table[shape.id].position.y = ((that.two_height_scaled - shape.translation.y) / that.pix_per_m);
        } else if (that.trapezoid_2) {

          let ratio = that.wall_width_scaled / that.wall_width;
          let offset_width = (that.two_width_scaled - that.two_width_scaled / ratio) / 2;

          that.lookup_table[shape.id].position.x -= offset_width / that.pix_per_m;
          that.lookup_table[shape.id].position.y = ((that.two_height_scaled - shape.translation.y) / that.pix_per_m);

        } else if (that.rectangle_inclined_1) {
          let ratio = Math.pow(that.width_2_0, 2);
          ratio -= Math.pow(that.wall_height_scaled, 2);
          ratio = Math.sqrt(Math.abs(ratio));
          ratio = that.width_2_1 / ratio;
          let offset_width: number;

          if (that.wall_width_scaled > that.wall_width) {
            offset_width = ((that.two_width_scaled - that.two_width_scaled / ratio) / 1.5);
          } else {
            offset_width = ((that.two_width_scaled - that.two_width_scaled / ratio) / 20);
          }

          that.lookup_table[shape.id].position.x -= offset_width / that.pix_per_m;
          that.lookup_table[shape.id].position.y = ((that.two_height_scaled - shape.translation.y) / that.pix_per_m);

        } else if (that.rectangle_inclined_2) {
          that.lookup_table[shape.id].position.y = ((that.two_height_scaled - shape.translation.y) / that.pix_per_m);
        }

      } else {
        that.lookup_table[shape.id].position.y = (that.two_height - shape.translation.y) / that.pix_per_m;
      }
    };

    $(shape._renderer.elem)
      .css({
        cursor: 'pointer'
      })
      .bind('mousedown', function (e) {
        e.preventDefault();

        offset_x = e.clientX - shape.translation.x;
        offset_y = e.clientY - shape.translation.y;
        $(window)
          .bind('mousemove', drag)
          .bind('mouseup', dragEnd);
      });
  }
}


/**
 * Food data with nested structure.
 * Each node has a name and an optiona list of children.
 */
interface FillerNode {
  walls: RoomWall[];
  exhibits: Exhibit[];
}
