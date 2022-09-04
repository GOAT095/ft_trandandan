import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import {CreateUserDto} from '../dto/user.dto'
import { UserStatus } from './user.status.enum';
import { userInfo } from 'os';
import { FriendrequestEntity } from './friend.entity';

@Injectable()
export class UserService {
    @InjectRepository(User)
    private readonly repository: Repository<User>;
    async getUserByid(id: number):Promise<User>
    {
        return await this.repository.findOne({where:{id}});
    }
     async getAllUser():Promise<User[]>
    {
        return await this.repository.find();
    }

     async createUser(body: CreateUserDto): Promise<User> {
        const user: User = new User();
        
        user.id = body.id;
        user.name = body.name;
        user.avatar = body.avatar;
        user.status = UserStatus.online;
        return await this.repository.save(user);
      }

    async addUserToDB(user: any): Promise <boolean>
    {
        let x  = await this.getUserByid(user.id);
        // console.log(x);
        if(x)
        {
            return false;
        }
        let ret : User = new User();
        ret.id = user.id;
        ret.name = user.login;
        ret.avatar = user.image_url;
        user.status = UserStatus.online;
        await this.repository.save(ret);
        return true;
    }
    async updateUsernameAvatar(id: number, username: string, avatar: string): Promise<User>{
        let user = await this.getUserByid(id);
        if(!user)
            throw new NotFoundException(`user with id ${id} not found`);
        if(username)
        {user.name = username;}
        if(avatar)
        {user.avatar = avatar;}
        await this.repository.save(user);
        return await this.getUserByid(id);
    }
    // async updateUserAvatar(id: number, avatar: string): Promise<User>{
    //     let user = await this.getUserByid(id);
    //     if(!user)
    //         throw new NotFoundException(`user with id ${id} not found`);
    //     if(avatar)
    //     {user.avatar = avatar;}
    //     await this.repository.save(user);
    //     return await this.getUserByid(id);
    // }
    async removeUser(id: number): Promise<boolean> {
        
        const res = await this.repository.delete(id);
        return (res.affected === 1);
      }
    async sendFriendRequest(receiverId: Number, sender: User): Promise<FriendrequestEntity>
    {
        if (receiverId === sender.id)
            throw new ForbiddenException("can't add yourself");
        
        const receiver = await this.getUserByid(Number(receiverId));
        const frindrequest: FriendrequestEntity = new FriendrequestEntity();
        frindrequest.requestSender = sender;
        frindrequest.requestReceiver = receiver;
        return frindrequest;
    }
    
}
