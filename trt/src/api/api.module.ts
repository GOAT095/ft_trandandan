import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [UserModule, AuthModule, FriendsModule],
  providers: [
    GameGateway
  ],
})
export class ApiModule {}
