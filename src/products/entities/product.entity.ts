import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./images.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

/**
  * @author R.M
  * 
  * @version 1.1
  * 
  * @description
  * La clase `ProductEntity` representa la entidad de un producto dentro de la base de datos. 
  * Está diseñada para mapear cada propiedad del producto a una columna de la base de datos utilizando
  * las funcionalidades de TypeORM. También incluye hooks para personalizar el comportamiento antes 
  * de insertar o actualizar registros.
  * 
  * ### Propiedades
  * - **`id`**: Clave primaria única generada automáticamente como UUID.
  * - **`title`**: Título del producto. Único y almacenado como texto.
  * - **`price`**: Precio del producto, con valor predeterminado `0`.
  * - **`description`**: Descripción del producto. Campo opcional.
  * - **`slug`**: Identificador único en URL, generado a partir del título si no se proporciona.
  * - **`stock`**: Cantidad en inventario con un valor predeterminado de `0`.
  * - **`sizes`**: Lista de tallas disponibles para el producto.
  * - **`gender`**: Género asociado al producto (texto).
  * - **`tags`**: Lista de etiquetas asociadas al producto, convertidas a minúsculas automáticamente.
  * - **`images`**: Relación uno a muchos con la entidad `ProductImage`. Incluye las imágenes asociadas al producto.
  * 
  * ### Relaciones
  * - **`@OneToMany`**:
  *   - Define la relación con la entidad `ProductImage`.
  *   - Configuración:
  *     - `cascade: true`: Permite que las imágenes asociadas se creen o eliminen automáticamente según las operaciones del producto.
  *     - `eager: true`: Carga automáticamente las imágenes al consultar el producto.
  *
  * ### Hooks
  * - **`@BeforeInsert()`**:
  *   - Normaliza el título a minúsculas.
  *   - Normaliza las etiquetas (tags) a minúsculas.
  *   - Genera un slug basado en el título si no se proporciona uno.
  *   - Limpia caracteres no deseados del slug.
  * - **`@BeforeUpdate()`**:
  *   - Normaliza el título a minúsculas si se actualiza.
  *   - Normaliza las etiquetas (tags) a minúsculas si se actualizan.
  *   - Actualiza el slug basado en el título si el título cambia y no se proporciona un nuevo slug.
  *   - Limpia caracteres no deseados del slug si este se actualiza.
  */

@Entity()
export class ProductEntity {

    @ApiProperty({
        example: '1d7d0d3b-7c4b-4f5f-8c3c-0e1d7f4e6c8b',
        description: 'Unique identifier as UUID',
        uniqueItems: true,
        required: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-shirt Teslo',
        description: 'Product title',
        uniqueItems: true,
        required: true,
    })
    @Column('text', { unique: true })
    title: string;

    @ApiProperty({
        example: 10.99,
        description: 'Product price',
        minimum: 0,
        required: true,
    })
    @Column('float', { default: 0 })
    price: number;

    @ApiProperty({
        example: 'This is a T-shirt from Teslo',
        description: 'Product description',
        nullable: true,
        required: true,
    })
    @Column({ type: 'text', nullable: true })
    description: string;

    @ApiProperty({
        example: 't-shirt_teslo',
        description: 'Unique identifier for URL',
        uniqueItems: true,
        required: true,
    })
    @Column('text', { unique: true })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        minimum: 0,
        required: true,
    })
    @Column('int', { default: 0 })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'L'],
        description: 'Available sizes',
        required: true,
    })
    @Column('text', { array: true })
    sizes: string[];

    @ApiProperty({
        example: 'Men',
        description: 'Gender associated with the product',
        required: true,
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ['clothing', 't-shirt', 'teslo'],
        description: 'Product tags',
        required: true,
    })
    @Column('text', { array: true, default: [] })
    tags: string[];

    @ApiProperty({
        example: [{ id: '1', url: 'http://example.com/image.jpg' }],
        description: 'Product images',
        required: false,
    })
    @OneToMany(
        () => ProductImage, 
        (image) => image.product, 
        { eager: true, cascade: true }
    )
    images?: ProductImage[];

    @ApiProperty({
        type: () => User,
        description: 'User associated with the product',
        required: true,
    })
    @ManyToOne(
        () => User, // entidad relacionada
        (user) => user.product, // campo de la relación
        { eager: true, cascade: true } // acción de eliminación 
    )
    user: User;


    @BeforeInsert()
    checkProductInsert() {

        this.title = this.title.toLowerCase();

        if ( this.tags ) 
            this.tags = this.tags.map(tag => tag.toLowerCase());
        
        if( !this.slug)
            this.slug = this.title.replaceAll(' ', '_').replaceAll("'", '');
           
        this.slug = this.slug.toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }


    @BeforeUpdate()
    checkProductUpdate() {
        if ( this.title ) 
            this.title = this.title.toLowerCase();
          
        if ( this.title && !this.slug ) 
            this.slug = this.title.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
      
        if ( this.slug ) 
            this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');

        if ( this.tags ) 
            this.tags = this.tags.map(tag => tag.toLowerCase());

          
    }

}
