import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

 async validate(payload: JwtPayload): Promise<User> {

    const { email } = payload;

    try {
        
        const user = await this.userRepository.findOneBy({ email });

        if(!user) throw new UnauthorizedException(`User with email ${email} not found`);
        if(!user.isActive) throw new UnauthorizedException(`User with email ${email} is not active`);

       
        return user;


    } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(error.message); 
        
    }

 }

}