import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";

/**
  * @class ProductImage
  *
  * @description
  * La entidad `ProductImage` representa una imagen asociada a un producto en la base de datos.
  * Define la estructura y las relaciones necesarias para almacenar y gestionar imágenes de productos.
  *
  * **Propiedades:**
  * - **id**: Identificador único generado automáticamente en formato UUID.
  * - **url**: Dirección de la imagen en formato de texto.
  * - **product**: Relación con la entidad `ProductEntity` que indica a qué producto pertenece la imagen.
  *
  * **Relaciones:**
  * - **ManyToOne**:
  *   - Una imagen pertenece a un único producto.
  *   - Configuración:
  *     - `onDelete: 'CASCADE'`: Si el producto asociado se elimina, las imágenes relacionadas también se eliminan automáticamente.
  *
  * **Decoradores:**
  * - `@Entity()`: Define esta clase como una entidad de base de datos.
  * - `@PrimaryGeneratedColumn('uuid')`: Genera automáticamente un identificador único para cada registro.
  * - `@Column('text')`: Define una columna de texto para almacenar la URL de la imagen.
  * - `@ManyToOne`: Configura la relación con la entidad `ProductEntity`.
  */

@Entity()
export class ProductImage{
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    url: string;

    @ManyToOne( 
        () => ProductEntity, 
        (product) => product.images,
        { onDelete: 'CASCADE' }
    )
    product: ProductEntity;

}