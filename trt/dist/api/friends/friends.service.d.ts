import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
export declare class FriendsService {
    private readonly userService;
    private readonly repository;
    sendFriendRequest(receiverId: Number, sender: User): Promise<FriendrequestEntity>;
    getfriendRequests(user: User): Promise<any>;
}
