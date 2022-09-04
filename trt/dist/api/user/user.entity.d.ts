import { FriendrequestEntity } from "./friend.entity";
import { UserStatus } from "./user.status.enum";
export declare class User {
    id: number;
    name: string;
    avatar: string;
    wins: number;
    losses: number;
    lvl: number;
    status: UserStatus;
    sentFriendrequests: FriendrequestEntity[];
    receivedFriendrequests: FriendrequestEntity[];
}
