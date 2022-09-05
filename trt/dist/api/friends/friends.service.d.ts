import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
export declare class FriendsService {
    private readonly userService;
    sendFriendRequest(receiverId: Number, sender: User): Promise<FriendrequestEntity>;
}
