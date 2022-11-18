import { Field, InputType } from '@nestjs/graphql';
import { Length, MaxLength } from 'class-validator';

@InputType()
export default class UpdateProfileDTO {
  @Length(1, 32)
  @Field(() => String)
  username?: string;

  @Length(1, 64)
  @Field(() => String)
  displayName?: string;

  @MaxLength(300)
  @Field(() => String)
  bio?: string;
}
