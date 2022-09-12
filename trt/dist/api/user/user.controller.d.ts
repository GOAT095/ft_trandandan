/// <reference types="multer" />
import { CreateUserDto } from '../dto/user.dto';
import { User } from './user.entity';
export declare class UserController {
    private readonly service;
    private readonly JwtService;
    getauthedUser(code: string): Promise<string>;
    getUser(id: number): Promise<User>;
    getAllUsers(): Promise<User[]>;
    uploadFile(file: Express.Multer.File, user: User): Promise<User>;
    createUser(body: CreateUserDto): Promise<string>;
    updateUsernameAvatar(id: number, name: string, avatar: string, user: User): Promise<User>;
    removeUser(id: number, user: User): Promise<boolean>;
}
