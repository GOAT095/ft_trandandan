import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Access_type } from "../utils/acces.type.enum";
import { chatLogs } from "./chatLogs.entity";

@Entity("room")
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelName: string;

  @Column()
  access_type: Access_type

  @Column({ default: null })
  password: string;

  @ManyToMany(() => User, (User) => User.room)
  user: User[];

  @OneToMany(() => chatLogs, (chatLogs) => chatLogs.room) //each chatLogs is made for one room
  chatLog: chatLogs[];
}
