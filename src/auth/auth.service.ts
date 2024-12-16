import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';

import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {


  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    
    try {
      const { password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this._getJwtToken({ id: user.id })
      };

    } catch (error) {
      this._handleError(error);
      
    }
  }

  async login(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['email', 'password', 'id']
     });
    
     if(!user) throw new UnauthorizedException('Invalid credentials email');
    
     const isPasswordValid = await bcrypt.compare(password, user.password);
    
     if(!isPasswordValid) throw new BadRequestException('Invalid credentials password');
    
     delete user.password;
    
     return {
      ...user,
      // id: user.id,
      token: this._getJwtToken({ id: user.id })
    };
      
  }

  private _getJwtToken( payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  private _handleError(error: any): never {
    console.log(error);

    if(error.code === '23505') throw new BadRequestException('Email already exists');

    if(error.response.statusCode === 401 || error.response.statusCode === 400) 
      throw new UnauthorizedException(error.response.message);

    throw new InternalServerErrorException('Something went wrong, check logs');
  }
 
}
