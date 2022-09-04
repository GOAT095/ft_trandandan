import { FriendStatus } from "./friend-status.enum";
import { User } from "./user.entity";
export declare class FriendrequestEntity {
    id: Number;
    FriendStatus: FriendStatus;
    requestSender: User;
    requestReceiver: User;
}
