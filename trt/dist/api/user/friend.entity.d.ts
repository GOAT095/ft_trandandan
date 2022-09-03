import { User } from "./user.entity";
export declare class Friends {
    id: Number;
    FriendStatus: string;
    requestSender: User;
    requestReceiver: User;
}
