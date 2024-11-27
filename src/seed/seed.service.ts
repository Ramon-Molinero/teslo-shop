import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/data';


@Injectable()
export class SeedService {

  constructor(
    private readonly _productsService: ProductsService
  ) {}
  

  /**
    * @author R.M
    * @version 1.0
    * 
    * @description
    * Este método `createSeed` gestiona el proceso de inicialización de datos semilla en la base de datos.
    * Llama a un método interno para crear los productos iniciales y retorna un mensaje de confirmación al completar el proceso.
    * 
    * ### Pasos de Ejecución
    * 
    * 1. **Crear Productos Semilla**:
    *    - Llama al método privado `_createProducts2` para gestionar la creación de los productos iniciales en la base de datos.
    * 
    * 2. **Retornar Confirmación**:
    *    - Retorna el mensaje `'Seed created'` para indicar que los datos de semilla se han creado correctamente.
    * 
    * @returns {Promise<string>} - Un mensaje de confirmación indicando que los datos de semilla se han creado.
    * 
    * @throws {Error} - Si ocurre algún error durante el proceso de inicialización de datos, este se manejará dentro de los métodos llamados.
    */
   
  async createSeed() {
    await this._createProducts2();
    
    return 'Seed created';
  }




  /**
    * @author R.M
    * @version 1.0
    * 
    * @private
    * 
    * @description
    * Este método privado `_createProducts` gestiona el proceso de inicialización de productos en la base de datos. 
    * Se encarga de eliminar los productos existentes y luego insertar una lista de productos iniciales (semillas).
    * 
    * ### Pasos de Ejecución
    * 
    * 1. **Eliminar Productos Existentes**:
    *    - Llama al método `deleteAllProducts` del servicio de productos (`_productsService`) para limpiar la base de datos antes de insertar los productos iniciales.
    * 
    * 2. **Preparar Datos de Semilla**:
    *    - Recupera la lista de productos iniciales desde `initialData.products`.
    * 
    * 3. **Crear Promesas de Inserción**:
    *    - Itera sobre los productos iniciales utilizando `forEach` y agrega una promesa al array `insertPromises` para cada producto, llamando al método `create` del servicio de productos.
    * 
    * 4. **Ejecutar Inserciones Concurrentemente**:
    *    - Utiliza `Promise.all` para ejecutar todas las promesas de inserción de manera concurrente.
    *    - Al completar las inserciones, imprime en la consola la cantidad de productos creados.
    * 
    * 5. **Retornar Resultado**:
    *    - Devuelve un valor booleano (`true`) para indicar que el proceso de inicialización de productos se completó con éxito.
    * 
    * @returns {Promise<boolean>} - Indica que el proceso de inicialización de productos ha finalizado con éxito.
    * 
    * @throws {Error} - Cualquier error durante el proceso de eliminación o creación se manejará dentro de los métodos correspondientes.
    */
   
  private async _createProducts() {
    await this._productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach(product => {
      insertPromises.push( this._productsService.create(product) );
    });

    const result = await Promise.all(insertPromises);
    console.log('Products created:', result.length);
    

    return true;
  }




  /**
    * @author R.M
    * @version 1.0
    * 
    * @private
    * 
    * @description
    * Este método privado `_createProducts2` se encarga de insertar una lista de productos iniciales (semillas) en la base de datos.
    * La lógica sigue los siguientes pasos:
    * 
    * 1. **Obtener Datos de Semilla**:
    *    - Recupera los datos iniciales de productos desde `initialData.products`.
    * 
    * 2. **Procesar e Insertar Productos**:
    *    - Itera sobre los productos iniciales y utiliza el método `create` del servicio de productos (`_productsService`) para intentar insertar cada producto.
    *    - Si un producto se inserta correctamente, se añade a un array de promesas (`insertPromises`).
    *    - Si ocurre un error durante la inserción de un producto, se registra en la consola utilizando `console.warn` sin interrumpir el proceso.
    * 
    * 3. **Esperar Inserción de Todos los Productos**:
    *    - Utiliza `Promise.all` para esperar a que todas las promesas de inserción se completen.
    *    - Calcula la cantidad de productos creados e imprime el resultado en la consola.
    * 
    * 4. **Retornar Resultado**:
    *    - Devuelve un valor booleano (`true`) para indicar que el proceso de inserción ha finalizado.
    * 
    * @returns {Promise<boolean>} - Indica que el proceso de inserción de productos ha finalizado con éxito.
    * 
    * @throws {Error} - Registra cualquier error encontrado durante la inserción en la consola, pero no detiene el proceso de inserción.
    */
   
  private async _createProducts2() {
    const seedProducts = initialData.products;

    const insertPromises = [];

    for (const product of seedProducts) {
      try {
        const productSeed = await this._productsService.create(product)
        
        if( productSeed ) 
          insertPromises.push( productSeed );

      } catch (error) {
        console.warn(`Error insertando producto: ${product.title}`, error.message);

      }

    }

    const result = await Promise.all(insertPromises);
    console.log('Products created:', result.length);

    return true;
  }
}
