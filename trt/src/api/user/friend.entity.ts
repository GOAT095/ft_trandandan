import { IsNotEmpty } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn  } from "typeorm";


@Entity()
export class Friends{

  @PrimaryColumn()
  @IsNotEmpty()
  public sender: number;


  @IsNotEmpty()
  public receiver: number;

  @Column({default: "pending"})
  public FriendStatus: string;

}