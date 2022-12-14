import { isNotEmpty, IsNotEmpty } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { FriendStatus } from './friend-status.enum';
import { User } from '../user/user.entity';

@Entity('friends')
export class FriendrequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'pending' })
  public FriendStatus: FriendStatus;

  @ManyToOne(() => User, (User) => User.sentFriendrequests, {onDelete: 'CASCADE'})
  requestSender: User;

  @ManyToOne(() => User, (User) => User.receivedFriendrequests, {onDelete: 'CASCADE'})
  requestReceiver: User;
}
