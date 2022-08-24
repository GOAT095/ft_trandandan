import { UserStatus } from "./user.status.enum";
export declare class User {
    id: number;
    name: string;
    avatar: string;
    wins: number;
    losses: number;
    lvl: number;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}
