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
exports.FriendsService = void 0;
const common_1 = require("@nestjs/common");
const friend_entity_1 = require("./friend.entity");
const user_service_1 = require("../user/user.service");
const friend_status_enum_1 = require("./friend-status.enum");
let FriendsService = class FriendsService {
    async sendFriendRequest(receiverId, sender) {
        if (receiverId === sender.id)
            throw new common_1.ForbiddenException("can't add yourself");
        const receiver = await this.userService.getUserByid(Number(receiverId));
        const frindrequest = new friend_entity_1.FriendrequestEntity();
        frindrequest.requestSender = sender;
        frindrequest.requestReceiver = receiver;
        frindrequest.FriendStatus = friend_status_enum_1.FriendStatus.pending;
        return frindrequest;
    }
};
__decorate([
    (0, common_1.Inject)(user_service_1.UserService),
    __metadata("design:type", user_service_1.UserService)
], FriendsService.prototype, "userService", void 0);
FriendsService = __decorate([
    (0, common_1.Injectable)()
], FriendsService);
exports.FriendsService = FriendsService;
//# sourceMappingURL=friends.service.js.map