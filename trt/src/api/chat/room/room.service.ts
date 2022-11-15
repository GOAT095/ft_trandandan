import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateRoomDto } from 'src/api/dto/user.dto';
import { Access_type } from '../../utils/acces.type.enum';
import { hashSync, compareSync } from 'bcryptjs';

export interface MutedPlayer {
    id: number;
    start: Date;
}
export interface Room {
  id: number;
  name: string;
  owner: number;
  type: Access_type;
  password?: string;
  members: number[];
  admins: number[];
  banList: number[];
  muteList: MutedPlayer[];
};

@Injectable()
export class RoomService {
    rooms : Room[] = [];

    // TODO: define an uuid
    createRoom(room: CreateRoomDto) : Room {
        // init
        var newRoom : Room = {
            id: this.rooms.length,
            name: room.name,
            owner: room.owner,
            type: room.type,
            // add owner to members, admins
            members: [room.owner,],
            admins: [room.owner,],
            banList: [],
            muteList: [],
        };

        // TODO: set the password if type is protected
        if (newRoom.type == Access_type.protected) {
            // password should be set
            if (room.password != null) {
                //newRoom.password = room.password;
                newRoom.password = hashSync(room.password, 8);
            }
            else {
                // TODO: fail: throw the right exception
                throw new BadRequestException({'error': 'Channel password property is null'});
            }
        }

        console.log(newRoom);

        this.rooms.push(newRoom);
        return newRoom;
    }

    checkRoomPassword(roomId: number, password: string) {
        let room = this.findById(roomId);
        if (!compareSync(password, room.password)) {
            throw new UnauthorizedException({'error': 'Channel password check failed'});
        }
    }

    find(searchObject: any) : Room[] {
        var results : Room[] = [];
        for (const room of this.rooms) {
            for (const key in searchObject) {
                if (key in room) {
                    if (typeof searchObject[key] == typeof []) {
                        for (const value of searchObject[key]) {
                            if (typeof room[key] == typeof []) {
                                if (room[key].includes(value)) {
                                    results.push(room);
                                }
                            }
                            else {
                                if (room[key] == value) {
                                    results.push(room);
                                }
                            }
                        }
                    }
                    else {
                        // assume primitive type and compare
                        //if (room[key] == searchObject[key]) {
                        //    results.push(room); // TODO: do not pass the password attribute 
                        //}
                        let value = searchObject[key];
                        if (typeof room[key] == typeof []) {
                            if (room[key].includes(value)) {
                                results.push(room);
                            }
                        }
                        else {
                            if (room[key] == value) {
                                results.push(room);
                            }
                        }
                    }
                }
            }
        }
        return results;
    }

    findById(id: number) : Room {
        if (id < 0 || id >= this.rooms.length) {
            throw new NotFoundException({'error': 'No Record matching'});
        }
        return this.rooms.at(id);
    }

    update(id: number, key: string, value: any, remove: boolean = false) : Room {
        var room = this.findById(id);
        if (key in room) {
            if (typeof room[key] == typeof []) {
                if (remove) {
                    var index = room[key].indexOf(value);
                    if (index == -1) {
                        throw new NotFoundException({'error': 'No Record matching'});
                    }
                    else {
                        room[key].splice(index, 1);
                    }
                }
                else {
                    room[key].push(value);
                }
            }
            else {
                room[key] = value;
            }
        }
        else {
            throw new BadRequestException({'error': 'Invalid attribute'});
        }
        return room;
    }
}
