import { User } from '../user/user.entity';
import { twoFactorAuthenticatorService } from './twoFactorAuthentication.service';
export declare class TwoFactorAuthenticationController {
    private readonly twoFactorAuthenticationService;
    constructor(twoFactorAuthenticationService: twoFactorAuthenticatorService);
    register(response: Response, user: User): Promise<any>;
}
