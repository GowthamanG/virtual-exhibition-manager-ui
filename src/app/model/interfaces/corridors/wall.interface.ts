import {Vector3f} from '../general/vector-3f.model';
import {IExhibit} from '../objects/exhibit.interface';

export interface IWall {
  color: Vector3f;
  texture: string;
  wallNumber: string;
  wallCoordinates: Vector3f[];
  exhibits: IExhibit[];
}
