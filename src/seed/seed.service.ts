import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'


@Injectable()
export class SeedService {

  /**
    * @author R.M
    * @version 1.1
    *
    * @param {ProductsService} _productsService - Servicio para gestionar productos en la base de datos.
    * @param {Repository<User>} _userRepository - Repositorio de TypeORM asociado a la entidad `User`.
    *
    * @description
    * El constructor inicializa los servicios y repositorios necesarios para manejar las operaciones de datos de productos y usuarios.
    * - **`_productsService`**: Gestiona la lógica de negocio y acceso a datos para productos.
    * - **`_userRepository`**: Gestiona la interacción con la base de datos para los usuarios.
    */

  constructor(
    private readonly _productsService: ProductsService,
    @InjectRepository( User ) private readonly _userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  


  /**
    * @author R.M
    * @version 1.1
    * 
    * @description
    * Este método inicializa los datos de semilla en la base de datos. Realiza las siguientes operaciones:
    * 
    * 1. **Eliminar Tablas Existentes**:
    *    - Llama al método `_deleteTables` para limpiar las tablas de productos y usuarios.
    * 
    * 2. **Insertar Usuarios**:
    *    - Llama al método `_insertUsers` para insertar los usuarios iniciales y devuelve el usuario administrador.
    * 
    * 3. **Insertar Productos**:
    *    - Llama al método `_createProducts2`, utilizando el usuario administrador como referencia.
    * 
    * 4. **Retornar Confirmación**:
    *    - Devuelve un mensaje indicando que el proceso de semilla se completó correctamente.
    * 
    * @returns {Promise<string>} - Mensaje de confirmación indicando que la semilla se ejecutó correctamente.
    */

  async createSeed() {
    this._deleteTables();
    const adminUser = await this._insertUsers();
    await this._createProducts2(adminUser);
    
    return 'Seed executed';
  }



  /**
    * @author R.M
    * @version 1.1
    * 
    * @private
    * 
    * @param {User} user - Usuario administrador que será asociado a los productos creados.
    * 
    * @description
    * Inserta productos iniciales (semillas) en la base de datos, siguiendo estos pasos:
    * 
    * 1. **Obtener Datos de Semilla**:
    *    - Recupera los productos iniciales desde `initialData.products`.
    * 
    * 2. **Crear Promesas de Inserción**:
    *    - Itera sobre los productos y agrega promesas al array `insertPromises` llamando al método `create` del servicio de productos.
    * 
    * 3. **Ejecutar Inserciones**:
    *    - Ejecuta todas las inserciones concurrentemente usando `Promise.all`.
    * 
    * 4. **Confirmar Operación**:
    *    - Imprime en consola el número de productos creados y devuelve `true` al completar el proceso.
    * 
    * @returns {Promise<boolean>} - Indica que los productos se insertaron correctamente.
    */

  private async _createProducts( user: User ) {
    
    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach(product => {
      insertPromises.push( this._productsService.create(product, user) );
    });

    const result = await Promise.all(insertPromises);
    console.log('Products created:', result.length);
    

    return true;
  }





    /**
    * @author R.M
    * @version 1.1
    * 
    * @private
    * 
    * @param {User} user - Usuario administrador que será asociado a los productos creados.
    * 
    * @description
    * Inserta productos iniciales en la base de datos, manejando errores de inserción individualmente.
    * 
    * ### Pasos
    * 
    * 1. **Obtener Productos Semilla**:
    *    - Recupera los datos iniciales de `initialData.products`.
    * 
    * 2. **Insertar Productos**:
    *    - Itera sobre los productos y utiliza el servicio de productos para insertarlos.
    *    - Si ocurre un error en un producto, registra el error en consola pero no detiene el proceso.
    * 
    * 3. **Confirmar Inserciones**:
    *    - Imprime la cantidad de productos creados en la consola.
    * 
    * @returns {Promise<boolean>} - Indica que las inserciones de productos finalizaron correctamente.
    */

   
  private async _createProducts2( user: User ) {
   
    const seedProducts = initialData.products;

    const insertPromises = [];

    for (const product of seedProducts) {
      try {
        const productSeed = await this._productsService.create(product, user)
        
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



  /**
    * @author R.M
    * @version 1.2
    * 
    * @private
    * 
    * @description
    * Inserta usuarios iniciales en la base de datos a partir de los datos proporcionados en `initialData.users`.
    * 
    * ### Pasos:
    * 
    * 1. **Preparar Usuarios**:
    *    - Itera sobre los datos iniciales, separando las contraseñas y generando su hash utilizando `bcrypt`.
    *    - Crea entidades de usuarios con los datos restantes y la contraseña cifrada.
    * 
    * 2. **Guardar Usuarios en la Base de Datos**:
    *    - Inserta las entidades creadas en la base de datos utilizando el método `save` del repositorio.
    * 
    * 3. **Retornar Usuario Administrador**:
    *    - Devuelve el primer usuario creado (generalmente el administrador) para su uso posterior.
    * 
    * ### Seguridad:
    * - Las contraseñas se cifran antes de guardar los usuarios en la base de datos.
    * 
    * @returns {Promise<User>} - El usuario administrador creado.
    * 
    * @throws {InternalServerErrorException} - Si ocurre algún error inesperado durante la creación o el guardado de usuarios.
    */

  private async _insertUsers() {

    const seedUsers = initialData.users;

    const users: User[] = [];

    for (const user of seedUsers) {
      
      let { password, ...rest } = user;
      password = await bcrypt.hashSync( password, 10 );
      
      users.push( this._userRepository.create({ ...rest, password }) );
    }

    const dbUser = await this._userRepository.save(users);

    return dbUser[0];
  }




  /**
    * @author R.M
    * @version 1.0
    * 
    * @private
    * 
    * @description
    * Limpia las tablas de productos y usuarios en la base de datos.
    * 
    * 1. **Eliminar Productos**:
    *    - Llama al método `deleteAllProducts` del servicio de productos para eliminar todos los registros.
    * 
    * 2. **Eliminar Usuarios**:
    *    - Utiliza un `QueryBuilder` para eliminar todos los registros en la tabla de usuarios.
    * 
    * @returns {Promise<void>} - Indica que la operación se completó.
    */

  private async _deleteTables() {
    await this._productsService.deleteAllProducts();

    const queryBuilder = this._userRepository.createQueryBuilder();
    await queryBuilder.delete()
      .where({}) // Elimina todos los registros
      .execute();
  }
}
