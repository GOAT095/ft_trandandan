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
@Entity("chat") // the chat what would be on a room and stocked on db
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string; // can use email

  @Column() //text li ktab l user
  text: string;

  @CreateDateColumn()
  createdAt: Date; // for date/time at input of the text

  @OneToOne(() => Room, (Room) => Room.chat) // each room has onw chat log
  room: Room;
}
