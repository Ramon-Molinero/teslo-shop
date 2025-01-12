import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";



export class CreateUserDto {

    @ApiProperty({
        example: 'johnDoe@example.com',
        description: 'User email',
        uniqueItems: true,
        required: true,
    })
    @IsString()
    @IsEmail()
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

    @ApiProperty({
        example: 'John Doe',
        description: 'User full name',
        required: true,
    })
    @IsString()
    @MinLength(3)
    fullName: string;
    
}
