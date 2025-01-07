import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


/**
  * @author R.M
  * @version 1.0
  *
  * @description
  * Este decorador personalizado `GetUserDecorator` permite acceder al objeto de usuario en el contexto de la solicitud HTTP.
  * Además, ofrece la posibilidad de recuperar un atributo específico del usuario si se proporciona un argumento (`data`).
  *
  * ### Lógica de Funcionamiento
  * 1. **Obtener la Solicitud**:
  *    - Utiliza `ExecutionContext` para extraer el objeto de solicitud HTTP.
  *
  * 2. **Validar la Presencia del Usuario**:
  *    - Verifica si el objeto de usuario está presente en la solicitud.
  *    - Si no se encuentra, lanza una excepción `InternalServerErrorException` indicando que el usuario no está disponible.
  *
  * 3. **Retornar el Usuario o un Atributo Específico**:
  *    - Si se proporciona un argumento en `data`, devuelve el valor correspondiente al atributo especificado del usuario.
  *    - Si no se proporciona `data`, retorna el objeto completo del usuario.
  *
  * 
  * @param {string} [data] - Nombre del atributo del usuario que se desea recuperar (opcional).
  * @param {ExecutionContext} ctx - Contexto de ejecución que proporciona acceso a la solicitud HTTP.
  *
  * 
  * @returns {any} - El objeto completo del usuario o el valor del atributo solicitado.
  *
  * @throws {InternalServerErrorException} - Si el objeto de usuario no está presente en la solicitud.
  */
 
export const GetUserDecorator = createParamDecorator(
    (data, ctx: ExecutionContext) => {

        const request = ctx.switchToHttp().getRequest();
        const { user } = request;

        if(!user) throw new InternalServerErrorException('User not found in request object');

        return data ? user[data] : user;
        
    }
)
