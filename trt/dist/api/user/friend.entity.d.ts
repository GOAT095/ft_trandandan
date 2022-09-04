import { User } from "./user.entity";
export declare class FriendrequestEntity {
    id: Number;
    FriendStatus: string;
    requestSender: User;
    requestReceiver: User;
}
