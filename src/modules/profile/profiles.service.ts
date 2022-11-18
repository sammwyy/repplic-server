import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import CreateProfileDTO from './dto/create-profile.dto';
import UpdateProfileDTO from './dto/update-profile.dto';
import { Profile, ProfileDocument } from './models/profile';

@Injectable()
export class ProfilesService {
  public static USERNAME_IN_USE = new BadRequestException(
    'USERNAME_IN_USE',
    'This username is already in use.',
  );
  public static PROFILE_ALREADY_EXIST = new BadRequestException(
    'PROFILE_ALREADY_EXIST',
    'A profile for this account already exist.',
  );

  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  public getByAccount(accountId: string): Promise<Profile | undefined> {
    return this.profileModel.findOne({ accountId }).exec();
  }

  public getByID(id: string): Promise<Profile | undefined> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.profileModel.findById(id).exec();
  }

  public getByUsername(username: string): Promise<Profile | undefined> {
    return this.profileModel
      .findOne({ username: username.toLowerCase() })
      .exec();
  }

  public async create(
    accountId: string,
    payload: CreateProfileDTO,
  ): Promise<Profile> {
    if (await this.getByUsername(payload.username)) {
      throw ProfilesService.USERNAME_IN_USE;
    } else if (await this.getByAccount(accountId)) {
      throw ProfilesService.PROFILE_ALREADY_EXIST;
    }

    const profile = new this.profileModel(payload);
    profile.accountId = accountId;
    await profile.save();
    return profile;
  }

  public async update(
    profileId: string,
    payload: UpdateProfileDTO,
  ): Promise<Profile> {
    if (payload.username && (await this.getByUsername(payload.username))) {
      throw ProfilesService.USERNAME_IN_USE;
    }
    return await this.profileModel.findByIdAndUpdate(profileId, payload);
  }
}
