import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from "passport-jwt";
import { JwtPayload } from "./jwt.payload.interface";
import { User } from "../user/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class JwtStrategy extends  PassportStrategy(Strategy){
    
    constructor(
        @InjectRepository(User)
         private readonly userRepository: Repository<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,

        });
    }
    async validate(payload: JwtPayload): Promise<User>
    {
        const {id} = payload;
        // console.log("id =" + id);
        const user = await this.userRepository.findOne({where:{id}});
        if(!user)
        {
            throw new UnauthorizedException();
        }
        return user;
    }
}