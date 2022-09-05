import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { FriendStatus } from './friend-status.enum';

@Injectable()
export class FriendsService {

    @Inject(UserService)
    private readonly userService: UserService;
    
    async sendFriendRequest(receiverId: Number, sender: User): Promise<FriendrequestEntity>
    {
        if (receiverId === sender.id)
            throw new ForbiddenException("can't add yourself");
        
        const receiver = await this.userService.getUserByid(Number(receiverId));
        const frindrequest: FriendrequestEntity = new FriendrequestEntity();
        frindrequest.requestSender = sender;
        frindrequest.requestReceiver = receiver;
        frindrequest.FriendStatus = FriendStatus.pending;
        // console.log(frindrequest);
        
        return frindrequest;
    }
}
