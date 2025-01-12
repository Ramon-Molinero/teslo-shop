import { ApiProperty } from "@nestjs/swagger";
import { ProductEntity } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @ApiProperty({
        example: '1d7d0d3b-7c4b-4f5f-8c3c-0e1d7f4e6c8b',
        description: 'Unique identifier as UUID',
        uniqueItems: true,
        required: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'johnDoe@example.com',
        description: 'User email',
        uniqueItems: true,
        nullable: false,
    })
    @Column('text',{ unique: true, nullable: false })
    email: string;

    @ApiProperty({
        example: 'password',
        description: 'User password',
        nullable: false,
    })
    @Column('text', { select: false })
    password: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'User full name',
        nullable: false,
    })
    @Column('text')
    fullName: string;

    @ApiProperty({
        example: true,
        description: 'User status',
        nullable: false,
    })
    @Column('bool',{ default: true })
    isActive: boolean;

    @ApiProperty({
        example: ['user'],
        description: 'User roles',
        nullable: false,
    })
    @Column('text',{ array: true, default: ['user'] })
    roles: string[];

    @ApiProperty({
        type: () => ProductEntity,
        description: 'Products associated with the user',
    })
    @OneToMany(
        () => ProductEntity, // entidad relacionada
        (product) => product.user, // campo de la relación
    )
    product: ProductEntity;


    @BeforeInsert()
    checkFields(){
        this.email = this.email.toLowerCase().trim();
        this.fullName = this.fullName.toLowerCase()
    }

    
    @BeforeUpdate()
    checkFieldsUpdate(){
        this.checkFields();
    }
}
