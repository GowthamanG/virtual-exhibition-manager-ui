import {AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {Room} from '../../../../model/implementations/polygonalRoom/room.model';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Textures} from '../../../../model/interfaces/general/textures.model';
import {Vector2f} from '../../../../model/interfaces/general/vector-2f.model';
import {AlertMessageComponent} from '../../../alert-message/alert-message.component';



@Component({
  selector: 'app-room-dialogue',
  templateUrl: './room-dialogue.component.html',
  styleUrls: ['./room-dialogue.component.scss']
})
export class RoomDialogueComponent implements OnInit, AfterViewInit {
  /** Template reference to the canvas element */
  @ViewChild('surfaceCanvas') surfaceCanvas: ElementRef;

  private contextSurface: CanvasRenderingContext2D;

  /** Canvas 2d context https://stackblitz.com/edit/canvas-example, https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial*/

  private grid_size = 20;
  private x_axis_distance_grid_lines = 4;
  private y_axis_distance_grid_lines = 8;
  private x_axis_starting_point = {number: 1, suffix: ''};
  private y_axis_starting_point = {number: 1, suffix: ''};
  private canvas_surface_width: number;
  private canvas_surface_height: number;


  private num_lines_x: number;
  private num_lines_y: number;
  private mouse_down_x: number;
  private mouse_down_y: number;
  private mouse_move_x: number;
  private mouse_move_y: number;
  private origin_translate_x = this.y_axis_distance_grid_lines * this.grid_size;
  private origin_translate_y = this.x_axis_distance_grid_lines * this.grid_size;

  private temp_x: number;
  private temp_y: number;

  private image_point: HTMLImageElement;


  private _textures: string[] = Textures.map(v => v.toString());

  constructor(public dialogRef: MatDialogRef<RoomDialogueComponent>, @Inject(MAT_DIALOG_DATA) public data: {Room: Room, Coordinates: Vector2f[]},
              public _dialog: MatDialog) {
    this.dialogRef.disableClose = true;
  }


  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.contextSurface = (this.surfaceCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    this.image_point = new Image(1, 1);
    this.image_point.src = '../../../../../assets/black_point.png';


    this.canvas_surface_width = this.contextSurface.canvas.width;
    this.canvas_surface_height = this.contextSurface.canvas.height;
    this.num_lines_x = Math.floor(this.canvas_surface_height / this.grid_size);
    this.num_lines_y = Math.floor(this.canvas_surface_width / this.grid_size);

    this.drawCoordinateSystem2(20);
  }

  drawCoordinateSytem(translate_x: number, translate_y: number): void {

    for (let i = 0; i <= this.num_lines_x; i++) {
      this.contextSurface.beginPath();
      this.contextSurface.lineWidth = 1;

      /** If line represents X-Axis draw in differnet color */
      if (i === this.x_axis_distance_grid_lines) {
        this.contextSurface.strokeStyle = '#000000';
      } else {
        this.contextSurface.strokeStyle = '#e9e9e9';
      }

      if (i === this.num_lines_x) {
        this.contextSurface.moveTo(0, this.grid_size * i);
        this.contextSurface.lineTo(this.canvas_surface_width, this.grid_size * i);
      } else {
        this.contextSurface.moveTo(0, this.grid_size * i + 0.5);
        this.contextSurface.lineTo(this.canvas_surface_width, this.grid_size * i + 0.5);
      }

      this.contextSurface.stroke();
    }

    for (let i = 0; i <= this.num_lines_y; i++) {
      this.contextSurface.beginPath();
      this.contextSurface.lineWidth = 1;

      /** If line represents Y-Axis draw in differnet color */
      if (i === this.y_axis_distance_grid_lines) {
        this.contextSurface.strokeStyle = '#000000';
      } else {
        this.contextSurface.strokeStyle = '#e9e9e9';
      }

      if (i === this.num_lines_y) {
        this.contextSurface.moveTo(this.grid_size * i, 0);
        this.contextSurface.lineTo(this.grid_size * i, this.canvas_surface_height);
      } else {
        this.contextSurface.moveTo(this.grid_size * i + 0.5, 0);
        this.contextSurface.lineTo(this.grid_size * i + 0.5, this.canvas_surface_height);
      }

      this.contextSurface.stroke();
    }

    this.contextSurface.translate(translate_x, translate_y);

    /** Ticks marks along the positive X-axis */
    for (let i = 1; i < (this.num_lines_y - this.y_axis_distance_grid_lines); i++) {
      this.contextSurface.beginPath();
      this.contextSurface.lineWidth = 1;
      this.contextSurface.strokeStyle = '#000000';

      /** Draw a trick mark 6px long (- 3 to 3) */
      this.contextSurface.moveTo(this.grid_size * i + 0.5, -3);
      this.contextSurface.lineTo(this.grid_size * i + 0.5, 3);
      this.contextSurface.stroke();

      /** Text value at that point */
      this.contextSurface.font = '9px Arial';
      this.contextSurface.textAlign = 'start';
      this.contextSurface.fillText(this.x_axis_starting_point.number * i + this.x_axis_starting_point.suffix, this.grid_size * i - 2, 15);
    }

    /** Ticks marks along the negative X-axis */
    for (let i = 1; i < this.y_axis_distance_grid_lines; i++) {
      this.contextSurface.beginPath();
      this.contextSurface.lineWidth = 1;
      this.contextSurface.strokeStyle = '#000000';

      /** Draw a trick mark 6px long (- 3 to 3) */
      this.contextSurface.moveTo(this.grid_size * i + 0.5, -3);
      this.contextSurface.lineTo(this.grid_size * i + 0.5, 3);
      this.contextSurface.stroke();

      /** Text value at that point */
      this.contextSurface.font = '9px Arial';
      this.contextSurface.textAlign = 'end';
      this.contextSurface.fillText(-this.x_axis_starting_point.number * i + this.x_axis_starting_point.suffix, -this.grid_size * i - 3, 15);
    }

    /** Ticks marks along the positive Y-axis
     * Positive Y-Axis of graph is negative Y-axis of the canvas */
    for (let i = 1; i < (this.num_lines_x - this.x_axis_distance_grid_lines); i++) {
      this.contextSurface.beginPath();
      this.contextSurface.lineWidth = 1;
      this.contextSurface.strokeStyle = '#000000';

      /** Draw a trick mark 6px long (- 3 to 3) */
      this.contextSurface.moveTo(-3, this.grid_size * (i) + 0.5);
      this.contextSurface.lineTo(3, this.grid_size * (i) + 0.5);
      this.contextSurface.stroke();

      /** Text value at that point */
      this.contextSurface.font = '9px Arial';
      this.contextSurface.textAlign = 'end';
      this.contextSurface.fillText(-this.y_axis_starting_point.number * i + this.y_axis_starting_point.suffix, 8, this.grid_size * i + 3);
    }

    /** Ticks marks along the negative Y-axis */
    for (let i = 1; i < this.x_axis_distance_grid_lines; i++) {
      this.contextSurface.beginPath();
      this.contextSurface.lineWidth = 1;
      this.contextSurface.strokeStyle = '#000000';

      /** Draw a trick mark 6px long (- 3 to 3) */
      this.contextSurface.moveTo(-3, -this.grid_size * i + 0.5);
      this.contextSurface.lineTo(3, -this.grid_size * i + 0.5);
      this.contextSurface.stroke();

      /** Text value at that point */
      this.contextSurface.font = '9px Arial';
      this.contextSurface.textAlign = 'start';
      this.contextSurface.fillText(this.y_axis_starting_point.number * i + this.y_axis_starting_point.suffix, 8, -this.grid_size * i + 3);
    }
  }

  drawCoordinateSystem2(grid_size: number): void {
    const grid_size_x = this.contextSurface.canvas.width / grid_size;
    const grid_size_y = this.contextSurface.canvas.height / grid_size;

    for (let i = 1; i < grid_size; i++) {
      if (i === (grid_size / 2)) {
        this.contextSurface.strokeStyle = '#000000';
      } else {
        this.contextSurface.strokeStyle = '#e9e9e9';
      }

      this.contextSurface.beginPath();
      this.contextSurface.moveTo(grid_size_x * i, 0);
      this.contextSurface.lineTo(grid_size_x * i, this.canvas_surface_height);
      this.contextSurface.stroke();

      this.contextSurface.beginPath();
      this.contextSurface.moveTo(0, grid_size_y * i);
      this.contextSurface.lineTo(this.canvas_surface_width, grid_size_y * i);
      this.contextSurface.stroke();
    }
  }

  save(): void {
    if (this.data.Coordinates.length < 4) {
      this.openAlertDialog('Not enough coordinates, select at least 4 coordinate!');
    } else if (this.data.Coordinates[0] !== this.data.Coordinates[this.data.Coordinates.length - 1]) {
      this.openAlertDialog('The first and the last coordinate must be the same!');
    } else {
      this.dialogRef.close(this.data);
    }
  }

  openAlertDialog(message: string): void {
    const dialogRef = this._dialog.open(AlertMessageComponent, {
      width: '350px',
      data: message
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Warning closed');
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  @HostListener('window:keyup.esc') onKeyUp() {
    this.dialogRef.close(null);
  }

  clearCanvas(): void {
    this.contextSurface.clearRect(0, 0, this.canvas_surface_width, this.canvas_surface_height);
    this.data.Coordinates.length = 0;
    this.temp_x = null;
    this.temp_y = null;
    this.drawCoordinateSystem2(20);
  }

  drawSurface(event: MouseEvent): void {

    let x = event.layerX;
    let y = event.layerY;


    this.mouse_down_x = this.mouse_move_x;
    this.mouse_down_y = this.mouse_move_y;

    //this.contextSurface.fillRect(x, y, 2, 1);

    this.contextSurface.drawImage(this.image_point, x - 5, y - 5, 10, 10);

    this.data.Coordinates.push({x: this.mouse_down_x, y: this.mouse_down_y});

    if (this.temp_x !== null && this.temp_y !== null) {
      this.contextSurface.beginPath();
      this.contextSurface.moveTo(this.temp_x, this.temp_y);
      this.contextSurface.lineTo(x, y);
      this.contextSurface.strokeStyle = '#123DEA';
      this.contextSurface.lineWidth = 2.0;
      this.contextSurface.stroke();
    }

    this.temp_x = x;
    this.temp_y = y;
  }

  coordsOnMove(event: MouseEvent): void {
    if (event.offsetX >= (this.canvas_surface_width / 2)) {
      console.log(this.contextSurface.canvas.height, this.contextSurface.canvas.width);
      this.mouse_move_x = Math.floor((event.offsetX - this.canvas_surface_width / 2) / (this.grid_size + 5));
    } else {
      this.mouse_move_x = Math.floor((event.offsetX - this.canvas_surface_width / 2) / (this.grid_size + 5));
    }

    if (event.offsetY >= (this.canvas_surface_height / 2)) {
      this.mouse_move_y = -Math.floor((event.offsetY - (this.canvas_surface_height /  2)) / (this.grid_size + 9));
    } else {
      this.mouse_move_y = -Math.floor((event.offsetY - (this.canvas_surface_height /  2)) / (this.grid_size + 9));
    }
  }
}

// https://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
