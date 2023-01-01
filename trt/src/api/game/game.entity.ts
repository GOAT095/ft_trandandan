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


  @ManyToOne('')
  playerOne: User; /** playerOne id **/

  @ManyToOne('')
  playerTwo: User; /** playerTwo id **/

  @Column({default: 0})
  timestamp: Date; /** Timestamp game */
}