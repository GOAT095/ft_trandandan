import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../auth/get-user.decorator";
import { FriendrequestEntity } from "./friend.entity";
import { User } from "../user/user.entity";
import { FriendsService } from "./friends.service";
import { UserService } from "../user/user.service";

@UseGuards(AuthGuard())
@Controller("friends")
export class FriendsController {
  @Inject(FriendsService)
  private readonly friendService: FriendsService;
  @Inject(UserService)
  private readonly service: UserService;

  @Post("sendRequest/:receiverId")
  async sendFriendRequest(
    @Param("receiverId", ParseIntPipe) receiverId: number,
    @GetUser() user: User
  ): Promise<FriendrequestEntity> {
    return this.friendService.sendFriendRequest(receiverId, user);
  }

  @Get("getfriendrequests")
  async getfriendRequests(@GetUser() user: User): Promise<any> {
    return await this.friendService.getfriendRequests(user);
  }

  @Post("acceptRequest/:id")
  async acceptFriendRequest(
    @Param("id", ParseIntPipe) requstId: number,
    @GetUser() user: User
  ): Promise<boolean> {
    return this.friendService.acceptFriendRequest(requstId, user);
  }

  @Post("declineRequest/:id")
  async declinetFriendRequest(
    @Param("id", ParseIntPipe) requstId: number,
    @GetUser() user: User
  ): Promise<boolean> {
    return this.friendService.declineFriendRequest(requstId, user);
  }

  @Get("friends")
  async getMyFriends(@GetUser() user: User): Promise<FriendrequestEntity[]> {
    return this.friendService.getMyFriends(user);
  }

  @Get("getAllrequests")
  async getAllRequestsForDebugging(): Promise<FriendrequestEntity[]> {
    return await this.friendService.getAllRequestsForDebugging();
  }
}
