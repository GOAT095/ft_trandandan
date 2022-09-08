import { ConfigService } from "@nestjs/config";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
export declare class twoFactorAuthenticatorService {
    private readonly usersService;
    private readonly configService;
    constructor(usersService: UserService, configService: ConfigService);
    generateTwoFactorAuthenticationSecret(user: User): Promise<{
        secret: string;
        otpauthurl: string;
    }>;
    pipeQrCodeStream(stream: Response, otpauthUrl: string): Promise<any>;
}
