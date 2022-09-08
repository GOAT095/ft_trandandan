import {ClassSerializerInterceptor,Controller,Post,UseInterceptors,Res,UseGuards,} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.entity';
import { GetUser } from './get-user.decorator';
  import { twoFactorAuthenticatorService } from './twoFactorAuthentication.service';
   
  @Controller('2fa')
  @UseInterceptors(ClassSerializerInterceptor)
  export class TwoFactorAuthenticationController {
    constructor(
        
      private readonly twoFactorAuthenticationService: twoFactorAuthenticatorService,
    ) {}

    
    @UseGuards(AuthGuard())
    @Post('generate')
    async register(@Res() response: Response, @GetUser() user: User) {
      const { otpauthurl }  = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
   
      return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthurl);
    }
  }