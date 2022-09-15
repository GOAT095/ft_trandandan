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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const typeorm_2 = require("typeorm");
const user_status_enum_1 = require("./user.status.enum");
const fs = require("fs");
const jwt_1 = require("@nestjs/jwt");
const bcrypt_1 = require("../utils/bcrypt");
let UserService = class UserService {
    async getUserByid(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async getAllUser() {
        return await this.repository.find();
    }
    async createaccess(d, res) {
        await this.addUserToDB(d);
        const id = await (await this.getUserByid(d.id)).id;
        const twofa = await (await this.getUserByid(d.id)).twoFactor;
        if (!twofa) {
            const payload = { id };
            const accesToken = await this.JwtService.sign(payload);
            console.log(accesToken);
            return accesToken;
        }
        else {
            console.log('2fa');
            res.redirect('http://localhost:3000/2fa/check');
        }
        return;
    }
    async createUser(body) {
        const user = new user_entity_1.User();
        user.id = body.id;
        user.name = body.name;
        user.avatar = body.avatar;
        user.status = user_status_enum_1.UserStatus.online;
        try {
            await this.repository.save(user);
        }
        catch (error) {
            if (error.code === '23505')
                throw new common_1.ConflictException('id already exist !');
        }
        return;
    }
    async addUserToDB(user) {
        const x = await this.getUserByid(user.id);
        if (x) {
            return false;
        }
        const ret = new user_entity_1.User();
        ret.id = user.id;
        ret.name = user.login;
        ret.avatar = user.image_url;
        user.status = user_status_enum_1.UserStatus.online;
        await this.repository.save(ret);
        return true;
    }
    async updateUsername(id, username) {
        const user = await this.getUserByid(id);
        if (!user)
            throw new common_1.NotFoundException(`user with id ${id} not found`);
        if (username) {
            user.name = username;
        }
        await this.repository.save(user);
        return await this.getUserByid(id);
    }
    async removeUser(id) {
        const res = await this.repository.delete(id);
        return res.affected === 1;
    }
    async setTwoFactorAuthenticationSecret(secret, userId) {
        const res = await (0, bcrypt_1.hashPassword)(secret);
        return this.repository.update(userId, {
            twoFactorAuthenticationSecret: res,
        });
    }
    async turnOnTwoFactorAuthentication(userId) {
        return this.repository.update(userId, {
            twoFactor: true,
        });
    }
    async updateavatar(user, file) {
        console.log(file);
        const type = file.mimetype.split('/')[1];
        console.log(type);
        fs.rename(file.path, file.destination + '/' + user.name + '.' + type, (Error) => {
            if (Error)
                throw Error;
        });
        user.avatar = process.env.UPLAOD_PATH + '/' + user.name + '.' + type;
        this.repository.save(user);
        return user;
    }
};
__decorate([
    (0, typeorm_1.InjectRepository)(user_entity_1.User),
    __metadata("design:type", typeorm_2.Repository)
], UserService.prototype, "repository", void 0);
__decorate([
    (0, common_1.Inject)(jwt_1.JwtService),
    __metadata("design:type", jwt_1.JwtService)
], UserService.prototype, "JwtService", void 0);
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "createaccess", null);
UserService = __decorate([
    (0, common_1.Injectable)()
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map