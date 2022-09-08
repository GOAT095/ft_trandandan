import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { authenticator } from "otplib";
import { pathToFileURL } from "url";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { toFileStream } from 'qrcode';

@Injectable()
export class twoFactorAuthenticatorService{

    constructor(private readonly usersService: UserService,
        private readonly configService: ConfigService
    ){}
     async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();
        const otpauthurl = authenticator.keyuri(user.name, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);
        await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
        return{
            secret,
            otpauthurl
        }
    }

     async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
      }
    
}