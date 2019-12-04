import {AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {Room} from '../../../../model/implementations/polygonalRoom/room.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Textures} from '../../../../model/interfaces/general/textures.model';
import {Vector3f} from '../../../../model/interfaces/general/vector-3f.model';


@Component({
  selector: 'app-room-dialogue',
  templateUrl: './room-dialogue.component.html',
  styleUrls: ['./room-dialogue.component.scss']
})
export class RoomDialogueComponent implements OnInit, AfterViewInit {
  /** Template reference to the canvas element */
  @ViewChild('floorCanvas') floorCanvas: ElementRef;
  @ViewChild('ceilingCanvas') ceilingCanvas: ElementRef;

  /** Canvas 2d context https://stackblitz.com/edit/canvas-example, https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial*/
  private contextFloor: CanvasRenderingContext2D;
  private contextCeiling: CanvasRenderingContext2D;
  private coordinates: Vector3f [] = [];

  private _textures: string[] = Textures.map(v => v.toString());

  constructor(public dialogRef: MatDialogRef<RoomDialogueComponent>, @Inject(MAT_DIALOG_DATA) public data: Room) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.contextFloor = (this.floorCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    this.contextCeiling = (this.ceilingCanvas.nativeElement as HTMLCanvasElement).getContext('2d');

    this.contextFloor.canvas.addEventListener('mousedown', this.onClick, false);

  }


  save(): void {
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  @HostListener('window:keyup.esc') onKeyUp() {
    this.dialogRef.close(null);
  }

  onClick(event: MouseEvent): void {
    const x_layer = event.layerX;
    const y_layer = event.layerY;
    
    console.log('X_layer: ' + x_layer + ' Y_layer: ' + y_layer);
  }


}

// https://usefulangle.com/post/19/html5-canvas-tutorial-how-to-draw-graphical-coordinate-system-with-grids-and-axis
