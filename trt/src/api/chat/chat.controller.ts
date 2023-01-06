import { Controller, Post, Body, Param, ValidationPipe, Get, BadRequestException, Patch, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { CreateRoomDto, PasswordDto, RoomAdminstrationDto, UpdateRoomDto } from '../dto/user.dto';
import { Access_type } from '../utils/acces.type.enum';
import { RoomService, Room } from './room/room.service';
import { GetUser } from '../auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { User } from '../user/user.entity';

@Controller('chat')
@UseGuards(AuthGuard())
export class ChatController {

    constructor(private room: RoomService) {}

    // Authorization: LoggedIN
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room')
    createRoom(@Body() body: CreateRoomDto, @GetUser() user: User) {
        // ~TODO: validate that a password is present if type is protected
        console.log(body);
        if(!body.type) throw new BadRequestException({'error': 'Channel password property is null'});
        if (body.type == Access_type.protected) {
            if (body.password == null) {
                throw new BadRequestException({'error': 'Creating a protected channel requires setting a password.'});
            }
        }

        // createRoomOr400() 
        return this.room.createRoom(body, user);
    }

    // Authorization: LoggedIN, Owner
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId')
    update(@Param('roomId') roomId: number, @Body() body: UpdateRoomDto, @GetUser() user: User) {
        this.room.checkIsOwner(roomId, user);

        this.room.update(roomId, 'name', body.name);
        this.room.update(roomId, 'type', body.type);
        if (body.type == Access_type.protected) {
            if (body.password != null) {
                this.room.resetRoomPassword(roomId, body.password);
            }
        }
        return this.room.findById(roomId);
    }


    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('room')
    listPublicAndProtectedRooms() : Room[] {
        return this.room.find({'type': [Access_type.public, Access_type.protected]});
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get('room/player/:playerId')
    listPlayerActiveRooms(@Param('playerId') playerId: number, @GetUser() user: User) {
        return this.room.find({'members': user.id});
    }

    // Not Used (so far)
    // v1: done
    // TODO: filter direct messages by current user id
    //@Get('room/dm')
    //listDirectMessages() {
    //    return this.room.find({'type': Access_type.direct_message})
    //}

    // Authorization: RoomOwner | RoomAdmin
    // ~TODO: check : can't ban room owner !
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/ban/:playerId')
    banPlayer(@Param() action: RoomAdminstrationDto, @GetUser() user: User) {
        this.room.checkIsAdmin(action.roomId, user);
        this.room.checkIsNotOwner(action.roomId, Number(action.playerId));
        return this.room.update(action.roomId, 'banList', Number(action.playerId));
    }

    // Authorization: RoomOwner | RoomAdmin
    // ~TODO: check : can't mute room owner !
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/mute/:playerId')
    mutePlayer(@Param() action: RoomAdminstrationDto, @GetUser() user: User) {
        this.room.checkIsAdmin(action.roomId, user);
        this.room.checkIsNotOwner(action.roomId, Number(action.playerId));
        return this.room.update(action.roomId, 'muteList', {'id': Number(action.playerId), 'start': new Date()})
    }

    // Authorization: RoomOwner | RoomAdmin
    // ~TODO: check : can't kick room owner !
    // remove from members list
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/kick/:playerId')
    kickPlayer(@Param() action: RoomAdminstrationDto, @GetUser() user: User) {
        this.room.checkIsAdmin(action.roomId, user);
        this.room.checkIsNotOwner(action.roomId, Number(action.playerId));
        return this.room.update(action.roomId, 'members', Number(action.playerId), true);
    }

    // Authorization: RoomOwner
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/set-as-admin/:playerId')
    setAsAdmin(@Param() action: RoomAdminstrationDto, @GetUser() user: User) {
        this.room.checkIsOwner(action.roomId, user);
        return this.room.update(action.roomId, 'admins', Number(action.playerId));
    }

    // Authorization: LoggedIN
    // ~TODO:
    //  ~ this route is accessible only if:
    //      ~ room is public/protected
    //      ~ room is private and the currently logged in user is a member
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('room/:roomId')
    details(@Param('roomId') roomId: number, @GetUser() user: User) {
        this.room.checkRoomIsAccessible(Number(roomId), user);
        return this.room.findById(roomId);
    }

    // Not Used (so far)
    // Authorization: LoggedIN
    // TODO: check for access, member (private/dms)
    //@Get('room/:roomId/messages')
    //messages(@Param('roomId') roomId: number) {
    //    return {'roomId': roomId}
    //}

    // Authorization: RoomOwner
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/key')
    setKey(@Param('roomId') roomId: number, @Body() body: PasswordDto, @GetUser() user: User) { 
        this.room.checkIsOwner(roomId, user);
        return this.room.update(roomId, 'password', body.password);
    }

    // Authorization: RoomOwner
    // v1: done
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/key/disable')
    disableKeyAccess(@Param('roomId') roomId: number, @Body() body: any, @GetUser() user: User) {
        this.room.checkIsOwner(roomId, user);
        return this.room.update(roomId, 'type', Access_type.public);
    }

    // Authorization: LoggedIn
    // Access: room is public, or protected
    // ~TODO: check room is public or protected
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/join')
    joinRoom(@Param('roomId') roomId: number, @Body() body: any, @GetUser() user: User) {
        this.room.checkRoomIsPublic(roomId);
        this.room.checkIsNotBanned(roomId, user.id);
        return this.room.update(Number(roomId), 'members', user.id);
    }

    // ~TODO: check room is protected
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/join-protected')
    joinProtectedRoom(@Param('roomId') roomId: number, @Body() body: any, @GetUser() user: User) {
        this.room.checkRoomIsProtected(roomId);
        this.room.checkRoomPassword(Number(roomId), body.password);
        this.room.checkIsNotBanned(roomId, user.id);
        return this.room.update(Number(roomId), 'members', user.id);
    }

 
    // Authorization: LoggedIn
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('room/:roomId/leave')
    leaveRoom(@Param('roomId') roomId: number, @Body() body: any, @GetUser() user: User) {
        return this.room.update(roomId, 'members', user.id, true);
    }

}
