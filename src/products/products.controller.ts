import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { PaginationDTO } from '../common/dto/pagination.dto';

import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { Auth, GetUserDecorator } from '../auth/decorators';

@Controller('products')

export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUserDecorator() user: User
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  // @Auth()
  findAll( @Query() paginationDto: PaginationDTO ) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term' ) term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUserDecorator() user: User
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
