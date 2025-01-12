import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDTO {

    @ApiProperty({
        default: 10,
        description: 'Number of items per page'
    })
    @IsOptional()
    @IsPositive()
    // Transformar
    @Type( () => Number )
    limit?: number;

    @ApiProperty({
        default: 10,
        description: 'Number of items to skip'
    })
    @IsOptional()
    @Min(0)
    // Transformar
    @Type( () => Number )
    offset?: number;
}