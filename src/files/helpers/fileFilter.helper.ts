

/**
  * @author R.M
  * @version 1.0
  * 
  * @param {Express.Request} req - Objeto de solicitud HTTP.
  * @param {Express.Multer.File} file - Archivo recibido a través de la carga.
  * @param {Function} callback - Función de devolución de llamada para completar la validación del archivo.
  * 
  * @description
  * Este método actúa como un filtro para determinar si un archivo es válido y debe ser procesado durante la carga.
  * 
  * ### Proceso
  * 1. **Validación del Archivo**:
  *    - Comprueba si el archivo existe. Si no se proporciona un archivo, invoca el `callback` con un error y detiene el proceso.
  * 
  * 2. **Extracción de la Extensión**:
  *    - Obtiene la extensión del archivo a partir de su tipo MIME.
  * 
  * 3. **Validación de Extensiones Permitidas**:
  *    - Define un conjunto de extensiones permitidas: `jpg`, `jpeg`, `png`, `gif`.
  *    - Si la extensión del archivo está dentro de las extensiones permitidas, invoca el `callback` con `null` y `true`.
  * 
  * 4. **Rechazo de Archivos No Permitidos**:
  *    - Si la extensión no es válida, invoca el `callback` con `null` y `false`, indicando que el archivo no debe procesarse.
  * 
  * @throws {Error} - Si no se proporciona un archivo en la solicitud.
  * 
  * @returns {void}
  */
 
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if ( !file ) return callback( new Error('No file provided'), false );

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if ( validExtensions.includes(fileExtension) ) return callback( null, true );
    
    callback(null, false);


}