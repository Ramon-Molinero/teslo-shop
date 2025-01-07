import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


/**
  * @author R.M
  * @version 1.0
  *
  * @description
  * El decorador personalizado `RawHeadersDecorator` permite acceder a los encabezados brutos (`rawHeaders`) de una solicitud HTTP.
  * Este decorador se puede usar para obtener la lista completa de encabezados tal como se recibieron en la solicitud.
  *
  * ### Lógica de Funcionamiento
  * 1. **Obtener la Solicitud**:
  *    - Utiliza `ExecutionContext` para extraer el objeto de solicitud HTTP.
  *
  * 2. **Validar la Presencia de Raw Headers**:
  *    - Verifica si los encabezados brutos (`rawHeaders`) están disponibles en la solicitud.
  *    - Si no están presentes, lanza una excepción `InternalServerErrorException` indicando que no se encontraron encabezados.
  *
  * 3. **Retornar los Raw Headers**:
  *    - Devuelve el contenido completo de `rawHeaders` tal como aparece en la solicitud.
  *
  * 
  * @param {any} [data] - No es utilizado en este decorador.
  * @param {ExecutionContext} ctx - Contexto de ejecución que proporciona acceso a la solicitud HTTP.
  *
  * 
  * @returns {string[]} - Una lista de encabezados brutos (`rawHeaders`) de la solicitud.
  *
  * @throws {InternalServerErrorException} - Si los encabezados brutos no están presentes en la solicitud.
  */

export const RawHeadersDecorator = createParamDecorator(
    (data, ctx: ExecutionContext) => {

        const request = ctx.switchToHttp().getRequest();
        const { rawHeaders } = request;

        if(!rawHeaders) throw new InternalServerErrorException('Raw headers not found in request object');

        return rawHeaders;
        
    }
)