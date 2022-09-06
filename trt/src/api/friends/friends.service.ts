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

    async sendFriendRequest(receiverId: Number, sender: User): Promise<FriendrequestEntity>
    {
        console.log("sender"+ sender.id + " receiver"+ receiverId);
        if (receiverId === sender.id)
        {
            throw new ForbiddenException("can't add yourself");
        }
        
        const receiver = await this.userService.getUserByid(Number(receiverId));
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
        const query = await this.repository.find({where:{ "requestReceiver":{id: 5}, FriendStatus:FriendStatus.pending }, relations:['requestSender', 'requestReceiver'] });
        //where("FriendrequestEntity.requestReceiver= :user", {user: user})
        // 
        
        return query;
    }
}
