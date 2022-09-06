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
exports.FriendrequestEntity = void 0;
const typeorm_1 = require("typeorm");
const friend_status_enum_1 = require("./friend-status.enum");
const user_entity_1 = require("../user/user.entity");
let FriendrequestEntity = class FriendrequestEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FriendrequestEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "pending" }),
    __metadata("design:type", String)
], FriendrequestEntity.prototype, "FriendStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (User) => User.sentFriendrequests),
    __metadata("design:type", user_entity_1.User)
], FriendrequestEntity.prototype, "requestSender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (User) => User.receivedFriendrequests),
    __metadata("design:type", user_entity_1.User)
], FriendrequestEntity.prototype, "requestReceiver", void 0);
FriendrequestEntity = __decorate([
    (0, typeorm_1.Entity)('friends')
], FriendrequestEntity);
exports.FriendrequestEntity = FriendrequestEntity;
//# sourceMappingURL=friend.entity.js.map