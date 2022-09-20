import { Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, ParseIntPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import Authenticator from 'api42client';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  @Inject(UserService)
  private readonly userservice: UserService;

  @Get('redirect')
  async getauthedUser(
    @Query('code') code: string,
    @Res() res: any,
  ): Promise<any> {
    const app = new Authenticator(
      process.env.clientID,
      process.env.clientSecret,
      process.env.callbackURL,
    );

    const tokenData = await app.get_Access_token(code);
    if (tokenData.access_token) {
      const data = await app.get_user_data(tokenData.access_token);
      this.userservice.createaccess(data, res);
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
  @UseGuards(AuthGuard())
  @Get('/logout/:id')
  async loguserout(@Param('id', ParseIntPipe) id: number, @Res() res, @GetUser() user: User): Promise<boolean>{
    // console.log("__ID__ : ", id);
    // console.log("__USER__ID__ : ", user.id);
    if (id == user.id)
    {
      return res.clearCookie('auth-cookie', {httponly: true});
      res.redirect("/redirect/home");
      // res.send("/redirect/home");

      return true;
    }
    else throw new ForbiddenException('unauthorised logout request');
    return;
  }

  @Get('home')
  async gethome(){
    return "this is home for test";
  }
}
