import { Controller, Post, Body, Param, ValidationPipe, Get, BadRequestException } from '@nestjs/common';
import { CreateRoomDto, PasswordDto, RoomAdminstrationDto } from '../dto/user.dto';
import { Access_type } from '../utils/acces.type.enum';
import { RoomService, Room } from './room/room.service';

@Controller('chat')
export class ChatController {

    constructor(private room: RoomService) {}

    // Authorization: LoggedIN
    // v1: done
    @Post('room')
    createRoom(@Body() body: CreateRoomDto) {
        // TODO: validate that a password is present if type is protected
        if (body.type == Access_type.protected) {
            if (body.password == null) {
                throw new BadRequestException({'error': 'Creating a protected channel requires setting a password.'});
            }
        }

        // createRoomOr400() 
        return this.room.createRoom(body);
    }

    // v1: done
    @Get('room')
    listPublicAndProtectedRooms() {
        return this.room.find({'type': [Access_type.public, Access_type.protected]});
    }

    @Get('room/player/:playerId')
    listPlayerActiveRooms(@Param('playerId') playerId: number) {
        return this.room.find({'members': Number(playerId)});
    }

    // v1: done
    // TODO: filter direct messages by current user id
    @Get('room/dm')
    listDirectMessages() {
        return this.room.find({'type': Access_type.direct_message})
    }

    // Authorization: RoomOwner | RoomAdmin
    // v1: done
    @Post('room/:roomId/ban/:playerId')
    banPlayer(@Param() action: RoomAdminstrationDto) {
        return this.room.update(action.roomId, 'banList', Number(action.playerId));
    }

    // Authorization: RoomOwner | RoomAdmin
    // v1: done
    @Post('room/:roomId/mute/:playerId')
    mutePlayer(@Param() action: RoomAdminstrationDto) {
        return this.room.update(action.roomId, 'muteList', {'id': Number(action.playerId), 'start': new Date()})
    }

    // Authorization: RoomOwner | RoomAdmin
    // remove from members list
    // v1: done
    @Post('room/:roomId/kick/:playerId')
    kickPlayer(@Param() action: RoomAdminstrationDto) {
        return this.room.update(action.roomId, 'members', Number(action.playerId), true);
    }

    // Authorization: RoomOwner
    // v1: done
    @Post('room/:roomId/set-as-admin/:playerId')
    setAsAdmin(@Param() action: RoomAdminstrationDto) {
        return this.room.update(action.roomId, 'admins', Number(action.playerId));
    }

    // Authorization: LoggedIN
    // v1: done
    @Get('room/:roomId')
    details(@Param('roomId') roomId: number) {
        return this.room.findById(roomId);
    }

    // Authorization: LoggedIN
    // TODO: check for access, member (private/dms)
    @Get('room/:roomId/messages')
    messages(@Param('roomId') roomId: number) {
        return {'roomId': roomId}
    }

    // Authorization: RoomOwner
    // v1: done
    @Post('room/:roomId/key')
    setKey(@Param('roomId') roomId: number, @Body() body: PasswordDto) { 
        return this.room.update(roomId, 'password', body.password);
    }

    // Authorization: RoomOwner
    // v1: done
    @Post('room/:roomId/key/disable')
    disableKeyAccess(@Param('roomId') roomId: number, @Body() body: any) {
        return this.room.update(roomId, 'type', Access_type.public);
    }

    // Authorization: LoggedIn
    // Access: room is public, or protected
    @Post('room/:roomId/join')
    joinRoom(@Param('roomId') roomId: number, @Body() body: any) {
        var playerId = 53993; // TODO: get current player Id
        // temporary get playerId from body
        console.log(body);
        console.log(Number(body.playerId));
        console.log(roomId);
        return this.room.update(Number(roomId), 'members', Number(body.playerId));
    }

    // Authorization: LoggedIn
    @Post('room/:roomId/leave')
    leaveRoom(@Param('roomId') roomId: number, @Body() body: any) {
        var playerId = 53993; // TODO: get current player Id
        // temporary get playerId from body
        return this.room.update(roomId, 'members', Number(body.playerId), true);
    }

}
