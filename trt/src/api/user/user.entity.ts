import { IsNotEmpty } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany  } from "typeorm";
import { Friends } from "./friend.entity";
import { UserStatus } from "./user.status.enum";

@Entity()
export class User{

  @PrimaryColumn()
  @IsNotEmpty()
  public id: number;

  @Column({ type: 'varchar', length: 120 })
  public name: string;

  @Column({type: 'varchar', length: 254})
  public avatar: string;

  @Column({default:0})
  public wins:number;

  @Column({default:0})
  public losses:number;

  @Column({default:0})
  public lvl:number;

  @Column({default:"online"})
  status: UserStatus;

  @OneToMany(() => Friends, (friends) => friends.requestSender)
  sentFriendrequests: Friends[];

  @OneToMany(() => Friends, (friends) => friends.requestReceiver)
  receivedFriendrequests: Friends[];
  /*
   * Create and Update Date Columns
   */

//   @CreateDateColumn({ type: 'timestamp' })
//   public createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamp' })
//   public updatedAt: Date;
}