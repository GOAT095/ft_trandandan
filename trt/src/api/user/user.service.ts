import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/user.dto';
import { UserStatus } from './user.status.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/get-user.decorator';
import { userInfo } from 'os';
import * as fs from 'fs';
@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;
  async getUserByid(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id } });
  }
  async getAllUser(): Promise<User[]> {
    return await this.repository.find();
  }

  async createUser(body: CreateUserDto): Promise<User> {
    const user: User = new User();

    user.id = body.id;
    user.name = body.name;
    user.avatar = body.avatar;
    user.status = UserStatus.online;
    try {
      await this.repository.save(user);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('id already exist !');
    }
    return;
  }

  async addUserToDB(user: any): Promise<boolean> {
    const x = await this.getUserByid(user.id);
    // console.log(x);
    if (x) {
      return false;
    }
    const ret: User = new User();
    ret.id = user.id;
    ret.name = user.login;
    ret.avatar = user.image_url;
    user.status = UserStatus.online;
    await this.repository.save(ret);
    return true;
  }
  async updateUsername(id: number, username: string): Promise<User> {
    const user = await this.getUserByid(id);
    if (!user) throw new NotFoundException(`user with id ${id} not found`);
    if (username) {
      user.name = username;
    }
    await this.repository.save(user);
    return await this.getUserByid(id);
  }
  // async updateUserAvatar(id: number, avatar: string): Promise<User>{
  //     let user = await this.getUserByid(id);
  //     if(!user)
  //         throw new NotFoundException(`user with id ${id} not found`);
  //     if(avatar)
  //     {user.avatar = avatar;}
  //     await this.repository.save(user);
  //     return await this.getUserByid(id);
  // }

  // async addAvatar(@GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
  //   return this.repository.addAvatar(user.id, {
  //     path: file.path,
  //     filename: file.originalname,
  //     mimetype: file.mimetype
  //   });
  // }

  async removeUser(id: number): Promise<boolean> {
    const res = await this.repository.delete(id);
    return res.affected === 1;
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.repository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.repository.update(userId, {
      twoFactor: true,
    });
  }

  async updateavatar(user: User, file: any): Promise<User> {
    console.log(file);
    const type = file.mimetype.split('/')[1];
    console.log(type);
    fs.rename(
      file.path,
      file.destination + '/' + user.name + '.' + type,
      (Error) => {
        if (Error) throw Error;
      },
    );

    user.avatar = process.env.UPLAOD_PATH + '/' + user.name + '.' + type;
    this.repository.save(user);
    return user;
  }
}
