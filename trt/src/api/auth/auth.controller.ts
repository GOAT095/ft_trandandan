import { Controller, Get, HttpException, HttpStatus, Inject, Query, Res } from '@nestjs/common';
import Authenticator from 'api42client';
import { UserService } from '../user/user.service';

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
}
