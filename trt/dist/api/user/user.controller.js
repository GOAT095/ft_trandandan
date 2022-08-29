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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_dto_1 = require("../dto/user.dto");
const user_service_1 = require("./user.service");
const api42client_1 = require("api42client");
let UserController = class UserController {
    async getauthedUser(code) {
        var app = new api42client_1.default(process.env.clientID, process.env.clientSecret, process.env.callbackURL);
        var data = await app.get_Access_token(code);
        let d = await app.get_user_data(data.access_token).then((data));
        if (!(await this.service.addUserToDB(d))) {
            return "user already exists !";
        }
        return "Hello " + JSON.stringify(d.login);
    }
    getUser(id) {
        return this.service.getUserByid(id);
    }
    getAllUsers() {
        return this.service.getAllUser();
    }
    createUser(body) {
        return this.service.createUser(body);
    }
    async updateUsername(id, name, avatar) {
        const username = name;
        return await this.service.updateUsername(id, username, avatar);
    }
    async removeUser(id) {
        return this.service.removeUser(id);
    }
};
__decorate([
    (0, common_1.Inject)(user_service_1.UserService),
    __metadata("design:type", user_service_1.UserService)
], UserController.prototype, "service", void 0);
__decorate([
    (0, common_1.Get)('redirect'),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getauthedUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)(':id/update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('avatar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUsername", null);
__decorate([
    (0, common_1.Patch)(':id/avatar'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "removeUser", null);
UserController = __decorate([
    (0, common_1.Controller)('user')
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map