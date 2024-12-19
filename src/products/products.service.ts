import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { isUUID } from 'class-validator';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { ProductImage } from './entities/images.entity';

@Injectable()
export class ProductsService {

  private readonly _logger = new Logger('ProductsService');



  /**
    * @constructor
    * 
    * @param {Repository<ProductEntity>} _productRepository - El repositorio de TypeORM asociado a la entidad `ProductEntity`.
    * @param {Repository<ProductImage>} _productImageRepository - El repositorio de TypeORM asociado a la entidad `ProductImage`.
    * @param {DataSource} _dataSource - La instancia de TypeORM `DataSource` utilizada para operaciones avanzadas como transacciones y consultas personalizadas.
    * 
    * @description
    * Este constructor utiliza la inyección de dependencias para acceder a los repositorios de las entidades `ProductEntity` y `ProductImage`, así como a la fuente de datos global.
    * 
    * **Repositorios:**
    * Los repositorios proporcionan métodos para interactuar con la base de datos, tales como:
    * 
    * **Para `ProductEntity`:**
    * - **find**: Recuperar múltiples registros.
    * - **findOne**: Recuperar un registro único basado en ciertos criterios.
    * - **save**: Insertar o actualizar registros.
    * - **remove**: Eliminar registros.
    * - **preload**: Cargar un objeto con nuevas propiedades basadas en un registro existente.
    * 
    * **Para `ProductImage`:**
    * - **find**: Recuperar imágenes asociadas a productos.
    * - **findOne**: Recuperar una imagen específica basada en ciertos criterios.
    * - **save**: Insertar o actualizar imágenes en la base de datos.
    * - **remove**: Eliminar imágenes de la base de datos.
    * 
    * **Fuente de datos (`_dataSource`):**
    * La `DataSource` permite realizar operaciones avanzadas en la base de datos, tales como:
    * - Crear y manejar transacciones con `createQueryRunner`.
    * - Ejecutar consultas SQL personalizadas con `query`.
    * - Acceso directo al gestor de entidades con `manager`.
    * 
    * La inyección de los repositorios y la fuente de datos se realiza mediante el decorador `@InjectRepository` y la configuración de TypeORM, que asocia automáticamente las clases `ProductEntity` y `ProductImage` con sus respectivos repositorios.
    */
  
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _productRepository: Repository<ProductEntity>,

    @InjectRepository(ProductImage)
    private readonly _productImageRepository: Repository<ProductImage>,
    private readonly _dataSource: DataSource
  ) {}




  /**
    * @author R.M
    * @version 1.1
    *
    * @param {CreateProductDto} createProductDto - DTO que contiene los datos necesarios para crear un producto, incluyendo imágenes asociadas.
    *
    * @description
    * Este método se encarga de crear un nuevo producto en la base de datos, siguiendo los siguientes pasos:
    *
    * 1. **Desestructuración de Datos**:
    *    - Se separan las imágenes de los demás detalles del producto para un manejo independiente.
    *
    * 2. **Crear la Instancia del Producto**:
    *    - Utiliza el repositorio para instanciar un nuevo producto basado en los detalles proporcionados por `createProductDto`.
    *    - Crea instancias separadas para cada imagen asociada, usando el repositorio de `ProductImage`.
    *
    * 3. **Guardar el Producto en la Base de Datos**:
    *    - Usa el método `save` del repositorio para insertar el producto junto con las imágenes asociadas en la base de datos.
    *
    * 4. **Retornar el Producto Creado**:
    *    - Devuelve el producto recién creado con las imágenes en su estructura.
    *
    * 5. **Manejo de Errores**:
    *    - Si ocurre algún error durante la creación o el guardado del producto, el método `_handleDBError` se encarga de gestionar la excepción y lanzar un mensaje de error adecuado.
    *
    * @returns {Promise<ProductEntity>} - El producto creado con los datos registrados y las imágenes asociadas.
    *
    * @throws {BadRequestException} Si ocurre un error de clave duplicada o algún dato no válido.
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la creación del producto.
    */
  
  async create(createProductDto: CreateProductDto) {

    const { images = [], ...productDetails } = createProductDto;

    try {
      const product = this._productRepository.create({
        ...productDetails,
        images: images.map(image => this._productImageRepository.create( { url: image } ) )
      });
      await this._productRepository.save(product);


      return { ...product, images};
      
    } catch (error) {
      this._handleDBError(error);
      
    }
    
  }




  /**
    * @author R.M
    * @version 1.0
    *
    * @param {PaginationDTO} paginationDto - DTO que contiene los parámetros de paginación: `limit` y `offset`.
    *
    * @description
    * Este método recupera todos los productos almacenados en la base de datos con soporte de paginación y manejo de relaciones, siguiendo los siguientes pasos:
    *
    * 1. **Desestructuración de Parámetros**:
    *    - Se extraen los valores de `limit` y `offset` del objeto `paginationDto`. Si no se proporcionan, se utilizan valores predeterminados.
    *
    * 2. **Consulta de Productos**:
    *    - Usa el método `find` del repositorio para recuperar los productos, aplicando las restricciones de paginación (`take` y `skip`) y cargando las relaciones asociadas (imágenes) mediante `relations`.
    *
    * 3. **Transformación de Resultados**:
    *    - Mapea los productos recuperados para incluir solo la URL de las imágenes en lugar de toda la información de la relación.
    *
    * 4. **Retornar los Productos**:
    *    - Devuelve la lista de productos con la estructura transformada.
    *
    * 5. **Manejo de Errores**:
    *    - Si ocurre algún error durante la consulta, el método `_handleDBError` se encarga de gestionar la excepción y lanzar un mensaje de error adecuado.
    *
    * @returns {Promise<ProductEntity[]>} - Una lista de productos con sus imágenes asociadas transformadas.
    *
    * @throws {BadRequestException} Si ocurre un error de clave duplicada o algún dato no válido (controlado por `_handleDBError`).
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la consulta (controlado por `_handleDBError`).
    */
  
  async findAll( paginationDto: PaginationDTO ) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const products = await this._productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
        
      });
      return products.map( product => ({ 
        ...product, images: product.images.map( image => image.url ) 
      }) );

    } catch (error) {
      this._handleDBError(error);
    }
    
  }




  /**
    * @author R.M
    * @version 1.1
    *
    * @param {string} term - Término de búsqueda. Puede ser un UUID, slug o título del producto.
    *
    * @description
    * Este método busca un producto específico en la base de datos utilizando el término proporcionado (`term`).
    * El término puede ser uno de los siguientes:
    * 
    * - **UUID**: Busca el producto por su identificador único en el campo `id`.
    * - **Slug**: Busca el producto por su identificador legible en el campo `slug`, tras normalizarlo a minúsculas.
    * - **Título**: Busca el producto por su nombre en el campo `title`, tras convertirlo a mayúsculas.
    *
    * La lógica de búsqueda sigue estos pasos:
    *
    * 1. **Buscar por UUID**:
    *    - Si el término tiene el formato de un UUID válido, se busca directamente por el campo `id` utilizando el repositorio.
    *
    * 2. **Buscar por Slug o Título**:
    *    - Si el término no es un UUID, se utiliza un `QueryBuilder` para realizar una búsqueda más compleja:
    *      - Por el campo `slug` (tras normalizarlo a minúsculas y eliminar espacios adicionales).
    *      - Por el campo `title` (tras convertirlo a mayúsculas).
    *    - Se incluye una relación con las imágenes asociadas al producto utilizando `leftJoinAndSelect`.
    *
    * 3. **Excepción si no se Encuentra**:
    *    - Si no se encuentra un producto que coincida con el término, se lanza una excepción `NotFoundException`.
    *
    * 4. **Manejo de Errores**:
    *    - Si ocurre un error durante la operación, se delega el manejo al método `_handleDBError` para gestionar la excepción y registrar el error.
    *
    * @returns {Promise<ProductEntity>} - El producto encontrado junto con sus relaciones.
    *
    * @throws {NotFoundException} Si no se encuentra un producto que coincida con el término proporcionado.
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la búsqueda.
    */
  
  async findOne(term: string) {

    let product: ProductEntity;
    
    // isUUID(term) ? product = 
    // await this._productRepository.findOneBy( {id: term }) : product = await this._productRepository.findOneBy( { slug: term.toLowerCase().trim() } );

    // isUUID(term) ? product =
    // await this._productRepository.findOne({ where: { id: term } }) : product = await this._productRepository.findOne({ where: { slug: term.toLowerCase().trim() } });
    
    try {
      
      if (isUUID(term)) {
        product = await this._productRepository.findOneBy({ id: term });
      } else {
        const queryBuilder = this._productRepository.createQueryBuilder('prod');
        product = await queryBuilder
          .where('slug = :slug or title = :title', { slug: term.toLowerCase().trim(), title: term.toUpperCase() })
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne();
          
      }

      if (!product) throw new NotFoundException(`product with id ${term} not found`);
      
      return product;
      
    } catch (error) {
      this._handleDBError(error);
      
    }
    
  }





  /**
    * @author R.M
    * @version 1.1
    *
    * @param {string} id - Identificador único del producto a actualizar.
    * @param {UpdateProductDto} updateProductDto - DTO que contiene los datos a actualizar del producto, incluyendo posibles imágenes asociadas.
    *
    * @description
    * Este método actualiza un producto existente en la base de datos, utilizando transacciones para garantizar la consistencia de los datos. 
    * Incluye pasos para manejar las relaciones de imágenes y asegurar que el producto actualizado se devuelva con todos sus datos relacionados.
    *
    * 1. **Crear QueryRunner**:
    *    - Se crea un `QueryRunner` para gestionar la transacción.
    *    - Se conecta el `QueryRunner` y se inicia la transacción.
    *
    * 2. **Precargar Producto**:
    *    - Se utiliza el método `preload` del repositorio para cargar los datos actuales del producto y combinarlos con los nuevos datos.
    *    - Si el producto no se encuentra, lanza una excepción `BadRequestException`.
    *
    * 3. **Actualizar Imágenes**:
    *    - Si `images` está presente:
    *      - Se eliminan las imágenes asociadas al producto utilizando el gestor del `QueryRunner`.
    *      - Se asignan nuevas imágenes, transformándolas en entidades de tipo `ProductImage`.
    *
    * 4. **Guardar Producto**:
    *    - Se guarda el producto actualizado junto con las nuevas relaciones utilizando el gestor del `QueryRunner`.
    *    - La transacción se confirma (`commitTransaction`) y se libera el `QueryRunner`.
    *
    * 5. **Recuperar Producto Actualizado**:
    *    - Después de guardar, se realiza una consulta para recuperar el producto actualizado junto con las relaciones de imágenes.
    *    - Las imágenes se transforman para devolver solo sus URLs.
    *
    * 6. **Manejo de Errores**:
    *    - Si ocurre un error durante el proceso, la transacción se revierte (`rollbackTransaction`) y el método `_handleDBError` gestiona la excepción.
    *
    * @returns {Promise<ProductEntity>} - El producto actualizado, incluyendo las URLs de las imágenes asociadas.
    *
    * @throws {rollbackTransaction} Si ocurre un error durante la transacción, se revierte la operación.
    * @throws {BadRequestException} Si el producto no existe o los datos proporcionados son inválidos.
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la operación.
    */

  async update(id: string, updateProductDto: UpdateProductDto) {
   
    const { images , ...toUpdate } = updateProductDto;

    //Create query runner
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const product: ProductEntity = await this._productRepository.preload({
      id,
      ...toUpdate
    })
    
    if (!product) {
      throw new BadRequestException(`product with id ${id} not found`);
    }
    
    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: id });
        product.images = images.map( image => this._productImageRepository.create( { url: image } ) );
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      const productWithImages = await this._productRepository.findOne({
        where: { id: product.id },
        relations: { images: true },
      });
      
      return { ...productWithImages, images: productWithImages.images.map( image => image.url ) };
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      this._handleDBError(error);
    }

    return `This action updates a #${id} product`;
  }




  /**
    * @author R.M
    * @version 1.0
    *
    * @param {string} id - El identificador único del producto que se desea eliminar.
    *
    * @description
    * Este método elimina un producto específico de la base de datos, siguiendo los siguientes pasos:
    *
    * 1. **Buscar el Producto**:
    *    - Utiliza el método `findOne` para verificar la existencia del producto con el ID proporcionado.
    *    - Si no se encuentra el producto, lanza una excepción `BadRequestException`.
    *
    * 2. **Eliminar el Producto**:
    *    - Si el producto existe, utiliza el repositorio (`_productRepository`) para eliminarlo de la base de datos.
    *
    * 3. **Retornar el Producto Eliminado**:
    *    - Devuelve el producto eliminado como confirmación de que se eliminó correctamente.
    *
    * 4. **Control de Errores**:
    *    - Captura cualquier error que ocurra durante la operación y delega su manejo al método `_handleDBError`.
    *
    * @returns {Promise<ProductEntity>} - El producto eliminado.
    *
    * @throws {BadRequestException} Si no se encuentra el producto con el ID proporcionado.
    * @throws {InternalServerErrorException} Para errores inesperados, gestionados por `_handleDBError`.
    */
 
  async remove(id: string) {
    const product: ProductEntity = await this.findOne(id);

    if (!product) {
      throw new BadRequestException(`product with id ${id} not found`);
    }

    try {

      await this._productRepository.remove(product);
     
      return product;
      
    } catch (error) {
      this._handleDBError(error);
    }
  }




  /**
    * @author R.M
    * @version 1.0
    *
    * @private
    *
    * @param {any} error - Objeto de error capturado durante una operación en la base de datos o el servidor.
    *
    * @description
    * Este método maneja los errores capturados en las operaciones del servidor o de la base de datos. 
    * Según el código o estado del error, lanza excepciones específicas para facilitar el manejo de errores 
    * y garantizar respuestas adecuadas al cliente. La lógica sigue estos pasos:
    *
    * 1. **Errores de Clave Duplicada (`23505`)**:
    *    - Si el código del error es `23505` (propio de PostgreSQL para violaciones de claves únicas), lanza 
    *      una excepción `BadRequestException` con el detalle del error proporcionado.
    *
    * 2. **Errores de Solicitud Inválida (`400`)**:
    *    - Si el error tiene un estado `400`, lanza una excepción `BadRequestException` con el mensaje del error.
    *
    * 3. **Errores de No Encontrado (`404`)**:
    *    - Si el error tiene un estado `404`, lanza una excepción `NotFoundException` con el mensaje del error.
    *
    * 4. **Errores Inesperados**:
    *    - Si el error no coincide con los casos anteriores:
    *      - Registra el error en la consola y con el logger (`_logger.error`).
    *      - Lanza una excepción `InternalServerErrorException` indicando un error inesperado.
    *
    * @throws {BadRequestException} Si ocurre un error de clave duplicada (`23505`) o un error de solicitud inválida (`400`).
    * @throws {NotFoundException} Si ocurre un error de tipo "No encontrado" (`404`).
    * @throws {InternalServerErrorException} Si ocurre un error inesperado.
    */
   
  private _handleDBError(error: any) {

    if (error.code === '23505') {
      // Si lanzo un error de clave duplicada y tengo varios elementos, este error.detail me da la clave duplicada y detiene el proceso
      throw new BadRequestException(error.detail);
    }
    
    if ( error.status === 400) {
      throw new BadRequestException(error.message);
    }

    if ( error.status === 404) {
      throw new NotFoundException(error.message);
    }
    console.log(error);
    
    this._logger.error(error);

    throw new InternalServerErrorException(`unexpected error, check server logs`);
  }


    /**
      * @author R.M
      * @version 1.0
      * 
      * @param {string} term - Término de búsqueda, puede ser un `UUID`, `slug`, o `title`.
      * 
      * @description
      * Este método busca un producto en la base de datos y transforma el resultado para devolver un objeto plano.
      * La lógica sigue los siguientes pasos:
      * 
      * 1. **Buscar el Producto**: Llama al método `findOne(term)` para obtener el producto asociado al término proporcionado.
      * 
      * 2. **Transformar las Imágenes**: Extrae las imágenes asociadas al producto y transforma el array para devolver únicamente los URLs de las imágenes.
      * 
      * 3. **Retornar el Objeto Plano**: Devuelve un nuevo objeto que incluye las propiedades del producto excepto las imágenes, que se transforman en un array de URLs.
      * 
      * @returns {Promise<Object>} - Un objeto plano que representa el producto, con las imágenes transformadas.
      * 
      * @throws {NotFoundException} Si el producto no es encontrado.
      * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la operación (controlado por `_handleDBError`).
      */
   
  async findOnePlain(term: string) {

    const { images = [], ...rest } = await this.findOne(term);

    return { ...rest, images: images.map( image => image.url ) };
    
  }


  /**
    * @author R.M
    * @version 1.0
    *
    * @description
    * Este método elimina todos los productos almacenados en la base de datos. 
    * Está destinado únicamente para entornos de desarrollo y debe usarse con precaución.
    *
    * La lógica sigue los siguientes pasos:
    *
    * 1. **Construir Consulta de Eliminación**:
    *    - Utiliza un `QueryBuilder` para construir una consulta que elimina todos los registros de la tabla `ProductEntity`.
    *
    * 2. **Ejecutar Consulta**:
    *    - Ejecuta la consulta de eliminación usando el método `execute`.
    *
    * 3. **Manejo de Errores**:
    *    - Si ocurre un error durante la operación, el método `_handleDBError` se encarga de gestionar la excepción y registrar el error.
    *
    * @returns {Promise<DeleteResult>} - Un objeto que contiene información sobre la operación de eliminación.
    *
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la eliminación.
    */

  async deleteAllProducts() {
    const query = this._productRepository.createQueryBuilder('prod');

    try {
      return await query
      .delete()
      .where({})
      .execute();

    } catch (error) {
      this._handleDBError(error);
    }
  }

}

