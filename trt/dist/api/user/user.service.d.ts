import { User } from './user.entity';
import { CreateUserDto } from '../dto/user.dto';
export declare class UserService {
    private readonly repository;
    private readonly JwtService;
    getUserByid(id: number): Promise<User>;
    getAllUser(): Promise<User[]>;
    createaccess(d: any, res: any): Promise<string>;
    createUser(body: CreateUserDto): Promise<User>;
    addUserToDB(user: any): Promise<boolean>;
    updateUsername(id: number, username: string): Promise<User>;
    removeUser(id: number): Promise<boolean>;
    setTwoFactorAuthenticationSecret(secret: string, userId: number): Promise<import("typeorm").UpdateResult>;
    turnOnTwoFactorAuthentication(userId: number): Promise<import("typeorm").UpdateResult>;
    updateavatar(user: User, file: any): Promise<User>;
}
