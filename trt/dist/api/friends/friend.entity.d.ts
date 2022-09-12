import { FriendStatus } from './friend-status.enum';
import { User } from '../user/user.entity';
export declare class FriendrequestEntity {
    id: number;
    FriendStatus: FriendStatus;
    requestSender: User;
    requestReceiver: User;
}
