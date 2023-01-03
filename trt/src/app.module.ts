import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./api/user/user.entity";
import { UserModule } from "./api/user/user.module";
import { FriendrequestEntity } from "./api/friends/friend.entity";
import { MulterModule } from "@nestjs/platform-express";
import { Block } from "./api/user/block.entity";
import { chatLogs } from "./api/chat/chatLogs.entity";
import { Room } from "./api/chat/room.entity";
import { roomUser } from "./api/chat/roomUser.entity";
import { WsGateway } from './ws/ws.gateway';
import { ChatController } from './api/chat/chat.controller';
import { RoomService } from "./api/chat/room/room.service";
import { JwtModule } from "@nestjs/jwt";
import { GameGateway } from "./api/game/game.gateway";
import { Gamehistoryclass } from "./api/game/game.entity";

@Module({
  imports: [
    MulterModule.register({
      dest: "./uploadfile",
    }),
    UserModule,
    JwtModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASS,
      entities: [User, FriendrequestEntity, Block, chatLogs, Room, roomUser, Gamehistoryclass],
      // logger: 'file',
      // logging: true,
      synchronize: true, // never use TRUE in production
    }),
  ],
  providers: [WsGateway, RoomService, GameGateway],
  //providers: [WsGateway, RoomService],
  controllers: [ChatController],
  // controllers: [AppController],
})
export class AppModule {}
