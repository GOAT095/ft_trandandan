import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './api/user/user.entity';
import { UserModule } from './api/user/user.module';
import { FriendrequestEntity } from './api/friends/friend.entity';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASS,
      entities: [User, FriendrequestEntity],
      //logger: 'file',
      // logging: true,
      synchronize: true, // never use TRUE in productio
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
