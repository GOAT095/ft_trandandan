import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendrequestEntity } from "./friend.entity";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { FriendStatus } from "./friend-status.enum";
import { Repository } from "typeorm";

@Injectable()
export class FriendsService {
  @Inject(UserService)
  private readonly userService: UserService;

  @InjectRepository(FriendrequestEntity)
  private readonly repository: Repository<FriendrequestEntity>;

  async sendFriendRequest(
    receiverId: number,
    sender: User
  ): Promise<FriendrequestEntity> {
    // console.log("sender "+ sender.id + " receiver "+ receiverId);
    if (receiverId == Number(sender.id)) {
      throw new ConflictException("can't add yourself");
    }

    const query = await this.repository.find({
      where: {
        requestSender: { id: sender.id },
        requestReceiver: { id: receiverId },
        FriendStatus: FriendStatus.pending,
      },
      relations: ["requestSender", "requestReceiver"],
    });
    // console.log(query);
    if (query.length != 0) {
      throw new ConflictException("friend request already sent");
    }
    const receiver = await this.userService.getUserByid(Number(receiverId));
    const friendrequest: FriendrequestEntity = new FriendrequestEntity();

    friendrequest.requestSender = sender;
    friendrequest.requestReceiver = receiver;
    // console.log(frindrequest);
    await this.repository.save(friendrequest);
    return friendrequest;
  }

  async getfriendRequests(user: User): Promise<any> {
    // const query = await this.repository.find({relations:['requestSender', 'requestReceiver'] })
    const query = await this.repository.find({
      where: {
        requestReceiver: { id: user.id },
        FriendStatus: FriendStatus.pending,
      },
      relations: ["requestSender", "requestReceiver"],
    });
    //where("FriendrequestEntity.requestReceiver= :user", {user: user})
    //
    return query;
  }

  async acceptFriendRequest(
    requstId: number,
    receiver: User
  ): Promise<boolean> {
    const friendRequst = await this.repository.findOne({
      where: { id: requstId, FriendStatus: FriendStatus.pending },
      relations: ["requestSender", "requestReceiver"],
    });
    if (friendRequst) {
      friendRequst.FriendStatus = FriendStatus.accepted;
      this.repository.save(friendRequst);
      return true;
    }
    return false;
  }

  async declineFriendRequest(
    requstId: number,
    receiver: User
  ): Promise<boolean> {
    const friendRequst = await this.repository.findOne({
      where: [{ id: requstId, FriendStatus: FriendStatus.pending }],
      relations: ["requestSender", "requestReceiver"],
    });
    if (friendRequst) {
      friendRequst.FriendStatus = FriendStatus.declined;
      this.repository.save(friendRequst);
      return true;
    }
    return false;
  }

  async getMyFriends(user: User): Promise<FriendrequestEntity[]> {
    // const all = this.getAllRequestsForDebugging();
    // user.id =
    return await this.repository.find({
      where: [
        { requestReceiver: {id:user.id}, FriendStatus: FriendStatus.accepted },
        { requestSender: {id:user.id}, FriendStatus: FriendStatus.accepted },
      ],
      relations: ["requestSender", "requestReceiver"],
    });
  }

  async getAllRequestsForDebugging(): Promise<FriendrequestEntity[]> {
    return await this.repository.find({
      relations: ["requestSender", "requestReceiver"],
    });
  }
}
