import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    Res,
  } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { Gamehistoryclass } from "./game.entity";

@Injectable()
export class GameService{
    @Inject(UserService)
    private readonly user: UserService;
    @InjectRepository(Gamehistoryclass)
    private readonly Gamehistory: Repository<Gamehistoryclass>;

    // async saveHistory(id1: number, id2: number, scoreOne: number, scoreTwo: number): Promise<Gamehistoryclass> {
    //     const game : Gamehistoryclass = new Gamehistoryclass();
    //     const playerOne = await this.user.getUserByid(id1);
    //     if (!playerOne) throw new NotFoundException(`user not found`);

    //     const playerTwo = await this.user.getUserByid(id2);
    //     if (!playerTwo) throw new NotFoundException(`user not found`);
    //     game.playerOne = playerOne;
    //     game.playerTwo = playerTwo;
    //     game.scoreOne = scoreOne;
    //     game.scoreTwo = scoreTwo;
    //     await this.Gamehistory.save(game);
    //     return game;
    // }
    // async getUserHistory(user: User): Promise<Gamehistoryclass[]>{

    //     return await this.Gamehistory.find({
    //         where: [
    //           { playerOne: {id:user.id}},
    //           { playerTwo: {id:user.id} },
    //         ],
    //         relations: ["playerOne", "playerTwo"],
    //       });
    // }
}