import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { ApiProperty } from "@nestjs/swagger";

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
    
    @ApiProperty({
        example: '1d7d0d3b-7c4b-4f5f-8c3c-0e1d7f4e6c8b',
        description: 'Unique identifier as UUID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'https://example.com/image.jpg',
        description: 'Image URL',
    })
    @Column('text')
    url: string;

    @ApiProperty({
        type: () => ProductEntity,
        description: 'Product associated with the image',
    })
    @ManyToOne( 
        () => ProductEntity, 
        (product) => product.images,
        { onDelete: 'CASCADE' }
    )
    product: ProductEntity;

}