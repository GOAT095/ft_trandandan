import { createParamDecorator, ExecutionContext } from '@nestjs/common';

//gets you the user that is doing a request from the req
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
