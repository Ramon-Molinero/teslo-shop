import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateProductDto {

    @ApiProperty({
        example: 'T-shirt Teslo',
        description: 'Product title',
        uniqueItems: true,
        nullable: false,
        required: true,
    })
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty({
        example: 10.99,
        description: 'Product price',
        nullable: true,
        required: false,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        example: 'This is a T-shirt from Teslo',
        description: 'Product description',
        nullable: true,
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 't-shirt_teslo',
        description: 'Unique identifier for URL',
        uniqueItems: true,
        nullable: true,
        required: false,
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        nullable: true,
        required: false,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        example: ['S', 'M', 'L'],
        description: 'Available sizes',
        nullable: false,
        required: true,
    })
    @IsString( { each: true } )
    @IsArray()
    sizes: string[];

    @ApiProperty({
        example: 'men',
        description: 'Gender associated with the product',
        nullable: false,
        required: true,
    })
    @IsIn([ 'men', 'women', 'unisex', 'kid' ])
    gender: string;

    @ApiProperty({
        example: ['clothing', 't-shirt', 'teslo'],
        description: 'Product tags',
        nullable: false,
        required: true,
    })
    @IsString( { each: true } )
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty({
        example: ['https://url.com/image.jpg'],
        description: 'Product images',
        nullable: true,
        required: false,
    })
    @IsOptional()
    images?: string[];
    

}
