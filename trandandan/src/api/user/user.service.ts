import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import {CreateUserDto} from '../dto/user.dto'
import { UserStatus } from './user.status.enum';

@Injectable()
export class UserService {
    @InjectRepository(User)
    private readonly repository: Repository<User>;

    public getUser(id: number):Promise<User>
    {
        return this.repository.findOne({where:{id}});
    }
    public createUser(body: CreateUserDto): Promise<User> {
        const user: User = new User();
    
        user.name = body.name;
        user.avatar = body.avatar;
        user.status = UserStatus.online;
        return this.repository.save(user);
      }
}
