import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        });
    }

 async validate(payload: JwtPayload): Promise<User> {

    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    
    if(!user) 
        throw new UnauthorizedException(`User with id ${id} not found`);
    
    if(!user.isActive) 
        throw new UnauthorizedException(`User with id ${id} is not active`);
    
    return user;

 }

}