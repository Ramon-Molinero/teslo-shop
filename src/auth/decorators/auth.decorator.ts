import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';


/**
  * @author R.M
  * @version 1.0
  * 
  * @function Auth
  * 
  * @param {...ValidRoles[]} roles - Lista de roles válidos que se espera que un usuario tenga para acceder a un recurso protegido.
  * 
  * @description
  * Este decorador combina varias funcionalidades de protección de rutas en una sola función, utilizando decoradores personalizados y guards. 
  * Su propósito es restringir el acceso a rutas según los roles y la autenticación del usuario.
  * 
  * ### Composición:
  * - **RoleProtected**:
  *   - Un decorador personalizado que establece los roles requeridos para acceder al recurso.
  * - **UseGuards**:
  *   - Aplica los guards `AuthGuard` y `UserRoleGuard` para verificar que:
  *     - El usuario esté autenticado (manejado por `AuthGuard`).
  *     - El usuario tenga los roles necesarios (manejado por `UserRoleGuard`).
  * 
  * ### Uso:
  * Este decorador puede aplicarse directamente a los controladores o métodos para protegerlos con una lógica de autenticación y autorización basada en roles.
  * 
  * @example
  * ```typescript
  * @Auth('admin', 'user')
  * @Get('protected-route')
  * getProtectedData() {
  *   return { message: 'Access granted' };
  * }
  * ```
  * 
  * @returns {Function} - Una función que aplica los decoradores `RoleProtected` y `UseGuards` a un controlador o método.
  */
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected( ...roles ),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}