import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { RoomService } from './chat/room/room.service';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [UserModule, AuthModule, FriendsModule],
  providers: [RoomService, GameGateway],
})
export class ApiModule {}
