import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from './database/user.entity';

@Injectable()
export class AppService {
  private code;

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private mailerService: MailerService,
  ) {
    this.code = Math.floor(10000 + Math.random() * 90000);
  }

  async sendConfirmedEmail(user: UserEntity) {
    const { email, fullname } = user;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Nice App! Email Confirmed',
      template: 'confirmed',
      context: {
        fullname,
        email,
      },
    });
  }

  async sendConfirmationEmail(user: any) {
    const { email, fullname } = await user;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Nice App! Confirm Email',
      template: 'confirm',
      context: {
        fullname,
        code: this.code,
      },
    });
  }

  async signup(user: UserEntity): Promise<any> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(user.password, salt);
      const reqBody = {
        fullname: user.fullname,
        email: user.email,
        password: hash,
        authConfirmToken: this.code,
      };
      await this.userRepository.insert(reqBody);
      await this.sendConfirmationEmail(reqBody);
      return true;
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signin(user: UserEntity, jwt: JwtService): Promise<any> {
    try {
      const foundUser = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      });
      if (foundUser) {
        if (foundUser.isVerified) {
          if (bcrypt.compare(user.password, foundUser.password)) {
            const payload = { email: user.email };
            return {
              token: jwt.sign(payload),
            };
          }
        } else {
          return new HttpException(
            'Please varify your account',
            HttpStatus.UNAUTHORIZED,
          );
        }
        return new HttpException(
          'Incorrect username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return new HttpException(
        'Incorrect username or password',
        HttpStatus.UNAUTHORIZED,
      );
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async varifyAccount(code: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          authConfirmToken: code,
        },
      });
      if (!user) {
        return new HttpException(
          'Verification code has expired or not found',
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.userRepository.update(
        { email: user.email },
        { isVerified: true, authConfirmToken: undefined },
      );
      await this.sendConfirmedEmail(user);
      return true;
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOne(email): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { email } });
  }
}
