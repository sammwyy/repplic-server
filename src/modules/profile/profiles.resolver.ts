import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import CurrentUser from 'src/decorators/current-user.decorator';
import { User } from '../users/models/user';
import { UsersService } from '../users/users.service';
import CreateProfileDTO from './dto/create-profile.dto';
import UpdateProfileDTO from './dto/update-profile.dto';
import { Profile } from './models/profile';
import { ProfilesService } from './profiles.service';

@Resolver(() => Profile)
export class ProfilesResolver {
  constructor(
    private profilesService: ProfilesService,
    private usersService: UsersService,
  ) {}

  @Query(() => Profile, { nullable: true })
  public async findProfile(
    @Args('username') username: string,
  ): Promise<Profile | undefined> {
    return await this.profilesService.getByUsername(username);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Profile)
  public async createProfile(
    @CurrentUser() user: User,
    @Args('payload') payload: CreateProfileDTO,
  ): Promise<Profile> {
    const profile = await this.profilesService.create(user._id, payload);
    if (profile != null) {
      const result = await this.usersService.setProfileToUser(
        user._id,
        profile._id,
      );

      if (result) {
        return profile;
      } else {
        throw new InternalServerErrorException(
          'SERVER_ERROR',
          'An unexpected error has occurred: (Error 1001)',
        );
      }
    } else {
      throw new InternalServerErrorException(
        'SERVER_ERROR',
        'An unexpected error has occurred: (Error 1000)',
      );
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Profile)
  public async updateProfile(
    @CurrentUser() user: User,
    @Args('payload') payload: UpdateProfileDTO,
  ): Promise<Profile> {
    return await this.profilesService.update(user.profile, payload);
  }
}
