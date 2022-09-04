import { IsNotEmpty } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, OneToMany  } from "typeorm";
import { FriendrequestEntity } from "./friend.entity";
import { UserStatus } from "./user.status.enum";

@Entity('user')
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

  @OneToMany(() => FriendrequestEntity, (FriendrequestEntity) => FriendrequestEntity.requestSender)
  sentFriendrequests: FriendrequestEntity[];

  @OneToMany(() => FriendrequestEntity, (FriendrequestEntity) => FriendrequestEntity.requestReceiver)
  receivedFriendrequests: FriendrequestEntity[];
  /*
   * Create and Update Date Columns
   */

//   @CreateDateColumn({ type: 'timestamp' })
//   public createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamp' })
//   public updatedAt: Date;
}