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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const typeorm_2 = require("typeorm");
const user_status_enum_1 = require("./user.status.enum");
let UserService = class UserService {
    async getUserByid(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async getAllUser() {
        return await this.repository.find();
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
        let x = await this.getUserByid(user.id);
        if (x) {
            return false;
        }
        let ret = new user_entity_1.User();
        ret.id = user.id;
        ret.name = user.login;
        ret.avatar = user.image_url;
        user.status = user_status_enum_1.UserStatus.online;
        await this.repository.save(ret);
        return true;
    }
    async updateUsernameAvatar(id, username, avatar) {
        let user = await this.getUserByid(id);
        if (!user)
            throw new common_1.NotFoundException(`user with id ${id} not found`);
        if (username) {
            user.name = username;
        }
        if (avatar) {
            user.avatar = avatar;
        }
        await this.repository.save(user);
        return await this.getUserByid(id);
    }
    async removeUser(id) {
        const res = await this.repository.delete(id);
        return (res.affected === 1);
    }
};
__decorate([
    (0, typeorm_1.InjectRepository)(user_entity_1.User),
    __metadata("design:type", typeorm_2.Repository)
], UserService.prototype, "repository", void 0);
UserService = __decorate([
    (0, common_1.Injectable)()
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map