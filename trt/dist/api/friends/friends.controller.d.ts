import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
export declare class FriendsController {
    private readonly friendService;
    private readonly service;
    sendFriendRequest(receiverId: Number, user: User): Promise<FriendrequestEntity>;
}
