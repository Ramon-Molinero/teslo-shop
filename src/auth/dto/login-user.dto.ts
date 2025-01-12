import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";



export class LoginUserDto {

    @ApiProperty({
        example: 'johnDoe@example.com',
        description: 'User email',
        uniqueItems: true,
        required: true,
    })
    @IsString()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @ApiProperty({
        example: 'password',
        description: 'User password',
        required: true,
    })
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    
}
