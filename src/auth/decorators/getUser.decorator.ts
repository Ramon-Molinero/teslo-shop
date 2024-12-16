import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";




export const GetUserDecorator = createParamDecorator(
    (data, ctx: ExecutionContext) => {

        const request = ctx.switchToHttp().getRequest();
        const { user } = request;

        if(!user) throw new InternalServerErrorException('User not found in request object');

        return data ? user[data] : user;
        
    }
)