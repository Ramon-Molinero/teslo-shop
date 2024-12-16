import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";




export const RawHeadersDecorator = createParamDecorator(
    (data, ctx: ExecutionContext) => {

        const request = ctx.switchToHttp().getRequest();
        const { rawHeaders } = request;

        if(!rawHeaders) throw new InternalServerErrorException('Raw headers not found in request object');

        return rawHeaders;
        
    }
)