import {Vector3f} from '../general/vector-3f.model';
import {IExhibit} from '../objects/exhibit.interface';
import {IWall} from './wall.interface';
import {IRoom} from '../room/room.interface';

export interface ICorridor {
  text: string;
  ambient: string;
  floor: string;
  ceiling: string;
  position: Vector3f;
  size: Vector3f;
  entrypoint: Vector3f;
  walls: IWall[];
  exhibits: IExhibit[];
  connects: IRoom[];
}
