import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { FriendStatus } from './friend-status.enum';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService {

    @Inject(UserService)
    private readonly userService: UserService;

    @InjectRepository(FriendrequestEntity)
    private readonly repository: Repository<FriendrequestEntity>;

    async sendFriendRequest(receiverId: number, sender: User): Promise<FriendrequestEntity>
    {
        // console.log("sender "+ sender.id + " receiver "+ receiverId);
        if (receiverId == Number(sender.id))
        {
            throw new ForbiddenException("can't add yourself");
        }

        const query = await this.repository
        .find({where:{ "requestSender":{id:sender.id}, 'requestReceiver':{id:receiverId}, FriendStatus:FriendStatus.pending},
         relations:['requestSender', 'requestReceiver'] });
        // console.log(query);
        if(query.length != 0)
        {
            throw new ForbiddenException("friend request already sent");
        }
        const receiver = await this.userService.getUserByid(Number(receiverId))
        const frindrequest: FriendrequestEntity = new FriendrequestEntity();
        
        frindrequest.requestSender = sender;
        frindrequest.requestReceiver = receiver;
        // console.log(frindrequest);
        await this.repository.save(frindrequest);
        return frindrequest;
    }

    async getfriendRequests(user: User): Promise<any>
    {
        // const query = await this.repository.find({relations:['requestSender', 'requestReceiver'] })
        const query = await this.repository
        .find({where:{ "requestReceiver":{id:user.id}, FriendStatus:FriendStatus.pending },
         relations:['requestSender', 'requestReceiver'] });
        //where("FriendrequestEntity.requestReceiver= :user", {user: user})
        //
        return query;
    }


    async acceptFriendRequest(requstId: number, receiver: User): Promise<boolean>
    {
        const friendRequst = await this.repository.findOne({where:{id:requstId, FriendStatus:FriendStatus.pending}, relations:['requestSender', 'requestReceiver']});
        if(friendRequst)
        {
            friendRequst.FriendStatus = FriendStatus.accepted;
            this.repository.save(friendRequst);
            return true;
        }
        return false;
    }
}
