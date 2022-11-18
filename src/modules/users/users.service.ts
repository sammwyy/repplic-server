import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';

import { User, UserDocument } from './models/user';

import CreateUserDTO from './dto/create-user.dto';
import UpdatePasswordDTO from './dto/update-password.dto';
import UpdateUserDTO from './dto/update-user.dto';
import { randomStringNumber } from 'src/utils/random.utils';

@Injectable()
export class UsersService {
  public static EMAIL_IN_USE = new BadRequestException(
    'EMAIL_IN_USE',
    'This email is already in use.',
  );
  public static USER_NOT_FOUND = new NotFoundException(
    'USER_NOT_FOUND',
    "The user with this ID didn't exist.",
  );
  public static WRONG_PASSWORD = new UnauthorizedException(
    'WRONG_PASSWORD',
    'Incorrect old password.',
  );
  public static WRONG_VERIFICATION_CODE = new UnauthorizedException(
    'WRONG_VERIFICATION_CODE',
    'Email verification code invalid or expired.',
  );

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  public getByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  public getByID(id: string): Promise<User | undefined> {
    if (!isValidObjectId(id)) {
      return null;
    }
    return this.userModel.findOne({ _id: id }).exec();
  }

  public async sendWelcome(user: User): Promise<void> {
    const to = user.email;
    const from = `"${process.env['MAIL_TITLE']}" <${process.env['ACCOUNT_MAIL']}>`;

    await this.mailerService.sendMail({
      to,
      from,
      subject: 'Welcome! Thanks for joining',
      template: 'welcome',
    });
  }

  public async sendVerificationCode(user: User): Promise<void> {
    const to = user.email;
    const from = `"${process.env['MAIL_TITLE']}" <${process.env['ACCOUNT_MAIL']}>`;

    await this.mailerService.sendMail({
      to,
      from,
      subject: 'Verify your account',
      template: 'verify-account',
      context: {
        code: user.verificationCode,
      },
    });
  }

  public async create(payload: CreateUserDTO): Promise<User> {
    if (await this.getByEmail(payload.email)) {
      throw UsersService.EMAIL_IN_USE;
    }

    const user = new this.userModel(payload);
    user.verificationCode = randomStringNumber(6);
    await user.save();
    this.sendVerificationCode(user);
    return user;
  }

  public async update(
    userID: string,
    payload: UpdateUserDTO,
  ): Promise<boolean> {
    if (payload.email && (await this.getByEmail(payload.email))) {
      throw UsersService.EMAIL_IN_USE;
    }

    await this.userModel.findByIdAndUpdate(userID, payload);
    return true;
  }

  public async updatePassword(
    userID: string,
    payload: UpdatePasswordDTO,
  ): Promise<boolean> {
    const user = await this.getByID(userID);
    const { oldPassword, newPassword } = payload;

    if (!user) {
      throw UsersService.USER_NOT_FOUND;
    }

    const match = await user.comparePassword(oldPassword);
    if (match !== true) {
      throw UsersService.WRONG_PASSWORD;
    }

    user.password = newPassword;
    await (user as UserDocument).save();
    return true;
  }

  public async setProfileToUser(
    userID: string,
    profileID: string,
  ): Promise<boolean> {
    const user = await this.getByID(userID);

    if (!user) {
      throw UsersService.USER_NOT_FOUND;
    }

    if (user.profile == null) {
      user.profile = profileID;
      await (user as UserDocument).save();
      return true;
    } else {
      return false;
    }
  }

  public async verifyUser(userID: string): Promise<boolean> {
    await this.userModel.findByIdAndUpdate(userID, {
      emailVerified: true,
      verificationCode: null,
    });
    return true;
  }

  public async tryVerifyUser(userID: string, code: string): Promise<boolean> {
    const modified = await this.userModel.findOneAndUpdate(
      { _id: userID, verificationCode: code },
      {
        emailVerified: true,
        verificationCode: null,
      },
    );

    if (!modified) {
      throw UsersService.WRONG_VERIFICATION_CODE;
    }

    await this.sendWelcome(modified);
    return true;
  }
}
