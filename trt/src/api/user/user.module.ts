import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "../auth/auth.controller";
import { JwtStrategy } from "../auth/jwt.strategy";
import { TwoFactorAuthenticationController } from "../auth/twoFactorAuthentication.controller";
import { twoFactorAuthenticatorService } from "../auth/twoFactorAuthentication.service";
import { FriendrequestEntity } from "../friends/friend.entity";
import { FriendsController } from "../friends/friends.controller";
import { FriendsService } from "../friends/friends.service";
import { Block } from "./block.entity";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FriendrequestEntity, Block]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [
    UserController,
    FriendsController,
    TwoFactorAuthenticationController,
    AuthController,
  ],
  providers: [
    UserService,
    FriendsService,
    JwtStrategy,
    twoFactorAuthenticatorService,
  ],
  exports: [JwtStrategy, PassportModule, UserService],
})
export class UserModule {}
