import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('chat')
export class Chat{
    @PrimaryGeneratedColumn('uuid') //auto generated primary column
    id: number

    @Column()
    username: string // can use email

    @Column()  //text li ktab l user
    text: string

    @CreateDateColumn()
    createdAt: Date; // for date/time at input of the text
}