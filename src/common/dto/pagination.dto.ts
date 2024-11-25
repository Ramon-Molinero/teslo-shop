import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDTO {

    @IsOptional()
    @IsPositive()
    // Transformar
    @Type( () => Number )
    limit?: number;

    @IsOptional()
    @Min(0)
    // Transformar
    @Type( () => Number )
    offset?: number;
}