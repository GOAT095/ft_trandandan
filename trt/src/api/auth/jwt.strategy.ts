import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt.payload.interface';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { request } from 'http';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (request: any) => {
      //     const data = request?.headers.cookie;
      //     if (!data) {
      //       return null;
      //     }
      //     const res = data
      //       .split(';')
      //       .find((c: string) => c.trim().startsWith('auth-cookie='));
      //     if (res)return res.split('=')[1]; // after auth-cookie= is the token needed
      //     return null;
      //   },
        
      // ]),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
