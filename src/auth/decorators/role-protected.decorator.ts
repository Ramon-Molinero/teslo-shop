import { SetMetadata } from '@nestjs/common';

export const META_ROLES = 'roles';

/**
  * @author R.M
  * @version 1.0
  *
  * @description
  * El decorador `RoleProtected` se utiliza para establecer metadatos en un controlador o método, definiendo los roles necesarios para acceder a un recurso protegido.
  * Los roles definidos a través de este decorador pueden ser utilizados por guardias (`Guards`) para verificar si el usuario actual tiene permisos adecuados.
  *
  * ### Lógica de Funcionamiento
  * 1. **Definir Metadatos**:
  *    - Usa `SetMetadata` para asociar una clave específica (`META_ROLES`) con los roles proporcionados como argumentos.
  *
  * 2. **Roles Permitidos**:
  *    - Los roles se pasan como un array de cadenas y se almacenan en los metadatos del método o controlador.
  *
  * 
  * @param {...string[]} args - Lista de roles permitidos que se asociarán al recurso.
  *
  * 
  * @returns {CustomDecorator<string>} - Un decorador personalizado que aplica los metadatos de roles al recurso.
  *
  * ### Uso
  * Este decorador debe combinarse con un guardia (`Guard`) que lea los metadatos y realice la lógica de validación.
  *
  * @example
  * ```typescript
  * @RoleProtected('admin', 'user')
  * @Get('protected')
  * protectedRoute() {
  *   return 'This route is protected by roles';
  * }
  * ```
  */
 
export const RoleProtected = (...args: string[]) => {

    return SetMetadata(META_ROLES, args)
}
