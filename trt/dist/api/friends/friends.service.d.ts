import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
export declare class FriendsService {
    private readonly userService;
    private readonly repository;
    sendFriendRequest(receiverId: number, sender: User): Promise<FriendrequestEntity>;
    getfriendRequests(user: User): Promise<any>;
    acceptFriendRequest(requstId: number, receiver: User): Promise<boolean>;
    declineFriendRequest(requstId: number, receiver: User): Promise<boolean>;
    getAllRequestsForDebugging(): Promise<FriendrequestEntity[]>;
}