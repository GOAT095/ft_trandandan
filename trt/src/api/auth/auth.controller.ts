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
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import Authenticator from "api42client";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { GetUser } from "./get-user.decorator";

@Controller("auth")
export class AuthController {
  @Inject(UserService)
  private readonly userservice: UserService;

  @Get("loginAs/:name")
  async loginAs(@Param("name") name: string, @Res() res: any) {
    this.userservice.giveaccess(name, res);
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
    // console.log("__ID__ : ", id);
    // console.log("__USER__ID__ : ", user.id);
    if (id == user.id) {
      //sets cookie back to 
      res.cookie("auth-cookie", null, { httponly: true, expires: new Date(1) });
      res.redirect("/redirect/home");
      // res.send("/redirect/home");
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
