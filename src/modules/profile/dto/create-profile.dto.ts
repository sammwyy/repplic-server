import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Length, MaxLength } from 'class-validator';

@InputType()
export default class CreateProfileDTO {
  @IsNotEmpty()
  @Length(1, 32)
  @Field(() => String)
  username: string;

  @IsNotEmpty()
  @Length(1, 64)
  @Field(() => String)
  displayName: string;

  @MaxLength(300)
  @Field(() => String)
  bio?: string;
}
