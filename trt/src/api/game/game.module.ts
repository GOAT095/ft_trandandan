import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
    imports:[UserService],
    providers:[GameService, GameGateway],
    exports:[GameService],

})
export class GameModule {

}
