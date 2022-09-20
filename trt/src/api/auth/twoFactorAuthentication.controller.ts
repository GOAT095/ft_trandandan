import {
  Controller,
  Post,
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

@UseGuards(AuthGuard())
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

  @Post('check')
  async checkTwoFactorAuthentication(
    @GetUser() user: User,
    @Body('code') twoFactorAuthenticationCode: string,
    @Res() res,
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
      // console.log(accesToken);
      res.cookie('auth-cookie', accesToken, { httpOnly: true });
      // return accesToken;
    }
    throw new UnauthorizedException('wrong 2fa authentication code');
  }

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

  @Post('turn-off')
  async turnOffTwoFactorAuthentication(@GetUser() user: User) {
    await this.usersService.turnOffTwoFactorAuthentication(user.id);
  }
}
