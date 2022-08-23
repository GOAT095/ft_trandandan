import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn  } from "typeorm";

@Entity()
export class User{

  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar', length: 120 })
  public name: string;


  @Column({ type: 'boolean', default: false })
  public isDeleted: boolean;

  @Column({type: 'varchar', length: 254})
  public avatar: string;

  @Column()
  public wins:number;

  @Column()
  public losses:number;

  @Column()
  public lvl:number;

  @Column({type: 'varchar', length:20})
  public status: string;
  /*
   * Create and Update Date Columns
   */

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}