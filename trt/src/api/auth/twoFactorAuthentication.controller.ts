import {
  Controller,
  Post,
  Res,
  UseGuards,
  Inject,
  UnauthorizedException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { GetUser } from './get-user.decorator';
import { JwtPayload } from './jwt.payload.interface';
import { twoFactorAuthenticatorService } from './twoFactorAuthentication.service';

//https://wanago.io/2021/03/08/api-nestjs-two-factor-authentication/
@Controller('2fa')
export class TwoFactorAuthenticationController {
  @Inject(JwtService)
  private readonly JwtService: JwtService;
  constructor(
    private readonly twoFactorAuthenticationService: twoFactorAuthenticatorService,
  ) {}

  @Inject(UserService)
  private readonly usersService: UserService;

  @Post('check')
  async checkTwoFactorAuthentication(
    @Body('code') twoFactorAuthenticationCode: string,
    @Body('token') token: string,
    @Res() res,
  ) {
    //console.log(twoFactorAuthenticationCode);
    // get the user.`id` based on the md5 token
    let user : User;
    let id : number;
    if (token in this.usersService.tokens) {
      id = this.usersService.tokens[token];
      
    }
    else {
      throw new BadRequestException('Invalid token');
    }
    user = await this.usersService.getUserByid(id);
    if (user == null) {
      throw new BadRequestException('Bad token')
    }
    delete this.usersService.tokens[token]; // clean up
    if (
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        user,
      )
    ) {
      const payload: JwtPayload = { id: user.id };
      const accesToken = this.JwtService.sign(payload);
      // console.log(accesToken);
      res.cookie('auth-cookie', accesToken, { httpOnly: false });
      res.send();
      // return accesToken;
    }
    else {
      throw new UnauthorizedException('wrong 2fa authentication code');
    }
  }

  @UseGuards(AuthGuard())
  @Post('generate')
  async register(@Res() response: Response, @GetUser() user: User) {
    const { otpauthurl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        user,
      );

    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthurl,
    );
  }

  @UseGuards(AuthGuard())
  @Post('turn-on')
  async turnOnTwoFactorAuthentication(
    @GetUser() user: User,
    @Body() twoFactorAuthenticationCode: string,
  ) {
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode['code'],
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.turnOnTwoFactorAuthentication(user.id);
  }

  @UseGuards(AuthGuard())
  @Post('turn-off')
  async turnOffTwoFactorAuthentication(@GetUser() user: User) {
    await this.usersService.turnOffTwoFactorAuthentication(user.id);
  }
}
