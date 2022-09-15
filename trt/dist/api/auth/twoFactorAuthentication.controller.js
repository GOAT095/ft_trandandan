"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorAuthenticationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const user_entity_1 = require("../user/user.entity");
const user_service_1 = require("../user/user.service");
const get_user_decorator_1 = require("./get-user.decorator");
const twoFactorAuthentication_service_1 = require("./twoFactorAuthentication.service");
let TwoFactorAuthenticationController = class TwoFactorAuthenticationController {
    constructor(twoFactorAuthenticationService) {
        this.twoFactorAuthenticationService = twoFactorAuthenticationService;
    }
    async checkTwoFactorAuthentication(user, twoFactorAuthenticationCode) {
        console.log(twoFactorAuthenticationCode);
        if (this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, user)) {
            const payload = { id: user.id };
            const accesToken = await this.JwtService.sign(payload);
            console.log(accesToken);
            return accesToken;
        }
        throw new common_1.UnauthorizedException('wrong 2fa authentication code');
    }
    async register(response, user) {
        const { otpauthurl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthurl);
    }
    async turnOnTwoFactorAuthentication(user, twoFactorAuthenticationCode) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode['code'], user);
        if (!isCodeValid) {
            throw new common_1.UnauthorizedException('Wrong authentication code');
        }
        await this.usersService.turnOnTwoFactorAuthentication(user.id);
    }
    async turnOffTwoFactorAuthentication(user) {
        await this.usersService.turnOffTwoFactorAuthentication(user.id);
    }
};
__decorate([
    (0, common_1.Inject)(jwt_1.JwtService),
    __metadata("design:type", jwt_1.JwtService)
], TwoFactorAuthenticationController.prototype, "JwtService", void 0);
__decorate([
    (0, common_1.Inject)(user_service_1.UserService),
    __metadata("design:type", user_service_1.UserService)
], TwoFactorAuthenticationController.prototype, "usersService", void 0);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Post)('check'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthenticationController.prototype, "checkTwoFactorAuthentication", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Response, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthenticationController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Post)('turn-on'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthenticationController.prototype, "turnOnTwoFactorAuthentication", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Post)('turn-off'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthenticationController.prototype, "turnOffTwoFactorAuthentication", null);
TwoFactorAuthenticationController = __decorate([
    (0, common_1.Controller)('2fa'),
    __metadata("design:paramtypes", [twoFactorAuthentication_service_1.twoFactorAuthenticatorService])
], TwoFactorAuthenticationController);
exports.TwoFactorAuthenticationController = TwoFactorAuthenticationController;
//# sourceMappingURL=twoFactorAuthentication.controller.js.map