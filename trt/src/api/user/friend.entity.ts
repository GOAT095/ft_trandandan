import { IsNotEmpty } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToOne  } from "typeorm";
import { User } from "./user.entity";


@Entity('User')
export class Friends{

  @PrimaryGeneratedColumn()
  id: Number;

  @Column({default: "pending"})
  public FriendStatus: string;
  
  @ManyToOne(() => User , (User) => User.sentFriendrequests)
  requestSender:  User;

  @ManyToOne(() => User , (User) => User.receivedFriendrequests)
  requestReceiver:  User;
}