import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { diskStorage } from 'multer';
import { Response } from 'express';

import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { renameFile } from './helpers/rename.helper';

@ApiTags('Files - Get And Upload')
@Controller('files')
export class FilesController {

  /**
    * @constructor
    * 
    * @param {FilesService} filesService - Servicio encargado de manejar operaciones relacionadas con archivos, 
    * como almacenamiento, eliminación y recuperación de archivos desde el sistema de almacenamiento.
    * 
    * @param {ConfigService} configService - Servicio proporcionado por `@nestjs/config` para acceder a las variables de configuración 
    * definidas en el entorno. Facilita la obtención de configuraciones específicas necesarias para la funcionalidad del servicio.
    * 
    * @description
    * Este constructor utiliza la inyección de dependencias para acceder a los servicios `FilesService` y `ConfigService`.
    * 
    * - **FilesService**:
    *   - Permite interactuar con los archivos almacenados en el sistema o en servicios externos (por ejemplo, Amazon S3, Google Cloud Storage).
    * 
    * - **ConfigService**:
    *   - Proporciona acceso centralizado a las variables de entorno y configuraciones específicas de la aplicación.
    *   - Facilita el manejo seguro de configuraciones sensibles como credenciales, rutas, o configuraciones de almacenamiento.
    * 
    * Esta combinación asegura que el servicio pueda gestionar archivos de manera eficiente mientras respeta las configuraciones definidas.
    */

  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}




  /**
    * @author R.M
    * @version 1.0
    *
    * @Post('product')
    * 
    * @description
    * Este método permite la carga de un archivo relacionado con un producto. 
    * Utiliza el decorador `@Post` para crear un endpoint que recibe un archivo mediante el uso de `FileInterceptor`.
    * 
    * ### Configuración del Interceptor
    * - **`fileFilter`**: Función personalizada que valida si el archivo cumple con las características permitidas, como tipo MIME o extensión.
    * - **`storage`**:
    *   - **`diskStorage`**: Configuración para guardar los archivos localmente.
    *   - **`destination`**: Define el directorio donde se almacenarán los archivos (`./static/uploads`).
    *   - **`filename`**: Personaliza el nombre del archivo antes de almacenarlo.
    * 
    * @param {Express.Multer.File} file - Archivo cargado a través de la solicitud.
    * 
    * @throws {BadRequestException} Si no se proporciona un archivo válido en la solicitud.
    * 
    * @returns {Object} - Contiene la URL del archivo cargado en el servidor.
    */
   
  @Post('product')
  @ApiOperation({ summary: 'Upload Product File' })
  @ApiResponse({ status: 201, description: 'Product file uploaded', type: Object })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors( 
    FileInterceptor( 'file', { 
      fileFilter: fileFilter,
      storage: diskStorage( {
        destination: './static/uploads',
        filename: renameFile
      } )
    }))
  uploadProductFile(
    @UploadedFile() file: Express.Multer.File
  ) {

    if(!file) throw new BadRequestException('No file provided');
    // console.log(file);

    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;
    
    return { secureUrl };
  }




  /**
    * @author R.M
    * @version 1.0
    *
    * @param {string} imageName - Nombre del archivo que se solicita.
    * @param {Response} res - Objeto de respuesta HTTP proporcionado por Express para manejar la respuesta.
    *
    * @description
    * Este método gestiona la recuperación de archivos estáticos relacionados con productos. El archivo solicitado se identifica a través de un parámetro en la URL (`imageName`) y se devuelve al cliente como respuesta.
    *
    * ### Proceso
    * 1. **Obtener la Ruta del Archivo**:
    *    - Utiliza el método `getStaticProductFiles` del servicio `FilesService` para resolver la ruta local del archivo correspondiente al nombre proporcionado.
    *
    * 2. **Enviar el Archivo**:
    *    - Usa el método `sendFile` del objeto `res` para transmitir el archivo al cliente.
    *
    * @returns {void} - Envía el archivo solicitado en la respuesta HTTP.
    *
    * @throws {BadRequestException} Si el archivo no existe o el nombre proporcionado es inválido (validación realizada en el servicio `FilesService`).
    */
   
  @Get('product/:imageName')
  @ApiOperation({ summary: 'Get Product File' })
  @ApiResponse({ status: 201, description: 'Product file found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  findProductFiles(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getStaticProductFiles(imageName);

    res.sendFile(path);

  }
 
}
