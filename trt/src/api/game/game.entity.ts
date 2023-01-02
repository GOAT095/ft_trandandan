import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('Game')
export class Gamehistoryclass{
  @PrimaryGeneratedColumn()
  id: number; /** game id **/


  @ManyToOne(() => User, (User) => User.p2, {onDelete: 'CASCADE'})
  playerOne: User; /** playerOne not just id but the all player data btw a achraf**/ 

  @ManyToOne(() => User, (User) => User.p2, {onDelete: 'CASCADE'}) //cascade to delete child if parent is deleted
  playerTwo: User; /** playerTwo  **/

  @Column()
  scoreOne: number;

  @Column()
  scoreTwo: number;
  /** writing : resulat playerOne and playerTwo */
  /** reading : fetch by id  */

  @CreateDateColumn()
  createdDate: Date;
}