import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { isUUID } from 'class-validator';
import { PaginationDTO } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly _logger = new Logger('ProductsService');


  /**
    * @constructor
    * 
    * @param {Repository<ProductEntity>} _productRepository - El repositorio de TypeORM asociado a la entidad `ProductEntity`.
    * 
    * @description
    * Este constructor utiliza la inyección de dependencias para acceder al repositorio de la entidad `ProductEntity`.
    * El repositorio proporciona métodos para interactuar con la base de datos, tales como:
    * 
    * - **find**: Recuperar múltiples registros.
    * - **findOne**: Recuperar un registro único basado en ciertos criterios.
    * - **save**: Insertar o actualizar registros.
    * - **remove**: Eliminar registros.
    * 
    * La inyección del repositorio se realiza mediante el decorador `@InjectRepository`, que asocia automáticamente
    * la clase `ProductEntity` con el repositorio correspondiente.
    */
   
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _productRepository: Repository<ProductEntity>
  ) {}


  /**
    * @author R.M
    * @version 1.0
    *
    * @param {CreateProductDto} createProductDto - DTO que contiene los datos necesarios para crear un producto.
    *
    * @description
    * Este método se encarga de crear un nuevo producto en la base de datos, siguiendo los siguientes pasos:
    *
    *
    * 1. **Crear la Instancia del Producto**:
    *    - Utiliza el repositorio para instanciar un nuevo producto basado en los datos proporcionados por `createProductDto`.
    *
    * 2. **Guardar el Producto en la Base de Datos**:
    *    - Usa el método `save` del repositorio para insertar el producto en la base de datos.
    *
    * 3. **Retornar el Producto Creado**:
    *    - Devuelve el producto recién creado con todos los datos registrados.
    *
    * 4. **Manejo de Errores**:
    *    - Si ocurre algún error durante la creación o el guardado del producto, el método `_handleDBError` se encarga de gestionar la excepción y lanzar un mensaje de error adecuado.
    *
    * @returns {Promise<ProductEntity>} - El producto creado con los datos registrados.
    *
    * @throws {BadRequestException} Si ocurre un error de clave duplicada o algún dato no válido.
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la creación del producto.
    */

  async create(createProductDto: CreateProductDto) {

    try {
      
      const product = this._productRepository.create(createProductDto);
      await this._productRepository.save(product);


      return product;
      
    } catch (error) {
      this._handleDBError(error);
      
    }
    
  }


  async findAll( paginationDto: PaginationDTO ) {
    try {

      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this._productRepository.find({
        take: limit,
        skip: offset
        //TODO: relaciones
      });
      return products

    } catch (error) {
      this._handleDBError(error);
    }
    
  }

  /**
    * @author R.M
    * @version 1.0
    *
    * @param {string} term - Término de búsqueda. Puede ser un UUID, slug o título del producto.
    *
    * @description
    * Este método busca un producto específico en la base de datos según el término proporcionado (`term`).
    * El término puede ser:
    * 
    * - **UUID**: Identificador único del producto.
    * - **Slug**: Identificador legible del producto.
    * - **Título**: Nombre del producto (mayúsculas o minúsculas).
    *
    * La lógica de búsqueda sigue estos pasos:
    *
    * 1. **Buscar por UUID**:
    *    - Si el término cumple con el formato de un UUID válido, busca el producto por su campo `id`.
    *
    * 2. **Buscar por Slug o Título**:
    *    - Si el término no es un UUID, utiliza un `QueryBuilder` para buscar:
    *      - Por el campo `slug` (en minúsculas y sin espacios adicionales).
    *      - Por el campo `title` (en mayúsculas, ignorando el formato original).
    *
    * 3. **Excepción si no se Encuentra**:
    *    - Si no se encuentra un producto que coincida con el término, lanza una excepción `NotFoundException`.
    *
    * 4. **Manejo de Errores**:
    *    - Si ocurre un error durante la operación, lo delega al método `_handleDBError`.
    *
    * @returns {Promise<ProductEntity>} - El producto encontrado.
    *
    * @throws {NotFoundException} Si no se encuentra un producto que coincida con el término proporcionado.
    * @throws {InternalServerErrorException} Si ocurre un error inesperado durante la búsqueda.
    */
   
  async findOne(term: string) {

    try {
      
      let product: ProductEntity;

      if (isUUID(term)) {
        product = await this._productRepository.findOne({ where: { id: term } });
      } else {
        const queryBuilder = this._productRepository.createQueryBuilder();
        product = await queryBuilder
          .where('slug = :slug or title = :title', { slug: term.toLowerCase().trim(), title: term.toUpperCase() })
          .getOne();
          
      }

      // isUUID(term) ? product = 
      // await this._productRepository.findOneBy( {id: term }) : product = await this._productRepository.findOneBy( { slug: term.toLowerCase().trim() } );

      // isUUID(term) ? product =
      // await this._productRepository.findOne({ where: { id: term } }) : product = await this._productRepository.findOne({ where: { slug: term.toLowerCase().trim() } });
     

      if (!product) throw new NotFoundException(`product with id ${term} not found`);
      
      return product;
      
    } catch (error) {
      this._handleDBError(error);
      
    }
    
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
   
    
    try {
      const product: ProductEntity = await this._productRepository.preload({
        id,
        ...updateProductDto
      })

      if (!product) {
        throw new BadRequestException(`product with id ${id} not found`);
      }

      console.log(product);
      
      await this._productRepository.save(product);      

      return product;
      
    } catch (error) {
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
    try {
      const product: ProductEntity = await this.findOne(id);

      if (!product) {
        throw new BadRequestException(`product with id ${id} not found`);
      }

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

}

