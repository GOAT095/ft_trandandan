import { User } from './user.entity';
import { twoFactorAuthenticatorService } from './twoFactorAuthentication.service';
export declare class TwoFactorAuthenticationController {
    private readonly twoFactorAuthenticationService;
    constructor(twoFactorAuthenticationService: twoFactorAuthenticatorService);
    private readonly service;
    register(response: Response, user: User): Promise<any>;
}
