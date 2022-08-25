import { CreateUserDto } from '../dto/user.dto';
import { User } from './user.entity';
export declare class UserController {
    private readonly service;
    getauthedUser(code: string): Promise<string>;
    getUser(id: number): Promise<User>;
    getAllUsers(): Promise<User[]>;
    createUser(body: CreateUserDto): Promise<User>;
}
