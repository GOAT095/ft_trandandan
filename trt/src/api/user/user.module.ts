import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../auth/jwt.strategy';
import { FriendrequestEntity } from '../friends/friend.entity';
import { FriendsController } from '../friends/friends.controller';
import { FriendsService } from '../friends/friends.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, FriendrequestEntity]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1d'},
  }),
  ],
  controllers: [UserController, FriendsController],
  providers: [UserService, FriendsService, 
  JwtStrategy],
  exports: [JwtStrategy, PassportModule, UserService]
})
export class UserModule {}
