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
  Req,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import Authenticator from 'api42client';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/jwt.payload.interface';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { request } from 'http';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;
  @Inject(JwtService)
  private readonly JwtService: JwtService;

  @Get('redirect')
  async getauthedUser(@Query('code') code: string) {
    const app = new Authenticator(
      process.env.clientID,
      process.env.clientSecret,
      process.env.callbackURL,
    );

    const data = await app.get_Access_token(code);
    // console.log("CHECK " + JSON.stringify(data)); //token, refresh_token,
    // token.then((data) => {
    // get the acces token of the user
    // console.log("======================== auth user Data =========================");
    // // console.log(data);
    // console.log("========================= 42 user data ==========================");
    // get the user info from 42 api
    // console.log(await app.get_user_data(data.access_token));

    if (data.access_token) {
      const d = await app.get_user_data(data.access_token);

      // console.log(id + "dawdawdawdawdada")
      await this.service.addUserToDB(d);
      // console.log("Hello "+ d.login);
      // console.log(d);
      const id = await (await this.getUser(d.id)).id;
      const payload: JwtPayload = { id };
      const accesToken = await this.JwtService.sign(payload);
      console.log(accesToken);
      //need to add 2fa logic ! if enabled and normal login case should stay
      return accesToken;
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
  @Get(':id')
  public getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.service.getUserByid(id);
  }

  @UseGuards(AuthGuard())
  @Get()
  public getAllUsers(): Promise<User[]> {
    //  console.log(req.user);
    return this.service.getAllUser();
  }

  @UseGuards(AuthGuard())
  @Post('uploadfile')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploadfile',
      }),
    }),
  )
  async updateavatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000 }),
          new FileTypeValidator({
            fileType: /(gif|jpe?g|tiff?|png|webp|bmp|jpg)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<User> {
    return this.service.updateavatar(user, file);
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
  @Patch(':id/updatename')
  async updateUsername(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name: string,
    @GetUser() user: User,
  ): Promise<User> {
    if (id === user.id) {
      return await this.service.updateUsername(id, name);
    } else
      throw new UnauthorizedException(
        'this user doesnt have the rights to edit',
      );
  }
  // @Patch(':id/avatar')
  // async updateUseravatar(@Param('id', ParseIntPipe) id: number, @Body('avatar') avatar: string): Promise <User>
  // {
  //   const av = avatar;
  //   return await this.service.updateUsername(id, av);
  // }

  @UseGuards(AuthGuard())
  @Delete('/:id/delete')
  async removeUser(
    @Param('id') id: number,
    @GetUser() user: User,
  ): Promise<boolean> {
    // console.log(user);
    if (id === user.id) {
      return this.service.removeUser(id);
    } else
      throw new UnauthorizedException(
        'this user doesnt have the rights to remove the user',
      );
  }
}
