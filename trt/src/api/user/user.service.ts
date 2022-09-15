import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/user.dto';
import { UserStatus } from './user.status.enum';
import * as fs from 'fs';
import { JwtPayload } from '../auth/jwt.payload.interface';
import { JwtService } from '@nestjs/jwt';
// import { hashPassword } from '../utils/bcrypt';
@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;
  @Inject(JwtService)
  private readonly JwtService: JwtService;

  async getUserByid(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id } });
  }
  async getAllUser(): Promise<User[]> {
    return await this.repository.find();
  }

  async createaccess(d: any, @Res() res): Promise<string> {
    await this.addUserToDB(d);
    const id = await (await this.getUserByid(d.id)).id;
    const twofa = await (await this.getUserByid(d.id)).twoFactor;
    if (!twofa) {
      const payload: JwtPayload = { id };
      const accesToken = await this.JwtService.sign(payload);
      console.log(accesToken);
      return accesToken;
    } else {
      console.log('2fa');
      res.redirect('http://localhost:3000/2fa/check');
    }
    return;
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
    // const res: string = await hashPassword(secret);
    return this.repository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.repository.update(userId, {
      twoFactor: true,
    });
  }

  async turnOffTwoFactorAuthentication(userId: number) {
    return this.repository.update(userId, {
      twoFactor: false,
      twoFactorAuthenticationSecret: null,
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
