import { isNotEmpty, IsNotEmpty } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('Block')
export class Block {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (User) => User.blocking, {onDelete: 'CASCADE'})
  blocker: User;

  @ManyToOne(() => User, (User) => User.blockedby, {onDelete: 'CASCADE'})
  blocked: User;
}