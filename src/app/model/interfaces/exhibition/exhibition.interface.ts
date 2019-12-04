import {IRoom} from '../polygonalRoom/room.interface';
import {ObjectId} from './objectid.interface';

export interface IExhibition {
    id: ObjectId;
    name: string;
    key: string;
    description: string;
    rooms: IRoom[];
}
