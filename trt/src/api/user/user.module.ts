import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
  JwtModule.register({
    secret: "dMYQN8aw8tzxzdTrdJAdwELprUBfzwZh3nJLHKUX9Ekp3AmSHQCfjkHDkjVAd72j",
    signOptions: { expiresIn: '60s' },
  }),
  ],
  controllers: [UserController],
  providers: [UserService,],
})
export class UserModule {}
