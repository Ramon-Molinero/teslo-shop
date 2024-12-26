import { ProductEntity } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{ unique: true, nullable: false })
    email: string;

    @Column('text', { select: false })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool',{ default: true })
    isActive: boolean;

    @Column('text',{ array: true, default: ['user'] })
    roles: string[];

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
