import { Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { FriendrequestEntity } from './friend.entity';
import { User } from '../user/user.entity';
import { FriendsService } from './friends.service';
import { UserService } from '../user/user.service';

@Controller('friends')
export class FriendsController {
    
    @Inject(FriendsService)
    private readonly friendService: FriendsService;
    @Inject(UserService)
    private readonly service: UserService;
    
    @UseGuards(AuthGuard())
    @Post('sendRequest/:receiverId')
    async sendFriendRequest(@Param('receiverId') receiverId: number, @GetUser() user: User): Promise <FriendrequestEntity>
      {
        return this.friendService.sendFriendRequest(receiverId, user);
      }
    
    @UseGuards(AuthGuard())
    @Get('getfriendrequests')
    async getfriendRequests(@GetUser() user: User): Promise<any>
    {
      return await this.friendService.getfriendRequests(user);
    }

}
