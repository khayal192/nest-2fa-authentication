import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UserEntity } from './database/user.entity';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private jwtService: JwtService,
  ) {}

  @Get()
  @Render('index')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  root() {}

  @Get('/verify')
  @Render('verify')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  VarifyEmail() {}

  @Post('/signup')
  async signup(@Body() user: UserEntity) {
    return await this.appService.signup(user);
  }

  @Post('/signin')
  async signin(@Body() user: UserEntity) {
    return await this.appService.signin(user, this.jwtService);
  }

  @Post('/verify')
  async varify(@Body() body) {
    return await this.appService.varifyAccount(body.code);
  }

  @Get('/:id')
  async getOneUser(@Res() response, @Param() param) {
    const user = await this.appService.getOne(param.id);
    return response.status(HttpStatus.CREATED).json({
      user,
    });
  }
}
