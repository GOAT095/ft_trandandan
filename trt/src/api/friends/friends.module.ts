import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { FriendrequestEntity } from './friend.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [UserService],
  controllers: [FriendsController],
  providers: [FriendsService, ]
})
export class FriendsModule {}
