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


  /**
    * @author R.M
    * @version 1.0
    * 
    * @description
    * Este método `canActivate` es utilizado por un guardia personalizado en NestJS para determinar si un usuario tiene permiso para acceder a un recurso protegido. 
    * Evalúa si el usuario autenticado cumple con los roles necesarios especificados mediante metadatos en el controlador o método correspondiente.
    * 
    * ### Pasos de Ejecución
    * 
    * 1. **Obtener los Roles Válidos**:
    *    - Utiliza el decorador `@SetMetadata` para extraer los roles válidos asociados al controlador o método usando `Reflector`.
    *    - Si no se especifican roles válidos o el array está vacío, permite el acceso (retorna `true`).
    * 
    * 2. **Obtener el Usuario del Request**:
    *    - Recupera el objeto `user` del objeto `request` proporcionado en el contexto de ejecución.
    *    - Si el usuario no existe en el `request`, lanza una excepción `BadRequestException`.
    * 
    * 3. **Validar los Roles del Usuario**:
    *    - Evalúa si alguno de los roles del usuario coincide con los roles válidos especificados.
    *    - Si no hay coincidencias, lanza una excepción `ForbiddenException` con un mensaje detallado sobre los roles requeridos.
    * 
    * 4. **Retornar el Resultado**:
    *    - Si el usuario tiene al menos un rol válido, permite el acceso retornando `true`.
    * 
    * @param {ExecutionContext} context - Contexto de ejecución que contiene el objeto `request` y los metadatos del controlador o método.
    * 
    * @returns {boolean | Promise<boolean> | Observable<boolean>} - `true` si el usuario cumple con los roles requeridos, de lo contrario, lanza una excepción.
    * 
    * @throws {BadRequestException} Si no se encuentra el usuario en el objeto `request`.
    * @throws {ForbiddenException} Si el usuario no tiene al menos un rol válido especificado en los metadatos.
    * 
    * @example
    * ```typescript
    * @UseGuards(AuthGuard(), UserRoleGuard)
    * @SetMetadata('roles', ['admin', 'user'])
    * @Get('protected')
    * getProtectedRoute() {
    *   return 'This route is protected by roles';
    * }
    * ```
    */
   
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get<ValidRoles[]>(META_ROLES, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if(!user ) throw new BadRequestException('User not found');
    
    if(!validRoles || validRoles.length === 0) return true;

    const userRole = user.roles.some((role: string) => validRoles.includes(role));
    
    if(!userRole) throw new ForbiddenException(`User ${user.fullName} with roles: ${user.roles}, need a role: ${validRoles}`);
   
    return true;
  }
  
}
