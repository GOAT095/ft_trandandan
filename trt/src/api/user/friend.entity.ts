import { IsNotEmpty } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn  } from "typeorm";


@Entity()
export class Friends{

  @PrimaryGeneratedColumn()
  requestId: number;

  @IsNotEmpty()
  public sender: number;


  @IsNotEmpty()
  @Column()
  public receiver: number;

  @Column({default: "pending"})
  public FriendStatus: string;
  
}