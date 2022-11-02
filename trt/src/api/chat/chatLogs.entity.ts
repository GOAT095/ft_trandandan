import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity";
import { Room } from "./room.entity";
@Entity("chatLogs") // the chatLogs what would be on a room and stocked on db
export class chatLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string; // can use email

  @Column() //text li ktab l user
  message: string; //1 message

  @CreateDateColumn()
  createdAt: Date; // for date/time at input of the text

  @ManyToOne(() => Room, (Room) => Room.chatLog) // each room has its onw chat log
  room: Room;
}
