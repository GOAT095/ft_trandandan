import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
export declare class twoFactorAuthenticatorService {
    private readonly usersService;
    constructor(usersService: UserService);
    generateTwoFactorAuthenticationSecret(user: User): Promise<{
        secret: string;
        otpauthurl: string;
    }>;
    pipeQrCodeStream(stream: Response, otpauthUrl: string): Promise<any>;
    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User): boolean;
}
