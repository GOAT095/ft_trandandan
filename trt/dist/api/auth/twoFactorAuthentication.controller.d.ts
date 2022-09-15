import { User } from '../user/user.entity';
import { twoFactorAuthenticatorService } from './twoFactorAuthentication.service';
export declare class TwoFactorAuthenticationController {
    private readonly twoFactorAuthenticationService;
    private readonly JwtService;
    constructor(twoFactorAuthenticationService: twoFactorAuthenticatorService);
    private readonly usersService;
    checkTwoFactorAuthentication(user: User, twoFactorAuthenticationCode: string): Promise<string>;
    register(response: Response, user: User): Promise<any>;
    turnOnTwoFactorAuthentication(user: User, twoFactorAuthenticationCode: string): Promise<void>;
}
