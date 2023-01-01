import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('Game')
export class Gamehistoryclass{
  @PrimaryGeneratedColumn()
  id: number; /** game id **/


  @ManyToOne(() => User, (user) => user.p2, {onDelete: 'CASCADE'})
  playerOne: User; /** playerOne not just id but the all player data btw a achraf**/ 

  @ManyToOne(() => User, (user) => user.p2, {onDelete: 'CASCADE'}) //cascade to delete child if parent is deleted
  playerTwo: User; /** playerTwo  **/

  @CreateDateColumn()
  createdDate: Date
}