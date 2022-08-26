import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import {CreateUserDto} from '../dto/user.dto'
import { UserStatus } from './user.status.enum';
import { url } from 'inspector';

@Injectable()
export class UserService {
    @InjectRepository(User)
    private readonly repository: Repository<User>;

    public async getUser(id: number):Promise<User>
    {
        return await this.repository.findOne({where:{id}});
    }
    public async getAllUser():Promise<User[]>
    {
        return await this.repository.find();
    }
    public async createUser(body: CreateUserDto): Promise<User> {
        const user: User = new User();
    
        user.name = body.name;
        user.avatar = body.avatar;
        user.status = UserStatus.online;
        return await this.repository.save(user);
      }
    public async addUserToDB(user: any): Promise <boolean>
    {
        // let x  = user.id;
        // if (this.repository.findOne({where:{id : x}}))
        // {
        //     return false;
        // }
        let ret : User = new User();
        ret.id = user.id;
        ret.name = user.login;
        ret.avatar = user.image_url;
        user.status = UserStatus.online;
        console.log(user.status);
        await this.repository.save(ret);
        return true;
    }
}
