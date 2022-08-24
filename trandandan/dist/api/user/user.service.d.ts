import { User } from './user.entity';
import { CreateUserDto } from '../dto/user.dto';
export declare class UserService {
    private readonly repository;
    getUser(id: number): Promise<User>;
    createUser(body: CreateUserDto): Promise<User>;
}
