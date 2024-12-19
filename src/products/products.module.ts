import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductImage } from './entities/images.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductImage
    ]),
    AuthModule
  ],
  exports: [
    ProductsService,
    TypeOrmModule,
  ]
})
export class ProductsModule {}
