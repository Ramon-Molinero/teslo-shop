import {v4 as uuid} from 'uuid'

/**
  * @author R.M
  * @version 1.0
  * 
  * @param {Express.Request} req - Objeto de solicitud HTTP.
  * @param {Express.Multer.File} file - Archivo recibido a través de la carga.
  * @param {Function} callback - Función de devolución de llamada para completar el procesamiento del archivo.
  * 
  * @description
  * Este método genera un nombre único para los archivos cargados y define cómo se deben renombrar antes de ser almacenados.
  * 
  * ### Proceso
  * 1. **Validación del Archivo**:
  *    - Comprueba si el archivo existe. Si no se proporciona un archivo, invoca el `callback` con un error y detiene el proceso.
  * 
  * 2. **Generación del Nombre del Archivo**:
  *    - Extrae la extensión del archivo a partir de su tipo MIME.
  *    - Genera un nombre único utilizando `uuid` y lo combina con la extensión para crear un nombre de archivo único.
  * 
  * 3. **Invocación del Callback**:
  *    - Llama al `callback` con el nombre del archivo generado.
  * 
  * @throws {Error} - Si no se proporciona un archivo en la solicitud.
  * 
  * @returns {void}
  */
 
export const renameFile = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if ( !file ) return callback( new Error('No file provided'), false );

    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${ uuid() }.${ fileExtension }`;
    console.log(fileName);
    
    
    callback(null, fileName);


}