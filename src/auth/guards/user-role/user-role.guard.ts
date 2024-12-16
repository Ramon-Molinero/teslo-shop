import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isArray } from 'class-validator';
import { Observable } from 'rxjs';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if(!user ) throw new BadRequestException('User not found');
    
    if(!validRoles) return true;

    const userRole = user.roles.some((role: string) => validRoles.includes(role));
    
    if(!userRole) throw new ForbiddenException(`User ${user.fullName} with roles: ${user.roles}, is not allowed to access this resource`);
   
    return true;
  }
}
