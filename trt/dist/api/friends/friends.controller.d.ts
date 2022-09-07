import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
export declare class FriendsController {
    private readonly friendService;
    private readonly service;
    sendFriendRequest(receiverId: number, user: User): Promise<FriendrequestEntity>;
    getfriendRequests(user: User): Promise<any>;
    acceptFriendRequest(requstId: number, user: User): Promise<boolean>;
}
