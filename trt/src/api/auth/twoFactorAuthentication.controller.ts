import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Inject,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { GetUser } from './get-user.decorator';
import { JwtPayload } from './jwt.payload.interface';
import { twoFactorAuthenticatorService } from './twoFactorAuthentication.service';

@Controller('2fa')
//   @UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  @Inject(JwtService)
  private readonly JwtService: JwtService;
  constructor(
    private readonly twoFactorAuthenticationService: twoFactorAuthenticatorService,
  ) {}

  @Inject(UserService)
  private readonly usersService: UserService;

  @UseGuards(AuthGuard())
  @Post('check')
  async checkTwoFactorAuthentication(
    @GetUser() user: User,
    @Body('code') twoFactorAuthenticationCode: string,
  ) {
    console.log(twoFactorAuthenticationCode);
    if (
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        user,
      )
    ) {
      const payload: JwtPayload = { id: user.id };
      const accesToken = await this.JwtService.sign(payload);
      console.log(accesToken);
      return accesToken;
    }
    throw new UnauthorizedException('wrong 2fa authentication code');
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
}
