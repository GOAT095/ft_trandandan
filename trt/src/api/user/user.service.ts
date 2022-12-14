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
import { Response } from "express";
import { use } from "passport";
import { Gamehistoryclass } from "../game/game.entity";

// import { hashPassword } from '../utils/bcrypt';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;
  @InjectRepository(Block)
  private readonly BlockRepo: Repository<Block>;
  @Inject(JwtService)
  private readonly JwtService: JwtService;
  @InjectRepository(Gamehistoryclass)
  private readonly GameHistory: Repository<Gamehistoryclass>;
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

  async giveaccess(name: string, @Res() res: Response) {
    const id = (await this.getUserByName(name)).id;
    const payload: JwtPayload = { id };
    const accesToken = this.JwtService.sign(payload, { expiresIn: "1d" });
    res.cookie("auth-cookie", accesToken, { httpOnly: false });
    //res.header("auth-token", accesToken);
    res.redirect(`${process.env.APP_URL}/default?auth-token=${accesToken}`);
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
      res.cookie('auth-cookie', accesToken, { httpOnly: false});
      //res.header("auth-token", accesToken);
      res.redirect(`${process.env.APP_URL}/default?new=${new_user}`);
      // return accesToken;
    } else {
      console.log("2fa");
      // when 2fa is enabled, we need to match the user who initiated
      // the original auth requests in /redirect to the /auth/check route
      // we use a simple md5 string mapping
      let token = createHash("md5").update(randomBytes(128)).digest("hex");
      this.tokens[token] = id; // save it
      res.redirect(`${process.env.APP_URL}/2fa-step?token=${token}`);
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
    console.log(file);
    const type = file.mimetype.split("/")[1];
    console.log(type);
    let name: string = createHash("md5").update(randomBytes(128)).digest("hex");
    fs.rename(
      file.path,
      file.destination + "/" + name + "." + type,
      (Error) => {
        if (Error) throw Error;
      }
    );

    user.avatar = process.env.UPLOAD_PATH + "/" + name + "." + type;
    this.repository.save(user);
    return true;
  }

  //game stuff
  async addwin(id: number): Promise<boolean> {
    const user = await this.getUserByid(id);
    if (!user) throw new NotFoundException(`user not found`);
    user.wins += 1;
    user.lvl += 30;
    user.streaks += 1;
    if (user.streaks > user.maxStreaks){
      user.maxStreaks = user.streaks;
    }

    await this.repository.save(user);
    return true;
  }

  async addloss(id: number): Promise<boolean> {
    const user = await this.getUserByid(id);
    if (!user) throw new NotFoundException(`user not found`);
    user.losses += 1;
    user.lvl += 10;
    user.streaks = 0;
    await this.repository.save(user);
    return true;
  }


  async updateStatus(id: number, status: UserStatus): Promise<User> {
    const user = await this.getUserByid(id);
    if (!user) throw new NotFoundException(`user not found`);
    user.status = status;
    await this.repository.save(user);
    return await this.getUserByid(id);
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

  async getUserHistory(id: number): Promise<Gamehistoryclass[]> {
    const user = await this.getUserByid(id);
    if (!user) throw new NotFoundException(`user not found`);
    return await this.GameHistory.find({
      where: [
        { playerOne: {id:user.id} },
        { playerTwo: {id:user.id} },
      ],
      relations: ["playerOne", "playerTwo"],
    });
  }
  async saveHistory(id1: number, id2: number, scoreOne: number, scoreTwo: number): Promise<Gamehistoryclass> {
    const game : Gamehistoryclass = new Gamehistoryclass();
    const playerOne = await this.getUserByid(id1);
    if (!playerOne) throw new NotFoundException(`user not found`);

    const playerTwo = await this.getUserByid(id2);
    if (!playerTwo) throw new NotFoundException(`user not found`);
    game.playerOne = playerOne;
    game.playerTwo = playerTwo;
    game.scoreOne = scoreOne;
    game.scoreTwo = scoreTwo;
    await this.GameHistory.save(game);
    return game;
}
}
