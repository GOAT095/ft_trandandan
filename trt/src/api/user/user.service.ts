import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Res,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "../dto/user.dto";
import { UserStatus } from "./user.status.enum";
import * as fs from "fs";
import { JwtPayload } from "../auth/jwt.payload.interface";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "crypto";
import { Block } from "./block.entity";
// import { hashPassword } from '../utils/bcrypt';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;
  @InjectRepository(Block)
  private readonly BlockRepo: Repository<Block>;
  @Inject(JwtService)
  private readonly JwtService: JwtService;

  // TODO: use a better data structure, caveats: requests to /redirect will populate
  // the mapping without ever cleaning up if /check is not visited for that
  // particular token
  tokens: object = {};

  async getUserByid(id: number): Promise<User> {
    return await this.repository.findOne({ where: { id } });
  }

  async getUserByName(name: string): Promise<User> {
    return await this.repository.findOne({ where: { name } });
  }

  async getAllUser(): Promise<User[]> {
    return await this.repository.find();
  }

  async giveaccess(name: string, @Res() res) {
    const id = (await this.getUserByName(name)).id;
    const payload: JwtPayload = { id };
    const accesToken = this.JwtService.sign(payload, { expiresIn: "1d" });
    res.cookie("auth-cookie", accesToken, { httpOnly: true });
    res.redirect("http://localhost:4200/default");
    res.send();
  }

  async createaccess(d: any, @Res() res): Promise<string> {
    const new_user : boolean = await this.addUserToDB(d);
    const id =  (await this.getUserByid(d.id)).id
    const twofa = (await this.getUserByid(d.id)).twoFactor;
    if (!twofa) {
      const payload: JwtPayload = { id };
      const accesToken = this.JwtService.sign(payload, { expiresIn: "7d" });
      // console.log(accesToken);
      res.cookie('auth-cookie', accesToken, { httpOnly: true});
      res.redirect(`http://localhost:4200/default?new=${new_user}`);
      // return accesToken;
    } else {
      console.log("2fa");
      // when 2fa is enabled, we need to match the user who initiated
      // the original auth requests in /redirect to the /auth/check route
      // we use a simple md5 string mapping
      let token = createHash("md5").update(randomBytes(128)).digest("hex");
      this.tokens[token] = id; // save it
      res.redirect(`http://localhost:4200/2fa-step?token=${token}`);
    }
    return;
  }

  async createUser(body: CreateUserDto): Promise<User> {
    const user: User = new User();

    user.id = body.id;
    user.name = body.name;
    user.avatar = null;
    user.email = body.email;
    user.status = UserStatus.online;
    try {
      await this.repository.save(user);
    } catch (error) {
      if (error.code === "23505")
        throw new ConflictException("id already exist !");
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
    ret.avatar = null;
    ret.email = user.email;
    user.status = UserStatus.online;
    await this.repository.save(ret);
    return true;
  }
  async updateUsername(id: number, username: string): Promise<User> {
    const user = await this.getUserByid(id);
    if (!user) throw new NotFoundException(`user not found`);
    const tmp = await this.repository.findOne({
      where: { name: username },
    });
    if (tmp) throw new ConflictException("username already exist !");
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

  async updateavatar(user: User, file: any): Promise<Boolean> {
    if(!user)throw new NotFoundException(`user not found`);
    console.log(file);
    const type = file.mimetype.split("/")[1];
    console.log(type);
    fs.rename(
      file.path,
      file.destination + "/" + user.name + "." + type,
      (Error) => {   //callback if error
        if (Error) throw Error;
      }
    );
    user.avatar = process.env.UPLOAD_PATH + "/" + user.name + "." + type;
    this.repository.save(user);
    return true;
  }

  //game stuff
  async addwin(user: User): Promise<User> {
    if (user) {
      console.log(user);
    }
    user.wins += 1;
    await this.repository.save(user);
    return await this.getUserByid(user.id);
  }

  async addloss(user: User): Promise<User> {
    user.losses += 1;
    await this.repository.save(user);
    return await this.getUserByid(user.id);
  }

  async upgradelvl(user: User): Promise<User> {
    //some math to upgrade the lvl !

    return;
  }
  async get_online_users(): Promise<User[]> {
    return await this.repository.find({ where: { status: UserStatus.online } });
  }

  async get_user_status(id: number): Promise<UserStatus> {
    return (await this.getUserByid(id)).status;
  }

  async blockUser(blockedId: number, blocker: User): Promise<Block> {
    if (blockedId == Number(blocker.id)) {
      throw new ConflictException("can't block yourself"); // maybe not needed
    }

    const blockedUser = await this.getUserByid(blockedId);
    if (!blockedUser) {
      throw new ConflictException("user to be blocked not found !");
    }
    const blockRequest: Block = new Block();
    blockRequest.blocker = blocker;
    blockRequest.blocked = blockedUser;
    await this.BlockRepo.save(blockRequest);
    return blockRequest;
  }
  async unblockUser(blockedId: number, blocker: User): Promise<boolean> {
    const query = await this.BlockRepo.findOne({
      where: {
        blocker: { id: blocker.id },
        blocked: { id: blockedId },
      },
      relations: ["blocker", "blocked"],
    });
    if (!query) {
      throw new ConflictException("can't unblock a non-blocked user !");
    }
    this.BlockRepo.delete(query.id);
    return true;
  }
  async getBlockedusers(user: User): Promise<Block[]> {
    return await this.BlockRepo.find({
      where: { blocker: { id: user.id } },
      relations: ["blocker", "blocked"],
    });
    //works now
  }
}
