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

    async saveHistoty(playerOne: User, playerTwo: User, scoreOne: number, scoreTwo: number): Promise<Gamehistoryclass> {
        const game : Gamehistoryclass = new Gamehistoryclass();

        game.playerOne = playerOne;
        game.playerTwo = playerTwo;
        game.scoreOne = scoreOne;
        game.scoreTwo = scoreTwo;
        await this.Gamehistory.save(game);
        return game;
    }
}