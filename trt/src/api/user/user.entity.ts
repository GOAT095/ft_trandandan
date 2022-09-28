import { IsNotEmpty } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { FriendrequestEntity } from '../friends/friend.entity';
import { UserStatus } from './user.status.enum';

@Entity('user')
export class User {
  @PrimaryColumn()
  @IsNotEmpty()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 120, nullable: true})
  email: string;

  @Column({ type: 'varchar', length: 254, nullable: true})
  avatar: string;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  lvl: number;

  @Column({ default: 'online' })
  status: UserStatus;

  @Column({ default: false })
  twoFactor: boolean;

  @Column({ nullable: true })
  twoFactorAuthenticationSecret: string;

  @OneToMany(
    () => FriendrequestEntity,
    (FriendrequestEntity) => FriendrequestEntity.requestSender,
  )
  sentFriendrequests: FriendrequestEntity[];

  @OneToMany(
    () => FriendrequestEntity,
    (FriendrequestEntity) => FriendrequestEntity.requestReceiver,
  )
  receivedFriendrequests: FriendrequestEntity[];
  /*
   * Create and Update Date Columns
   */

  //   @CreateDateColumn({ type: 'timestamp' })
  //   public createdAt: Date;

  //   @UpdateDateColumn({ type: 'timestamp' })
  //   public updatedAt: Date;
}
