import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { CreateUserDto } from "../dto/user.dto";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import Authenticator from "api42client";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../auth/jwt.payload.interface";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../auth/get-user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { diskStorage } from "multer";
import { json } from "stream/consumers";
import { Block } from "./block.entity";
import { extname } from "path";
import * as fs from "fs";
import { Gamehistoryclass } from "../game/game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { use } from "passport";
import { UserStatus } from "./user.status.enum";

@Controller("user")
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;
  @Inject(JwtService)
  private readonly JwtService: JwtService;
  @UseGuards(AuthGuard())
  @Get("home")
  async hellohome(@GetUser() user: User): Promise<string> {
    const name = JSON.stringify(user.name);
    return "hello" + name;
  }

  @UseGuards(AuthGuard())
  @Get("me")
  async current(@GetUser() user: User): Promise<User> {
    this.service.updateStatus(user.id, UserStatus.online);
    console.log("set online", user.name);
    return user;
  }

  // @Get('redirect')
  // async getauthedUser(
  //   @Query('code') code: string,
  //   @Res() res: any,
  // ): Promise<any> {
  //   const app = new Authenticator(
  //     process.env.clientID,
  //     process.env.clientSecret,
  //     process.env.callbackURL,
  //   );

  //   const tokenData = await app.get_Access_token(code);
  //   if (tokenData.access_token) {
  //     const data = await app.get_user_data(tokenData.access_token);
  //     this.service.createaccess(data, res);
  //   } else {
  //     throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  //   }
  // }
  @UseGuards(AuthGuard())
  @Get("myblocked")
  async getMyBlockedUsers(@GetUser() user: User): Promise<Block[]> {
    return await this.service.getBlockedusers(user);
  }

  // TODO:
  //  ~ Use Interceptor: Exclude
  @Get(":id")
  public getUser(@Param("id", ParseIntPipe) id: number): Promise<User> {
    return this.service.getUserByid(id);
  }
  //get/post... with no route should always be under be careful !
  @UseGuards(AuthGuard())
  @Get()
  public getAllUsers(): Promise<User[]> {
    //  console.log(req.user);
    return this.service.getAllUser();
  }

  @UseGuards(AuthGuard())
  @Post("uploadfile")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./public/uploadfile",
        // filename:(req, image, callback) =>{
        //   const ext = extname(image.originalname);
        //   const filename = GetUser().name + `${ext}`
        //   callback(null, filename)
        // }
      }),
    })
  ) 
  async updateavatar(
    @UploadedFile(
      new ParseFilePipe({
        // validators: [
        //   new MaxFileSizeValidator({ maxSize: 12000000 }),
        //   new FileTypeValidator({
        //     fileType: /(gif|jpe?g|tiff?|png|webp|bmp)/,
        //   }),
        // ],
      })
    )
    file: Express.Multer.File,
    @GetUser() user: User
  ): Promise<Boolean> {
    if(file.size > 12000000){
      fs.unlink(file.path, (erro) =>{})
      throw new BadRequestException('file size is too large');
    }
    const type = file.mimetype.split("/")[1];
    if(!type.match(/(gif|jpe?g|tiff?|png|webp|bmp)/))
    {
      fs.unlink(file.path, (erro) =>{})
      throw new BadRequestException('file exthension is not supported');
    }
    return this.service.updateavatar(user,file);
  }

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<string> {
    await this.service.createUser(body);
    const id = body.id;
    const payload: JwtPayload = { id };
    const accesToken = await this.JwtService.sign(payload);
    console.log(accesToken);
    return accesToken;
  }

  @UseGuards(AuthGuard())
  @Patch(":id/updatename")
  async updateUsername(
    @Param("id", ParseIntPipe) id: number,
    @Body("name") name: string,
    @GetUser() user: User
  ): Promise<User> {
    if (id === user.id) {
      return await this.service.updateUsername(id, name);
    } else
      throw new UnauthorizedException(
        "this user doesnt have the rights to edit"
      );
  }
  // @Patch(':id/avatar')
  // async updateUseravatar(@Param('id', ParseIntPipe) id: number, @Body('avatar') avatar: string): Promise <User>
  // {
  //   const av = avatar;
  //   return await this.service.updateUsername(id, av);
  // }

  @UseGuards(AuthGuard())
  @Delete("/:id/delete")
  async removeUser(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<boolean> {
    // console.log(user);
    if (id === user.id) {
      return this.service.removeUser(id);
    } else
      throw new UnauthorizedException(
        "this user doesnt have the rights to remove the user"
      );
  }

  @UseGuards(AuthGuard())
  @Post("block/:blocked")
  async BlockUser(
    @Param("blocked", ParseIntPipe) blocked: number,
    @GetUser() user: User
  ): Promise<Block> {
    return this.service.blockUser(blocked, user);
  }

  @UseGuards(AuthGuard())
  @Post("unblock/:blocked")
  async unBlockUser(
    @Param("blocked", ParseIntPipe) blocked: number,
    @GetUser() user: User
  ): Promise<Boolean> {
    return this.service.unblockUser(blocked, user);
  }
  @UseGuards(AuthGuard())
  @Get("game/userHistory/:user")
  async getuserHistory(@Param("user",ParseIntPipe) id: number): Promise<Gamehistoryclass[]>{
    
    return this.service.getUserHistory(id);
  }
}
