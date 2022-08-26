
import { Body, Controller, Get, Inject, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateUserDto } from '../dto/user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import Authenticator from "api42client";
import { Code } from 'typeorm';
import { json } from 'stream/consumers';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Get('redirect')
 async getauthedUser(@Query('code') code : string){
    var app = new Authenticator(process.env.clientID, process.env.clientSecret, process.env.callbackURL);
  // console.log("CHECK :" + code  + "      " )
    var data =  await app.get_Access_token(code);
    // console.log("CHECK " + JSON.stringify(data));
    // token.then((data) => {
      // get the acces token of the user
      // console.log("======================== auth user Data =========================");
      // // console.log(data);
      // console.log("========================= 42 user data ==========================");
      // get the user info from 42 api
     
        let d = await app.get_user_data(data.access_token).then((data));
        if (!this.service.addUserToDB(d))
        // {
        //   return "user already exists !";
        // }
    // });
        
    return "Hello "+ d.login;
  }
  @Get(':id')
  public getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    
     return this.service.getUser(id);
  }
  @Get()
  public getAllUsers(): Promise<User[]> {
     return this.service.getAllUser();
  }

  @Post()
  public createUser(@Body() body: CreateUserDto): Promise<User> {
    
    return this.service.createUser(body);
  }
  
  
}
