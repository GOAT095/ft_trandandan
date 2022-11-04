import { IsNotEmpty } from "class-validator";
import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  Unique,
  ManyToMany,
  JoinTable,
  OneToOne,
} from "typeorm";
import { Room } from "../chat/room.entity";
import { roomUser } from "../chat/roomUser.entity";
import { FriendrequestEntity } from "../friends/friend.entity";
import { Block } from "./block.entity";
import { UserStatus } from "./user.status.enum";

@Entity("user")
export class User {
  @PrimaryColumn()
  @IsNotEmpty()
  id: number;

  @Column({ type: "varchar", length: 120, unique: true })
  name: string;

  @Column({ type: "varchar", length: 120, nullable: true, unique: true })
  email: string;

  @Column({ type: "varchar", length: 254, nullable: true })
  avatar: string;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  lvl: number;

  @Column({ default: "online" })
  status: UserStatus;

  @Column({ default: false })
  twoFactor: boolean;

  @Column({ nullable: true })
  twoFactorAuthenticationSecret: string;

  @Column("int", { array: true, default: [1.0, 0.0, 0.0] })
  Pcolor: number[]; //paddle color for customization

  @OneToMany(
    () => FriendrequestEntity,
    (FriendrequestEntity) => FriendrequestEntity.requestSender
  )
  sentFriendrequests: FriendrequestEntity[];

  @OneToMany(
    () => FriendrequestEntity,
    (FriendrequestEntity) => FriendrequestEntity.requestReceiver
  )
  receivedFriendrequests: FriendrequestEntity[];

  @OneToMany(() => Block, (Block) => Block.blocker)
  blocking: Block[];

  @OneToMany(() => Block, (Block) => Block.blocked)
  blockedby: Block[];

  @ManyToMany(() => Room, (Room) => Room.user)
  @JoinTable() //bidirectionnal (@JoinTable must be only on one side of the relation)
  room: Room[]; //multiple rooms the user can be on

  @OneToOne(() => roomUser, (roomUser) => roomUser.user)
  roomuser: roomUser // link to roomuser table to get all info
}
