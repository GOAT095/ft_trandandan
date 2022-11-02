import { combineLatestInit } from "rxjs/internal/observable/combineLatest";
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
import { user_perm } from "../utils/chat.permision.enum";
import { restriction } from "../utils/restriction.enum";
import { Room } from "./room.entity";
//link between room and user

@Entity("roomUser")
  export class roomUser{
  @PrimaryGeneratedColumn()
  id: number;
  
  @OneToOne(() => User,(User) => User.roomuser)
  user: User;

  @OneToOne(() => Room,(Room) => Room.roomUser)
  room: Room;

  @Column()
  permission: user_perm; // the perm that the user above have towards the room above

  @Column({ default: "NULL"})
  restriction: restriction; // no restriction NULL is set to the property

  @CreateDateColumn()
  restrictedAt: Date; // the date he got restricted

  @Column({default : 0})
  restrictionDuration: number;

}