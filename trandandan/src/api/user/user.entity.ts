import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn  } from "typeorm";
import { UserStatus } from "./user.status.enum";

@Entity()
export class User{

  @PrimaryGeneratedColumn()
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

  @Column()
  status: UserStatus;
  /*
   * Create and Update Date Columns
   */

//   @CreateDateColumn({ type: 'timestamp' })
//   public createdAt: Date;

//   @UpdateDateColumn({ type: 'timestamp' })
//   public updatedAt: Date;
}