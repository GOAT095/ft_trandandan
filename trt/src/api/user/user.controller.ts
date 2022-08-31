
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateUserDto } from '../dto/user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import Authenticator from "api42client";
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.payload.interface';
import { response } from 'express';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;
  @Inject(JwtService)
  private readonly JwtService: JwtService;

  @Get('redirect')
  async getauthedUser(@Query('code') code : string){
    var app = new Authenticator(process.env.clientID, process.env.clientSecret, process.env.callbackURL);
    
    var data =  await app.get_Access_token(code);
    // console.log("CHECK " + JSON.stringify(data)); //token, refresh_token,
    // token.then((data) => {
      // get the acces token of the user
      // console.log("======================== auth user Data =========================");
      // // console.log(data);
      // console.log("========================= 42 user data ==========================");
      // get the user info from 42 api
        // console.log(await app.get_user_data(data.access_token));
 
          if(data.access_token)
          { 
            const d = await app.get_user_data(data.access_token);
            
            // console.log(id + "dawdawdawdawdada")
          if (!(await this.service.addUserToDB(d)))
              {
                const id =  await (await this.getUser(d.id)).id;
                const payload: JwtPayload = {id};
                const accesToken = await this.JwtService.sign(payload);
                // response.cookie('jwt', accesToken);
                return accesToken;
              }
          else{
            // console.log(user);
            const id =  await (await this.getUser(d.id)).id;
            const payload: JwtPayload = {id};
            const accesToken = await this.JwtService.sign(payload);
            return accesToken;
          }
          // console.log("Hello "+ d.login);
          }
          else
          {throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);}
  }
  @Get(':id')
  public getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    
     return this.service.getUserByid(id);
  }
  @Get()
  public getAllUsers(): Promise<User[]> {
     return this.service.getAllUser();
  }

  @Post()
  public createUser(@Body() body: CreateUserDto): Promise<User> {
    
    return this.service.createUser(body);
  }
  @Patch(':id/update')
  async updateUsername(@Param('id', ParseIntPipe) id: number, @Body('name') name: string, @Body('avatar') avatar: string): Promise <User>
  {
    const username = name;
    return await this.service.updateUsername(id, username, avatar);
  }
  // @Patch(':id/avatar')
  // async updateUseravatar(@Param('id', ParseIntPipe) id: number, @Body('avatar') avatar: string): Promise <User>
  // {
  //   const av = avatar;
  //   return await this.service.updateUsername(id, av);
  // }
  
  @Delete('/:id/delete')
  async removeUser(@Param('id') id : number) : Promise <Boolean>
  {
    return  this.service.removeUser(id);
  }
}
