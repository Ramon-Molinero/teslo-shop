import { IsString, MinLength } from "class-validator";

export class WsMessage {
    @IsString()
    @MinLength(1)
    message: string;
}