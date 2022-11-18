import {
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import Authenticator from "api42client";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { GetUser } from "./get-user.decorator";
import { appendFile } from "fs";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { Octokit } from "octokit";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  @Inject(UserService)
  private readonly userservice: UserService;

  @Get("loginAs/:name")
  async loginAs(@Param("name") name: string, @Res() res: any) {
    this.userservice.giveaccess(name, res);
  }

  @Get("github/redirect")
  async getGithubAuthedUser(@Req() request: Request, @Query() query: any, @Res() res: Response) {
    // https://github.com/login/oauth/authorize?client_id=761b6d85a92c80e1666c
    const auth = createOAuthAppAuth({
      clientType: "oauth-app",
      clientId: "761b6d85a92c80e1666c",
      clientSecret: "1f488584fac0c37b138471dcf93fd4d74e05eee0",
    })
    console.log(query);
    const userAuthenticationFromWebFlow = await auth({
      type: "oauth-user",
      code: query.code,
    });
    console.log(userAuthenticationFromWebFlow);
    console.log('/github/redirect');
    const octokit = new Octokit({auth: userAuthenticationFromWebFlow.token});
    const data = await octokit.rest.users.getAuthenticated();
    console.log(data);
    let user = {
      'login': data.data.login,
      'email': null,
      'avatar': data.data.avatar_url,
      'id': data.data.id
    }
    //console.log(user);
    this.userservice.createaccess(user, res);
  }

  @Get("redirect")
  async getauthedUser(
    @Query("code") code: string,
    @Res() res: any
  ): Promise<any> {
    const app = new Authenticator(
      process.env.clientID,
      process.env.clientSecret,
      process.env.callbackURL
    );
    //gets you token, refresh, exp date...
    const tokenData = await app.get_Access_token(code);
    if (tokenData.access_token) {
      //gets you user data from 42 api
      const data = await app.get_user_data(tokenData.access_token);
      this.userservice.createaccess(data, res);
    } else {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
  }
  @UseGuards(AuthGuard())
  @Get("/logout/:id")
  async loguserout(
    @Param("id", ParseIntPipe) id: number,
    @Res() res,
    @GetUser() user: User
  ): Promise<boolean> {
    if (id == user.id) {
      //sets cookie back to 
      res.cookie("auth-cookie", null, { httponly: true, expires: new Date(1) });
      res.send();
      return true;
    } 
    else throw new ForbiddenException("unauthorised logout request");
    // return;
  }

  @Get("home")
  async gethome() {
    return "this is home for test";
  }
}
