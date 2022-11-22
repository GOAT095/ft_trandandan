import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { CreateRoomDto } from 'src/api/dto/user.dto';
import { Access_type } from '../../utils/acces.type.enum';
import { hashSync, compareSync } from 'bcryptjs';
import { User } from '../../user/user.entity';
import { Exclude } from 'class-transformer';

export interface MutedPlayer {
    id: number;
    start: Date;
}
export class Room {
  id: number;
  name: string;
  owner: number;
  type: Access_type;
  @Exclude()
  password?: string;
  members: number[];
  admins: number[];
  banList: number[];
  muteList: MutedPlayer[];

  constructor(partial: Partial<Room>) {
    Object.assign(this, partial);
  }
};

@Injectable()
export class RoomService {
    rooms : Room[] = [];

    // TODO: define an uuid
    createRoom(room: CreateRoomDto, user: User) : Room {
        // init
        var newRoom : Room = new Room({
            id: this.rooms.length,
            name: room.name,
            owner: user.id,
            type: room.type,
            // add owner to members, admins
            members: [user.id,],
            admins: [user.id,],
            banList: [],
            muteList: [],
        });

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

    resetRoomPassword(roomId: number, password: string) {
        let room = this.findById(roomId);
        room.password = hashSync(password, 8);
    }

    checkRoomPassword(roomId: number, password: string) {
        let room = this.findById(roomId);
        if (!compareSync(password, room.password)) {
            throw new UnauthorizedException({'error': 'Channel password check failed'});
        }
    }

    checkIsOwner(roomId: number, user: User) {
        let room = this.findById(roomId);
        if (!(room.owner == user.id)) {
            throw new UnauthorizedException({'error': 'This action requires owner privilege'})
        }
    }

    checkIsNotOwner(roomId: number, userId: number) {
        let room = this.findById(roomId);
        if ((room.owner == userId)) {
            throw new UnauthorizedException({'error': 'This action is not allowed'})
        }
    }

    checkIsAdmin(roomId: number, user: User) {
        let room = this.findById(roomId);
        if (!(room.admins.includes(user.id))) {
            throw new UnauthorizedException({'error': 'This action requires admin privilege'})
        }
    }

    checkRoomIsAccessible(roomId: number, user: User) {
        let room = this.findById(roomId);
        if (room.type == Access_type.private && (!room.members.includes(user.id))) {
            throw new UnauthorizedException({'error': 'This action is not allowed'});
        }
    }

    checkRoomIsPublicOrProtected(roomId: number) {
        let room = this.findById(roomId);
        if (room.type == Access_type.direct_message || room.type == Access_type.private) {
            throw new UnauthorizedException({'error': 'This action is not allowed'});
        }
    }

    checkRoomIsPublic(roomId: number) {
        let room = this.findById(roomId);
        if (room.type != Access_type.public) {
            throw new UnauthorizedException({'error': 'This action is not allowed'});
        }
    }

    checkRoomIsProtected(roomId: number) {
        let room = this.findById(roomId);
        if (room.type != Access_type.protected) {
            throw new UnauthorizedException({'error': 'This action is not allowed'});
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
