import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { ValidRoles } from 'src/auth/interfaces';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get<ValidRoles[]>(META_ROLES, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if(!user ) throw new BadRequestException('User not found');
    
    if(!validRoles) return true;

    const userRole = user.roles.some((role: string) => validRoles.includes(role));
    
    if(!userRole) throw new ForbiddenException(`User ${user.fullName} with roles: ${user.roles}, need a role: ${validRoles}`);
   
    return true;
  }
}
