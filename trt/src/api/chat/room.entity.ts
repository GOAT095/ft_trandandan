import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Chat } from "./chat.entity";

@Entity("room")
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelName: string;

  @Column({ default: null })
  password: string;

  @ManyToOne(() => User, (User) => User.room)
  user: User;

  @OneToOne(() => Chat, (Chat) => Chat.room) //each chat is made for one room
  chat: Chat;
}
