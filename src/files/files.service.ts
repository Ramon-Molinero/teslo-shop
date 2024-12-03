import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {
  
  /**
    * @author R.M
    * @version 1.0
    * 
    * @param {string} imgName - Nombre del archivo de imagen solicitado.
    * 
    * @description
    * Este método localiza un archivo de imagen en el sistema de archivos a partir del nombre proporcionado. Si el archivo no existe en la ruta esperada, lanza una excepción.
    * 
    * ### Proceso
    * 1. **Construcción de la Ruta**:
    *    - Combina la ruta base con el directorio estático (`static/uploads`) y el nombre del archivo (`imgName`) usando `join`.
    * 
    * 2. **Validación de Existencia**:
    *    - Comprueba si el archivo existe en la ruta construida utilizando `existsSync`.
    * 
    * 3. **Excepción en Caso de Inexistencia**:
    *    - Si el archivo no existe, lanza una excepción `BadRequestException` con un mensaje adecuado.
    * 
    * 4. **Devolver la Ruta**:
    *    - Si el archivo existe, devuelve la ruta completa del archivo.
    * 
    * @returns {string} - Ruta completa del archivo en el sistema.
    * 
    * @throws {BadRequestException} - Si el archivo no se encuentra en la ruta especificada.
    */
   
  getStaticProductFiles( imgName: string) {
      const path = join(__dirname, '..', '..', 'static', 'uploads', imgName);
      if( !existsSync(path) ) throw new BadRequestException('File not found');
    return path;
  }
}
