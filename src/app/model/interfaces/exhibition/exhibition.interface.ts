import {IRoom} from '../polygonalRoom/room.interface';
import {ObjectId} from './objectid.interface';
import {ICorridor} from '../corridors/corridor.interface';

export interface IExhibition {
    id: ObjectId;
    name: string;
    key: string;
    description: string;
    rooms: IRoom[];
    corridors: ICorridor[];
}
