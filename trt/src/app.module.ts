import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './api/user/user.entity';
import { UserModule } from './api/user/user.module';
import { FriendrequestEntity } from './api/friends/friend.entity';
import { FriendsModule } from './api/friends/friends.module';
import { FriendsController } from './api/friends/friends.controller';
import { FriendsService } from './api/friends/friends.service';
import { UserService } from './api/user/user.service';
@Module({
  imports: [ UserModule ,TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    entities: [User, FriendrequestEntity],
    logger: 'file',
    synchronize: true, // never use TRUE in productio

  })],
  controllers: [AppController,  ],
  providers: [AppService, ],
})
export class AppModule {}
